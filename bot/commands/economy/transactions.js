const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('../../models/User');
const { formatNumber, formatTime } = require('../../utils/helpers');

// Número de transacciones por página
const TRANSACTIONS_PER_PAGE = 5;

// Emojis para diferentes tipos de transacciones
const TRANSACTION_EMOJIS = {
    transfer: { emoji: '🔄', name: 'Transferencia' },
    work: { emoji: '💼', name: 'Trabajo' },
    shop: { emoji: '🛒', name: 'Compra' },
    daily: { emoji: '🎁', name: 'Recompensa Diaria' },
    admin: { emoji: '👑', name: 'Administración' },
    default: { emoji: '📝', name: 'Transacción' }
};

// Monedas disponibles
const CURRENCIES = {
    balance: { name: 'Monedas', emoji: '💰' },
    gems: { name: 'Gemas', emoji: '💎' },
    pg: { name: 'Puntos de Gremio', emoji: '⚔️' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transacciones')
        .setDescription('Muestra tu historial de transacciones')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Filtrar por tipo de transacción')
                .setRequired(false)
                .addChoices(
                    { name: 'Todas', value: 'all' },
                    { name: 'Transferencias', value: 'transfer' },
                    { name: 'Trabajos', value: 'work' },
                    { name: 'Compras', value: 'shop' },
                    { name: 'Recompensas', value: 'daily' },
                    { name: 'Administración', value: 'admin' }
                )
        )
        .addStringOption(option =>
            option.setName('moneda')
                .setDescription('Filtrar por tipo de moneda')
                .setRequired(false)
                .addChoices(
                    { name: 'Todas', value: 'all' },
                    { name: '💰 Monedas', value: 'balance' },
                    { name: '💎 Gemas', value: 'gems' },
                    { name: '⚔️ Puntos de Gremio', value: 'pg' }
                )
        )
        .addIntegerOption(option =>
            option.setName('pagina')
                .setDescription('Número de página a mostrar')
                .setRequired(false)
                .setMinValue(1)
        ),

    async execute(interaction) {
        const filterType = interaction.options.getString('tipo') || 'all';
        const filterCurrency = interaction.options.getString('moneda') || 'all';
        let page = (interaction.options.getInteger('pagina') || 1) - 1; // Convertir a índice 0
        
        try {
            // Buscar al usuario en la base de datos
            const user = await User.findOne({ userId: interaction.user.id });
            
            if (!user || !user.transactions || user.transactions.length === 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setColor('#95a5a6')
                    .setTitle('📜 Historial de Transacciones')
                    .setDescription('No tienes transacciones registradas.')
                    .setFooter({ text: 'Las transacciones aparecerán aquí cuando realices alguna acción económica.' });
                
                return interaction.reply({ embeds: [emptyEmbed], ephemeral: true });
            }
            
            // Filtrar transacciones
            let transactions = [...user.transactions];
            
            // Aplicar filtros
            if (filterType !== 'all') {
                transactions = transactions.filter(t => t.type === filterType);
            }
            
            if (filterCurrency !== 'all') {
                transactions = transactions.filter(t => t.currency === filterCurrency);
            }
            
            // Ordenar por fecha (más recientes primero)
            transactions.sort((a, b) => b.timestamp - a.timestamp);
            
            // Validar página
            const totalPages = Math.ceil(transactions.length / TRANSACTIONS_PER_PAGE);
            if (page < 0) page = 0;
            if (page >= totalPages) page = totalPages - 1;
            
            // Obtener transacciones de la página actual
            const start = page * TRANSACTIONS_PER_PAGE;
            const end = start + TRANSACTIONS_PER_PAGE;
            const pageTransactions = transactions.slice(start, end);
            
            if (pageTransactions.length === 0) {
                return interaction.reply({
                    content: '❌ No se encontraron transacciones con los filtros seleccionados.',
                    ephemeral: true
                });
            }
            
            // Crear embed con las transacciones
            const embed = this.createTransactionsEmbed(
                interaction.user,
                pageTransactions,
                page + 1,
                totalPages,
                filterType,
                filterCurrency
            );
            
            // Crear botones de navegación si hay más de una página
            const components = [];
            if (totalPages > 1) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('transactions_prev')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️')
                            .setDisabled(page === 0),
                        new ButtonBuilder()
                            .setCustomId('transactions_next')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️')
                            .setDisabled(page === totalPages - 1)
                    );
                components.push(row);
            }
            
            // Enviar el mensaje
            const message = await interaction.reply({
                embeds: [embed],
                components,
                fetchReply: true
            });
            
            // Si solo hay una página, no es necesario el sistema de navegación
            if (totalPages <= 1) return;
            
            // Crear un colector de interacciones
            const filter = i => i.user.id === interaction.user.id && 
                               (i.customId === 'transactions_prev' || i.customId === 'transactions_next');
            
            const collector = message.createMessageComponentCollector({ 
                filter, 
                time: 300000, // 5 minutos
                idle: 60000 // 1 minuto de inactividad
            });
            
            collector.on('collect', async i => {
                try {
                    let newPage = page;
                    
                    if (i.customId === 'transactions_prev' && page > 0) {
                        newPage = page - 1;
                    } else if (i.customId === 'transactions_next' && page < totalPages - 1) {
                        newPage = page + 1;
                    }
                    
                    // Si la página cambió, actualizar el mensaje
                    if (newPage !== page) {
                        page = newPage;
                        const newStart = page * TRANSACTIONS_PER_PAGE;
                        const newEnd = newStart + TRANSACTIONS_PER_PAGE;
                        const newPageTransactions = transactions.slice(newStart, newEnd);
                        
                        const newEmbed = this.createTransactionsEmbed(
                            interaction.user,
                            newPageTransactions,
                            page + 1,
                            totalPages,
                            filterType,
                            filterCurrency
                        );
                        
                        // Actualizar el estado de los botones
                        const row = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('transactions_prev')
                                    .setLabel('Anterior')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji('⬅️')
                                    .setDisabled(page === 0),
                                new ButtonBuilder()
                                    .setCustomId('transactions_next')
                                    .setLabel('Siguiente')
                                    .setStyle(ButtonStyle.Secondary)
                                    .setEmoji('➡️')
                                    .setDisabled(page === totalPages - 1)
                            );
                        
                        await i.update({ 
                            embeds: [newEmbed], 
                            components: [row] 
                        });
                    } else {
                        // Si no hay cambio de página, solo hacer que el botón parezca que se presionó
                        await i.deferUpdate();
                    }
                } catch (error) {
                    console.error('Error al manejar la interacción de paginación:', error);
                    await i.reply({
                        content: '❌ Ocurrió un error al cambiar de página.',
                        ephemeral: true
                    }).catch(console.error);
                }
            });
            
            collector.on('end', () => {
                // Deshabilitar los botones cuando el colector termina
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('transactions_prev')
                            .setLabel('Anterior')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('⬅️')
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('transactions_next')
                            .setLabel('Siguiente')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('➡️')
                            .setDisabled(true)
                    );
                
                message.edit({ components: [disabledRow] }).catch(console.error);
            });
            
        } catch (error) {
            console.error('Error en el comando transacciones:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al cargar el historial de transacciones. Por favor, inténtalo de nuevo más tarde.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
    
    /**
     * Crea un embed con las transacciones
     * @param {User} user - Usuario de Discord
     * @param {Array} transactions - Transacciones a mostrar
     * @param {number} currentPage - Página actual
     * @param {number} totalPages - Total de páginas
     * @param {string} filterType - Tipo de filtro aplicado
     * @param {string} filterCurrency - Moneda de filtro aplicada
     * @returns {EmbedBuilder} Embed con las transacciones
     */
    createTransactionsEmbed(user, transactions, currentPage, totalPages, filterType, filterCurrency) {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📜 Historial de Transacciones')
            .setThumbnail(user.displayAvatarURL())
            .setFooter({ 
                text: `Página ${currentPage} de ${totalPages} • ${new Date().toLocaleDateString()}`,
                iconURL: user.displayAvatarURL()
            });
        
        // Añadir información de filtros
        const filterText = [];
        if (filterType !== 'all') {
            const typeInfo = TRANSACTION_EMOJIS[filterType] || TRANSACTION_EMOJIS.default;
            filterText.push(`**Tipo:** ${typeInfo.emoji} ${typeInfo.name}`);
        }
        
        if (filterCurrency !== 'all') {
            const currencyInfo = CURRENCIES[filterCurrency] || { name: filterCurrency, emoji: '❓' };
            filterText.push(`**Moneda:** ${currencyInfo.emoji} ${currencyInfo.name}`);
        }
        
        if (filterText.length > 0) {
            embed.setDescription(`**Filtros aplicados:** ${filterText.join(' • ')}`);
        }
        
        // Añadir transacciones
        if (transactions.length === 0) {
            embed.addFields({
                name: 'Sin transacciones',
                value: 'No se encontraron transacciones con los filtros actuales.'
            });
        } else {
            transactions.forEach((tx, index) => {
                const txInfo = TRANSACTION_EMOJIS[tx.type] || TRANSACTION_EMOJIS.default;
                const currencyInfo = CURRENCIES[tx.currency] || { name: tx.currency, emoji: '💵' };
                
                let title = `${txInfo.emoji} ${txInfo.name}`;
                let value = '';
                
                // Formatear el valor (positivo o negativo)
                const amount = tx.amount || 0;
                const amountFormatted = `${amount >= 0 ? '+' : ''}${formatNumber(amount)}`;
                
                // Agregar información específica según el tipo de transacción
                switch (tx.type) {
                    case 'transfer':
                        const direction = tx.isOutgoing ? 'Enviado a' : 'Recibido de';
                        const target = tx.isOutgoing ? `<@${tx.to}>` : `<@${tx.from}>`;
                        title += ` ${direction} ${target}`;
                        value += `**${amountFormatted}** ${currencyInfo.emoji} ${currencyInfo.name}\n`;
                        break;
                        
                    case 'work':
                        title += ` - ${tx.job || 'Trabajo'}`;
                        value += `**+${formatNumber(amount)}** ${currencyInfo.emoji} ${currencyInfo.name}\n`;
                        break;
                        
                    case 'shop':
                        title += ' - Compra en tienda';
                        value += `**-${formatNumber(amount)}** ${currencyInfo.emoji} ${currencyInfo.name}\n`;
                        if (tx.item) {
                            value += `**Artículo:** ${tx.item.name} (x${tx.quantity || 1})\n`;
                        }
                        break;
                        
                    default:
                        value += `**${amountFormatted}** ${currencyInfo.emoji} ${currencyInfo.name}\n`;
                }
                
                // Agregar razón si existe
                if (tx.reason) {
                    value += `**Razón:** ${tx.reason}\n`;
                }
                
                // Agregar fecha
                const date = tx.timestamp ? new Date(tx.timestamp) : new Date();
                value += `*Hace ${formatTime(Date.now() - date)}*`;
                
                embed.addFields({
                    name: title,
                    value: value,
                    inline: false
                });
            });
        }
        
        // Añadir estadísticas si es la primera página
        if (currentPage === 1) {
            try {
                // Calcular totales por tipo de moneda
                const totals = {};
                transactions.forEach(tx => {
                    if (!totals[tx.currency]) {
                        totals[tx.currency] = {
                            income: 0,
                            expense: 0,
                            currency: tx.currency
                        };
                    }
                    
                    const amount = tx.amount || 0;
                    if (amount > 0) {
                        totals[tx.currency].income += amount;
                    } else {
                        totals[tx.currency].expense += Math.abs(amount);
                    }
                });
                
                // Crear texto de resumen
                const summaryLines = [];
                for (const [currency, data] of Object.entries(totals)) {
                    const currencyInfo = CURRENCIES[currency] || { name: currency, emoji: '💵' };
                    summaryLines.push(
                        `\n${currencyInfo.emoji} **${currencyInfo.name}**\n` +
                        `• Ingresos: **+${formatNumber(data.income)}**\n` +
                        `• Gastos: **-${formatNumber(data.expense)}**\n` +
                        `• Balance: **${data.income - data.expense >= 0 ? '+' : ''}${formatNumber(data.income - data.expense)}**`
                    );
                }
                
                if (summaryLines.length > 0) {
                    embed.addFields({
                        name: '📊 Resumen',
                        value: summaryLines.join('\n'),
                        inline: false
                    });
                }
            } catch (error) {
                console.error('Error al generar estadísticas de transacciones:', error);
            }
        }
        
        return embed;
    }
};
