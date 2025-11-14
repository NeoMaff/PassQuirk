const { SlashCommandBuilder } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('📚 Muestra la lista de comandos disponibles'),

    async execute(interaction) {
        const embed = new PassQuirkEmbed()
            .setTitle('📚 Comandos de PassQuirk RPG')
            .setDescription('¡Bienvenido al mundo de PassQuirk! Aquí están todos los comandos disponibles:')
            .addFields(
                {
                    name: '👤 Personaje',
                    value: [
                        '`/start` - Crea tu personaje e inicia tu aventura',
                        '`/personaje` - Ver tu perfil y estadísticas',
                        '`/inventario` - Ver tu inventario de objetos'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚔️ Aventura',
                    value: [
                        '`/explorar` - Explora el mundo en busca de aventuras',
                        '`/combate` - Inicia un combate de práctica',
                        '`/misiones` - Ver misiones disponibles'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '💰 Economía',
                    value: [
                        '`/balance` - Ver tu dinero',
                        '`/work` - Trabaja para ganar dinero',
                        '`/shop` - Ver la tienda',
                        '`/daily` - Reclamar recompensa diaria'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '⚔️ Gremios',
                    value: [
                        '`/guild create` - Crear un gremio',
                        '`/guild info` - Ver información del gremio',
                        '`/guild join` - Unirse a un gremio'
                    ].join('\n'),
                    inline: false
                },
                {
                    name: '🌍 Información',
                    value: [
                        '`/ayuda` - Muestra este mensaje',
                        '`/info` - Información sobre el bot'
                    ].join('\n'),
                    inline: false
                }
            )
            .setFooter({ text: 'PassQuirk RPG - Un juego de rol en Discord' });

        await interaction.reply({ embeds: [embed] });
    }
};
