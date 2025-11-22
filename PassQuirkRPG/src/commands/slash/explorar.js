const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder } = require('discord.js');
const worldSystem = require('../../../bot/utils/worldSystem');
const path = require('path');
const fs = require('fs');
const musicManager = require('../../../bot/utils/musicManager');
const { getEmoji, getEmojiURL } = require('../../../bot/utils/emojiManager');

// Zonas organizadas por categoría/dificultad
const ZONE_DATA = {
    'Reino de Akai': { difficulty: 'Fácil', minLevel: 1, maxLevel: 10, category: 'easy', emoji: '🌟' },
    'Bosque Sombrío': { difficulty: 'Intermedia', minLevel: 5, maxLevel: 15, category: 'intermediate', emoji: '⚔️' },
    'Montañas Heladas': { difficulty: 'Avanzada', minLevel: 10, maxLevel: 20, category: 'advanced', emoji: '❄️' },
    'Desierto de Fuego': { difficulty: 'Muy Difícil', minLevel: 15, maxLevel: 25, category: 'very_hard', emoji: '🔥' },
    'Ruinas Ancestrales': { difficulty: 'Muy Difícil', minLevel: 20, maxLevel: 30, category: 'very_hard', emoji: '🏺' },
    'Abismo del Vacío': { difficulty: 'Extrema', minLevel: 25, maxLevel: 40, category: 'extreme', emoji: '👹' }
};

const PASSCOIN_PATH = path.join(process.cwd(), 'documentation/Doc-Oficial/Imagenes - Diseño/Otros Aspectos del Juego/PassCoin.png');

// Helper function to create fresh AttachmentBuilder instances (required by Discord)
function getPassCoinAttachment() {
    return new AttachmentBuilder(PASSCOIN_PATH, { name: 'PassCoin.png' });
}

const ZONE_CATEGORIES = [
    { name: 'Todos', value: 'all', emoji: '🗺️' },
    { name: 'Fácil', value: 'easy', emoji: '🌟' },
    { name: 'Intermedia', value: 'intermediate', emoji: '⚔️' },
    { name: 'Avanzada', value: 'advanced', emoji: '❄️' },
    { name: 'Muy Difícil', value: 'very_hard', emoji: '🔥' },
    { name: 'Extrema', value: 'extreme', emoji: '👹' }
];

function zoneChoices(category = 'all', forSlashCommand = false) {
    const zones = Object.entries(ZONE_DATA);
    let filtered = zones;
    if (category !== 'all') {
        filtered = zones.filter(([_, data]) => data.category === category);
    }

    return filtered.map(([name, data]) => {
        if (forSlashCommand) {
            return {
                name: `${data.emoji} ${name} (Nv ${data.minLevel}-${data.maxLevel})`,
                value: name
            };
        } else {
            return {
                label: `${data.emoji} ${name} (Nv ${data.minLevel}-${data.maxLevel})`,
                value: name,
                description: data.difficulty
            };
        }
    });
}

function ensureExplorationSystem(client) {
    try {
        if (!client?.gameManager) return null;
        if (!client.gameManager.systems) client.gameManager.systems = {};
        if (client.gameManager.systems.exploration) return client.gameManager.systems.exploration;
        const candidates = [
            path.join(__dirname, '../../../systems/exploration-system.js'),
            path.join(__dirname, '../../../../src/systems/exploration-system.js'),
            path.join(process.cwd(), 'src/systems/exploration-system.js'),
            path.join(process.cwd(), 'systems/exploration-system.js')
        ];
        const target = candidates.find((p) => fs.existsSync(p)) || null;
        if (!target) return null;
        const ExplorationSystem = require(target);
        client.gameManager.systems.exploration = new ExplorationSystem(client.gameManager);
        return client.gameManager.systems.exploration || null;
    } catch {
        return null;
    }
}

function computeDistance(from, to) {
    const order = ['Reino de Akai', 'Bosque Sombrío', 'Montañas Heladas', 'Desierto de Fuego', 'Ruinas Ancestrales', 'Abismo del Vacío'];
    const a = order.indexOf(from);
    const b = order.indexOf(to);
    if (a === -1 || b === -1) return 500;
    const steps = Math.abs(a - b) || 0;
    if (steps === 0) return 250;
    return Math.max(500, steps * 500);
}

function computeRisk(player, zone) {
    if (!zone) return 3;
    if (player.level < zone.minLevel) return 5;
    if (player.level > zone.maxLevel) return 2;
    const mid = (zone.minLevel + zone.maxLevel) / 2;
    const diff = Math.abs(player.level - mid);
    return Math.max(1, Math.min(5, Math.ceil((diff / (zone.maxLevel - zone.minLevel + 1)) * 5)));
}

function hasTeleportItem(player) {
    const inv = player?.inventory?.items || {};
    return Object.values(inv).some((it) => (it.name || '').toLowerCase() === 'teleport');
}

function consumeTeleport(player, client) {
    const inv = player?.inventory?.items || {};
    for (const [k, it] of Object.entries(inv)) {
        if ((it.name || '').toLowerCase() === 'teleport') { delete inv[k]; break; }
    }
    player.inventory.items = inv;
    client.gameManager.playerDB.savePlayer(player);
}

function hasPotion(player) {
    const inv = player?.inventory?.items || {};
    return Object.values(inv).some((it) => (it.name || '').toLowerCase().includes('poción de vida'));
}

function consumePotion(player) {
    const inv = player?.inventory?.items || {};
    for (const [k, it] of Object.entries(inv)) {
        if ((it.name || '').toLowerCase().includes('poción de vida')) { delete inv[k]; break; }
    }
    player.inventory.items = inv;
}

function makeBar(percent) {
    const len = 12;
    const filled = Math.floor((percent / 100) * len);
    return `${'▰'.repeat(filled)}${'▱'.repeat(len - filled)} ${percent}%`;
}

