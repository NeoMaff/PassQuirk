// 💼 COMANDO WORK - Sistema de trabajo para ganar dinero
const { SlashCommandBuilder } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
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
            let user = await User.findOne({ where: { userId } });
            
            // Si el usuario no existe, crearlo
            if (!user) {
                user = await User.create({
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
                
                const cooldownEmbed = new PassQuirkEmbed()
                    .setTitle('⏳ Descanso del Héroe - PassQuirk RPG')
                    .setDescription(`**¡Alto ahí, valiente aventurero!** ⚔️\n\nTu cuerpo necesita descansar después de la última misión. Podrás trabajar de nuevo en **${minutes} minutos**.\n\n*Incluso los héroes más poderosos necesitan recuperar energías.*`)
                    .addFields(
                        { name: '⚡ Estado', value: 'Recuperando energía', inline: true },
                        { name: '⏰ Tiempo restante', value: `${minutes} minutos`, inline: true },
                        { name: '💡 Consejo', value: 'Usa este tiempo para explorar otros comandos', inline: false }
                    )
                    .setImage('https://i.imgur.com/rest_banner.png')
                    .setFooter({ text: '⚡ Sistema de Trabajo PassQuirk RPG | El descanso fortalece al héroe' });
                
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
            const workEmbed = new PassQuirkEmbed()
                .setTitle(`${job.emoji} ¡Misión Completada! - PassQuirk RPG`)
                .setDescription(`**¡Excelente trabajo, héroe!** ⚔️\n\nHas completado tu misión como **${job.name}** con gran éxito. Tu dedicación ha sido recompensada generosamente.`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🪙 Recompensa Base', value: `${formatNumber(earnings)} monedas`, inline: true },
                    { name: '⭐ Bonificación de Nivel', value: `+${formatNumber(levelBonus)} monedas`, inline: true },
                    { name: '💰 Total Ganado', value: `**${formatNumber(totalEarnings)} monedas**`, inline: true },
                    { name: '✨ Experiencia Ganada', value: `+${xpEarned} XP`, inline: true },
                    { name: '📊 Progreso Actual', value: `Nivel ${user.stats.level} (${user.stats.xp}/${xpNeeded} XP)`, inline: true },
                    { name: '🎯 Profesión', value: `${job.emoji} ${job.name}`, inline: true }
                )
                .setImage('https://i.imgur.com/work_success_banner.png')
                .setFooter({ text: `⚡ Sistema de Trabajo PassQuirk RPG | Nivel ${user.stats.level} • ${user.stats.xp}/${xpNeeded} XP` });
            
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
            
            const errorEmbed = new PassQuirkEmbed()
                .setTitle('❌ Error en la Misión - PassQuirk RPG')
                .setDescription('**¡Oh no!** Algo salió mal durante tu misión de trabajo. 😰\n\nPor favor, inténtalo de nuevo más tarde. Si el problema persiste, contacta a los administradores del reino.')
                .addFields(
                    { name: '🔧 Solución', value: 'Intenta usar el comando nuevamente en unos momentos', inline: false }
                )
                .setFooter({ text: '⚡ Sistema de Trabajo PassQuirk RPG | Error temporal' });
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};
