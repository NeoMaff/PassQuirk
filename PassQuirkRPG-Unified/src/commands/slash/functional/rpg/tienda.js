// 🏪 COMANDO DE TIENDA PASSQUIRK RPG
// Integra el sistema de economía oficial

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
const ShopSystem = require('../../systems/shop-system');
const passquirkData = require('../../data/passquirkData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tienda')
        .setDescription('🏪 Accede a la tienda de PassQuirk RPG')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de tienda a visitar')
                .setRequired(false)
                .addChoices(
                    { name: '🏪 Tienda Principal', value: 'principal' },
                    { name: '🎰 Gachapón Místico', value: 'gachapon' },
                    { name: '🎒 Mi Inventario', value: 'inventario' }
                )
        ),

    async execute(interaction) {
        try {
            const tipoTienda = interaction.options.getString('tipo') || 'principal';
            const shopSystem = new ShopSystem();
            
            // Obtener datos del usuario (simulado por ahora)
            const usuario = {
                id: interaction.user.id,
                username: interaction.user.username,
                monedas: 1000, // Valor inicial simulado
                inventario: []
            };

            let panelData;

            switch (tipoTienda) {
                case 'principal':
                    panelData = await shopSystem.crearPanelTiendaPrincipal(usuario);
                    break;
                case 'gachapon':
                    panelData = await shopSystem.crearPanelGachapon(usuario);
                    break;
                case 'inventario':
                    panelData = await this.crearPanelInventario(usuario);
                    break;
                default:
                    panelData = await shopSystem.crearPanelTiendaPrincipal(usuario);
            }

            await interaction.reply(panelData);

        } catch (error) {
            console.error('❌ Error en comando tienda:', error);
            
            const errorEmbed = new PassQuirkEmbed()
                .setTitle('❌ Error en la Tienda')
                .setDescription('Hubo un problema al acceder a la tienda. Inténtalo de nuevo.')
                .setColor('#FF0000');

            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },

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
            // Mostrar items del inventario
            usuario.inventario.forEach((item, index) => {
                embed.addFields({
                    name: `${item.emoji || '📦'} ${item.nombre}`,
                    value: `📝 ${item.descripcion}\n🔢 Cantidad: ${item.cantidad || 1}`,
                    inline: true
                });
            });
        }

        // Botones de navegación
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
};