function createZoneSelectionMessage(selectedCategory = 'all') {
    const categoryName = ZONE_CATEGORIES.find(c => c.value === selectedCategory)?.name || 'Todos';
    const embed = new EmbedBuilder()
        .setTitle('🗺️ Selección de Zona de Exploración')
        .setColor('#45B7D1')
        .setDescription(`Categoría actual: **${categoryName}**\n\nElige la zona donde deseas explorar. Cada zona tiene diferentes niveles de dificultad y recompensas.`);

    const zones = zoneChoices(selectedCategory);
    const menu = new StringSelectMenuBuilder()
        .setCustomId('explore_zone_select')
        .setPlaceholder('🌍 Selecciona una zona...')
        .addOptions(zones.length > 0 ? zones : [{ label: 'Sin zonas disponibles', value: 'none', description: 'Cambia de categoría' }]);

    const categoryMenu = new StringSelectMenuBuilder()
        .setCustomId('explore_category_select')
        .setPlaceholder('🏷️ Filtrar por categoría...')
        .addOptions(ZONE_CATEGORIES.map(cat => ({
            label: `${cat.emoji} ${cat.name}`,
            value: cat.value,
            default: cat.value === selectedCategory
        })));

    const row1 = new ActionRowBuilder().addComponents(categoryMenu);
    const row2 = new ActionRowBuilder().addComponents(menu);

    return { embeds: [embed], components: [row1, row2] };
}

function createWalkingMessage(client, player, session) {
    const { zoneName, distanceRemaining, startDistance, objetivo, riesgo, maxEventos, history, lastEnemy, counters, startTime, isPaused } = session;
    const state = worldSystem.getWorldState();
    const isArrived = distanceRemaining <= 0;

    const percent = Math.max(0, Math.min(100, Math.floor(((startDistance - distanceRemaining) / startDistance) * 100)));
    const barLen = 10;
    const filled = Math.floor((percent / 100) * barLen);
    const bar = '🟩'.repeat(filled) + '⬜'.repeat(barLen - filled);
    const list = history.slice(-6).map((h) => `• ${h}`).join('\n') || 'Sin eventos';

    const title = `🚶 Caminando... ${isPaused ? '⏸️ PAUSADO' : ''}`;
    const color = isPaused ? '#FFA726' : '#45B7D1';

    const embed = new EmbedBuilder()
        .setAuthor({ name: title })
        .setColor(color)
        .setDescription(`Destino: **${zoneName}**\n${bar} ${percent}%\n${isArrived ? '¡Exploración infinita activa!' : `Distancia: ${distanceRemaining}m`}\nTiempo: ${formatElapsed(startTime)}`)
        .addFields(
            { name: 'Objetivo', value: objetivo.replace('_', ' '), inline: true },
            { name: 'Riesgo', value: String(riesgo), inline: true },
            { name: 'Máx. eventos', value: String(maxEventos), inline: true },
            { name: 'Hora Local', value: state.localTime, inline: true },
            { name: 'Clima', value: `${state.weather.emoji} ${state.weather.name}`, inline: true },
            { name: 'Eventos recientes', value: list, inline: false }
        );

    const stats = counters || { coins: 0, items: 0, chests: 0, enemies: 0, quirks: 0 };
    embed.addFields({
        name: 'Resumen',
        value: `PassCoins: ${stats.coins} • 📦 ${stats.items} • 💼 Cofres ${stats.chests} • 👹 ${stats.enemies} • ✨ ${stats.quirks}`,
        inline: false
    });

    const lootPct = Math.min(100, Math.floor((stats.coins % 200) / 2));
    const meetPct = Math.min(100, Math.floor((stats.enemies % 10) * 10));
    embed.addFields(
        { name: 'Loot', value: makeBar(lootPct), inline: true },
        { name: 'Encuentros', value: makeBar(meetPct), inline: true }
    );

    // Fila 1: Paneles de información
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('explore_travel_history').setLabel('Historial').setStyle(ButtonStyle.Secondary).setEmoji('📜'),
        new ButtonBuilder().setCustomId('explore_probabilities').setLabel('Probabilidades').setStyle(ButtonStyle.Secondary).setEmoji('📊'),
        new ButtonBuilder().setCustomId('explore_loot').setLabel('Loot').setStyle(ButtonStyle.Secondary).setEmoji('🎒'),
        new ButtonBuilder().setCustomId('explore_stats').setLabel('Estadísticas').setStyle(ButtonStyle.Secondary).setEmoji('📈'),
        new ButtonBuilder().setCustomId('explore_bag').setLabel('Mochila').setStyle(ButtonStyle.Primary).setEmoji('🎒')
    );

    // Fila 2: Controles de velocidad y ruta
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('explore_travel_speed_down').setLabel('Más lento').setStyle(ButtonStyle.Secondary).setEmoji('🐢'),
        new ButtonBuilder().setCustomId('explore_travel_speed_up').setLabel('Más rápido').setStyle(ButtonStyle.Primary).setEmoji('🐎'),
        new ButtonBuilder().setCustomId('explore_route').setLabel('Ruta').setStyle(ButtonStyle.Secondary).setEmoji('🧭'),
        new ButtonBuilder().setCustomId('explore_multipliers').setLabel('Multiplicadores').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
        new ButtonBuilder().setCustomId('explore_travel_stop').setLabel('Cancelar').setStyle(ButtonStyle.Danger).setEmoji('🛑')
    );

    const components = [row1, row2];

    // Fila 3: Botón de combate si hay enemigo
    if (lastEnemy) {
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('explore_travel_fight').setLabel('Enfrentar').setStyle(ButtonStyle.Danger).setEmoji('⚔️'),
            new ButtonBuilder().setCustomId('explore_travel_flee').setLabel('Huir').setStyle(ButtonStyle.Secondary).setEmoji('🏃')
        );
        components.push(row3);
    }

    return { embeds: [embed], components, files: [getPassCoinAttachment()] };
}

