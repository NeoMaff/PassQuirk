const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { PassQuirkEmbed, BattleEmbed, ShopEmbed, InventoryEmbed } = require('../utils/embedStyles');
const User = require('../models/User');
const passquirkData = require('../data/passquirkData');

module.exports = {
    // Manejo del menú principal de navegación
    async handleMainNavigation(interaction) {
        try {
            const selectedOption = interaction.values[0];
            const user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (!user || !user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ Necesitas crear un personaje primero. Usa `/passquirkrpg` para comenzar.',
                    ephemeral: true
                });
            }

            switch (selectedOption) {
                case 'explore':
                    await this.showExploration(interaction, user);
                    break;
                case 'battle':
                    await this.showBattleOptions(interaction, user);
                    break;
                case 'inventory':
                    await this.showInventory(interaction, user);
                    break;
                case 'shop':
                    await this.showShop(interaction, user);
                    break;
                case 'quests':
                    await this.showQuests(interaction, user);
                    break;
                case 'profile':
                    await this.showProfile(interaction, user);
                    break;
                case 'settings':
                    await this.showSettings(interaction, user);
                    break;
                default:
                    await interaction.reply({
                        content: '❌ Opción no válida.',
                        ephemeral: true
                    });
            }
        } catch (error) {
            console.error('Error en handleMainNavigation:', error);
            await interaction.reply({
                content: '❌ Error al procesar la navegación.',
                ephemeral: true
            });
        }
    },

    // Mostrar opciones de exploración
    async showExploration(interaction, user) {
        const embed = new PassQuirkEmbed()
            .setTitle('🗺️ Exploración - ' + user.location.region)
            .setDescription(
                `**Ubicación Actual:** ${user.location.zone}\n\n` +
                '🌍 **Regiones Oficiales de PassQuirk:**\n\n' +
                '🌟 **Reino de Akai** - Tierra de fuego y valor (Nivel 1-10)\n' +
                '🌟 **Reino de Say** - Reino de magia y sabiduría (Nivel 1-10)\n' +
                '🌟 **Reino de Masai** - Desiertos y mercenarios (Nivel 1-10)\n' +
                '❄️ **Montañas Heladas** - Frío extremo y criaturas de hielo (Nivel 10-15)\n' +
                '🔥 **Desierto de las Ilusiones** - Dragones legendarios (Nivel 15-20)\n' +
                '👹 **Isla del Rey Demonio** - Desafío supremo (Nivel 30+)\n\n' +
                '💡 **Consejo:** Cada región tiene enemigos únicos y recompensas especiales.'
            )
            .setColor('#00B894')
            .addFields(
                {
                    name: '📊 Tu Progreso',
                    value: `Nivel: ${user.rpgStats.level} | XP: ${user.rpgStats.xp}`,
                    inline: true
                },
                {
                    name: '🎯 Recomendación',
                    value: user.rpgStats.level < 5 ? 'Centro de Inicio' : user.rpgStats.level < 10 ? 'Región de Akai' : 'Región de Say',
                    inline: true
                }
            );

        const regionMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_region')
                    .setPlaceholder('🗺️ Selecciona una región para explorar...')
                    .addOptions([
                        {
                            label: '🌟 Reino de Akai',
                            description: 'Tierra de fuego y valor - Nivel 1-10',
                            value: 'reino_akai',
                            emoji: '🌟'
                        },
                        {
                            label: '🌟 Reino de Say',
                            description: 'Reino de magia y sabiduría - Nivel 1-10',
                            value: 'reino_say',
                            emoji: '🌟'
                        },
                        {
                            label: '🌟 Reino de Masai',
                            description: 'Desiertos y mercenarios - Nivel 1-10',
                            value: 'reino_masai',
                            emoji: '🌟'
                        },
                        {
                            label: '❄️ Montañas Heladas',
                            description: 'Frío extremo - Nivel 10-15',
                            value: 'montanas_heladas',
                            emoji: '❄️'
                        },
                        {
                            label: '🔥 Desierto de las Ilusiones',
                            description: 'Dragones legendarios - Nivel 15-20',
                            value: 'desierto_ilusiones',
                            emoji: '🔥'
                        },
                        {
                            label: '👹 Isla del Rey Demonio',
                            description: 'Desafío supremo - Nivel 30+',
                            value: 'isla_rey_demonio',
                            emoji: '👹'
                        }
                    ])
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [regionMenu, backButton]
        });
    },

    // Mostrar opciones de batalla
    async showBattleOptions(interaction, user) {
        const embed = new BattleEmbed(
            '⚔️ Centro de Combate',
            `¡Prepárate para la batalla, ${user.characterName}!\n\n` +
            '🎯 **Opciones de Combate Disponibles:**\n\n' +
            '🤖 **Entrenamiento** - Lucha contra dummies de práctica\n' +
            '👹 **Enemigos Salvajes** - Encuentra criaturas en la naturaleza\n' +
            '🏟️ **Arena PvP** - Desafía a otros jugadores\n' +
            '🏆 **Torneos** - Participa en competencias épicas\n' +
            '🐉 **Jefes de Mazmorra** - Enfrenta desafíos legendarios\n\n' +
            `💪 **Tu Poder de Combate:** ${this.calculateCombatPower(user)}`
        );

        const battleMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_battle_type')
                    .setPlaceholder('⚔️ Elige tu tipo de batalla...')
                    .addOptions([
                        {
                            label: '🤖 Entrenamiento',
                            description: 'Práctica segura sin riesgo',
                            value: 'training',
                            emoji: '🤖'
                        },
                        {
                            label: '👹 Enemigos Salvajes',
                            description: 'Caza criaturas por XP y botín',
                            value: 'wild_enemies',
                            emoji: '👹'
                        },
                        {
                            label: '🏟️ Arena PvP',
                            description: 'Lucha contra otros jugadores',
                            value: 'pvp_arena',
                            emoji: '🏟️'
                        },
                        {
                            label: '🏆 Torneos',
                            description: 'Competencias con grandes premios',
                            value: 'tournaments',
                            emoji: '🏆'
                        },
                        {
                            label: '🐉 Jefes de Mazmorra',
                            description: 'Desafíos épicos y legendarios',
                            value: 'dungeon_bosses',
                            emoji: '🐉'
                        }
                    ])
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [battleMenu, backButton]
        });
    },

    // Mostrar inventario
    async showInventory(interaction, user) {
        const embed = new InventoryEmbed(
            `🎒 Inventario de ${user.characterName}`,
            user.inventory.length > 0 ? 
                'Aquí están todos tus objetos y equipo:' : 
                'Tu inventario está vacío. ¡Sal a explorar para encontrar objetos!'
        );

        // Mostrar equipo equipado
        let equippedGear = '**🛡️ Equipo Equipado:**\n';
        equippedGear += `⚔️ Arma: ${user.equipment?.weapon?.name || 'Ninguna'}\n`;
        equippedGear += `🛡️ Armadura: ${user.equipment?.armor?.name || 'Ninguna'}\n`;
        equippedGear += `💍 Accesorio: ${user.equipment?.accessory?.name || 'Ninguno'}\n\n`;

        // Mostrar inventario
        if (user.inventory.length > 0) {
            let inventoryText = '**🎒 Objetos en Inventario:**\n';
            user.inventory.slice(0, 10).forEach(item => {
                const rarity = this.getRarityEmoji(item.rarity);
                inventoryText += `${rarity} ${item.name} x${item.amount}\n`;
            });
            
            if (user.inventory.length > 10) {
                inventoryText += `\n... y ${user.inventory.length - 10} objetos más`;
            }
            
            embed.setDescription(equippedGear + inventoryText);
        } else {
            embed.setDescription(equippedGear + '*No tienes objetos en tu inventario.*');
        }

        const inventoryButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('manage_equipment')
                    .setLabel('⚔️ Gestionar Equipo')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('use_items')
                    .setLabel('🧪 Usar Objetos')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('sell_items')
                    .setLabel('💰 Vender Objetos')
                    .setStyle(ButtonStyle.Secondary)
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [inventoryButtons, backButton]
        });
    },

    // Mostrar tienda
    async showShop(interaction, user) {
        const embed = new ShopEmbed(
            '🛒 Tienda Oficial de PassQuirk',
            `¡Bienvenido a la tienda, ${user.characterName}!\n\n` +
            `💰 **Monedas:** ${user.balance}\n` +
            `💎 **Gemas:** ${user.gems}\n\n` +
            '🛍️ **Categorías Oficiales:**\n\n' +
            '🧪 **Consumibles** - Pociones de vida y energía\n' +
            '⚔️ **Equipamiento** - Armas y escudos mágicos\n' +
            '💎 **Especiales** - Gemas encantadas y artefactos\n' +
            '🧿 **Legendarios** - Objetos únicos como LOY\n\n' +
            '✨ **Destacado:** LOY - Igualador de stats (10,000 monedas)'
        );

        embed.addFields(
            {
                name: '🧪 Consumibles',
                value: 'Pociones de vida (50) y energía (75)',
                inline: true
            },
            {
                name: '⚔️ Equipamiento',
                value: 'Armas raras (500) y escudos mágicos (450)',
                inline: true
            },
            {
                name: '💎 Especiales',
                value: 'Gemas encantadas (1,000)',
                inline: true
            },
            {
                name: '🏺 Artefactos',
                value: 'Mejoras permanentes (5,000)',
                inline: true
            },
            {
                name: '🧿 LOY (Legendario)',
                value: 'Igualador de stats - 1 uso cada 72h',
                inline: true
            },
            {
                name: '💡 Consejo',
                value: 'LOY te permite enfrentar enemigos élite',
                inline: true
            }
        );

        const shopMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_shop_category')
                    .setPlaceholder('🛒 Selecciona una categoría...')
                    .addOptions([
                        {
                            label: '🧪 Consumibles',
                            description: 'Pociones de vida y energía',
                            value: 'consumibles',
                            emoji: '🧪'
                        },
                        {
                            label: '⚔️ Equipamiento',
                            description: 'Armas raras y escudos mágicos',
                            value: 'equipamiento',
                            emoji: '⚔️'
                        },
                        {
                            label: '💎 Especiales',
                            description: 'Gemas encantadas y mejoras',
                            value: 'especiales',
                            emoji: '💎'
                        },
                        {
                            label: '🧿 LOY (Legendario)',
                            description: 'Igualador de stats - Objeto único',
                            value: 'loy_especial',
                            emoji: '🧿'
                        }
                    ])
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [shopMenu, backButton]
        });
    },

    // Mostrar misiones
    async showQuests(interaction, user) {
        const embed = new PassQuirkEmbed()
            .setTitle('📜 Centro de Misiones')
            .setColor('#FDCB6E');

        let questsText = `**¡Misiones disponibles para ${user.characterName}!**\n\n`;
        
        if (user.quests && user.quests.length > 0) {
            const activeQuests = user.quests.filter(q => q.status === 'Activa');
            const completedQuests = user.quests.filter(q => q.status === 'Completada');
            
            if (activeQuests.length > 0) {
                questsText += '**🎯 Misiones Activas:**\n';
                activeQuests.forEach(quest => {
                    const progress = Math.round((quest.progress / quest.maxProgress) * 100);
                    questsText += `📋 ${quest.name} - ${progress}% completado\n`;
                });
                questsText += '\n';
            }
            
            if (completedQuests.length > 0) {
                questsText += `**✅ Misiones Completadas:** ${completedQuests.length}\n\n`;
            }
        }
        
        questsText += '**🆕 Nuevas Misiones Disponibles:**\n';
        questsText += '🌟 Tutorial Básico - Aprende los fundamentos\n';
        questsText += '⚔️ Primera Batalla - Derrota a 3 enemigos\n';
        questsText += '🗺️ Explorador Novato - Visita 2 regiones diferentes\n';
        questsText += '💰 Comerciante - Compra tu primer objeto\n';
        
        embed.setDescription(questsText);

        const questButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_tutorial')
                    .setLabel('📚 Aceptar Tutorial')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('view_all_quests')
                    .setLabel('📜 Ver Todas las Misiones')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('quest_rewards')
                    .setLabel('🎁 Reclamar Recompensas')
                    .setStyle(ButtonStyle.Success)
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [questButtons, backButton]
        });
    },

    // Mostrar perfil detallado
    async showProfile(interaction, user) {
        const passquirkData = require('../data/passquirkData');
        
        const embed = new PassQuirkEmbed()
            .setTitle(`👤 Perfil de ${user.characterName || 'Aventurero'}`)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor('#6C5CE7');

        // Calcular poder de combate total
        const combatPower = (user.rpgStats?.attack || 10) + (user.rpgStats?.defense || 5) + (user.rpgStats?.speed || 8) + (user.rpgStats?.intelligence || 7);
        
        // Información básica mejorada
        embed.addFields(
            {
                name: '🎭 Información del Aventurero',
                value: 
                    `**Nombre:** ${user.characterName || 'Sin nombre'}\n` +
                    `**Clase:** ${user.characterClass || 'Sin clase'} ⭐\n` +
                    `**Nivel:** ${user.rpgStats?.level || 1} 📊\n` +
                    `**Experiencia:** ${user.rpgStats?.xp || 0}/100 XP\n` +
                    `**Poder de Combate:** ${combatPower} ⚡`,
                inline: true
            },
            {
                name: '💪 Estadísticas de Combate',
                value: 
                    `❤️ **HP:** ${user.rpgStats?.hp || 100}/${user.rpgStats?.maxHp || 100}\n` +
                    `💙 **MP:** ${user.rpgStats?.mp || 50}/${user.rpgStats?.maxMp || 50}\n` +
                    `⚔️ **Ataque:** ${user.rpgStats?.attack || 10}\n` +
                    `🛡️ **Defensa:** ${user.rpgStats?.defense || 5}\n` +
                    `⚡ **Velocidad:** ${user.rpgStats?.speed || 8}\n` +
                    `🧠 **Inteligencia:** ${user.rpgStats?.intelligence || 7}`,
                inline: true
            },
            {
                name: '💰 Recursos y Ubicación',
                value: 
                    `🪙 **Monedas:** ${user.balance || 1000}\n` +
                    `💎 **Gemas:** ${user.gems || 0}\n` +
                    `🎯 **PG:** ${user.pg || 0}\n` +
                    `🗺️ **Región:** ${user.location?.region || 'Centro de Inicio'}\n` +
                    `📍 **Zona:** ${user.location?.zone || 'Plaza Principal'}`,
                inline: true
            }
        );

        // Quirks activos con información detallada
        if (user.quirks && user.quirks.length > 0) {
            let quirksText = '';
            user.quirks.forEach(quirk => {
                const rarity = this.getRarityEmoji(quirk.rarity);
                quirksText += `${rarity} **${quirk.name}** (Nivel ${quirk.level})\n`;
                if (quirk.description) {
                    quirksText += `   └ ${quirk.description}\n`;
                }
            });
            embed.addFields({ name: '🌟 Quirks Activos', value: quirksText, inline: false });
        } else {
            embed.addFields({ 
                name: '🌟 Quirks Activos', 
                value: '❌ Ningún Quirk desbloqueado aún\n💡 ¡Completa misiones para desbloquear tu primer Quirk!', 
                inline: false 
            });
        }
        
        // Equipamiento actual
        const equipment = user.equipment || {};
        let equipText = '';
        equipText += `⚔️ **Arma:** ${equipment.weapon?.name || 'Ninguna'} ${equipment.weapon?.emoji || ''}\n`;
        equipText += `🛡️ **Armadura:** ${equipment.armor?.name || 'Ninguna'} ${equipment.armor?.emoji || ''}\n`;
        equipText += `💍 **Accesorio:** ${equipment.accessory?.name || 'Ninguno'} ${equipment.accessory?.emoji || ''}`;
        
        embed.addFields({ name: '🎒 Equipo Actual', value: equipText, inline: false });

        const profileButtons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('detailed_stats')
                    .setLabel('📊 Estadísticas Detalladas')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('achievements')
                    .setLabel('🏆 Logros')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('character_history')
                    .setLabel('📖 Historia')
                    .setStyle(ButtonStyle.Success)
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [profileButtons, backButton]
        });
    },

    // Mostrar configuraciones
    async showSettings(interaction, user) {
        const embed = new PassQuirkEmbed()
            .setTitle('⚙️ Configuraciones')
            .setDescription(
                `**Configuraciones de ${user.characterName}**\n\n` +
                '🔧 **Opciones Disponibles:**\n\n' +
                '🔔 **Notificaciones** - Gestiona alertas del juego\n' +
                '🎨 **Tema Visual** - Cambia la apariencia\n' +
                '🔒 **Privacidad** - Controla quién ve tu perfil\n' +
                '🌐 **Idioma** - Selecciona tu idioma preferido\n' +
                '📱 **Accesibilidad** - Opciones de accesibilidad\n' +
                '💾 **Datos** - Exportar/importar progreso'
            )
            .setColor('#74B9FF');

        const settingsMenu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_setting')
                    .setPlaceholder('⚙️ Selecciona una configuración...')
                    .addOptions([
                        {
                            label: '🔔 Notificaciones',
                            description: 'Gestionar alertas y avisos',
                            value: 'notifications',
                            emoji: '🔔'
                        },
                        {
                            label: '🎨 Tema Visual',
                            description: 'Cambiar apariencia del juego',
                            value: 'theme',
                            emoji: '🎨'
                        },
                        {
                            label: '🔒 Privacidad',
                            description: 'Controlar visibilidad del perfil',
                            value: 'privacy',
                            emoji: '🔒'
                        },
                        {
                            label: '💾 Gestión de Datos',
                            description: 'Exportar/importar progreso',
                            value: 'data_management',
                            emoji: '💾'
                        }
                    ])
            );

        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('back_to_main')
                    .setLabel('🔙 Volver al Panel Principal')
                    .setStyle(ButtonStyle.Secondary)
            );

        await interaction.update({
            embeds: [embed],
            components: [settingsMenu, backButton]
        });
    },

    // Funciones auxiliares
    calculateCombatPower(user) {
        const stats = user.rpgStats;
        return Math.round((stats.attack * 2) + (stats.defense * 1.5) + (stats.speed * 1.2) + (stats.intelligence * 1.3));
    },

    getRarityEmoji(rarity) {
        const rarityEmojis = {
            'Común': '⚪',
            'Raro': '🔵',
            'Épico': '🟣',
            'Legendario': '🟡',
            'common': '⚪',
            'rare': '🔵',
            'epic': '🟣',
            'legendary': '🟡'
        };
        return rarityEmojis[rarity] || '⚪';
    }
};