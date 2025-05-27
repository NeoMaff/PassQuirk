const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu saldo actual')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario cuyo saldo quieres ver')
                .setRequired(false)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const isSelf = targetUser.id === interaction.user.id;
        
        try {
            const economy = interaction.client.economy;
            const balances = await economy.getUserBalances(targetUser.id);
            
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(isSelf ? '💵 Tu saldo' : `💵 Saldo de ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setTimestamp();
            
            // Agregar cada moneda al embed
            for (const [currencyId, amount] of Object.entries(balances)) {
                if (currencyId === 'id') continue;
                
                const currency = economy.currencies.get(currencyId);
                if (!currency) continue;
                
                embed.addFields({
                    name: `${currency.symbol} ${currency.name}`,
                    value: `**${amount.toLocaleString()}**`,
                    inline: true
                });
            }
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error al obtener el saldo:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al obtener el saldo. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true
            });
        }
    }
};
