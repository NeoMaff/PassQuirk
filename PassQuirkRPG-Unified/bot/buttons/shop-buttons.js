// 🏪 BOTONES INTERACTIVOS DE LA TIENDA PASSQUIRK RPG
// Maneja todas las interacciones de compra y gachapón

const { PassQuirkEmbed } = require('../utils/embedStyles');
const ShopSystem = require('../systems/shop-system');
const passquirkData = require('../data/passquirkData');

class ShopButtons {
    constructor() {
        this.shopSystem = new ShopSystem();
    }

    // 🎯 Manejar interacciones de botones de tienda
    async handleShopButton(interaction) {
        const customId = interaction.customId;
        
        // Obtener datos del usuario (simulado por ahora)
        const usuario = {
            id: interaction.user.id,
            username: interaction.user.username,
            monedas: 1000, // Valor inicial simulado
            inventario: []
        };

        try {
            switch (customId) {
                // 🏪 Navegación entre tiendas
                case 'shop_principal':
                    const panelPrincipal = await this.shopSystem.crearPanelTiendaPrincipal(usuario);
                    await interaction.update(panelPrincipal);
                    break;

                case 'shop_gachapon':
                    const panelGachapon = await this.shopSystem.crearPanelGachapon(usuario);
                    await interaction.update(panelGachapon);
                    break;

                case 'shop_inventario':
                    const panelInventario = await this.crearPanelInventario(usuario);
                    await interaction.update(panelInventario);
                    break;

                case 'shop_cerrar':
                    const embedCerrar = new PassQuirkEmbed()
                        .setTitle('🏪 Tienda Cerrada')
                        .setDescription('¡Gracias por visitar la tienda de PassQuirk RPG!\n¡Vuelve pronto para más aventuras! 🌟')
                        .setColor('#FFD700');
                    
                    await interaction.update({ embeds: [embedCerrar], components: [] });
                    break;

                // 🛒 Compras en tienda principal
                case 'shop_buy_pocion_vida':
                    await this.procesarCompra('pocion_vida_pequena', usuario, interaction);
                    break;

                case 'shop_buy_pocion_energia':
                    await this.procesarCompra('pocion_energia_pequena', usuario, interaction);
                    break;

                case 'shop_buy_espada_basica':
                    await this.procesarCompra('espada_basica', usuario, interaction);
                    break;

                // 🎰 Gachapón
                case 'gachapon_comun':
                    await this.ejecutarGachapon('comun', usuario, interaction);
                    break;

                case 'gachapon_raro':
                    await this.ejecutarGachapon('raro', usuario, interaction);
                    break;

                case 'gachapon_epico':
                    await this.ejecutarGachapon('epico', usuario, interaction);
                    break;

                default:
                    await interaction.reply({ 
                        content: '❌ Acción no reconocida en la tienda.', 
                        ephemeral: true 
                    });
            }
        } catch (error) {
            console.error('❌ Error en botón de tienda:', error);
            await interaction.reply({ 
                content: '❌ Hubo un error al procesar tu solicitud. Inténtalo de nuevo.', 
                ephemeral: true 
            });
        }
    }

    // 🛒 Procesar compra de item
    async procesarCompra(itemId, usuario, interaction) {
        const resultado = await this.shopSystem.procesarCompra(itemId, usuario);
        
        if (resultado.error) {
            const embedError = new PassQuirkEmbed()
                .setTitle('❌ Error de Compra')
                .setDescription(resultado.mensaje)
                .setColor('#FF0000');
            
            await interaction.reply({ embeds: [embedError], ephemeral: true });
            return;
        }

        // Simular actualización de datos del usuario
        usuario.monedas -= resultado.costo;
        usuario.inventario.push({
            ...resultado.item,
            cantidad: 1,
            fechaCompra: new Date().toISOString()
        });

        const embedExito = new PassQuirkEmbed()
            .setTitle('✅ ¡Compra Exitosa! 🛒')
            .setDescription(resultado.mensaje)
            .setColor('#00FF00')
            .addFields(
                { name: '🎁 Item Comprado', value: `${this.shopSystem.obtenerEmojiRareza(resultado.item.rareza)} **${resultado.item.nombre}**`, inline: true },
                { name: '💰 Dinero Restante', value: `${usuario.monedas} ${passquirkData.economia.monedaPrincipal.simbolo}`, inline: true },
                { name: '📝 Descripción', value: resultado.item.descripcion, inline: false }
            )
            .setFooter({ text: '¡El item ha sido añadido a tu inventario!' });

        await interaction.reply({ embeds: [embedExito], ephemeral: true });
        
        // Actualizar el panel de la tienda
        setTimeout(async () => {
            const panelActualizado = await this.shopSystem.crearPanelTiendaPrincipal(usuario);
            await interaction.editReply(panelActualizado);
        }, 2000);
    }

