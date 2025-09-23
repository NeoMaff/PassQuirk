const { EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    name: 'quick_work',
    async execute(interaction, client) {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (!user || !user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para crear uno.',
                    ephemeral: true
                });
            }

            // Verificar si ya trabajó hoy
            const now = new Date();
            const lastWork = user.lastWork ? new Date(user.lastWork) : null;
            const canWork = !lastWork || (now - lastWork) >= 4 * 60 * 60 * 1000; // 4 horas

            if (!canWork) {
                const timeLeft = Math.ceil((4 * 60 * 60 * 1000 - (now - lastWork)) / (60 * 1000));
                return await interaction.reply({
                    content: `⏰ Ya has trabajado recientemente. Podrás trabajar de nuevo en ${timeLeft} minutos.`,
                    ephemeral: true
                });
            }

            // Calcular recompensas basadas en nivel
            const level = user.rpgStats?.level || 1;
            const baseCoins = 50;
            const bonusCoins = Math.floor(level * 10);
            const totalCoins = baseCoins + bonusCoins;
            const xpGained = Math.floor(level * 2 + 5);

            // Actualizar datos del usuario
            user.balance = (user.balance || 1000) + totalCoins;
            user.rpgStats = {
                ...user.rpgStats,
                xp: (user.rpgStats?.xp || 0) + xpGained
            };
            user.lastWork = now;
            await user.save();

            const workEmbed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('🔨 Trabajo Completado')
                .setDescription(
                    `¡Has trabajado duro en las tierras de PassQuirk!\n\n` +
                    `💰 **Monedas ganadas:** ${totalCoins}\n` +
                    `⭐ **XP ganado:** ${xpGained}\n` +
                    `💳 **Balance actual:** ${user.balance}`
                )
                .addFields(
                    {
                        name: '📊 Detalles del Trabajo',
                        value: `\`\`\`yaml\n` +
                               `Pago base: ${baseCoins} monedas\n` +
                               `Bonus por nivel: ${bonusCoins} monedas\n` +
                               `Nivel actual: ${level}\n` +
                               `\`\`\``,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'PassQuirk RPG • Podrás trabajar de nuevo en 4 horas',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({
                embeds: [workEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error en quick_work:', error);
            await interaction.reply({
                content: '❌ Error al procesar el trabajo.',
                ephemeral: true
            });
        }
    }
};