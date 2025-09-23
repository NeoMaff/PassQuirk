const { ActionRowBuilder, ButtonBuilder } = require('discord.js');
const BaseDialog = require('../components/BaseDialog');
const { DIALOGUE_STYLES, BUTTON_STYLES } = require('../components/styles');

class WelcomeDialog extends BaseDialog {
    constructor(options = {}) {
        super({
            id: 'welcome',
            title: '🌟 ¡Bienvenido a PassQuirk RPG! 🌟',
            description: '¡Saludos, joven aventurero! Soy El Sabio, tu guía en este mundo lleno de misterios y aventuras.\n\nJuntos aprenderás todo lo necesario para convertirte en un héroe legendario.',
            color: DIALOGUE_STYLES.colors.primary,
            thumbnail: DIALOGUE_STYLES.images.npc.wiseMan,
            ...options
        });

        // Añadir botones
        this.addComponent(this.createButtons());
    }

    createButtons() {
        const row = new ActionRowBuilder();
        
        const startButton = new ButtonBuilder()
            .setCustomId('start_creation')
            .setLabel('Comenzar Aventura')
            .setEmoji('▶️')
            .setStyle(BUTTON_STYLES.Primary);

        row.addComponents(startButton);
        return row;
    }

    async handleInteraction(interaction) {
        if (!interaction.isButton()) return;

        switch (interaction.customId) {
            case 'start_creation':
                // Aquí iría la lógica para iniciar la creación de personaje
                await interaction.reply({ content: '¡Vamos a crear tu personaje! Próximamente...', ephemeral: true });
                break;
        }
    }
}

module.exports = WelcomeDialog;
