const { EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    name: 'quick_daily',
    async execute(interaction, client) {
        try {
            const user = await User.findOne({ where: { userId: interaction.user.id } });
            
            if (!user || !user.hasCharacter) {
                return await interaction.reply({
                    content: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para crear uno.',
                    ephemeral: true
                });
            }

            // Verificar si ya reclamó la recompensa diaria
            const now = new Date();
            const lastDaily = user.lastDaily ? new Date(user.lastDaily) : null;
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastDailyDate = lastDaily ? new Date(lastDaily.getFullYear(), lastDaily.getMonth(), lastDaily.getDate()) : null;
            
            const canClaim = !lastDailyDate || today > lastDailyDate;

            if (!canClaim) {
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const timeLeft = Math.ceil((tomorrow - now) / (60 * 60 * 1000));
                
                return await interaction.reply({
                    content: `⏰ Ya has reclamado tu recompensa diaria hoy. Vuelve en ${timeLeft} horas.`,
                    ephemeral: true
                });
            }

            // Calcular recompensas basadas en nivel y racha
            const level = user.rpgStats?.level || 1;
            const currentStreak = user.dailyStreak || 0;
            const newStreak = currentStreak + 1;
            
            const baseCoins = 100;
            const levelBonus = level * 15;
            const streakBonus = Math.min(newStreak * 10, 200); // Máximo 200 de bonus por racha
            const totalCoins = baseCoins + levelBonus + streakBonus;
            
            const baseXP = 20;
            const xpBonus = Math.floor(newStreak / 7) * 10; // Bonus cada 7 días
            const totalXP = baseXP + xpBonus;
            
            const gems = newStreak % 7 === 0 ? 1 : 0; // 1 gema cada 7 días

            // Actualizar datos del usuario
            user.balance = (user.balance || 1000) + totalCoins;
            user.gems = (user.gems || 0) + gems;
            user.rpgStats = {
                ...user.rpgStats,
                xp: (user.rpgStats?.xp || 0) + totalXP
            };
            user.lastDaily = now;
            user.dailyStreak = newStreak;
            await user.save();

            const dailyEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎁 Recompensa Diaria Reclamada')
                .setDescription(
                    `¡Has reclamado tu recompensa diaria en PassQuirk!\n\n` +
                    `💰 **Monedas:** ${totalCoins}\n` +
                    `⭐ **XP:** ${totalXP}\n` +
                    `💎 **Gemas:** ${gems}\n` +
                    `🔥 **Racha:** ${newStreak} días`
                )
                .addFields(
                    {
                        name: '📊 Desglose de Recompensas',
                        value: `\`\`\`yaml\n` +
                               `Base: ${baseCoins} monedas + ${baseXP} XP\n` +
                               `Bonus por nivel: ${levelBonus} monedas\n` +
                               `Bonus por racha: ${streakBonus} monedas\n` +
                               `${gems > 0 ? `Bonus semanal: ${gems} gema\n` : ''}` +
                               `\`\`\``,
                        inline: false
                    },
                    {
                        name: '🎯 Próxima Recompensa',
                        value: newStreak % 7 === 6 ? 
                            '🌟 ¡Mañana recibirás una gema bonus!' :
                            `Faltan ${7 - (newStreak % 7)} días para la próxima gema`,
                        inline: false
                    }
                )
                .setFooter({ 
                    text: 'PassQuirk RPG • Vuelve mañana para continuar tu racha',
                    iconURL: client.user.displayAvatarURL()
                })
                .setTimestamp();

            await interaction.reply({
                embeds: [dailyEmbed],
                ephemeral: true
            });

        } catch (error) {
            console.error('Error en quick_daily:', error);
            await interaction.reply({
                content: '❌ Error al procesar la recompensa diaria.',
                ephemeral: true
            });
        }
    }
};