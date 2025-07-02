// 🎒 COMANDO INVENTORY - Sistema de inventario del usuario
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
const User = require('../../models/User');
const { formatNumber, createProgressBar } = require('../../utils/helpers');

// Número de ítems por página
const ITEMS_PER_PAGE = 10;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventario')
        .setDescription('Muestra tu inventario o el de otro usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario cuyo inventario quieres ver')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const isSelf = targetUser.id === interaction.user.id;
        
        try {
            // Buscar al usuario en la base de datos
            let user = await User.findOne({ where: { userId: targetUser.id } });
            
            // Si el usuario no existe o no tiene inventario
            if (!user || !user.inventory || user.inventory.length === 0) {
                const emptyEmbed = new PassQuirkEmbed()
                    .setTitle(`${isSelf ? '🎒 Tu Inventario Vacío' : `🎒 Inventario de ${targetUser.username}`} - PassQuirk RPG`)
                    .setDescription(isSelf 
                        ? '**¡Tu mochila de aventurero está vacía!** 🎒\n\nParece que aún no has adquirido ningún objeto para tu épica aventura. ¡Es hora de visitar la tienda mágica!' 
                        : `**El inventario de ${targetUser.username} está vacío** 🎒\n\nEste aventurero aún no ha comenzado a coleccionar objetos mágicos.`)
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '🛒 Consejo del Mentor', value: isSelf ? 'Usa `/tienda` para comprar tu primer objeto mágico' : 'Este héroe necesita visitar la tienda', inline: false },
                        { name: '⚡ Estado', value: 'Inventario vacío', inline: true },
                        { name: '📦 Objetos', value: '0 objetos', inline: true }
                    )
                    .setImage('https://i.imgur.com/empty_inventory_banner.png')
                    .setFooter({ 
                        text: isSelf 
                            ? '⚡ Inventario PassQuirk RPG | Usa /tienda para comenzar tu colección'
                            : `⚡ Inventario PassQuirk RPG | Solicitado por ${interaction.user.username}`,
                        iconURL: interaction.user.displayAvatarURL() 
                    });
                
                return interaction.reply({ embeds: [emptyEmbed] });
            }
            
            // Ordenar el inventario por tipo y nombre
            const sortedInventory = [...user.inventory].sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                return a.name.localeCompare(b.name);
            });
            
            // Crear páginas de inventario
            const pages = [];
            for (let i = 0; i < sortedInventory.length; i += ITEMS_PER_PAGE) {
                pages.push(sortedInventory.slice(i, i + ITEMS_PER_PAGE));
            }
            
            let currentPage = 0;
            
            // Función para crear el embed de la página actual
            const createInventoryEmbed = () => {
                const currentItems = pages[currentPage];
                const totalItems = sortedInventory.reduce((acc, item) => acc + item.amount, 0);
                const totalValue = sortedInventory.reduce((acc, item) => acc + (item.value * item.amount), 0);
                
                const embed = new PassQuirkEmbed()
                    .setTitle(`🎒 ${isSelf ? 'Tu Inventario Mágico' : `Inventario de ${targetUser.username}`} - PassQuirk RPG`)
                    .setDescription(`**¡Aquí están todos tus tesoros de aventurero!** ⚔️\n\nUna colección impresionante de objetos mágicos y útiles para tu épica jornada.`)
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: '📊 Estadísticas del Inventario', value: `**${totalItems}** objetos totales\n**$${formatNumber(totalValue)}** valor total`, inline: true },
                        { name: '📄 Página Actual', value: `${currentPage + 1} de ${pages.length}`, inline: true },
                        { name: '🎒 Estado', value: 'Inventario cargado', inline: true }
                    )
                    .setImage('https://i.imgur.com/inventory_banner.png')
                    .setFooter({ 
                        text: `⚡ Inventario PassQuirk RPG | Página ${currentPage + 1}/${pages.length} • ${totalItems} objetos ($${formatNumber(totalValue)})`,
                        iconURL: interaction.client.user.displayAvatarURL()
                    });
                
                // Agrupar ítems por tipo
                const itemsByType = {};
                currentItems.forEach(item => {
                    if (!itemsByType[item.type]) {
                        itemsByType[item.type] = [];
                    }
                    itemsByType[item.type].push(item);
                });
                
                // Añadir campos por tipo
                Object.entries(itemsByType).forEach(([type, items]) => {
                    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
                    const value = items
                        .map(item => 
                            `${item.emoji || '•'} **${item.name}** ×${item.amount} ` +
                            `($${formatNumber(item.value)} c/u)`
                        )
                        .join('\n');
                    
                    embed.addFields({
                        name: `**${typeName}** (${items.length})`,
                        value: value,
                        inline: false
                    });
                });
                
                // Añadir estadísticas generales en la primera página
                if (currentPage === 0) {
                    const itemTypes = [...new Set(sortedInventory.map(item => item.type))];
                    const mostCommonType = itemTypes.length > 0 
                        ? itemTypes.reduce((a, b) => 
                            sortedInventory.filter(item => item.type === a).length > 
                            sortedInventory.filter(item => item.type === b).length ? a : b
                          )
                        : 'Ninguno';
                    
                    const mostValuableItem = [...sortedInventory].sort((a, b) => (b.value * b.amount) - (a.value * a.amount))[0];
                    
                    embed.addFields({
                        name: '📊 Estadísticas',
                        value: `• **Tipo más común**: ${mostCommonType}\n` +
                               `• **Objeto más valioso**: ${mostValuableItem ? `${mostValuableItem.name} ($${formatNumber(mostValuableItem.value * mostValuableItem.amount)})` : 'Ninguno'}\n` +
                               `• **Espacio usado**: ${createProgressBar(sortedInventory.length, 100, 15)}`,
                        inline: false
                    });
                }
                
                return embed;
            };
            
            // Crear componentes de navegación
            const createActionRow = () => {
                const row = new ActionRowBuilder();
                
                // Botón de página anterior
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('Anterior')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⬅️')
                        .setDisabled(currentPage === 0)
                );
                
                // Menú desplegable de páginas
                if (pages.length > 1) {
                    const pageOptions = pages.map((_, index) => ({
                        label: `Página ${index + 1}`,
                        value: index.toString(),
                        default: index === currentPage
                    }));
                    
                    row.addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('select_page')
                            .setPlaceholder(`Página ${currentPage + 1} de ${pages.length}`)
                            .addOptions(pageOptions)
                    );
                }
                
                // Botón de página siguiente
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Siguiente')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('➡️')
                        .setDisabled(currentPage === pages.length - 1)
                );
                
                return row;
            };
            
            // Enviar el mensaje inicial
            const message = await interaction.reply({
                embeds: [createInventoryEmbed()],
                components: pages.length > 1 ? [createActionRow()] : [],
                fetchReply: true
            });
            
            // Si solo hay una página, no es necesario el sistema de navegación
            if (pages.length <= 1) return;
            
            // Crear un colector de interacciones
            const filter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutos
            
            collector.on('collect', async i => {
                if (i.isButton()) {
                    if (i.customId === 'prev_page') {
                        currentPage = Math.max(0, currentPage - 1);
                    } else if (i.customId === 'next_page') {
                        currentPage = Math.min(pages.length - 1, currentPage + 1);
                    }
                } else if (i.isStringSelectMenu() && i.customId === 'select_page') {
                    currentPage = parseInt(i.values[0]);
                }
                
                // Actualizar el mensaje con la nueva página
                await i.update({
                    embeds: [createInventoryEmbed()],
                    components: [createActionRow()]
                });
            });
            
            collector.on('end', () => {
                // Deshabilitar los botones cuando el colector termina
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('prev_page')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('next_page')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️')
                            .setDisabled(true)
                    );
                
                message.edit({ components: [disabledRow] }).catch(console.error);
            });
            
        } catch (error) {
            console.error('Error en el comando inventario:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al mostrar el inventario. Por favor, inténtalo de nuevo más tarde.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
