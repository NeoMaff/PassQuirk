const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const economy = require('../../../utils/advancedEconomy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('econ')
        .setDescription('Administración de la economía del servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(sub => sub
            .setName('set-balance')
            .setDescription('Establece el balance de un usuario')
            .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('add-balance')
            .setDescription('Añade balance a un usuario')
            .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('currency-name')
            .setDescription('Cambia el nombre de la moneda del servidor')
            .addStringOption(opt => opt.setName('nombre').setDescription('Nombre de moneda').setRequired(true)))
        .addSubcommand(sub => sub
            .setName('starting-balance')
            .setDescription('Define el balance inicial para nuevos usuarios')
            .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true))
        ),

    async execute(interaction) {
        const guildId = interaction.guildId;
        const sub = interaction.options.getSubcommand();
        const currency = (await economy.getConfig(guildId)).currencyName;

        try {
            if (sub === 'set-balance') {
                const user = interaction.options.getUser('usuario');
                const amount = interaction.options.getInteger('cantidad');
                await economy.setBalance(guildId, user.id, amount);
                await interaction.reply({ content: `✅ Balance de ${user.username} establecido a ${amount} ${currency}.` });
            } else if (sub === 'add-balance') {
                const user = interaction.options.getUser('usuario');
                const amount = interaction.options.getInteger('cantidad');
                await economy.addWallet(guildId, user.id, amount);
                await interaction.reply({ content: `✅ Añadidos ${amount} ${currency} a ${user.username}.` });
            } else if (sub === 'currency-name') {
                const name = interaction.options.getString('nombre');
                await economy.setConfigField(guildId, 'currencyName', name);
                await interaction.reply({ content: `✅ Nombre de moneda cambiado a ${name}.` });
            } else if (sub === 'starting-balance') {
                const amount = interaction.options.getInteger('cantidad');
                await economy.setConfigField(guildId, 'startingBalance', amount);
                await interaction.reply({ content: `✅ Balance inicial establecido a ${amount}.` });
            }
        } catch (err) {
            console.error('econ admin error', err);
            await interaction.reply({ content: '❌ Error al procesar el comando.', ephemeral: true });
        }
    },
};
