const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { ProfileEmbed } = require('../../../bot/utils/embedStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('Muestra tu perfil de personaje, estadísticas y progreso.'),
    async execute(interaction, client) {
        const userId = interaction.user.id;
        // Usar el GameManager para obtener datos reales
        const player = await client.gameManager.getPlayer(userId);

        if (!player) {
            await interaction.reply({ content: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para comenzar.', ephemeral: true });
            return;
        }

        // Preparar estadísticas para el embed
        const stats = {
            level: player.level,
            rank: player.rank,
            xp: player.experience || 0,
            xpToNext: player.maxExperience || (player.level * 100),
            playtime: Math.floor((Date.now() - (player.createdAt || Date.now())) / (1000 * 60 * 60)), // Horas aproximadas
            battles: player.stats?.battles || 0,
            victories: player.stats?.victories || 0,
            defeats: player.stats?.defeats || 0,
            balance: player.economy?.passcoins || 0,
            gems: player.economy?.gems || 0,
            status: 'online', // Podría ser dinámico
            achievements: player.achievements || []
        };

        const embed = new ProfileEmbed(interaction.user, stats);

        // Botones interactivos
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('profile_inventory')
                    .setLabel('Inventario')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎒'),
                new ButtonBuilder()
                    .setCustomId('profile_skills')
                    .setLabel('Habilidades')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚡'),
                new ButtonBuilder()
                    .setCustomId('profile_achievements')
                    .setLabel('Logros')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🏆')
            );

        const replyOptions = { embeds: [embed], components: [row] };

        // Manejar si es respuesta o actualización
        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    },

    async handleInteraction(interaction, client) {
        const id = interaction.customId;

        if (id === 'profile_inventory') {
            const inventoryCmd = client.commands.get('inventario');
            if (inventoryCmd) {
                await inventoryCmd.execute(interaction, client);
            } else {
                await interaction.reply({ content: '⚠️ El sistema de inventario aún no está disponible.', ephemeral: true });
            }
        } else if (id === 'profile_skills' || id === 'profile_achievements') {
            await interaction.reply({ content: '🛠️ Esta función estará disponible próximamente.', ephemeral: true });
        }
    }
};
