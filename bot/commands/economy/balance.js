const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Muestra tu saldo o el de otro usuario')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Usuario del que quieres ver el saldo')
                .setRequired(false)),
    
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            const isSelf = targetUser.id === interaction.user.id;

            // Buscar o crear el usuario en la base de datos
            let user = await User.findOne({ userId: targetUser.id });
            
            if (!user) {
                user = new User({
                    userId: targetUser.id,
                    username: targetUser.username,
                    balance: 1000, // Saldo inicial
                    lastDaily: null,
                    inventory: []
                });
                await user.save();
            }

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(isSelf ? '💰 Tu Saldo' : `💰 Saldo de ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Monedas', value: `\🪙 ${user.balance}`, inline: true },
                    { name: 'Gemas', value: `\💎 ${user.gems || 0}`, inline: true },
                    { name: 'PG', value: `\✨ ${user.pg || 0}`, inline: true }
                )
                .setFooter({ text: 'Usa /work para ganar más monedas' });

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error en comando balance:', error);
            await interaction.reply({ 
                content: '❌ Ocurrió un error al consultar el saldo.', 
                ephemeral: true 
            });
        }
    },
};