function createBagMessage(player, session) {
    const inv = player?.inventory || { items: {} };
    const economy = player?.economy || { passcoins: 0 };
    const items = Object.values(inv.items || {});
    const hasTp = items.some((it) => (it.name || '').toLowerCase() === 'teleport');
    const hasPot = items.some((it) => (it.name || '').toLowerCase().includes('poción de vida'));
    const obj = session?.objetivo || 'equilibrado';
    const embed = new EmbedBuilder().setTitle('🎒 Mochila').setColor('#8B4513').addFields({ name: 'PassCoins', value: String(economy.passcoins), inline: true }, { name: 'Objetivo actual', value: obj.replace('_', ' '), inline: true }, { name: 'Ítems', value: items.slice(-12).map((it) => `${it.rarity || 'Común'} • ${it.name}`).join('\n') || 'Vacío', inline: false });
    const row1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_bag_use_tp').setLabel('Usar Teleport').setStyle(ButtonStyle.Success).setEmoji('🧭').setDisabled(!hasTp), new ButtonBuilder().setCustomId('explore_bag_use_potion').setLabel('Usar Poción').setStyle(ButtonStyle.Success).setEmoji('🧪').setDisabled(!hasPot), new ButtonBuilder().setCustomId('explore_bag_close').setLabel('Cerrar').setStyle(ButtonStyle.Secondary).setEmoji('❌'));
    const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_obj_equilibrado').setLabel('Objetivo: Equilibrado').setStyle(ButtonStyle.Primary).setEmoji('🎯'), new ButtonBuilder().setCustomId('explore_obj_cofre').setLabel('Objetivo: Cofres').setStyle(ButtonStyle.Secondary).setEmoji('💰'), new ButtonBuilder().setCustomId('explore_obj_enemigo').setLabel('Objetivo: Enemigos').setStyle(ButtonStyle.Danger).setEmoji('⚔️'), new ButtonBuilder().setCustomId('explore_obj_quirk').setLabel('Objetivo: Quirk').setStyle(ButtonStyle.Secondary).setEmoji('✨'));
    return { embeds: [embed], components: [row1, row2], files: [getPassCoinAttachment()] };
}

function createProbabilityMessage(zoneName, state, objetivo, riesgo, player) {
    const base = { nada: 0.35, item: 0.22, passcoins: 0.12, arma: 0.1, cofre: 0.06, enemigo: 0.12, quirk: 0.03 };
    if (objetivo === 'buscar_enemigo') base.enemigo += 0.08;
    if (objetivo === 'buscar_cofre' || objetivo === 'tesoro') base.cofre += 0.08;
    if (objetivo === 'buscar_quirk') base.quirk += 0.05;
    if (state.weather.name === 'Tormenta') { base.enemigo += 0.05; base.nada -= 0.05; }
    if (state.weather.name === 'Lluvioso') base.item += 0.03;
    if (zoneName === 'Montañas Heladas') base.arma += 0.03;
    if (zoneName === 'Desierto de Fuego') base.enemigo += 0.03;
    if (zoneName === 'Ruinas Ancestrales') base.cofre += 0.03;
    const riskBoost = Math.max(0, Math.min(5, riesgo)) * 0.01;
    base.enemigo += riskBoost;
    const sum = Object.values(base).reduce((a, b) => a + b, 0);
    const pct = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.round((v / sum) * 100)]));
    const lines = [`Nada: ${pct.nada}%`, `Item: ${pct.item}%`, `PassCoins: ${pct.passcoins}%`, `Arma: ${pct.arma}%`, `Cofre: ${pct.cofre}%`, `Enemigo: ${pct.enemigo}%`, `Quirk: ${pct.quirk}%`].join('\n');
    const embed = new EmbedBuilder().setTitle('📊 Probabilidades de Sucesos').setColor('#6C5CE7').setDescription(lines).addFields({ name: 'Zona', value: zoneName, inline: true }, { name: 'Clima', value: `${state.weather.emoji} ${state.weather.name}`, inline: true }, { name: 'Objetivo', value: objetivo.replace('_', ' '), inline: true }, { name: 'Riesgo', value: String(riesgo), inline: true });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

