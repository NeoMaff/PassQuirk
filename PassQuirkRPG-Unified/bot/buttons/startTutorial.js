const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'start_tutorial',
    async execute(interaction, client) {
        try {
            // Obtener la instancia del sistema de diálogos
            const dialogueSystem = client.dialogueSystem;
            if (!dialogueSystem) {
                throw new Error('El sistema de diálogos no está inicializado');
            }
            
            // Mostrar el primer diálogo del tutorial
            const response = await dialogueSystem.showDialogue(interaction, 'welcome');
            
            if (response) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply(response);
                } else {
                    await interaction.reply(response);
                }
            }
        } catch (error) {
            console.error('Error al iniciar el tutorial:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al iniciar el tutorial. Por favor, inténtalo de nuevo más tarde.');
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
