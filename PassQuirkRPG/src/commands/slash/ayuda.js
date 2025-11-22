const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { generarMensajeEmbed } = require('../../../bot/utils/embedGenerator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Muestra la lista de comandos disponibles y ayuda del juego.'),
    async execute(interaction) {
        const mensaje = generarMensajeEmbed({
            titulo: `❓ **Centro de Ayuda PassQuirk**`,
            descripcion: `Aquí tienes una lista de los comandos que puedes usar:\n\n` +
                `**/passquirkrpg** - Inicia o reanuda tu aventura principal.\n` +
                `**/perfil** - Muestra tu ficha de personaje y estadísticas.\n` +
                `**/explorar** - Viaja por el mundo y encuentra enemigos o tesoros.\n` +
                `**/ayuda** - Muestra este mensaje de ayuda.\n\n` +
                `*Si encuentras algún error, contacta con los administradores.*`,
            color: 0x10b981,
            footer: `PassQuirk RPG • Ayuda`
        });

        const replyOptions = { embeds: [mensaje.embed], components: [], ephemeral: true };

        if (interaction.deferred || interaction.replied) {
            await interaction.followUp(replyOptions);
        } else {
            await interaction.reply(replyOptions);
        }
    }
};
