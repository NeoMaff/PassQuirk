// 🏪 SISTEMA DE TIENDA PASSQUIRK RPG
// Basado en el sistema de economía oficial de CioMaff/PassQuirk-RPG

const { PassQuirkEmbed } = require('../utils/embedStyles');
const passquirkData = require('../data/passquirkData');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

class ShopSystem {
    constructor() {
        this.tiendas = {
            principal: {
                nombre: '🏪 Tienda Principal',
                descripcion: 'Objetos generales y consumibles básicos',
                items: [
                    {
                        id: 'pocion_vida_pequena',
                        nombre: '🧪 Poción de Vida Pequeña',
                        precio: 50,
                        descripcion: 'Restaura 25 HP',
                        tipo: 'consumible',
                        rareza: 'comun'
                    },
                    {
                        id: 'pocion_energia_pequena',
                        nombre: '⚡ Poción de Energía Pequeña',
                        precio: 40,
                        descripcion: 'Restaura 20 de energía',
                        tipo: 'consumible',
                        rareza: 'comun'
                    },
                    {
                        id: 'espada_basica',
                        nombre: '⚔️ Espada Básica',
                        precio: 200,
                        descripcion: 'Arma básica para principiantes (+10 ATK)',
                        tipo: 'arma',
                        rareza: 'comun',
                        compatibleClases: ['⚔️ Espadachín', '🛡️ Guerrero']
                    }
                ]
            },
            gachapon: {
                nombre: '🎰 Gachapón Místico',
                descripcion: 'Obtén objetos aleatorios según la rareza',
                tipos: [
                    {
                        id: 'gachapon_comun',
                        nombre: '📦 Gachapón Común',
                        precio: 100,
                        rareza: 'comun',
                        probabilidades: {
                            comun: 0.8,
                            raro: 0.2
                        }
                    },
                    {
                        id: 'gachapon_raro',
                        nombre: '🎁 Gachapón Raro',
                        precio: 250,
                        rareza: 'raro',
                        probabilidades: {
                            comun: 0.4,
                            raro: 0.5,
                            epico: 0.1
                        }
                    },
                    {
                        id: 'gachapon_epico',
                        nombre: '💎 Gachapón Épico',
                        precio: 500,
                        rareza: 'epico',
                        probabilidades: {
                            raro: 0.3,
                            epico: 0.6,
                            legendario: 0.1
                        }
                    }
                ]
            }
        };
    }

    // 🏪 Crear panel de tienda principal
    async crearPanelTiendaPrincipal(usuario) {
        const tienda = this.tiendas.principal;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${tienda.nombre} 🛒`)
            .setDescription(`**${tienda.descripcion}**\n\n💰 **Tu dinero:** ${usuario.monedas || 0} ${passquirkData.economia.monedaPrincipal.simbolo}\n\n**📋 Artículos disponibles:**`)
            .setColor('#FFD700');

        // Agregar items a la tienda
        tienda.items.forEach((item, index) => {
            const emoji = this.obtenerEmojiRareza(item.rareza);
            embed.addFields({
                name: `${emoji} ${item.nombre}`,
                value: `💰 **Precio:** ${item.precio} ${passquirkData.economia.monedaPrincipal.simbolo}\n📝 ${item.descripcion}`,
                inline: true
            });
        });

        // Crear botones de compra
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_buy_pocion_vida')
                    .setLabel('🧪 Poción Vida')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_buy_pocion_energia')
                    .setLabel('⚡ Poción Energía')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_buy_espada_basica')
                    .setLabel('⚔️ Espada Básica')
                    .setStyle(ButtonStyle.Secondary)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_gachapon')
                    .setLabel('🎰 Gachapón Místico')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('shop_inventario')
                    .setLabel('🎒 Mi Inventario')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('shop_cerrar')
                    .setLabel('❌ Cerrar')
                    .setStyle(ButtonStyle.Danger)
            );

        return {
            embeds: [embed],
            components: [row1, row2]
        };
    }

    // 🎰 Crear panel de gachapón
    async crearPanelGachapon(usuario) {
        const gachapon = this.tiendas.gachapon;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${gachapon.nombre} 🎲`)
            .setDescription(`**${gachapon.descripcion}**\n\n💰 **Tu dinero:** ${usuario.monedas || 0} ${passquirkData.economia.monedaPrincipal.simbolo}\n\n**🎯 Tipos de Gachapón:**`)
            .setColor('#FF6B6B');

