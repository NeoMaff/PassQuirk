const { EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    name: 'quick_stats',
    async execute(interaction, client) {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (!user || !user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para crear uno.',
                    ephemeral: true
                });
            }

            const statsEmbed = new EmbedBuilder()
                .setColor('#4A90E2')
                .setTitle('📊 Estadísticas Detalladas')
                .setAuthor({
                    name: `${user.characterName || 'Aventurero'} - Nivel ${user.rpgStats?.level || 1}`,
                    iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                })
                .addFields(
                    {
                        name: '⚔️ Estadísticas de Combate',
                        value: `\`\`\`yaml\n` +
                               `Ataque: ${user.rpgStats?.attack || 10} 🗡️\n` +
                               `Defensa: ${user.rpgStats?.defense || 5} 🛡️\n` +
                               `Velocidad: ${user.rpgStats?.speed || 8} 💨\n` +
                               `Inteligencia: ${user.rpgStats?.intelligence || 7} 🧠\n` +
                               `\`\`\``,
                        inline: true
                    },
                    {
                        name: '❤️ Vitalidad',
                        value: `\`\`\`yaml\n` +
                               `HP: ${user.rpgStats?.hp || 100}/${user.rpgStats?.maxHp || 100} ❤️\n` +
                               `MP: ${user.rpgStats?.mp || 50}/${user.rpgStats?.maxMp || 50} 💙\n` +
                               `XP: ${user.rpgStats?.xp || 0} ⭐\n` +
                               `\`\`\``,
                        inline: true
                    },
                    {
                        name: '💰 Recursos',
                        value: `\`\`\`yaml\n` +
                               `Monedas: ${user.balance || 1000} 🪙\n` +
                               `Gemas: ${user.gems || 0} 💎\n` +
                               `PG: ${user.pg || 0} 🌟\n` +
                               `\`\`\``,
                        inline: true
                    },
                    {
                        name: '🎯 Progreso',
                        value: `\`\`\`yaml\n` +
                               `Clase: ${user.characterClass || 'Sin Clase'} 🎭\n` +
                               `Quirks Activos: ${user.quirks?.length || 0} ✨\n` +
                               `Batallas Ganadas: ${user.battleStats?.wins || 0} 🏆\n` +
                               `Batallas Perdidas: ${user.battleStats?.losses || 0} 💀\n` +
                               `\`\`\``,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'PassQuirk RPG • Estadísticas actualizadas',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({
                embeds: [statsEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error en quick_stats:', error);
            await interaction.reply({
                content: '❌ Error al mostrar las estadísticas.',
                ephemeral: true
            });
        }
    }
};