// 🎮 COMANDO PRINCIPAL PASSQUIRK RPG - Comando central del sistema de juego
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('passquirkrpg')
        .setDescription('🎮 ¡Inicia tu épica aventura en el mundo de PassQuirk RPG!')
        .addStringOption(option =>
            option.setName('accion')
                .setDescription('Acción específica a realizar')
                .setRequired(false)
                .addChoices(
                    { name: '🆕 Crear Personaje', value: 'crear' },
                    { name: '👤 Ver Perfil', value: 'perfil' },
                    { name: '🎒 Inventario', value: 'inventario' },
                    { name: '⚔️ Combate', value: 'combate' },
                    { name: '🗺️ Explorar', value: 'explorar' },
                    { name: '📊 Estadísticas', value: 'stats' }
                )
        ),

    async execute(interaction, client) {
        try {
            // Delegar toda la lógica al Game Manager
            return await client.gameManager.handleMainCommand(interaction);
        } catch (error) {
            console.error('Error en comando passquirkrpg:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar tu solicitud. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    }
};
        // Usar el panel modular de creación de personaje de v0.dev