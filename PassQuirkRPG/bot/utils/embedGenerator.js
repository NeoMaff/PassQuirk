const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getEmoji } = require('./emojiManager');

/**
 * Genera un mensaje embed con botones y una imagen lateral siguiendo el diseño de PassQuirk RPG
 * @param {Object} opciones - Configuración del embed
 * @param {string} opciones.titulo - Título del mensaje
 * @param {string} opciones.descripcion - Texto principal del embed
 * @param {Array} opciones.campos - Lista de campos [{ emoji, nombre, cantidad, valor }]
 * @param {string} opciones.imagen - Ruta local o URL de imagen
 * @param {Array} opciones.botones - Lista de botones [{ id, label, emoji, estilo }]
 * @param {string} opciones.color - Color del embed (por defecto amarillo)
 * @param {string} opciones.footer - Texto del footer
 * @param {string} opciones.author - Texto del author
 * @returns {Object} - { embed, components, files }
 */
function generarMensajeEmbed({
    titulo = '📢 Notificación',
    descripcion = 'Contenido del mensaje aquí.',
    campos = [],
    imagen = null,
    botones = [],
    color = '#FFD700', // Amarillo por defecto
    footer = null,
    author = null,
    banner = false
}) {
    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(titulo)
        .setTitle(titulo)
        .setDescription(descripcion);

    const files = [];
    let components = [];

    // Crear botones si se proporcionan
    if (botones.length > 0) {
        const row = new ActionRowBuilder();
        botones.forEach(boton => {
            const builder = new ButtonBuilder()
                .setLabel(boton.label)
                .setStyle(boton.style || ButtonStyle.Primary)
                .setEmoji(boton.emoji || null);

            if (boton.url) {
                builder.setURL(boton.url);
            } else {
                builder.setCustomId(boton.id);
            }

            row.addComponents(builder);
        });
        components.push(row);
    }

    // Configuración de imagen (Thumbnail o Banner)
    if (imagen) {
        const esAttachment = imagen.startsWith('attachment://');
        const nombreArchivo = esAttachment ? imagen.replace('attachment://', '') : 'imagen.png';

        // Si es banner (imagen grande abajo) o thumbnail (pequeña arriba derecha)
        // Por defecto es thumbnail para mantener compatibilidad, a menos que se especifique banner: true
        if (banner) {
            embed.setImage(`attachment://${nombreArchivo}`);
        } else {
            embed.setThumbnail(`attachment://${nombreArchivo}`);
        }

        // Solo añadir al array de files si NO es un attachment:// ya existente que se pasará externamente
        // O si es una ruta local que queremos adjuntar automáticamente
        if (!esAttachment) {
            files.push({
                attachment: imagen,
                name: nombreArchivo
            });
        }
    }

    return {
        embed,
        components,
        files
    };
}

/**
 * Genera un embed específico para el tutorial de PassQuirk RPG
 * @param {Object} opciones - Configuración específica del tutorial
 * @param {string} opciones.titulo - Título del embed
 * @param {string} opciones.descripcion - Descripción principal
 * @param {string} opciones.usuario - ID del usuario
 * @param {Array} opciones.botones - Array de botones
 * @returns {Object} - Embed y componentes
 */
function generarEmbedTutorial({ titulo, descripcion, usuario, botones = [] }) {
    const embed = new EmbedBuilder()
        .setColor('#FFD700') // Amarillo PassQuirk
        .setTitle(titulo)
        .setDescription(descripcion)
        .setTimestamp();

    // Crear botones si se proporcionan
    let components = [];
    if (botones.length > 0) {
        const row = new ActionRowBuilder();
        botones.forEach(boton => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(boton.id)
                    .setLabel(boton.label)
                    .setStyle(boton.style || ButtonStyle.Primary)
                    .setEmoji(boton.emoji || null)
            );
        });
        components.push(row);
    }

    return { embed, components };
}

/**
 * Genera un embed para recompensas
 * @param {Object} opciones - Configuración de recompensas
 * @returns {Object} - Embed configurado para recompensas
 */
function generarEmbedRecompensa({
    titulo,
    descripcion,
    recompensas = [],
    botones = [],
    imagen = './assets/images/reward-box.png'
}) {
    return generarMensajeEmbed({
        titulo: `${getEmoji('tada')} ${titulo}`,
        descripcion,
        campos: recompensas,
        imagen,
        botones,
        color: '#00FF00', // Verde para recompensas
        footer: `${getEmoji('sparkle_stars')} ¡Felicidades por tu progreso!`
    });
}

/**
 * Genera un embed para combate/peligro
 * @param {Object} opciones - Configuración de combate
 * @returns {Object} - Embed configurado para combate
 */
function generarEmbedCombate({
    titulo,
    descripcion,
    campos = [],
    botones = [],
    imagen = './assets/images/combat.png'
}) {
    return generarMensajeEmbed({
        titulo: `${getEmoji('sword_gold')} ${titulo}`,
        descripcion,
        campos,
        imagen,
        botones,
        color: '#FF0000', // Rojo para combate/peligro
        footer: `${getEmoji('shield')} ¡Prepárate para la batalla!`
    });
}

module.exports = {
    generarMensajeEmbed,
    generarEmbedTutorial,
    generarEmbedRecompensa,
    generarEmbedCombate
};