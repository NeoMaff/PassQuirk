const { SlashCommandBuilder} = require('discord.js');
const User = require('../../models/User');
const { InventoryEmbed, PassQuirkEmbed } = require('../../utils/embedStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('inventario')
        .setDescription('🎒 Ver tu inventario de objetos'),

    async execute(interaction) {
        try {
            const user = await User.findOne({ userId: interaction.user.id });

            if (!user) {
                const embed = new PassQuirkEmbed()
                    .setTitle('⚠️ Usuario no encontrado')
                    .setDescription('Usa `/start` para crear tu personaje.');

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            // Calculate inventory stats
            const totalItems = user.inventory.reduce((sum, item) => sum + (item.amount || 1), 0);
            const totalValue = user.inventory.reduce((sum, item) => sum + ((item.value || 0) * (item.amount || 1)), 0);

            const typeCount = {};
            user.inventory.forEach(item => {
                typeCount[item.type] = (typeCount[item.type] || 0) + 1;
            });
            const mostCommonType = Object.keys(typeCount).sort((a, b) => typeCount[b] - typeCount[a])[0] || 'Ninguno';

            const embed = new InventoryEmbed(interaction.user, user.inventory, {
                stats: {
                    totalItems,
                    totalValue,
                    mostCommonType
                }
            });

            embed.addFields({
                name: '💰 Balance',
                value: `**Monedas:** ${user.balance}\n**Gemas:** ${user.gems}\n**PG:** ${user.pg}`,
                inline: false
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en /inventario:', error);
            await interaction.reply({
                content: '❌ Hubo un error al obtener tu inventario.',
                ephemeral: true
            });
        }
    }
};
