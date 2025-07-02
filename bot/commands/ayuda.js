const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ayuda')
        .setDescription('Muestra todos los comandos disponibles')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría de comandos')
                .setRequired(false)
                .addChoices(
                    { name: 'Economía', value: 'economia' },
                    { name: 'Juego', value: 'juego' },
                    { name: 'Música', value: 'musica' },
                    { name: 'Moderación', value: 'moderacion' },
                    { name: 'Diversión', value: 'diversion' },
                )
        ),

    async execute(interaction) {
        const categoria = interaction.options.getString('categoria');
        
        // Crear el embed principal
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('🎮 Centro de Ayuda de PassQuirk RPG')
            .setDescription('¡Bienvenido al sistema de ayuda! Selecciona una categoría para ver los comandos disponibles.')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: `Solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        // Crear botones de navegación
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('economia_btn')
                    .setLabel('💰 Economía')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('juego_btn')
                    .setLabel('🎮 Juego')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('musica_btn')
                    .setLabel('🎵 Música')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setLabel('Soporte')
                    .setURL('https://discord.gg/tu-invitacion')
                    .setStyle(ButtonStyle.Link)
            );

        // Mostrar comandos por categoría si se especifica
        if (categoria) {
            const comandos = getComandosPorCategoria(categoria);
            embed.setTitle(`📋 Comandos de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`);
            
            for (const [categoria, listaComandos] of Object.entries(comandos)) {
                let valor = '';
                listaComandos.forEach(cmd => {
                    valor += `• **/${cmd.nombre}** - ${cmd.descripcion}\n`;
                });
                embed.addFields({ name: `\u200b\n${categoria}`, value: valor, inline: false });
            }
            
            embed.setDescription('');
        } else {
            // Mostrar descripción general si no hay categoría específica
            embed.addFields(
                { 
                    name: '📌 Categorías de Comandos', 
                    value: '• **💰 Economía** - Comandos de dinero y tienda\n' +
                           '• **🎮 Juego** - Comandos del juego RPG\n' +
                           '• **🎵 Música** - Sistema de música\n' +
                           '• **🛡️ Moderación** - Herramientas de moderación\n' +
                           '• **🎉 Diversión** - Comandos divertidos',
                    inline: false 
                },
                { 
                    name: '🔗 Enlaces Útiles', 
                    value: '[Invitación del Bot](https://discord.com/oauth2/authorize?client_id=TU_CLIENT_ID&permissions=8&scope=bot%20applications.commands) | ' +
                           '[Servidor de Soporte](https://discord.gg/tu-invitacion) | ' +
                           '[Votar](https://top.gg/bot/TU_BOT_ID/vote)',
                    inline: false 
                }
            );
        }

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};

// Función auxiliar para obtener comandos por categoría
function getComandosPorCategoria(categoria) {
    const comandos = {
        'economia': [
            { nombre: 'balance', descripcion: 'Muestra tu saldo o el de otro usuario' },
            { nombre: 'work', descripcion: 'Trabaja para ganar dinero' },
            { nombre: 'daily', descripcion: 'Reclama tu recompensa diaria' },
            { nombre: 'shop', descripcion: 'Muestra la tienda de objetos' },
            { nombre: 'buy', descripcion: 'Compra un objeto de la tienda' },
            { nombre: 'inventory', descripcion: 'Muestra tu inventario' },
        ],
        'juego': [
            { nombre: 'start', descripcion: 'Comienza tu aventura en PassQuirk RPG' },
            { nombre: 'profile', descripcion: 'Muestra tu perfil de jugador' },
            { nombre: 'explore', descripcion: 'Explora el mundo y encuentra tesoros' },
            { nombre: 'battle', descripcion: 'Inicia una batalla contra un enemigo' },
            { nombre: 'quests', descripcion: 'Muestra tus misiones activas' },
        ],
        'musica': [
            { nombre: 'play', descripcion: 'Reproduce una canción o añádela a la cola' },
            { nombre: 'skip', descripcion: 'Salta la canción actual' },
            { nombre: 'stop', descripcion: 'Detiene la reproducción y limpia la cola' },
            { nombre: 'queue', descripcion: 'Muestra la cola de reproducción' },
            { nombre: 'volume', descripcion: 'Ajusta el volumen de la música' },
        ],
        'moderacion': [
            { nombre: 'clear', descripcion: 'Borra mensajes del canal' },
            { nombre: 'ban', descripcion: 'Banea a un usuario del servidor' },
            { nombre: 'kick', descripcion: 'Expulsa a un usuario del servidor' },
            { nombre: 'mute', descripcion: 'Silencia a un usuario' },
        ],
        'diversion': [
            { nombre: 'meme', descripcion: 'Muestra un meme aleatorio' },
            { nombre: '8ball', descripcion: 'Haz una pregunta a la bola 8 mágica' },
            { nombre: 'say', descripcion: 'Haz que el bot diga algo' },
            { nombre: 'avatar', descripcion: 'Muestra el avatar de un usuario' },
        ]
    };

    return { [categoria]: comandos[categoria] || [] };
}