        // Agregar tipos de gachapón
        gachapon.tipos.forEach(tipo => {
            const probabilidadesTexto = Object.entries(tipo.probabilidades)
                .map(([rareza, prob]) => `${this.obtenerEmojiRareza(rareza)} ${(prob * 100).toFixed(0)}%`)
                .join(' | ');
            
            embed.addFields({
                name: tipo.nombre,
                value: `💰 **Precio:** ${tipo.precio} ${passquirkData.economia.monedaPrincipal.simbolo}\n🎲 **Probabilidades:** ${probabilidadesTexto}`,
                inline: false
            });
        });

        // Crear botones de gachapón
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('gachapon_comun')
                    .setLabel('📦 Común (100🪙)')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('gachapon_raro')
                    .setLabel('🎁 Raro (250🪙)')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('gachapon_epico')
                    .setLabel('💎 Épico (500🪙)')
                    .setStyle(ButtonStyle.Success)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_principal')
                    .setLabel('🏪 Tienda Principal')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('shop_cerrar')
                    .setLabel('❌ Cerrar')
                    .setStyle(ButtonStyle.Danger)
            );

        return {
            embeds: [embed],
            components: [row1, row2]
        };
    }

    // 🎲 Ejecutar gachapón
    async ejecutarGachapon(tipo, usuario) {
        const gachaponTipo = this.tiendas.gachapon.tipos.find(g => g.id === `gachapon_${tipo}`);
        if (!gachaponTipo) return null;

        // Verificar si tiene suficiente dinero
        if ((usuario.monedas || 0) < gachaponTipo.precio) {
            return {
                error: true,
                mensaje: `❌ **No tienes suficiente dinero!**\n💰 Necesitas: ${gachaponTipo.precio} ${passquirkData.economia.monedaPrincipal.simbolo}\n💰 Tienes: ${usuario.monedas || 0} ${passquirkData.economia.monedaPrincipal.simbolo}`
            };
        }

        // Determinar rareza del premio
        const rarezaObtenida = this.determinarRarezaAleatoria(gachaponTipo.probabilidades);
        
        // Obtener item aleatorio de esa rareza
        const itemObtenido = this.obtenerItemAleatorio(rarezaObtenida);
        
        // Crear embed de resultado
        const embed = new PassQuirkEmbed()
            .setTitle('🎰 ¡Resultado del Gachapón! 🎉')
            .setDescription(`**Has obtenido:**\n\n${this.obtenerEmojiRareza(rarezaObtenida)} **${itemObtenido.nombre}**\n📝 ${itemObtenido.descripcion}`)
            .setColor(this.obtenerColorRareza(rarezaObtenida))
            .addFields(
                { name: '💰 Costo', value: `${gachaponTipo.precio} ${passquirkData.economia.monedaPrincipal.simbolo}`, inline: true },
                { name: '🎯 Rareza', value: `${this.obtenerEmojiRareza(rarezaObtenida)} ${rarezaObtenida.charAt(0).toUpperCase() + rarezaObtenida.slice(1)}`, inline: true },
                { name: '💰 Dinero restante', value: `${(usuario.monedas || 0) - gachaponTipo.precio} ${passquirkData.economia.monedaPrincipal.simbolo}`, inline: true }
            );

        return {
            embed,
            item: itemObtenido,
            costo: gachaponTipo.precio,
            rareza: rarezaObtenida
        };
    }

    // 🎯 Determinar rareza aleatoria basada en probabilidades
    determinarRarezaAleatoria(probabilidades) {
        const random = Math.random();
        let acumulado = 0;
        
        for (const [rareza, probabilidad] of Object.entries(probabilidades)) {
            acumulado += probabilidad;
            if (random <= acumulado) {
                return rareza;
            }
        }
        
        return 'comun'; // Fallback
    }

    // 🎁 Obtener item aleatorio de una rareza específica
    obtenerItemAleatorio(rareza) {
        const itemsPorRareza = {
            comun: [
                { nombre: '🧪 Poción de Vida', descripcion: 'Restaura 25 HP', tipo: 'consumible' },
                { nombre: '⚡ Poción de Energía', descripcion: 'Restaura 20 de energía', tipo: 'consumible' },
                { nombre: '🪙 Bolsa de Monedas', descripcion: 'Contiene 50-100 monedas', tipo: 'monedas' }
            ],
            raro: [
                { nombre: '⚔️ Espada de Hierro', descripcion: 'Arma mejorada (+20 ATK)', tipo: 'arma' },
                { nombre: '🛡️ Escudo Reforzado', descripcion: 'Mejora la defensa (+15 DEF)', tipo: 'armadura' },
                { nombre: '💎 Gema de Poder', descripcion: 'Aumenta temporalmente las estadísticas', tipo: 'consumible' }
            ],
            epico: [
                { nombre: '🔥 Espada Flamígera', descripcion: 'Arma épica con daño de fuego (+35 ATK)', tipo: 'arma' },
                { nombre: '⚡ Quirk Menor', descripcion: 'Desbloquea una habilidad especial', tipo: 'quirk' },
                { nombre: '🏆 Fragmento Legendario', descripcion: 'Material para crear objetos legendarios', tipo: 'material' }
            ],
            legendario: [
                { nombre: '👑 Corona del Héroe', descripcion: 'Accesorio legendario (+50 todas las stats)', tipo: 'accesorio' },
                { nombre: '🌟 Quirk Épico', descripcion: 'Habilidad especial de alto nivel', tipo: 'quirk' },
                { nombre: '💫 Cristal de Poder', descripcion: 'Mejora permanente de estadísticas', tipo: 'mejora' }
            ]
        };

        const items = itemsPorRareza[rareza] || itemsPorRareza.comun;
        return items[Math.floor(Math.random() * items.length)];
    }

    // 🎨 Obtener emoji de rareza
    obtenerEmojiRareza(rareza) {
        const emojis = {
            comun: '⚪',
            raro: '🔵',
            epico: '🟣',
            legendario: '🟠',
            mitico: '🔴'
        };
        return emojis[rareza] || '⚪';
    }

    // 🌈 Obtener color de rareza
    obtenerColorRareza(rareza) {
        const colores = {
            comun: '#FFFFFF',
            raro: '#0099FF',
            epico: '#9932CC',
            legendario: '#FF8C00',
            mitico: '#FF0000'
        };
        return colores[rareza] || '#FFFFFF';
    }

    // 💰 Procesar compra de item
    async procesarCompra(itemId, usuario) {
        const item = this.tiendas.principal.items.find(i => i.id === itemId);
        if (!item) return { error: true, mensaje: '❌ Item no encontrado' };

        if ((usuario.monedas || 0) < item.precio) {
            return {
                error: true,
                mensaje: `❌ **No tienes suficiente dinero!**\n💰 Necesitas: ${item.precio} ${passquirkData.economia.monedaPrincipal.simbolo}\n💰 Tienes: ${usuario.monedas || 0} ${passquirkData.economia.monedaPrincipal.simbolo}`
            };
        }

        return {
            success: true,
            item,
            costo: item.precio,
            mensaje: `✅ **¡Compra exitosa!**\n🛒 Has comprado: **${item.nombre}**\n💰 Costo: ${item.precio} ${passquirkData.economia.monedaPrincipal.simbolo}`
        };
    }
}

module.exports = ShopSystem;