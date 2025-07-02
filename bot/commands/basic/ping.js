const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mide la latencia del bot'),

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pong!', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong! Latencia: ${latency}ms`);
    },
};
