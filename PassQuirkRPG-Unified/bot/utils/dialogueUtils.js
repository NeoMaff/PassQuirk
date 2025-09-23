const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

/**
 * Crea un embed con un formato estándar para los diálogos
 * @param {Object} options - Opciones para el embed
 * @param {string} options.title - Título del embed
 * @param {string} options.description - Descripción del embed
 * @param {string} [options.color='#6C63FF'] - Color del embed (por defecto: morado)
 * @param {string} [options.image] - URL de la imagen a mostrar
 * @param {string} [options.thumbnail] - URL de la miniatura a mostrar
 * @param {Array} [options.fields] - Campos adicionales para el embed
 * @returns {EmbedBuilder} - Embed creado
 */
function createDialogueEmbed({ 
    title, 
    description, 
    color = '#6C63FF', 
    image, 
    thumbnail, 
    fields = [] 
}) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color);

    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (fields.length > 0) embed.addFields(fields);

    return embed;
}

/**
 * Crea una fila de botones para interacciones
 * @param {Array} buttons - Array de botones a crear
 * @param {string} buttons[].id - ID del botón
 * @param {string} buttons[].label - Texto del botón
 * @param {string} [buttons[].emoji] - Emoji del botón (opcional)
 * @param {string} [buttons[].style='Primary'] - Estilo del botón (Primary, Secondary, Success, Danger, Link)
 * @param {boolean} [buttons[].disabled=false] - Si el botón está deshabilitado
 * @returns {ActionRowBuilder} - Fila de botones creada
 */
function createButtonRow(buttons = []) {
    const row = new ActionRowBuilder();
    
    for (const btn of buttons) {
        const button = new ButtonBuilder()
            .setCustomId(btn.id.startsWith('dialogue_') ? btn.id : `dialogue_${btn.id}`)
            .setLabel(btn.label)
            .setStyle(ButtonStyle[btn.style || 'Primary']);
        
        if (btn.emoji) button.setEmoji(btn.emoji);
        if (btn.disabled) button.setDisabled(true);
        
        row.addComponents(button);
    }
    
    return row;
}

/**
 * Crea un menú desplegable
 * @param {Object} options - Opciones del menú desplegable
 * @param {string} options.customId - ID personalizado para el menú
 * @param {string} options.placeholder - Texto de marcador de posición
 * @param {Array} options.options - Opciones del menú
 * @param {number} [options.minValues=1] - Mínimo de opciones a seleccionar
 * @param {number} [options.maxValues=1] - Máximo de opciones a seleccionar
 * @returns {ActionRowBuilder} - Fila con el menú desplegable
 */
function createSelectMenu({ 
    customId, 
    placeholder, 
    options, 
    minValues = 1, 
    maxValues = 1 
}) {
    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId(customId.startsWith('dialogue_') ? customId : `dialogue_${customId}`)
            .setPlaceholder(placeholder)
            .setMinValues(minValues)
            .setMaxValues(maxValues)
            .addOptions(options.map(opt => ({
                label: opt.label,
                description: opt.description,
                value: opt.value,
                emoji: opt.emoji,
                default: opt.default || false
            })))
    );
    
    return row;
}

/**
 * Maneja errores en las interacciones
 * @param {Object} interaction - La interacción de Discord
 * @param {Error} error - El error ocurrido
 * @param {string} [customMessage] - Mensaje personalizado de error
 */
async function handleInteractionError(interaction, error, customMessage) {
    console.error('Error en la interacción:', error);
    
    const errorEmbed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Error')
        .setDescription(customMessage || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo de nuevo.');
    
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
}

module.exports = {
    createDialogueEmbed,
    createButtonRow,
    createSelectMenu,
    handleInteractionError
};
