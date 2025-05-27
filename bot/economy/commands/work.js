const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Definición de trabajos disponibles
const JOBS = [
    { 
        name: 'minero', 
        title: 'Minero',
        emoji: '⛏️',
        min: 50, 
        max: 150, 
        description: 'Extraes minerales valiosos de las profundidades de la mina.',
        rareItem: { name: 'Diamante raro', chance: 0.05, emoji: '💎' }
    },
    { 
        name: 'pescador', 
        title: 'Pescador',
        emoji: '🎣',
        min: 30, 
        max: 120, 
        description: 'Pescas en el río en busca de peces exóticos.',
        rareItem: { name: 'Pez dorado', chance: 0.08, emoji: '🐠' }
    },
    { 
        name: 'leñador', 
        title: 'Leñador',
        emoji: '🪓',
        min: 40, 
        max: 130, 
        description: 'Cortas madera de los bosques cercanos.',
        rareItem: { name: 'Madera ancestral', chance: 0.06, emoji: '🪵' }
    },
    { 
        name: 'cazador', 
        title: 'Cazador',
        emoji: '🏹',
        min: 60, 
        max: 180, 
        description: 'Cazas criaturas en el bosque.',
        rareItem: { name: 'Piel de lobo plateado', chance: 0.04, emoji: '🐺' }
    },
    { 
        name: 'alquimista', 
        title: 'Alquimista',
        emoji: '🧪',
        min: 70, 
        max: 200, 
        description: 'Preparas pociones y elixires mágicos.',
        rareItem: { name: 'Poción de la eterna juventud', chance: 0.03, emoji: '🧴' }
    }
];

// Tiempo de espera entre trabajos (1 hora)
const WORK_COOLDOWN = 60 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trabajar')
        .setDescription('Trabaja para ganar dinero y objetos'),
    
    async execute(interaction) {
        const economy = interaction.client.economy;
        const userId = interaction.user.id;
        
        // Verificar cooldown
        const cooldown = economy.isOnCooldown(`work:${userId}`, WORK_COOLDOWN);
        
        if (cooldown > 0) {
            const minutes = Math.ceil(cooldown / 60000);
            return interaction.reply({
                content: `⏳ Debes esperar ${minutes} minutos antes de volver a trabajar.`,
                ephemeral: true
            });
        }
        
        try {
            // Seleccionar un trabajo aleatorio
            const job = JOBS[Math.floor(Math.random() * JOBS.length)];
            const amount = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
            
            // Crear embed de respuesta
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle(`${job.emoji} ${job.title}`)
                .setDescription(`*${job.description}*`)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            
            // Agregar recompensa principal
            await economy.addCurrency(userId, 'pc', amount, `Trabajo como ${job.name}`);
            embed.addFields({
                name: 'Recompensa',
                value: `Has ganado **${amount} PC**`
            });
            
            // Posibilidad de obtener gemas (15% de probabilidad)
            let gemBonus = 0;
            if (Math.random() < 0.15) {
                gemBonus = Math.floor(Math.random() * 3) + 1; // 1-3 gemas
                await economy.addCurrency(userId, 'gems', gemBonus, 'Bono de trabajo');
                embed.addFields({
                    name: '🎉 ¡Bono!',
                    value: `Has encontrado **${gemBonus} 💎 Gemas** mientras trabajabas.`,
                    inline: true
                });
            }
            
            // Posibilidad de obtener objeto raro
            if (job.rareItem && Math.random() < job.rareItem.chance) {
                // Aquí iría la lógica para agregar el objeto al inventario del usuario
                // Por ahora, solo lo mostramos en el mensaje
                embed.addFields({
                    name: '✨ ¡Objeto raro encontrado!',
                    value: `Has encontrado un **${job.rareItem.emoji} ${job.rareItem.name}** mientras trabajabas.`,
                    inline: true
                });
            }
            
            // Establecer cooldown
            economy.cooldowns.set(`work:${userId}`, Date.now());
            
            // Enviar respuesta
            await interaction.reply({ 
                content: `<@${userId}> ha trabajado como **${job.title}**`,
                embeds: [embed] 
            });
            
        } catch (error) {
            console.error('Error en el comando de trabajo:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar tu trabajo. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true
            });
        }
    }
};
