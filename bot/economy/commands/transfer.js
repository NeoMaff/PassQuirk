const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transferir')
        .setDescription('Transfiere dinero a otro usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario al que quieres transferir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('moneda')
                .setDescription('Tipo de moneda a transferir')
                .setRequired(true)
                .addChoices(
                    { name: '💰 PC', value: 'pc' },
                    { name: '💎 Gemas', value: 'gems' },
                    { name: '🏆 PG', value: 'pg' }
                ))
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad a transferir')
                .setRequired(true)
                .setMinValue(1)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const currencyId = interaction.options.getString('moneda');
        const amount = interaction.options.getInteger('cantidad');
        
        // Evitar auto-transferencias
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ No puedes transferirte dinero a ti mismo.',
                ephemeral: true
            });
        }
        
        // Evitar transferencias a bots
        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ No puedes transferir dinero a un bot.',
                ephemeral: true
            });
        }
        
        try {
            const economy = interaction.client.economy;
            const currency = economy.currencies.get(currencyId);
            
            if (!currency) {
                return interaction.reply({
                    content: '❌ Moneda no válida.',
                    ephemeral: true
                });
            }
            
            // Verificar fondos
            const userBalances = await economy.getUserBalances(interaction.user.id);
            if (userBalances[currencyId] < amount) {
                return interaction.reply({
                    content: `❌ No tienes suficiente ${currency.name.toLowerCase()} para realizar esta transferencia.`,
                    ephemeral: true
                });
            }
            
            // Realizar transferencia
            await economy.transferCurrency(
                interaction.user.id,
                targetUser.id,
                currencyId,
                amount,
                `Transferencia a ${targetUser.username}`
            );
            
            // Obtener saldos actualizados
            const updatedBalances = await economy.getUserBalances(interaction.user.id);
            const targetBalances = await economy.getUserBalances(targetUser.id);
            
            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('✅ Transferencia exitosa')
                .setDescription(`Has transferido **${amount} ${currency.symbol}** a ${targetUser}`)
                .addFields(
                    {
                        name: 'Tu saldo actual',
                        value: `**${updatedBalances[currencyId].toLocaleString()} ${currency.symbol}**`,
                        inline: true
                    },
                    {
                        name: `Saldo de ${targetUser.username}`,
                        value: `**${targetBalances[currencyId].toLocaleString()} ${currency.symbol}**`,
                        inline: true
                    }
                )
                .setTimestamp();
            
            await interaction.reply({ embeds: [embed] });
            
        } catch (error) {
            console.error('Error en la transferencia:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al procesar la transferencia. Por favor, inténtalo de nuevo más tarde.',
                ephemeral: true
            });
        }
    }
};
