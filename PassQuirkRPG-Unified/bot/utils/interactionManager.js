const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { COLORS } = require('./embedStyles');

class InteractionManager {
    constructor() {
        this.components = new Map();
        this.timeout = 5 * 60 * 1000; // 5 minutos por defecto
    }

    /**
     * Crea una fila de botones
     * @param {Array} buttons - Array de configuraciones de botones
     * @returns {ActionRowBuilder}
     */
    createButtonRow(buttons) {
        const row = new ActionRowBuilder();
        
        buttons.forEach(buttonConfig => {
            const button = new ButtonBuilder()
                .setCustomId(buttonConfig.id)
                .setLabel(buttonConfig.label)
                .setStyle(this._getButtonStyle(buttonConfig.style || 'secondary'));
            
            if (buttonConfig.emoji) button.setEmoji(buttonConfig.emoji);
            if (buttonConfig.disabled) button.setDisabled(buttonConfig.disabled);
            if (buttonConfig.url) button.setURL(buttonConfig.url).setStyle(ButtonStyle.Link);
            
            row.addComponents(button);
        });
        
        return row;
    }

    /**
     * Crea un menú desplegable
     * @param {Object} menuConfig - Configuración del menú
     * @returns {ActionRowBuilder}
     */
    createSelectMenu(menuConfig) {
        const { 
            id, 
            placeholder = 'Selecciona una opción', 
            minValues = 1, 
            maxValues = 1, 
            options = [] 
        } = menuConfig;
        
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(id)
                .setPlaceholder(placeholder)
                .setMinValues(minValues)
                .setMaxValues(maxValues)
                .addOptions(options.map(option => ({
                    label: option.label,
                    description: option.description || '',
                    value: option.value,
                    emoji: option.emoji,
                    default: option.default || false
                })))
        );
        
        return row;
    }

    /**
     * Crea una cuadrícula de botones
     * @param {Array} buttons - Array de configuraciones de botones
     * @param {number} columns - Número de columnas
     * @returns {Array<ActionRowBuilder>}
     */
    createButtonGrid(buttons, columns = 5) {
        const rows = [];
        let currentRow = new ActionRowBuilder();
        
        buttons.forEach((buttonConfig, index) => {
            const button = new ButtonBuilder()
                .setCustomId(buttonConfig.id)
                .setLabel(buttonConfig.label)
                .setStyle(this._getButtonStyle(buttonConfig.style || 'secondary'));
            
            if (buttonConfig.emoji) button.setEmoji(buttonConfig.emoji);
            if (buttonConfig.disabled) button.setDisabled(buttonConfig.disabled);
            if (buttonConfig.url) button.setURL(buttonConfig.url).setStyle(ButtonStyle.Link);
            
            currentRow.addComponents(button);
            
            // Si la fila actual está llena o es el último botón, la añadimos al array de filas
            if ((index + 1) % columns === 0 || index === buttons.length - 1) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
        });
        
        return rows;
    }

    /**
     * Crea un sistema de paginación
     * @param {Message} message - Mensaje original
     * @param {Array} pages - Array de embeds o strings
     * @param {Object} options - Opciones de paginación
     * @returns {Promise<void>}
     */
    async createPagination(message, pages, options = {}) {
        if (!message || !pages || pages.length === 0) return;
        
        const {
            time = 60000, // 1 minuto
            filter = () => true,
            buttonStyle = 'secondary',
            showPageNumbers = true,
            customLabels = {}
        } = options;
        
        let page = 0;
        const getPage = (pageIndex) => {
            const content = pages[pageIndex];
            if (typeof content === 'string') return { content };
            return { embeds: [content] };
        };
        
        const buttons = [
            { id: 'first', label: customLabels.first || '⏮️', style: buttonStyle },
            { id: 'prev', label: customLabels.prev || '◀️', style: buttonStyle },
            { id: 'page', label: `${page + 1}/${pages.length}`, style: 'secondary', disabled: true },
            { id: 'next', label: customLabels.next || '▶️', style: buttonStyle },
            { id: 'last', label: customLabels.last || '⏭️', style: buttonStyle },
            { id: 'stop', label: customLabels.stop || '⏹️', style: 'danger' }
        ];
        
        const row = this.createButtonRow(buttons);
        const msg = await message.channel.send({ 
            ...getPage(page),
            components: [row] 
        });
        
        const collector = msg.createMessageComponentCollector({ 
            filter: (i) => filter(i) && i.message.id === msg.id,
            time: time 
        });
        
        collector.on('collect', async (i) => {
            try {
                await i.deferUpdate();
                
                switch (i.customId) {
                    case 'first':
                        page = 0;
                        break;
                    case 'prev':
                        page = page > 0 ? page - 1 : pages.length - 1;
                        break;
                    case 'next':
                        page = page < pages.length - 1 ? page + 1 : 0;
                        break;
                    case 'last':
                        page = pages.length - 1;
                        break;
                    case 'stop':
                        collector.stop();
                        return;
                }
                
                // Actualizar etiqueta de página
                if (showPageNumbers) {
                    buttons[2].label = `${page + 1}/${pages.length}`;
                    const newRow = this.createButtonRow(buttons);
                    await msg.edit({ 
                        ...getPage(page),
                        components: [newRow] 
                    });
                } else {
                    await msg.edit(getPage(page));
                }
            } catch (error) {
                console.error('Error en la paginación:', error);
            }
        });
        
        collector.on('end', async () => {
            try {
                // Deshabilitar todos los botones
                const disabledButtons = buttons.map(btn => ({
                    ...btn,
                    disabled: true
                }));
                
                const disabledRow = this.createButtonRow(disabledButtons);
                await msg.edit({ components: [disabledRow] });
            } catch (error) {
                console.error('Error al finalizar la paginación:', error);
            }
        });
        
        return msg;
    }

    /**
     * Maneja las interacciones de los componentes
     * @param {Client} client - Cliente de Discord
     * @param {string} componentId - ID del componente
     * @param {Function} callback - Función a ejecutar
     */
    onInteraction(client, componentId, callback) {
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;
            if (interaction.customId !== componentId) return;
            
            try {
                await callback(interaction);
            } catch (error) {
                console.error(`Error en el manejador de interacción ${componentId}:`, error);
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ Ocurrió un error al procesar tu solicitud.',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ Ocurrió un error al procesar tu solicitud.',
                        ephemeral: true
                    });
                }
            }
        });
    }

    /**
     * Obtiene el estilo del botón
     * @private
     */
    _getButtonStyle(style) {
        const styles = {
            primary: ButtonStyle.Primary,
            secondary: ButtonStyle.Secondary,
            success: ButtonStyle.Success,
            danger: ButtonStyle.Danger,
            link: ButtonStyle.Link
        };
        
        return styles[style] || ButtonStyle.Secondary;
    }
}

module.exports = new InteractionManager();
