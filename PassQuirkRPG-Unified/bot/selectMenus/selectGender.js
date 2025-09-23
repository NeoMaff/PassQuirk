const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'select_gender',
    async execute(interaction, client) {
        try {
            // Obtener el valor seleccionado
            const selectedGender = interaction.values[0];
            
            // Aquí podrías guardar el género seleccionado en la base de datos
            // Por ahora, solo lo mostramos en un mensaje
            
            const embed = new EmbedBuilder()
                .setColor('#6C63FF')
                .setTitle('🎭 Selección de Género')
                .setDescription(`¡Perfecto! Has seleccionado: **${selectedGender}**`)
                .setFooter({ text: 'Siguiente paso: Seleccionar tu clase' });
            
            // Crear los botones para las clases
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_class')
                        .setPlaceholder('Selecciona tu clase')
                        .addOptions([
                            {
                                label: '🏹 Arquero',
                                description: 'Especialista en ataques a distancia',
                                value: 'Arquero',
                                emoji: '🏹'
                            },
                            {
                                label: '🥷 Ninja',
                                description: 'Ágil y sigiloso, experto en movimientos rápidos',
                                value: 'Ninja',
                                emoji: '🥷'
                            },
                            {
                                label: '⚔️ Espadachín',
                                description: 'Maestro del combate con espada',
                                value: 'Espadachín',
                                emoji: '⚔️'
                            },
                            {
                                label: '🛡️ Guerrero',
                                description: 'Fuerte y resistente, especialista en defensa',
                                value: 'Guerrero',
                                emoji: '🛡️'
                            },
                            {
                                label: '🧙 Mago',
                                description: 'Poderoso en el arte de la magia',
                                value: 'Mago',
                                emoji: '🧙'
                            }
                        ])
                );
            
            await interaction.update({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error al seleccionar el género:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al procesar tu selección. Por favor, inténtalo de nuevo.');
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