function createLootMessage(player) {
    const inv = player?.inventory || { items: {} };
    const economy = player?.economy || { passcoins: 0 };
    const items = Object.values(inv.items || {});
    const head = `PassCoins: ${economy.passcoins}`;
    const list = items.slice(-15).map((it) => `${it.rarity || 'Común'} • ${it.name}`).join('\n') || 'Sin ítems';
    const embed = new EmbedBuilder().setTitle('🎒 Loot Reciente').setColor('#FFD700').setDescription(`${head}\n\n${list}`);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

function createHistoryMessage(history) {
    const list = history.slice(-12).map((h, i) => `${i + 1}. ${h}`).join('\n') || 'Sin eventos registrados';
    const embed = new EmbedBuilder().setTitle('📜 Historial de Viaje').setColor('#6C5CE7').setDescription(list);
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_view_prev').setLabel('Anterior').setStyle(ButtonStyle.Secondary).setEmoji('⬅️').setDisabled(history.eventIndex <= 0), new ButtonBuilder().setCustomId('explore_view_next').setLabel('Siguiente').setStyle(ButtonStyle.Secondary).setEmoji('➡️').setDisabled(history.eventIndex >= history.length - 1), new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

function createEventDetailMessage(session, player) {
    const idx = session.eventIndex || (session.history.length - 1);
    const total = session.history.length;
    const current = session.history[idx];
    const embed = new EmbedBuilder().setTitle(`📜 Evento ${idx + 1}/${total}`).setColor('#6C5CE7').setDescription(current || 'Sin detalle');
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_view_prev').setLabel('Anterior').setStyle(ButtonStyle.Secondary).setEmoji('⬅️').setDisabled(idx <= 0), new ButtonBuilder().setCustomId('explore_view_next').setLabel('Siguiente').setStyle(ButtonStyle.Secondary).setEmoji('➡️').setDisabled(idx >= total - 1), new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

function formatElapsed(startTime) {
    const ms = Date.now() - (startTime || Date.now());
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const ss = s % 60, mm = m % 60;
    if (h > 0) return `${h}h ${mm}m ${ss}s`;
    if (m > 0) return `${mm}m ${ss}s`;
    return `${ss}s`;
}

async function editSessionMessage(client, session, payload) {
    try {
        const channel = client.channels.cache.get(session.channelId) || await client.channels.fetch(session.channelId);
        const message = await channel.messages.fetch(session.messageId);
        await message.edit(payload);
    } catch { }
}

function maybeGenerateTravelEvent(client, player, zoneName, state, objetivo, riesgo, pity = 0) {
    const base = { nada: 0.35, item: 0.22, passcoins: 0.12, arma: 0.1, cofre: 0.06, enemigo: 0.12, quirk: 0.03 + pity };
    if (objetivo === 'buscar_enemigo') base.enemigo += 0.08;
    if (objetivo === 'buscar_cofre' || objetivo === 'tesoro') base.cofre += 0.08;
    if (objetivo === 'buscar_quirk') base.quirk += 0.05;
    if (state.weather.name === 'Tormenta') { base.enemigo += 0.05; base.nada -= 0.05; }
    if (state.weather.name === 'Lluvioso') base.item += 0.03;
    if (zoneName === 'Montañas Heladas') base.arma += 0.03;
    if (zoneName === 'Desierto de Fuego') base.enemigo += 0.03;
    if (zoneName === 'Ruinas Ancestrales') base.cofre += 0.03;
    const riskBoost = Math.max(0, Math.min(5, riesgo)) * 0.01;
    base.enemigo += riskBoost;
    const roll = Math.random();
    let acc = 0;
    const ordered = ['nada', 'passcoins', 'item', 'arma', 'cofre', 'enemigo', 'quirk'];
    let picked = 'nada';
    for (const k of ordered) { acc += base[k]; if (roll < acc) { picked = k; break; } }
    if (picked === 'nada') return null;
    if (picked === 'passcoins') { const amt = Math.floor(10 + Math.random() * 40); return { type: 'passcoins', amount: amt, summary: `Encontraste ${amt} PassCoins` }; }
    if (picked === 'item') { const id = `itm_${Date.now()}_${Math.floor(Math.random() * 999)}`; const types = ['Poción de Vida', 'Poción de Energía', 'Gema Común', 'Material']; const name = types[Math.floor(Math.random() * types.length)]; const item = { id, name, type: 'consumible', rarity: 'Común', value: 10 }; return { type: 'item', item, summary: `Item pequeño: ${name}` }; }
    if (picked === 'arma') { const id = `itm_${Date.now()}_${Math.floor(Math.random() * 999)}`; const types = ['Daga Ligera', 'Arco Simple']; const name = types[Math.floor(Math.random() * types.length)]; const item = { id, name, type: 'arma', rarity: 'Común', stats: { attack: Math.floor(5 + Math.random() * 10) } }; return { type: 'item', item, summary: `Arma encontrada: ${name}` }; }
    if (picked === 'cofre') { const chestType = Math.random() < 0.5 ? 'Cofre Común' : 'Cofre Épico'; const itemCount = chestType === 'Cofre Común' ? 1 : 2 + Math.floor(Math.random() * 2); const items = []; for (let i = 0; i < itemCount; i++) { const id = `itm_${Date.now()}_${Math.floor(Math.random() * 999)}`; const pool = ['Poción de Vida', 'Poción de Energía', 'Gema Encantada', 'Pergamino']; const name = pool[Math.floor(Math.random() * pool.length)]; const r = Math.random(); const rarity = chestType === 'Cofre Épico' ? (r < 0.2 ? 'Legendario' : r < 0.6 ? 'Épico' : 'Raro') : (r < 0.2 ? 'Raro' : 'Común'); items.push({ id, name, type: 'cofre_item', rarity, value: 25 }); } const gold = chestType === 'Cofre Épico' ? Math.floor(50 + Math.random() * 100) : Math.floor(20 + Math.random() * 50); return { type: 'cofre', chestType, items, gold, summary: `${chestType}: +${gold} monedas y ${items.length} objetos` }; }
    if (picked === 'enemigo') { const enemy = client.gameManager.getRandomEnemy(player.level, zoneName); return { type: 'enemigo', enemy, summary: `Aparece ${enemy.name} (Nv ${enemy.level})` }; }
    if (picked === 'quirk') { const names = ['Golpe Rápido', 'Buscador de Tesoros', 'Vitalidad']; const name = names[Math.floor(Math.random() * names.length)]; return { type: 'quirk', quirk: { name, type: 'travel' }, summary: `Eco de quirk: ${name}` }; }
    return null;
}

async function applyTravelEvent(client, player, ev) {
    if (ev.type === 'passcoins') { player.economy = player.economy || { passcoins: 0 }; player.economy.passcoins += ev.amount; return; }
    if (ev.type === 'item') { player.inventory = player.inventory || { items: {} }; player.inventory.items[ev.item.id] = ev.item; return; }
    if (ev.type === 'cofre') { player.economy = player.economy || { passcoins: 0 }; player.economy.passcoins += ev.gold; player.inventory = player.inventory || { items: {} }; for (const it of ev.items) player.inventory.items[it.id] = it; return; }
    if (ev.type === 'enemigo') { return; }
    if (ev.type === 'quirk') { player.quirks = player.quirks || []; if (!player.quirks.find((q) => q.name === ev.quirk.name)) player.quirks.push(ev.quirk); return; }
}

function createRouteMessage(s) {
    const segs = Math.max(5, Math.min(20, Math.floor(s.startDistance / s.stepMeters)));
    const done = Math.floor(((s.startDistance - s.distanceRemaining) / s.startDistance) * segs);
    const line = `${'🟩'.repeat(done)}${'⬜'.repeat(segs - done)} (${s.distanceRemaining}m)`;
    const embed = new EmbedBuilder().setTitle('🧭 Ruta').setColor('#45B7D1').setDescription(line).addFields({ name: 'Destino', value: s.zoneName, inline: true }, { name: 'Inicio', value: `${s.startDistance}m`, inline: true }, { name: 'Ritmo', value: `${s.stepMeters}m/tick`, inline: true });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

function createMultipliersMessage(s, state) {
    const zoneName = s?.zoneName || 'Reino de Akai';
    const objetivo = s?.objetivo || 'equilibrado';
    const riesgo = s?.riesgo || 3;
    const pity = s?.quirkPity || 0;
    const base = { nada: 0.35, item: 0.22, passcoins: 0.12, arma: 0.1, cofre: 0.06, enemigo: 0.12, quirk: 0.03 };
    const modifiers = [];
    if (objetivo === 'buscar_enemigo') { base.enemigo += 0.08; modifiers.push('🎯 Objetivo Enemigos: +8% enemigo'); }
    if (objetivo === 'buscar_cofre' || objetivo === 'tesoro') { base.cofre += 0.08; modifiers.push('🎯 Objetivo Cofres: +8% cofre'); }
    if (objetivo === 'buscar_quirk') { base.quirk += 0.05; modifiers.push('🎯 Objetivo Quirk: +5% quirk'); }
    if (state.weather.name === 'Tormenta') { base.enemigo += 0.05; base.nada -= 0.05; modifiers.push('⛈️ Tormenta: +5% enemigo, -5% nada'); }
    if (state.weather.name === 'Lluvioso') { base.item += 0.03; modifiers.push('🌧️ Lluvia: +3% item'); }
    if (zoneName === 'Montañas Heladas') { base.arma += 0.03; modifiers.push('❄️ Heladas: +3% arma'); }
    if (zoneName === 'Desierto de Fuego') { base.enemigo += 0.03; modifiers.push('🔥 Desierto: +3% enemigo'); }
    if (zoneName === 'Ruinas Ancestrales') { base.cofre += 0.03; modifiers.push('🏺 Ruinas: +3% cofre'); }
    const riskBoost = Math.max(0, Math.min(5, riesgo)) * 0.01;
    if (riskBoost > 0) { base.enemigo += riskBoost; modifiers.push(`⚠️ Riesgo: +${Math.round(riskBoost * 100)}% enemigo`); }
    if (pity > 0) { base.quirk += pity; modifiers.push(`✨ Pity Quirk: +${Math.round(pity * 100)}% quirk`); }
    const sum = Object.values(base).reduce((a, b) => a + b, 0);
    const pct = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.round((v / sum) * 100)]));
    const lines = [`Nada: ${pct.nada}%`, `Item: ${pct.item}%`, `PassCoins: ${pct.passcoins}%`, `Arma: ${pct.arma}%`, `Cofre: ${pct.cofre}%`, `Enemigo: ${pct.enemigo}%`, `Quirk: ${pct.quirk}%`].join('\n');
    const embed = new EmbedBuilder().setTitle('➕ Multiplicadores Activos').setColor('#00B8D9').setDescription(lines).addFields({ name: 'Zona', value: zoneName, inline: true }, { name: 'Clima', value: `${state.weather.emoji} ${state.weather.name}`, inline: true }, { name: 'Periodo', value: state.period || 'Desconocido', inline: true }, { name: 'Objetivo', value: objetivo.replace('_', ' '), inline: true }, { name: 'Riesgo', value: String(riesgo), inline: true });
    const modsText = modifiers.length ? modifiers.map(m => `• ${m}`).join('\n') : 'Sin modificadores adicionales';
    embed.addFields({ name: 'Detalle', value: modsText, inline: false });
    const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️'));
    return { embeds: [embed], components: [row], files: [passCoinImg] };
}

const TravelSessionStore = new Map();

module.exports = {
    data: new SlashCommandBuilder().setName('explorar').setDescription('Explora zonas del mundo en un único panel dinámico'),
    async execute(interaction, client) {
        console.log(`[DEBUG] Executing /explorar command for user ${interaction.user.id}`);
        try {
            const userId = interaction.user.id;
            let explorationSystem = client.gameManager.systems.exploration || ensureExplorationSystem(client);

            if (!explorationSystem) {
                console.error('[DEBUG] Exploration system not found.');
                await interaction.reply({ content: '❌ El sistema de exploración no está disponible en este momento.', ephemeral: true });
                return;
            }

            // Verificar si ya hay una sesión activa
            if (TravelSessionStore.has(userId)) {
                console.log('[DEBUG] Session already exists for user.');
                const s = TravelSessionStore.get(userId);
                const player = await client.gameManager.getPlayer(userId);
                await interaction.reply(createWalkingMessage(client, player, s));
                return;
            }

            console.log('[DEBUG] Creating zone selection message.');
            const msg = createZoneSelectionMessage();
            await interaction.reply({ ...msg, ephemeral: true });
            console.log('[DEBUG] Zone selection message sent.');

            // Reproducir música de Aventura (Desactivado temporalmente por error de protocolo DAVE)
            /*
            if (musicManager) {
                const member = interaction.member;
                if (member && member.voice.channel) {
                    try {
                        await musicManager.joinChannel(member.voice.channel);
                        musicManager.playFile('e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav', true);
                    } catch (e) { console.error('Error playing exploration music:', e); }
                }
            }
            */
        } catch (error) {
            console.error('[ERROR] Error executing /explorar:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Ocurrió un error al ejecutar el comando.', ephemeral: true });
            } else {
                await interaction.followUp({ content: '❌ Ocurrió un error al ejecutar el comando.', ephemeral: true });
            }
        }
    },
    async handleInteraction(interaction, client) {
        console.log(`[DEBUG] explorar.js handleInteraction called. ID: ${interaction.customId}`);
        try {
            const id = interaction.customId;
            const userId = interaction.user.id;
            if (interaction.isStringSelectMenu()) {
                console.log(`[DEBUG] Select menu interaction: ${id}, values: ${interaction.values}`);
                if (id === 'explore_zone_select') {
                    console.log(`[DEBUG] explore_zone_select triggered. Values: ${interaction.values}`);
                    const zoneName = interaction.values[0];
                    const player = await client.gameManager.getPlayer(userId);
                    let explorationSystem = client.gameManager.systems.exploration || ensureExplorationSystem(client);

                    if (!explorationSystem) {
                        console.error('[DEBUG] Exploration system missing in zone select.');
                        await interaction.reply({ content: '❌ El sistema de exploración no está disponible.', ephemeral: true });
                        return;
                    }

                    const zone = explorationSystem.zones[zoneName];
                    console.log(`[DEBUG] Zone retrieved: ${zone ? zone.name : 'undefined'}`);

                    if (!zone) {
                        console.error(`[DEBUG] Zone not found: ${zoneName}`);
                        await interaction.reply({ content: '❌ Zona no encontrada.', ephemeral: true });
                        return;
                    }
                    const state = worldSystem.getWorldState();
                    const panel = new EmbedBuilder()
                        .setTitle(`${getEmoji('greenrose')} Exploración: Panel Inicial`)
                        .setColor('#45B7D1')
                        .addFields(
                            { name: 'Zona', value: zoneName, inline: true },
                            { name: 'Hora Local', value: state.localTime, inline: true },
                            { name: 'Clima', value: `${state.weather.emoji} ${state.weather.name}`, inline: true }
                        );
                    const controls = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('explore_mode_auto').setLabel('Automático').setStyle(ButtonStyle.Success).setEmoji('🔁'),
                        new ButtonBuilder().setCustomId('explore_mode_manual_next').setLabel('Siguiente').setStyle(ButtonStyle.Primary).setEmoji('➡️'),
                        new ButtonBuilder().setCustomId('explore_mode_pause').setLabel('Pausar').setStyle(ButtonStyle.Secondary).setEmoji('⏸️'),
                        new ButtonBuilder().setCustomId('explore_mode_resume').setLabel('Reanudar').setStyle(ButtonStyle.Success).setEmoji('▶️'),
                        new ButtonBuilder().setCustomId('explore_route').setLabel('Ruta').setStyle(ButtonStyle.Secondary).setEmoji('🧭'),
                        new ButtonBuilder().setCustomId('explore_multipliers').setLabel('Multiplicadores').setStyle(ButtonStyle.Secondary).setEmoji('➕'),
                        new ButtonBuilder().setCustomId('explore_back_zone_select').setLabel('Atrás (Zona)').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
                    );
                    await interaction.update({ embeds: [panel], components: [controls] });
                    const startDistance = computeDistance(player.exploration?.currentZone || zoneName, zoneName);
                    const step = Math.max(50, Math.floor(startDistance / 30));
                    TravelSessionStore.set(userId, { userId, zoneName, distanceRemaining: startDistance, startDistance, objetivo: 'equilibrado', riesgo: computeRisk(player, zone), maxEventos: 3, history: [], intervalId: null, lastEnemy: null, stepMeters: step, startTime: Date.now(), counters: { coins: 0, items: 0, chests: 0, enemies: 0, quirks: 0 }, nextTimeRewardAt: Date.now() + 60000, milestones: { m5: false, m10: false }, quirkPity: 0, channelId: interaction.channelId, messageId: interaction.message.id });
                    return;
                }
            }
            if (id === 'explore_travel_stop') { const s = TravelSessionStore.get(userId); if (s && s.intervalId) clearInterval(s.intervalId); TravelSessionStore.delete(userId); await interaction.reply({ content: 'Viaje cancelado.', ephemeral: true }); return; }
            if (id === 'explore_travel_tp') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const player = await client.gameManager.getPlayer(userId); if (!hasTeleportItem(player)) { await interaction.reply({ content: 'No tienes Teleport.', ephemeral: true }); return; } consumeTeleport(player, client); s.distanceRemaining = 0; await interaction.reply({ content: 'Usaste Teleport.', ephemeral: true }); return; }
            if (id === 'explore_use_potion') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const player = await client.gameManager.getPlayer(userId); if (!hasPotion(player)) { await interaction.reply({ content: 'No tienes Poción de Vida.', ephemeral: true }); return; } consumePotion(player); await client.gameManager.playerDB.savePlayer(player); s.history.push('Usaste una Poción de Vida durante el viaje'); await interaction.reply({ content: 'Poción usada.', ephemeral: true }); return; }
            if (id === 'explore_bag') { const s = TravelSessionStore.get(userId); const player = await client.gameManager.getPlayer(userId); const msg = createBagMessage(player, s); await interaction.update(msg); return; }
            if (id === 'explore_bag_use_tp' || id === 'explore_bag_use_potion') { const s = TravelSessionStore.get(userId); const player = await client.gameManager.getPlayer(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } if (id === 'explore_bag_use_tp') { if (!hasTeleportItem(player)) { await interaction.reply({ content: 'No tienes Teleport.', ephemeral: true }); return; } consumeTeleport(player, client); s.distanceRemaining = 0; await interaction.reply({ content: 'Teleport usado.', ephemeral: true }); return; } if (!hasPotion(player)) { await interaction.reply({ content: 'No tienes Poción de Vida.', ephemeral: true }); return; } consumePotion(player); await client.gameManager.playerDB.savePlayer(player); s.history.push('Poción de Vida usada'); await interaction.reply({ content: 'Poción usada.', ephemeral: true }); return; }
            if (id.startsWith('explore_obj_')) { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const map = { 'explore_obj_equilibrado': 'equilibrado', 'explore_obj_cofre': 'buscar_cofre', 'explore_obj_enemigo': 'buscar_enemigo', 'explore_obj_quirk': 'buscar_quirk' }; s.objetivo = map[id] || 'equilibrado'; await interaction.reply({ content: `Objetivo: ${s.objetivo.replace('_', ' ')}`, ephemeral: true }); return; }
            if (id === 'explore_bag_close') { const s = TravelSessionStore.get(userId); if (!s) return; const player = await client.gameManager.getPlayer(userId); const state = worldSystem.getWorldState(); await interaction.update(createWalkingMessage(client, player, { zoneName: s.zoneName, remaining: s.distanceRemaining, startDistance: s.startDistance, objetivo: s.objetivo, riesgo: s.riesgo, maxEventos: s.maxEventos, state, history: s.history, lastEnemy: s.lastEnemy, counters: s.counters, startTime: s.startTime, isPaused: s.isPaused })); return; }
            if (id === 'explore_probabilities') { const s = TravelSessionStore.get(userId); const player = await client.gameManager.getPlayer(userId); const state = worldSystem.getWorldState(); const msg = createProbabilityMessage(s ? s.zoneName : (player?.exploration?.currentZone || 'Reino de Akai'), state, s ? s.objetivo : 'equilibrado', s ? s.riesgo : 3, player); await interaction.update(msg); return; }
            if (id === 'explore_loot') { const s = TravelSessionStore.get(userId); const player = await client.gameManager.getPlayer(userId); const msg = createLootMessage(player); await interaction.update(msg); return; }
            if (id === 'explore_stats') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const embed = new EmbedBuilder().setTitle('📈 Estadísticas de Viaje').setColor('#32CD32').addFields({ name: 'Tiempo', value: formatElapsed(s.startTime), inline: true }, { name: 'Destino', value: s.zoneName, inline: true }, { name: 'Distancia restante', value: `${s.distanceRemaining}m`, inline: true }, { name: 'Monedas', value: String(s.counters.coins), inline: true }, { name: 'Ítems', value: String(s.counters.items), inline: true }, { name: 'Cofres', value: String(s.counters.chests), inline: true }, { name: 'Enemigos', value: String(s.counters.enemies), inline: true }, { name: 'Quirks', value: String(s.counters.quirks), inline: true }); const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('explore_travel_back').setLabel('Volver').setStyle(ButtonStyle.Primary).setEmoji('⬅️')); await interaction.update({ embeds: [embed], components: [row], files: [passCoinImg] }); return; }
            if (id === 'explore_travel_speed_up' || id === 'explore_travel_speed_down') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } if (id === 'explore_travel_speed_up') s.stepMeters = Math.min(s.stepMeters + 50, Math.max(100, Math.floor(s.startDistance / 10))); else s.stepMeters = Math.max(20, s.stepMeters - 50); await interaction.reply({ content: `Ritmo ajustado a ${s.stepMeters}m/tick.`, ephemeral: true }); return; }
            if (id === 'explore_travel_history') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const player = await client.gameManager.getPlayer(userId); const msg = createHistoryMessage(s.history); await interaction.update(msg); return; }
            if (id === 'explore_view_prev' || id === 'explore_view_next') { const s = TravelSessionStore.get(userId); if (!s || s.history.length === 0) { await interaction.reply({ content: 'Sin eventos para navegar.', ephemeral: true }); return; } s.eventIndex = s.eventIndex === undefined ? s.history.length - 1 : s.eventIndex; if (id === 'explore_view_prev') s.eventIndex = Math.max(0, s.eventIndex - 1); else s.eventIndex = Math.min(s.history.length - 1, s.eventIndex + 1); const player = await client.gameManager.getPlayer(userId); await interaction.update(createEventDetailMessage(s, player)); return; }
            if (id === 'explore_travel_back') { const s = TravelSessionStore.get(userId); if (!s) return; const player = await client.gameManager.getPlayer(userId); const state = worldSystem.getWorldState(); await interaction.update(createWalkingMessage(client, player, { zoneName: s.zoneName, remaining: s.distanceRemaining, startDistance: s.startDistance, objetivo: s.objetivo, riesgo: s.riesgo, maxEventos: s.maxEventos, state, history: s.history, lastEnemy: s.lastEnemy, counters: s.counters, startTime: s.startTime, isPaused: s.isPaused })); return; }
            if (id === 'explore_route') { const s = TravelSessionStore.get(userId); if (!s) { await interaction.reply({ content: 'No estás viajando.', ephemeral: true }); return; } const msg = createRouteMessage(s); await interaction.update(msg); return; }
            if (id === 'explore_multipliers') { const s = TravelSessionStore.get(userId); const state = worldSystem.getWorldState(); const msg = createMultipliersMessage(s, state); await interaction.update(msg); return; }
            if (id === 'explore_travel_fight' || id === 'explore_travel_flee') { const s = TravelSessionStore.get(userId); if (!s || !s.lastEnemy) { await interaction.reply({ content: 'No hay enemigo activo.', ephemeral: true }); return; } if (id === 'explore_travel_flee') { s.history.push('Huiste del enemigo'); s.lastEnemy = null; await interaction.reply({ content: 'Has huido.', ephemeral: true }); return; } const player = await client.gameManager.getPlayer(userId); if (client.gameManager.systems.combat) { await client.gameManager.systems.combat.startBattle(interaction, player, s.lastEnemy); s.history.push(`Combate iniciado con ${s.lastEnemy.name}`); s.lastEnemy = null; return; } await interaction.reply({ content: 'Sistema de combate no disponible.', ephemeral: true }); }
            if (id === 'explore_back_zone_select') { await interaction.update(createZoneSelectionMessage()); TravelSessionStore.delete(userId); return; }

            if (id === 'explore_mode_auto') {
                const s = TravelSessionStore.get(userId);
                if (!s) { await interaction.reply({ content: 'Primero elige una zona.', ephemeral: true }); return; }
                if (s.intervalId) { await interaction.reply({ content: 'Modo automático ya activo.', ephemeral: true }); return; }

                const player = await client.gameManager.getPlayer(userId);
                s.isPaused = false;

                const runTick = async () => {
                    try {
                        if (s.isPaused) return;

                        // Generar evento
                        const ev = maybeGenerateTravelEvent(client, player, s.zoneName, worldSystem.getWorldState(), s.objetivo, s.riesgo, s.quirkPity || 0);
                        if (ev) {
                            await applyTravelEvent(client, player, ev);
                            s.history.push(ev.summary);
                            if (s.history.length > 6) s.history.shift();
                            if (ev.type === 'enemigo') s.lastEnemy = ev.enemy; else s.lastEnemy = null;
                            if (ev.type === 'passcoins') s.counters.coins += ev.amount;
                            if (ev.type === 'item') s.counters.items += 1;
                            if (ev.type === 'cofre') { s.counters.chests += 1; s.counters.items += ev.items.length; s.counters.coins += ev.gold; }
                            if (ev.type === 'enemigo') s.counters.enemies += 1;
                            if (ev.type === 'quirk') { s.counters.quirks += 1; s.quirkPity = 0; }
                        }

                        s.quirkPity = Math.min(0.15, (s.quirkPity || 0) + 0.01);

                        // Reducir distancia si aun no llegamos
                        if (s.distanceRemaining > 0) {
                            s.distanceRemaining = Math.max(0, s.distanceRemaining - s.stepMeters);
                        }

                        // Recompensas por tiempo
                        if (Date.now() >= s.nextTimeRewardAt) {
                            const bonus = Math.floor(5 + Math.random() * 10);
                            player.economy = player.economy || { passcoins: 0 };
                            player.economy.passcoins += bonus;
                            s.counters.coins += bonus;
                            s.history.push(`Tiempo: +${bonus} PassCoins`);
                            if (s.history.length > 6) s.history.shift();
                            s.nextTimeRewardAt = Date.now() + 60000;
                        }

                        await client.gameManager.playerDB.savePlayer(player);
                        await editSessionMessage(client, s, createWalkingMessage(client, player, s));
                    } catch (e) {
                        console.error(e);
                        if (s.intervalId) clearInterval(s.intervalId);
                    }
                };

                s.intervalId = setInterval(runTick, 4000);
                await interaction.reply({ content: 'Modo automático activado (Infinito).', ephemeral: true });
                return;
            }

            if (id === 'explore_mode_manual_next') {
                const s = TravelSessionStore.get(userId);
                if (!s) { await interaction.reply({ content: 'Primero elige una zona.', ephemeral: true }); return; }
                const player = await client.gameManager.getPlayer(userId);

                if (s.distanceRemaining > 0) {
                    s.distanceRemaining = Math.max(0, s.distanceRemaining - s.stepMeters);
                }

                const ev = maybeGenerateTravelEvent(client, player, s.zoneName, worldSystem.getWorldState(), s.objetivo, s.riesgo, s.quirkPity || 0);
                if (ev) {
                    await applyTravelEvent(client, player, ev);
                    s.history.push(ev.summary);
                    if (s.history.length > 6) s.history.shift();
                    if (ev.type === 'enemigo') s.lastEnemy = ev.enemy; else s.lastEnemy = null;
                    if (ev.type === 'passcoins') s.counters.coins += ev.amount;
                    if (ev.type === 'item') s.counters.items += 1;
                    if (ev.type === 'cofre') { s.counters.chests += 1; s.counters.items += ev.items.length; s.counters.coins += ev.gold; }
                    if (ev.type === 'enemigo') s.counters.enemies += 1;
                    if (ev.type === 'quirk') { s.counters.quirks += 1; s.quirkPity = 0; }
                }
                s.quirkPity = Math.min(0.15, (s.quirkPity || 0) + 0.01);

                await client.gameManager.playerDB.savePlayer(player);
                await interaction.update(createWalkingMessage(client, player, s));
                return;
            }
            if (id === 'explore_mode_pause') {
                const s = TravelSessionStore.get(userId);
                if (!s) { await interaction.reply({ content: 'No hay una sesión de exploración activa para pausar.', ephemeral: true }); return; }
                if (s.isPaused) { await interaction.reply({ content: 'La exploración ya está pausada.', ephemeral: true }); return; }
                s.isPaused = true;
                if (s.intervalId) {
                    clearInterval(s.intervalId);
                    s.intervalId = null;
                }
                const player = await client.gameManager.getPlayer(userId);
                await interaction.update(createWalkingMessage(client, player, s));
                await interaction.followUp({ content: 'Exploración pausada.', ephemeral: true });
                return;
            }
            if (id === 'explore_mode_resume') {
                const s = TravelSessionStore.get(userId);
                if (!s) { await interaction.reply({ content: 'No hay una sesión de exploración activa para reanudar.', ephemeral: true }); return; }
                if (!s.isPaused) { await interaction.reply({ content: 'La exploración no está pausada.', ephemeral: true }); return; }
                s.isPaused = false;
                const player = await client.gameManager.getPlayer(userId);
                const runTick = async () => {
                    try {
                        if (s.isPaused) return;

                        // Generar evento
                        const ev = maybeGenerateTravelEvent(client, player, s.zoneName, worldSystem.getWorldState(), s.objetivo, s.riesgo, s.quirkPity || 0);
                        if (ev) {
                            await applyTravelEvent(client, player, ev);
                            s.history.push(ev.summary);
                            if (s.history.length > 6) s.history.shift();
                            if (ev.type === 'enemigo') s.lastEnemy = ev.enemy; else s.lastEnemy = null;
                            if (ev.type === 'passcoins') s.counters.coins += ev.amount;
                            if (ev.type === 'item') s.counters.items += 1;
                            if (ev.type === 'cofre') { s.counters.chests += 1; s.counters.items += ev.items.length; s.counters.coins += ev.gold; }
                            if (ev.type === 'enemigo') s.counters.enemies += 1;
                            if (ev.type === 'quirk') { s.counters.quirks += 1; s.quirkPity = 0; }
                        }

                        s.quirkPity = Math.min(0.15, (s.quirkPity || 0) + 0.01);

                        // Reducir distancia si aun no llegamos
                        if (s.distanceRemaining > 0) {
                            s.distanceRemaining = Math.max(0, s.distanceRemaining - s.stepMeters);
                        }

                        // Recompensas por tiempo
                        if (Date.now() >= s.nextTimeRewardAt) {
                            const bonus = Math.floor(5 + Math.random() * 10);
                            player.economy = player.economy || { passcoins: 0 };
                            player.economy.passcoins += bonus;
                            s.counters.coins += bonus;
                            s.history.push(`Tiempo: +${bonus} PassCoins`);
                            if (s.history.length > 6) s.history.shift();
                            s.nextTimeRewardAt = Date.now() + 60000;
                        }

                        await client.gameManager.playerDB.savePlayer(player);
                        await editSessionMessage(client, s, createWalkingMessage(client, player, s));
                    } catch (e) {
                        console.error(e);
                        if (s.intervalId) clearInterval(s.intervalId);
                    }
                };
                s.intervalId = setInterval(runTick, 4000);
                await interaction.update(createWalkingMessage(client, player, s));
                await interaction.followUp({ content: 'Exploración reanudada.', ephemeral: true });
                return;
            }
        } catch (error) {
            console.error('Error en handleInteraction de explorar:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Ocurrió un error al procesar la exploración.', ephemeral: true });
            }
        }
    }
};