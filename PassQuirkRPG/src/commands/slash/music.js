const { SlashCommandBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const musicManager = require('../../../bot/utils/musicManager');
const { generarMensajeEmbed } = require('../../../bot/utils/embedGenerator');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Controla la música del bot')
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Inicia la música de aventura con asistencia de ElSabio'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Detiene la música y desconecta al bot')),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'play') {
            const emojiMusica = '🎵';
            const emojiSabio = '🧙‍♂️';

            const mensaje = generarMensajeEmbed({
                titulo: `${emojiSabio} **Ambientación Musical**`,
                descripcion: `${emojiMusica} **¿Deseas activar la música ambiental?**\n\n` +
                    `Para una mejor experiencia inmersiva, te recomendamos activar el sonido.\n` +
                    `*El bot se unirá a tu canal de voz para reproducir la banda sonora.*`,
                footer: `${emojiSabio} ElSabio • Configuración`,
                botones: [
                    {
                        id: 'music_play_confirm',
                        label: 'Sí, activar música',
                        style: ButtonStyle.Success,
                        emoji: '🔊'
                    },
                    {
                        id: 'music_play_cancel',
                        label: 'Cancelar',
                        style: ButtonStyle.Secondary,
                        emoji: '❌'
                    }
                ],
                imagen: 'attachment://Tutorial_Sabio.png',
                banner: true
            });

            mensaje.files = [{
                attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
                name: 'Tutorial_Sabio.png'
            }];

            await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });

        } else if (subcommand === 'stop') {
            musicManager.stop();
            await interaction.reply({ content: '🛑 Música detenida y desconectado.', ephemeral: true });
        }
    },

    async handleInteraction(interaction, client) {
        const id = interaction.customId;

        if (id === 'music_play_cancel') {
            await interaction.update({ content: '❌ Operación cancelada.', embeds: [], components: [], files: [] });
            return;
        }

        if (id === 'music_play_confirm') {
            await interaction.deferUpdate();
            const { member, guild } = interaction;

            if (!musicManager) {
                await interaction.followUp({ content: '⚠️ El sistema de música no está disponible.', ephemeral: true });
                return;
            }

            try {
                // Mostrar estado de "Conectando..."
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🎵 Conectando...')
                            .setDescription('Estableciendo conexión con el plano de voz. Por favor espera...')
                            .setColor('#3498db')
                    ],
                    components: [],
                    files: []
                });

                // Asegurar caché
                await guild.channels.fetch();
                const currentMember = await guild.members.fetch(member.id);
                let targetChannel = currentMember.voice.channel;
                const channelName = '🎵 Música | PassQuirk';

                // Buscar o crear canal si no está en uno
                if (!targetChannel) {
                    targetChannel = guild.channels.cache.find(c => c.name === channelName && c.type === ChannelType.GuildVoice);

                    if (!targetChannel) {
                        try {
                            const worldCategory = guild.channels.cache.find(c => c.name === '🌍 MUNDO PASSQUIRK' && c.type === ChannelType.GuildCategory);
                            targetChannel = await guild.channels.create({
                                name: channelName,
                                type: ChannelType.GuildVoice,
                                parent: worldCategory ? worldCategory.id : null,
                                permissionOverwrites: [
                                    {
                                        id: guild.roles.everyone,
                                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
                                    }
                                ]
                            });
                        } catch (e) {
                            console.error('Error creando canal:', e);
                        }
                    }
                }

                if (targetChannel) {
                    await musicManager.joinChannel(targetChannel);

                    // Reproducir música
                    const musicPath = 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav';
                    musicManager.playFile(musicPath, true);

                    // Mover usuario si es necesario
                    if (currentMember.voice.channel && currentMember.voice.channel.id !== targetChannel.id) {
                        try {
                            await currentMember.voice.setChannel(targetChannel);
                        } catch (e) { console.error('Error moviendo usuario:', e); }
                    }

                    const embedExito = new EmbedBuilder()
                        .setTitle('✅ Conexión Establecida')
                        .setDescription(`He movido tu esencia al canal **${targetChannel.name}**.\nLa atmósfera está lista para tu aventura.`)
                        .setColor('#57F287');

                    await interaction.editReply({ embeds: [embedExito], components: [] });
                } else {
                    // Fallback si no se pudo encontrar/crear canal y usuario no está en uno
                    await interaction.editReply({
                        content: '⚠️ No pude conectar a un canal de voz. Por favor únete a uno manualmente y vuelve a intentar.',
                        embeds: []
                    });
                }

            } catch (error) {
                console.error('Error en música:', error);
                await interaction.editReply({ content: '❌ Ocurrió un error al conectar.', embeds: [] });
            }
        }
    }
};