    // 🎰 Ejecutar gachapón
    async ejecutarGachapon(tipo, usuario, interaction) {
        const resultado = await this.shopSystem.ejecutarGachapon(tipo, usuario);
        
        if (resultado.error) {
            const embedError = new PassQuirkEmbed()
                .setTitle('❌ Error en Gachapón')
                .setDescription(resultado.mensaje)
                .setColor('#FF0000');
            
            await interaction.reply({ embeds: [embedError], ephemeral: true });
            return;
        }

        // Simular actualización de datos del usuario
        usuario.monedas -= resultado.costo;
        usuario.inventario.push({
            ...resultado.item,
            cantidad: 1,
            rareza: resultado.rareza,
            fechaObtencion: new Date().toISOString(),
            origen: 'gachapon'
        });

        // Crear animación de gachapón
        const embedAnimacion = new PassQuirkEmbed()
            .setTitle('🎰 Gachapón en Proceso... 🎲')
            .setDescription('🌟 **¡La máquina está girando!**\n⏳ Determinando tu premio...')
            .setColor('#FFD700');

        await interaction.reply({ embeds: [embedAnimacion], ephemeral: true });

        // Esperar 3 segundos para crear suspense
        setTimeout(async () => {
            // Mostrar resultado final con efectos especiales
            resultado.embed.setFooter({ 
                text: `🎉 ¡Felicidades ${interaction.user.username}! | Origen: Gachapón ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}` 
            });
            
            // Agregar efectos especiales según la rareza
            if (resultado.rareza === 'legendario' || resultado.rareza === 'mitico') {
                resultado.embed.setDescription(
                    `🌟✨ **¡PREMIO EXCEPCIONAL!** ✨🌟\n\n${resultado.embed.data.description}`
                );
            }

            await interaction.editReply({ embeds: [resultado.embed] });
            
            // Actualizar panel después de mostrar resultado
            setTimeout(async () => {
                const panelActualizado = await this.shopSystem.crearPanelGachapon(usuario);
                await interaction.followUp(panelActualizado);
            }, 3000);
        }, 3000);
    }

    // 🎒 Crear panel de inventario
    async crearPanelInventario(usuario) {
        const embed = new PassQuirkEmbed()
            .setTitle(`🎒 Inventario de ${usuario.username}`)
            .setDescription(`💰 **Dinero:** ${usuario.monedas || 0} ${passquirkData.economia.monedaPrincipal.simbolo}\n\n📦 **Objetos en tu inventario:**`)
            .setColor('#4CAF50');

        // Si el inventario está vacío
        if (!usuario.inventario || usuario.inventario.length === 0) {
            embed.addFields({
                name: '📭 Inventario Vacío',
                value: 'No tienes objetos en tu inventario.\n¡Visita la tienda para comprar algunos!',
                inline: false
            });
        } else {
            // Agrupar items por tipo
            const itemsAgrupados = {};
            usuario.inventario.forEach(item => {
                const key = item.nombre;
                if (itemsAgrupados[key]) {
                    itemsAgrupados[key].cantidad += item.cantidad || 1;
                } else {
                    itemsAgrupados[key] = { ...item, cantidad: item.cantidad || 1 };
                }
            });

            // Mostrar items agrupados
            Object.values(itemsAgrupados).forEach((item, index) => {
                if (index < 25) { // Límite de Discord para fields
                    const emoji = this.shopSystem.obtenerEmojiRareza(item.rareza || 'comun');
                    embed.addFields({
                        name: `${emoji} ${item.nombre}`,
                        value: `📝 ${item.descripcion}\n🔢 Cantidad: ${item.cantidad}`,
                        inline: true
                    });
                }
            });

            if (Object.keys(itemsAgrupados).length > 25) {
                embed.setFooter({ text: `... y ${Object.keys(itemsAgrupados).length - 25} objetos más` });
            }
        }

        // Botones de navegación
        const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('shop_principal')
                    .setLabel('🏪 Tienda Principal')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('shop_gachapon')
                    .setLabel('🎰 Gachapón')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('shop_cerrar')
                    .setLabel('❌ Cerrar')
                    .setStyle(ButtonStyle.Danger)
            );

        return {
            embeds: [embed],
            components: [row]
        };
    }
}

module.exports = ShopButtons;