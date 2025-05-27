const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// Ejemplo de tienda (en producción, esto vendría de la base de datos)
const DEFAULT_SHOP = {
    id: 'main_shop',
    name: '🏪 Tienda Principal',
    description: 'Bienvenido a la tienda principal de PassQuirk. Aquí puedes comprar varios artículos útiles.',
    items: [
        {
            id: 'health_potion',
            name: 'Poción de Vida',
            description: 'Restaura 50 puntos de vida',
            price: 100,
            currency: 'pc',
            emoji: '❤️',
            stock: -1, // -1 para stock ilimitado
            maxStock: 0,
            cooldown: 0,
            roles: []
        },
        {
            id: 'mana_potion',
            name: 'Poción de Maná',
            description: 'Restaura 30 puntos de maná',
            price: 120,
            currency: 'pc',
            emoji: '🔮',
            stock: -1,
            maxStock: 0,
            cooldown: 0,
            roles: []
        },
        {
            id: 'lucky_charm',
            name: 'Amuleto de la Suerte',
            description: 'Aumenta la suerte en un 10% por 1 hora',
            price: 5,
            currency: 'gems',
            emoji: '🍀',
            stock: 10,
            maxStock: 10,
            cooldown: 86400000, // 24 horas en ms
            roles: []
        },
        {
            id: 'xp_boost',
            name: 'Potenciador de XP',
            description: 'Doble XP por 1 hora',
            price: 10,
            currency: 'gems',
            emoji: '⚡',
            stock: 5,
            maxStock: 5,
            cooldown: 86400000, // 24 horas en ms
            roles: []
        },
        {
            id: 'vip_badge',
            name: 'Insignia VIP',
            description: 'Acceso a canales VIP por 7 días',
            price: 50,
            currency: 'gems',
            emoji: '⭐',
            stock: -1,
            maxStock: 0,
            cooldown: 0,
            roles: ['vip_role_id'] // ID del rol VIP
        }
    ]
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tienda')
        .setDescription('Visita la tienda para comprar objetos útiles'),
    
    async execute(interaction) {
        try {
            const economy = interaction.client.economy;
            
            // Cargar la tienda (en producción, esto vendría de la base de datos)
            let shop = await economy.getShop('main_shop');
            if (!shop) {
                // Si no existe la tienda, crear una por defecto
                shop = DEFAULT_SHOP;
                await economy.saveShop(shop);
            }
            
            // Crear embed de la tienda
            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle(shop.name)
                .setDescription(shop.description)
                .setTimestamp();
            
            // Agregar campos para cada ítem
            const itemsPerPage = 5;
            let currentPage = 0;
            const totalPages = Math.ceil(shop.items.length / itemsPerPage);
            
            // Función para actualizar el embed con los ítems de la página actual
            const updateEmbed = (page) => {
                const startIdx = page * itemsPerPage;
                const endIdx = startIdx + itemsPerPage;
                const currentItems = shop.items.slice(startIdx, endIdx);
                
                // Limpiar campos existentes
                embed.spliceFields(0, embed.data.fields?.length || 0);
                
                // Agregar ítems de la página actual
                currentItems.forEach((item, index) => {
                    const itemNumber = startIdx + index + 1;
                    let itemInfo = `**${item.emoji} ${item.name}**\n`;
                    itemInfo += `${item.description}\n`;
                    
                    // Mostrar precio
                    const currency = economy.currencies.get(item.currency) || { symbol: '?' };
                    itemInfo += `Precio: **${item.price} ${currency.symbol}**\n`;
                    
                    // Mostrar stock si es limitado
                    if (item.stock > 0) {
                        itemInfo += `Disponibles: **${item.stock}**\n`;
                    }
                    
                    // Mostrar cooldown si lo tiene
                    if (item.cooldown) {
                        const hours = Math.ceil(item.cooldown / (60 * 60 * 1000));
                        itemInfo += `Enfriamiento: **${hours}h**\n`;
                    }
                    
                    // Mostrar si se requiere rol
                    if (item.roles && item.roles.length > 0) {
                        itemInfo += `🔒 Requiere rol especial\n`;
                    }
                    
                    embed.addFields({
                        name: `#${itemNumber} - ${item.name}`,
                        value: itemInfo,
                        inline: true
                    });
                });
                
                // Agregar pie de página con número de página
                embed.setFooter({ 
                    text: `Página ${page + 1} de ${totalPages} | Usa /comprar [número] para comprar un ítem` 
                });
            };
            
            // Inicializar con la primera página
            updateEmbed(currentPage);
            
            // Crear botones de navegación si hay más de una página
            const row = new ActionRowBuilder();
            
            if (totalPages > 1) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev_page')
                        .setLabel('◀️ Anterior')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next_page')
                        .setLabel('Siguiente ▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                );
            }
            
            // Enviar mensaje con la tienda
            const message = await interaction.reply({ 
                embeds: [embed], 
                components: totalPages > 1 ? [row] : [],
                fetchReply: true 
            });
            
            // Si hay múltiples páginas, agregar el collector para la navegación
            if (totalPages > 1) {
                const filter = i => (i.customId === 'prev_page' || i.customId === 'next_page') && i.user.id === interaction.user.id;
                const collector = message.createMessageComponentCollector({ 
                    filter, 
                    componentType: ComponentType.Button, 
                    time: 300000 // 5 minutos
                });
                
                collector.on('collect', async i => {
                    if (i.customId === 'prev_page' && currentPage > 0) {
                        currentPage--;
                    } else if (i.customId === 'next_page' && currentPage < totalPages - 1) {
                        currentPage++;
                    }
                    
                    // Actualizar botones
                    row.components[0].setDisabled(currentPage === 0);
                    row.components[1].setDisabled(currentPage === totalPages - 1);
                    
                    // Actualizar embed
                    updateEmbed(currentPage);
                    
                    await i.update({ 
                        embeds: [embed], 
                        components: [row] 
                    });
                });
                
                collector.on('end', () => {
                    // Deshabilitar botones cuando el collector termina
                    row.components.forEach(component => component.setDisabled(true));
                    message.edit({ components: [row] }).catch(console.error);
                });
            }
            
        } catch (error) {
            console.error('Error al mostrar la tienda:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al cargar la tienda. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true
            });
        }
    }
};
