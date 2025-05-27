const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const { getRandomInt, formatNumber } = require('../../utils/helpers');

// Lista de trabajos disponibles con sus recompensas
const JOBS = [
    { name: 'Programador', emoji: '💻', min: 100, max: 500, xp: 10 },
    { name: 'Cocinero', emoji: '👨‍🍳', min: 80, max: 400, xp: 8 },
    { name: 'Constructor', emoji: '👷', min: 120, max: 350, xp: 12 },
    { name: 'Músico', emoji: '🎵', min: 90, max: 450, xp: 9 },
    { name: 'Diseñador', emoji: '🎨', min: 110, max: 550, xp: 11 },
    { name: 'Médico', emoji: '⚕️', min: 150, max: 600, xp: 15 },
    { name: 'Granjero', emoji: '👨‍🌾', min: 70, max: 300, xp: 7 },
    { name: 'Mecánico', emoji: '🔧', min: 100, max: 400, xp: 10 },
    { name: 'Científico', emoji: '🔬', min: 130, max: 500, xp: 13 },
    { name: 'Bombero', emoji: '🚒', min: 110, max: 450, xp: 11 },
];

// Tiempo de espera entre trabajos (en milisegundos)
const WORK_COOLDOWN = 3600000; // 1 hora

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Trabaja para ganar dinero y experiencia'),

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            const now = new Date();
            
            // Buscar al usuario en la base de datos
            let user = await User.findOne({ userId });
            
            // Si el usuario no existe, crearlo
            if (!user) {
                user = new User({
                    userId,
                    username: interaction.user.username,
                    balance: 1000,
                    lastWork: null,
                    stats: {
                        level: 1,
                        xp: 0,
                        messages: 0,
                        commands: 0,
                        voiceMinutes: 0
                    },
                    cooldowns: {}
                });
            }
            
            // Verificar si el usuario puede trabajar
            if (user.lastWork && (now - user.lastWork) < WORK_COOLDOWN) {
                const remainingTime = WORK_COOLDOWN - (now - user.lastWork);
                const minutes = Math.ceil(remainingTime / (1000 * 60));
                
                const cooldownEmbed = new EmbedBuilder()
                    .setColor('#ff9900')
                    .setTitle('⏳ Enfriamiento')
                    .setDescription(`¡Espera un poco! Puedes trabajar de nuevo en **${minutes} minutos**.`)
                    .setFooter({ text: 'El trabajo duro es importante, pero el descanso también.' });
                
                return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
            }
            
            // Seleccionar un trabajo aleatorio
            const job = JOBS[Math.floor(Math.random() * JOBS.length)];
            const earnings = getRandomInt(job.min, job.max);
            const xpEarned = job.xp + Math.floor(Math.random() * 5);
            
            // Calcular bonificaciones (ejemplo: bonificación por nivel)
            const levelBonus = Math.floor(earnings * (user.stats.level * 0.05)); // 5% más por nivel
            const totalEarnings = earnings + levelBonus;
            
            // Actualizar datos del usuario
            user.balance += totalEarnings;
            user.lastWork = now;
            user.stats.xp += xpEarned;
            
            // Verificar si subió de nivel
            const xpNeeded = user.stats.level * 100;
            let levelUp = false;
            
            if (user.stats.xp >= xpNeeded) {
                user.stats.level += 1;
                user.stats.xp = 0;
                levelUp = true;
            }
            
            await user.save();
            
            // Crear embed de respuesta
            const workEmbed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle(`${job.emoji} ¡Trabajo completado!`)
                .setDescription(`Has trabajado como **${job.name}** y ganaste **${formatNumber(totalEarnings)} monedas** y **${xpEarned} XP**!`)
                .addFields(
                    { name: 'Ganancias base', value: `$${formatNumber(earnings)}`, inline: true },
                    { name: 'Bonificación por nivel', value: `+$${formatNumber(levelBonus)}`, inline: true },
                    { name: 'Total ganado', value: `**$${formatNumber(totalEarnings)}**`, inline: false },
                )
                .setFooter({ text: `Nivel ${user.stats.level} • ${user.stats.xp}/${xpNeeded} XP` })
                .setTimestamp();
            
            if (levelUp) {
                workEmbed.addFields({
                    name: '¡Nuevo Nivel!',
                    value: `¡Felicidades! Ahora eres nivel **${user.stats.level}**!`,
                    inline: false
                });
            }
            
            await interaction.reply({ embeds: [workEmbed] });
            
        } catch (error) {
            console.error('Error en el comando work:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al procesar tu trabajo. Por favor, inténtalo de nuevo más tarde.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
