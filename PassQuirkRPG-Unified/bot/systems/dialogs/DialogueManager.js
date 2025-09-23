const { Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');

class DialogueManager {
    constructor(client) {
        this.client = client;
        this.dialogs = new Collection();
        this.activeDialogs = new Collection(); // Almacena diálogos activos por usuario
        this.loadDialogs();
    }

    /**
     * Carga todos los diálogos de la carpeta de diálogos
     */
    loadDialogs() {
        const dialogsPath = path.join(__dirname, '../../embeds/dialogs');
        const dialogFiles = fs.readdirSync(dialogsPath)
            .filter(file => file.endsWith('.js') && file !== 'BaseDialog.js');

        for (const file of dialogFiles) {
            try {
                const DialogClass = require(path.join(dialogsPath, file));
                const dialog = new DialogClass();
                this.dialogs.set(dialog.id, dialog);
                console.log(`[DIALOG] Cargado diálogo: ${dialog.id}`);
            } catch (error) {
                console.error(`[ERROR] Error al cargar el diálogo ${file}:`, error);
            }
        }
    }

    /**
     * Muestra un diálogo al usuario
     * @param {Interaction} interaction - La interacción de Discord
     * @param {string} dialogId - El ID del diálogo a mostrar
     * @param {Object} options - Opciones adicionales para el diálogo
     */
    async showDialog(interaction, dialogId, options = {}) {
        const DialogClass = this.dialogs.get(dialogId);
        if (!DialogClass) {
            throw new Error(`Diálogo con ID '${dialogId}' no encontrado.`);
        }

        const dialog = new DialogClass(options);
        const messageOptions = dialog.render();

        // Guardar el diálogo activo
        this.activeDialogs.set(interaction.user.id, dialog);

        // Enviar el diálogo
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(messageOptions);
        } else {
            await interaction.reply(messageOptions);
        }
    }

    /**
     * Maneja las interacciones de los diálogos
     * @param {Interaction} interaction - La interacción de Discord
     */
    async handleInteraction(interaction) {
        if (!interaction.isButton() && !interaction.isSelectMenu()) return;

        const dialog = this.activeDialogs.get(interaction.user.id);
        if (!dialog) return;

        try {
            await dialog.handleInteraction(interaction);
        } catch (error) {
            console.error(`[ERROR] Error al manejar interacción en diálogo ${dialog.id}:`, error);
            await interaction.reply({
                content: '❌ Ha ocurrido un error al procesar tu solicitud.',
                ephemeral: true
            });
        }
    }

    /**
     * Cierra un diálogo activo
     * @param {string} userId - El ID del usuario
     */
    closeDialog(userId) {
        return this.activeDialogs.delete(userId);
    }
}

module.exports = DialogueManager;
