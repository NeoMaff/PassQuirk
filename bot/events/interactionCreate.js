const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Manejar comandos de barra (slash commands)
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No se encontró el comando: ${interaction.commandName}`);
                return;
            }

            try {
                console.log(`Ejecutando comando: ${interaction.commandName} por ${interaction.user.tag}`);
                await command.execute(interaction, client);
                
                // Registrar el comando en la base de datos
                try {
                    const User = require('../models/User');
                    await User.findOneAndUpdate(
                        { userId: interaction.user.id },
                        { 
                            $inc: { 'stats.commands': 1 },
                            $set: { username: interaction.user.username }
                        },
                        { upsert: true, new: true }
                    );
                } catch (dbError) {
                    console.error('Error al actualizar estadísticas del usuario:', dbError);
                }
                
            } catch (error) {
                console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('❌ Error')
                    .setDescription('Ocurrió un error al ejecutar el comando. Por favor, inténtalo de nuevo más tarde.')
                    .setFooter({ text: 'Si el problema persiste, contacta con el soporte.' });
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Manejar botones
        else if (interaction.isButton()) {
            const button = client.buttons.get(interaction.customId);
            
            if (!button) return;
            
            try {
                await button.execute(interaction, client);
            } catch (error) {
                console.error(`Error al ejecutar el botón ${interaction.customId}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Ocurrió un error al procesar esta acción.');
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Manejar menús desplegables
        else if (interaction.isStringSelectMenu()) {
            const selectMenu = client.selectMenus.get(interaction.customId);
            
            if (!selectMenu) return;
            
            try {
                await selectMenu.execute(interaction, client);
            } catch (error) {
                console.error(`Error al ejecutar el menú ${interaction.customId}:`, error);
                
                const errorEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('❌ Ocurrió un error al procesar esta selección.');
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
    },
};
