const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { DIALOGUE_STYLES } = require('./styles');

class BaseDialog {
    constructor(options = {}) {
        this.id = options.id || 'dialog_' + Math.random().toString(36).substr(2, 9);
        this.title = options.title || 'Diálogo';
        this.description = options.description || '';
        this.color = options.color || DIALOGUE_STYLES.colors.primary;
        this.image = options.image || null;
        this.thumbnail = options.thumbnail || null;
        this.footer = options.footer || null;
        this.components = options.components || [];
        this.embeds = [];
        this.state = options.state || {};
    }

    /**
     * Crea el embed principal del diálogo
     * @returns {EmbedBuilder}
     */
    createEmbed() {
        const embed = new EmbedBuilder()
            .setTitle(this.title)
            .setDescription(this.description)
            .setColor(this.color);

        if (this.image) embed.setImage(this.image);
        if (this.thumbnail) embed.setThumbnail(this.thumbnail);
        if (this.footer) embed.setFooter(this.footer);

        return embed;
    }

    /**
     * Añade un componente al diálogo
     * @param {ActionRowBuilder} component 
     * @returns {BaseDialog}
     */
    addComponent(component) {
        if (Array.isArray(component)) {
            this.components.push(...component);
        } else {
            this.components.push(component);
        }
        return this;
    }

    /**
     * Añade un embed adicional al diálogo
     * @param {EmbedBuilder} embed 
     * @returns {BaseDialog}
     */
    addEmbed(embed) {
        this.embeds.push(embed);
        return this;
    }

    /**
     * Renderiza el diálogo para enviarlo a Discord
     * @returns {Object}
     */
    render() {
        const mainEmbed = this.createEmbed();
        const embeds = [mainEmbed, ...this.embeds];
        
        return {
            embeds,
            components: this.components,
            ephemeral: this.ephemeral || false,
            fetchReply: true
        };
    }

    /**
     * Maneja las interacciones del diálogo
     * @param {Interaction} interaction 
     */
    async handleInteraction(interaction) {
        // Implementar en las clases hijas
        throw new Error('Método handleInteraction debe ser implementado por las clases hijas');
    }
}

module.exports = BaseDialog;
