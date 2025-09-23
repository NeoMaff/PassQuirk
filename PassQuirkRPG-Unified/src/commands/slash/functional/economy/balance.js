// 💰 COMANDO BALANCE - Mostrar saldo del usuario
const { SlashCommandBuilder } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
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
            let user = await User.findOne({ where: { userId: targetUser.id } });
            
            if (!user) {
                user = await User.create({
                    userId: targetUser.id,
                    username: targetUser.username,
                    balance: 1000, // Saldo inicial
                    lastDaily: null,
                    inventory: []
                });
            }

            const embed = new PassQuirkEmbed()
                .setTitle(isSelf ? '💰 Tu Saldo - PassQuirk RPG' : `💰 Saldo de ${targetUser.username} - PassQuirk RPG`)
                .setDescription(isSelf ? 
                    '¡Aquí tienes tu estado financiero actual, héroe! 💪' : 
                    `Estado financiero del aventurero ${targetUser.username}`)
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: '🪙 Monedas de Oro', value: `**${user.balance.toLocaleString()}** monedas`, inline: true },
                    { name: '💎 Gemas Mágicas', value: `**${(user.gems || 0).toLocaleString()}** gemas`, inline: true },
                    { name: '✨ Puntos de Gloria (PG)', value: `**${(user.pg || 0).toLocaleString()}** PG`, inline: true },
                    { name: '\u200B', value: '\u200B', inline: false },
                    { name: '💡 Consejo del Mentor', value: 'Usa `/work` para ganar más monedas y `/shop` para equiparte mejor', inline: false }
                )
                .setImage('https://i.imgur.com/economy_banner.png')
                .setFooter({ text: '⚡ Sistema Económico PassQuirk RPG | ¡Tu aventura financiera te espera!' });

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
