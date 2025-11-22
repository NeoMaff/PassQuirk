const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ChannelType, PermissionFlagsBits, ComponentType } = require('discord.js');
const animatedEmojis = require('../../../bot/utils/animatedEmojis');
const passquirkData = require('../../../bot/data/passquirkData');
const officialData = require('../../../bot/data/passquirk-official-data');
const { PlayerDatabase } = require('../../../bot/data/player-database');
const { generarMensajeEmbed } = require('../../../bot/utils/embedGenerator');
const musicManager = require('../../../bot/utils/musicManager');
const { saveTutorialState, loadTutorialState } = require('../../../bot/utils/persistence');
const perfilCommand = require('./perfil');
const ayudaCommand = require('./ayuda');
const explorarCommand = require('./explorar');

// --- ESTADO GLOBAL DEL MÓDULO ---
// Almacenamiento temporal de datos del personaje (Cargado desde persistencia)
const datosPersonaje = loadTutorialState();

// Función helper para guardar cambios
function guardarEstado() {
    saveTutorialState(datosPersonaje);
}

// Estados de combate
const estadosCombate = new Map();
// Base de datos de jugadores
const playerDB = new PlayerDatabase();

// Estados del tutorial
const ESTADOS = {
    NO_INICIADO: 'NO_INICIADO',
    CREANDO_PERSONAJE: 'CREANDO_PERSONAJE',
    ELIGIENDO_CLASE: 'ELIGIENDO_CLASE',
    ELIGIENDO_REINO: 'ELIGIENDO_REINO',
    COMBATE_TUTORIAL: 'COMBATE_TUTORIAL',
    TUTORIAL_COMPLETADO: 'TUTORIAL_COMPLETADO'
};

// Colores oficiales
const COLORES = {
    AMARILLO_TUTORIAL: 0xfcd34d,
    ROJO_PELIGRO: 0xdc2626,
    VERDE_EXITO: 0x10b981,
    PURPURA_MISTICO: 0x9B59B6
};

// Clases oficiales
const CLASES_OFICIALES = officialData.CLASES || passquirkData.clases || {
    celestial: { name: 'Celestial', emoji: '🪽', desc: 'Ser de luz con habilidades curativas y ataques sagrados de área.' },
    fenix: { name: 'Fénix', emoji: '🔥', desc: 'Renace tras ser derrotado; domina el fuego y el resurgir explosivo.' },
    berserker: { name: 'Berserker', emoji: '⚔️', desc: 'Guerrero desatado con fuerza bruta creciente cuanto más daño recibe.' },
    inmortal: { name: 'Inmortal', emoji: '☠️', desc: 'No puede morir fácilmente; regenera y resiste efectos mortales.' },
    demon: { name: 'Demon', emoji: '👹', desc: 'Poder oscuro, drenaje de vida y habilidades infernales.' },
    sombra: { name: 'Sombra', emoji: '⚔️🌀', desc: 'Ninja silencioso y letal; experto en clones, humo y ataques críticos.' }
};

// Reinos oficiales
const REINOS_OFICIALES = officialData.REINOS || passquirkData.reinos || {
    akai: { name: 'Reino de Akai', emoji: '🔴', desc: 'Reino de la fuerza, la guerra y la resistencia.' },
    say: { name: 'Reino de Say', emoji: '🟢', desc: 'Reino de la magia, el conocimiento y lo ancestral.' },
    masai: { name: 'Reino de Masai', emoji: '🟡', desc: 'Reino del comercio, la alquimia y la diplomacia.' },
    bosque: { name: 'Bosque Misterioso', emoji: '🌑', desc: 'Lugar lleno de secretos y criaturas místicas.' },
    cueva: { name: 'Cueva Oscura', emoji: '🕳️', desc: 'Profundidades inexploradas con tesoros ocultos.' }
};

// --- FUNCIONES AUXILIARES ---

function getEmoji(emojiKey, fallback = '✨') {
    // Usuario solicitó no usar emojis animados por ahora
    return fallback;
}

function crearBarraVida(nombre, vidaActual, vidaMaxima) {
    const porcentaje = (vidaActual / vidaMaxima) * 100;
    const barras = 10;
    const barrasLlenas = Math.floor((porcentaje / 100) * barras);
    const barrasVacias = barras - barrasLlenas;

    let emoji = '❤️';
    if (porcentaje <= 25) emoji = '💔';
    else if (porcentaje <= 50) emoji = '🧡';
    else if (porcentaje <= 75) emoji = '💛';

    const barra = '█'.repeat(barrasLlenas) + '░'.repeat(barrasVacias);

    return `${emoji} **${nombre}:** \`${barra}\` ${vidaActual}/${vidaMaxima} HP`;
}

function obtenerQuirkAleatorio() {
    const quirksOficiales = Object.values(officialData.PASSQUIRKS || passquirkData.passquirks || {});
    const quirksComunes = quirksOficiales.length > 0 ? quirksOficiales : [
        { name: 'Fuerza Básica', desc: 'Aumenta el daño físico' },
        { name: 'Velocidad Básica', desc: 'Aumenta la velocidad de ataque' },
        { name: 'Resistencia Básica', desc: 'Reduce el daño recibido' },
        { name: 'Energía Básica', desc: 'Aumenta la energía máxima' }
    ];

    return quirksComunes[Math.floor(Math.random() * quirksComunes.length)];
}

// --- LÓGICA DEL TUTORIAL ---


const worldSystem = require('../../../bot/utils/worldSystem');

// --- LÓGICA DEL TUTORIAL ---

async function iniciarTutorialElSabio(interaction) {
    console.log('🚀 [DEBUG] iniciarTutorialElSabio called');
    await preguntarMusica(interaction);
}

async function preguntarMusica(interaction) {
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
                id: 'tutorial_musica_si',
                label: 'Sí, activar música',
                style: ButtonStyle.Success,
                emoji: '🔊'
            },
            {
                id: 'tutorial_musica_no',
                label: 'No, continuar en silencio',
                style: ButtonStyle.Secondary,
                emoji: '🔇'
            }
        ],
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else if (interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else {
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        }
    } catch (error) {
        console.error('Error en preguntarMusica (con video):', error);
        // Fallback: intentar enviar sin video
        try {
            mensaje.embed.setImage(null);
            mensaje.embed.setThumbnail(null);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components });
            } else {
                await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components });
            }
        } catch (fallbackError) {
            console.error('Error fatal en preguntarMusica:', fallbackError);
        }
    }
}

async function procesarMusica(interaction) {
    try {
        // Deferir actualización inmediatamente para evitar timeout
        await interaction.deferUpdate();

        const { customId, member, guild } = interaction;
        const quiereMusica = customId === 'tutorial_musica_si';

        // Guardar preferencia (podría guardarse en DB)
        // ...

        if (quiereMusica) {
            if (!musicManager) {
                await interaction.followUp({ content: '⚠️ El sistema de música no está disponible.', ephemeral: true });
            } else {
                try {
                    // Mostrar estado de "Conectando..." inmediatamente
                    await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('🎵 Conectando...')
                                .setDescription('Estableciendo conexión con el plano de voz. Por favor espera...')
                                .setColor('#3498db') // Hardcoded blue to avoid undefined color error
                        ],
                        components: [], // Quitar botones mientras carga
                        ephemeral: true
                    });

                    // Asegurar que la caché de canales está actualizada
                    await guild.channels.fetch();

                    // Obtener el miembro actualizado para asegurar estado de voz correcto
                    const currentMember = await guild.members.fetch(member.id);

                    let targetChannel = currentMember.voice.channel;
                    let createdChannel = false;
                    const channelName = '🎵 Música | PassQuirk';

                    // Si el usuario no está en un canal, buscar o crear uno
                    if (!targetChannel) {
                        targetChannel = guild.channels.cache.find(c => c.name === channelName && c.type === ChannelType.GuildVoice);

                        if (!targetChannel) {
                            console.log('Creando nuevo canal de música...');
                            // Crear canal si no existe
                            try {
                                // Intentar ponerlo en la categoría del mundo si existe
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
                                createdChannel = true;
                                console.log('Canal de música creado:', targetChannel.id);
                            } catch (createError) {
                                console.error('Error creando canal de música:', createError);
                                await interaction.followUp({ content: `⚠️ Error técnico creando el canal: ${createError.message}. Por favor, crea un canal de voz manualmente y únete.`, ephemeral: true });
                            }
                        } else {
                            console.log('Canal de música encontrado:', targetChannel.id);
                        }
                    }

                    if (targetChannel) {
                        console.log('[DEBUG] Conectando al canal de música...');
                        let joined = false;
                        try {
                            joined = await musicManager.joinChannel(targetChannel);
                        } catch (joinErr) {
                            console.error('[DEBUG] Error en joinChannel:', joinErr);
                        }
                        console.log('[DEBUG] Resultado de joinChannel:', joined);

                        if (joined) {
                            // Reproducir Introducción al inicio (según petición usuario) en bucle
                            console.log('[DEBUG] Intentando reproducir música...');
                            try {
                                const musicPath = 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav';
                                const playResult = musicManager.playFile(musicPath, true);
                                console.log('[DEBUG] Resultado de playFile:', playResult);
                            } catch (playErr) {
                                console.error('[DEBUG] Error al reproducir archivo:', playErr);
                            }
                        } else {
                            console.warn('[DEBUG] No se pudo unir al canal, saltando reproducción.');
                        }

                        // Intentar mover al usuario si ya está en un canal de voz
                        try {
                            // Esperar un momento para asegurar que la conexión de voz se ha establecido
                            await new Promise(resolve => setTimeout(resolve, 1000));

                            // Obtener el miembro actual
                            const currentMember = await guild.members.fetch(interaction.user.id);

                            if (currentMember.voice.channel && currentMember.voice.channel.id !== targetChannel.id) {
                                try {
                                    await currentMember.voice.setChannel(targetChannel);
                                    console.log('[DEBUG] Usuario movido al canal de música');
                                } catch (moveErr) {
                                    console.error('[DEBUG] No se pudo mover al usuario:', moveErr);
                                }

                                const embedExito = new EmbedBuilder()
                                    .setTitle('✅ Conexión Establecida')
                                    .setDescription(`He movido tu esencia al canal **${targetChannel.name}**.\nLa atmósfera está lista para tu aventura.`)
                                    .setColor('#57F287');

                                const rowContinuar = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('tutorial_music_continue')
                                        .setLabel('Continuar')
                                        .setStyle(ButtonStyle.Success)
                                        .setEmoji('➡️')
                                );

                                await interaction.editReply({
                                    embeds: [embedExito],
                                    components: [rowContinuar],
                                    ephemeral: true
                                });
                            } else if (!currentMember.voice.channel) {
                                // Usuario NO está en ningún canal de voz
                                console.log('[DEBUG] Usuario NO está en canal de voz, mostrando embed con botón');

                                // Mensaje con El Sabio
                                const embedFallo = await generarMensajeEmbed({
                                    titulo: '¡Necesito tu ayuda, viajero!',
                                    descripcion: `"Para que la magia de la música te envuelva, debes estar presente en el plano de la voz."\n\n**No puedo moverte si no estás en un canal de voz.**\nPor favor, únete manualmente al canal ${targetChannel.toString()} y la melodía comenzará.`,
                                    color: COLORES.AMARILLO_TUTORIAL,
                                    imagen: 'attachment://El-video-de-presentacion-de-las-passquirk.gif',
                                    banner: true,
                                    botones: [
                                        {
                                            id: 'link_canal_voz',
                                            label: `Unirse a ${targetChannel.name}`,
                                            style: ButtonStyle.Link,
                                            url: `https://discord.com/channels/${guild.id}/${targetChannel.id}`,
                                            emoji: '🔊'
                                        },
                                        {
                                            id: 'tutorial_music_check_joined',
                                            label: 'Ya estoy dentro',
                                            style: ButtonStyle.Success,
                                            emoji: '✅'
                                        },
                                        {
                                            id: 'tutorial_music_continue',
                                            label: 'Continuar sin música',
                                            style: ButtonStyle.Secondary,
                                            emoji: '➡️'
                                        }
                                    ]
                                });

                                await interaction.editReply({
                                    embeds: [embedFallo.embed],
                                    components: embedFallo.components,
                                    files: embedFallo.files,
                                    ephemeral: true
                                });
                            } else {
                                // Usuario ya está en el canal correcto
                                console.log('[DEBUG] Usuario ya está en el canal de música');

                                const embedExito = new EmbedBuilder()
                                    .setTitle('✅ Conexión Establecida')
                                    .setDescription(`Ya estás en el canal **${targetChannel.name}**.\nLa música comenzará a sonar.`)
                                    .setColor('#57F287');

                                const rowContinuar = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('tutorial_music_continue')
                                        .setLabel('Continuar')
                                        .setStyle(ButtonStyle.Success)
                                        .setEmoji('➡️')
                                );

                                await interaction.editReply({
                                    embeds: [embedExito],
                                    components: [rowContinuar],
                                    ephemeral: true
                                });
                            }
                        } catch (moveError) {
                            console.error('Error en lógica de movimiento/audio:', moveError);
                            await interaction.editReply({
                                content: `✅ Música activada (con advertencia). Hubo un error técnico (${moveError.message}). Por favor, únete manualmente a ${targetChannel.toString()}.`,
                                components: [
                                    new ActionRowBuilder().addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('tutorial_music_continue')
                                            .setLabel('Continuar')
                                            .setStyle(ButtonStyle.Primary)
                                            .setEmoji('➡️')
                                    )
                                ],
                                ephemeral: true
                            });
                        }
                    } else {
                        await interaction.editReply({
                            content: '⚠️ No pude conectar a un canal de voz. Únete a uno y vuelve a intentarlo.',
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('tutorial_music_continue')
                                        .setLabel('Continuar')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('➡️')
                                )
                            ],
                            ephemeral: true
                        });
                    }
                } catch (musicSetupError) {
                    console.error('Error en la configuración de música (FULL):', musicSetupError);
                    if (musicSetupError.rawError) console.error('Raw Error:', JSON.stringify(musicSetupError.rawError, null, 2));

                    await interaction.editReply({
                        content: `⚠️ Ocurrió un error al intentar activar la música: ${musicSetupError.message}.`,
                        components: [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('tutorial_music_continue')
                                    .setLabel('Continuar')
                                    .setStyle(ButtonStyle.Primary)
                                    .setEmoji('➡️')
                            )
                        ],
                        ephemeral: true
                    });
                }
            }
        } else {
            // Usuario dijo NO a la música
            await interaction.followUp({
                content: '✅ Continuaremos sin música.',
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('tutorial_music_continue')
                            .setLabel('Continuar')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                    )
                ],
                ephemeral: true
            });
        }

        // ELIMINADO: setTimeout para avance automático. Ahora depende del botón 'tutorial_music_continue'.
    } catch (error) {
        console.error('Error crítico en procesarMusica:', error);
        try {
            await interaction.followUp({
                content: '⚠️ Ocurrió un error, pero puedes continuar.',
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('tutorial_music_continue')
                            .setLabel('Continuar')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('➡️')
                    )
                ],
                ephemeral: true
            });
        } catch (fatalError) {
            console.error('Error fatal recuperando de procesarMusica:', fatalError);
        }
    }
}

async function mostrarBienvenida(interaction) {
    const emojiEstrella = getEmoji('starYellow', '⭐');
    const emojiSparkles = getEmoji('sparkleStars', '✨');
    const emojiSabio = '🧙‍♂️';

    // const worldState = worldSystem.getWorldState(); // Ya no se usa en el texto del embed

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **ElSabio te da la bienvenida**`,
        descripcion: `${emojiSparkles} ***¡Saludos, viajero!***\n\n` +
            `Soy **ElSabio**, el guardián de las historias de **PassQuirk**.\n` +
            `He visto muchos rostros pasar por aquí, pero el tuyo... tiene algo especial.\n\n` +
            `*El anciano te mira con curiosidad, ajustándose sus gafas.*\n\n` +
            `**"Dime, joven... ¿cuál es tu nombre?"**`,
        // Usamos imagen estática para evitar errores de video
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        footer: `${emojiSabio} ElSabio • Inicio de la Aventura`,
        botones: [
            {
                id: 'tutorial_step_nombre',
                label: 'Presentarse',
                style: ButtonStyle.Primary,
                emoji: '👋'
            }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else {
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        }
    } catch (error) {
        console.error('Error en mostrarBienvenida (con video):', error);
        try {
            mensaje.embed.setImage(null);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components });
            } else {
                await interaction.update({ embeds: [mensaje.embed], components: mensaje.components });
            }
        } catch (fallbackError) {
            console.error('Error fatal en mostrarBienvenida:', fallbackError);
        }
    }
}

async function mostrarModalNombre(interaction) {
    // Si la interacción ya fue respondida o diferida, NO podemos mostrar un modal directamente.
    // Debemos enviar un mensaje con un botón para que el usuario haga clic y abra el modal.
    if (interaction.replied || interaction.deferred) {
        const emojiSabio = '🧙‍♂️';
        const emojiSparkles = getEmoji('sparkleStars', '✨');

        const mensaje = generarMensajeEmbed({
            titulo: `${emojiSabio} **Registro de Identidad**`,
            descripcion: `${emojiSparkles} **ElSabio:** "¡Excelente! Ahora, por favor escribe tu nombre para el registro."\n\n` +
                `*"Tu nombre será conocido en todos los rincones de PassQuirk..."*`,
            imagen: 'attachment://ElSabio_Habla.gif',
            banner: true,
            footer: `${emojiSabio} ElSabio • Nombre`,
            botones: [
                {
                    id: 'tutorial_open_name_modal',
                    label: 'Escribir Nombre',
                    style: ButtonStyle.Primary,
                    emoji: '📝'
                }
            ]
        });

        const files = [{
            attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/GIF/El-video-de-presentacion-de-las-passquirk.gif',
            name: 'Presentacion_PassQuirk.gif'
        }];

        await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: files });
        return;
    }

    const modal = new ModalBuilder()
        .setCustomId('modal_tutorial_nombre')
        .setTitle('🧙‍♂️ ¿Cómo te llamas?');

    const nombreInput = new TextInputBuilder()
        .setCustomId('nombre_personaje')
        .setLabel('Tu Nombre')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Escribe tu nombre aquí...')
        .setRequired(true)
        .setMaxLength(20);

    const generoInput = new TextInputBuilder()
        .setCustomId('genero_personaje')
        .setLabel('Género (Opcional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Masculino, Femenino, etc.')
        .setRequired(false)
        .setMaxLength(15);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nombreInput),
        new ActionRowBuilder().addComponents(generoInput)
    );

    await interaction.showModal(modal);
}

async function procesarNombre(interaction) {
    const nombre = interaction.fields.getTextInputValue('nombre_personaje');
    const genero = interaction.fields.getTextInputValue('genero_personaje') || 'No especificado';

    let userData = datosPersonaje.get(interaction.user.id) || {};
    userData.nombre = nombre;
    userData.genero = genero;
    userData.estado = ESTADOS.CREANDO_PERSONAJE;
    datosPersonaje.set(interaction.user.id, userData);
    guardarEstado(); // GUARDAR ESTADO

    const emojiSabio = '🧙‍♂️';
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **Un gusto conocerte, ${nombre}**`,
        descripcion: `${emojiSparkles} **ElSabio:** "Ah, **${nombre}**... un nombre con fuerza."\n\n` +
            `*ElSabio asiente lentamente mientras anota en su gran libro.*\n\n` +
            `**"Ahora, necesito visualizarte mejor para mis registros."**\n` +
            `**"¿Cómo es tu apariencia? ¿Tienes alguna imagen que te represente?"**`,
        imagen: 'attachment://ElSabio_Habla.gif',
        banner: true,
        footer: `${emojiSabio} ElSabio • Creación de Personaje`,
        botones: [
            {
                id: 'tutorial_step_aspecto',
                label: 'Describir Aspecto',
                style: ButtonStyle.Primary,
                emoji: '🖼️'
            }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/GIF/ElSabio-Video-de-cuando-habla.gif',
        name: 'ElSabio_Habla.gif'
    }];

    try {
        await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    } catch (error) {
        console.error('Error en procesarNombre (con video):', error);
        try {
            mensaje.embed.setImage(null);
            await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components });
        } catch (fallbackError) {
            console.error('Error fatal en procesarNombre:', fallbackError);
        }
    }
}

async function mostrarModalAspecto(interaction) {
    // MODIFICADO: En lugar de mostrar el modal directamente, damos opción de subir imagen o usar URL
    const emojiCamara = '📷';
    const emojiLink = '🔗';
    const emojiSabio = '🧙‍♂️';
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **Tu Apariencia**`,
        descripcion: `${emojiSparkles} **ElSabio:** "¿Cómo quieres mostrar tu apariencia?"\n\n` +
            `Puedes subir una imagen directamente desde tu dispositivo o usar un enlace.\n` +
            `*"La imagen es el reflejo del alma..."*`,
        imagen: 'attachment://ElSabio_Habla.gif',
        banner: true,
        footer: `${emojiSabio} ElSabio • Aspecto`,
        botones: [
            {
                id: 'tutorial_aspecto_subir',
                label: 'Subir Imagen',
                style: ButtonStyle.Primary,
                emoji: emojiCamara
            },
            {
                id: 'tutorial_aspecto_url',
                label: 'Usar URL',
                style: ButtonStyle.Secondary,
                emoji: emojiLink
            }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/GIF/ElSabio-Video-de-cuando-habla.gif',
        name: 'ElSabio_Habla.gif'
    }];

    if (interaction.replied || interaction.deferred) {
        await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    } else {
        await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    }
}

async function mostrarModalAspectoUrl(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_tutorial_aspecto')
        .setTitle('🧙‍♂️ Tu Apariencia');

    const historiaInput = new TextInputBuilder()
        .setCustomId('historia_personaje')
        .setLabel('Breve Historia / Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe quién eres y cómo te ves...')
        .setRequired(false)
        .setMaxLength(200);

    const imagenInput = new TextInputBuilder()
        .setCustomId('imagen_personaje')
        .setLabel('URL de Imagen (Opcional)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('https://ejemplo.com/tu-imagen.png')
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(historiaInput),
        new ActionRowBuilder().addComponents(imagenInput)
    );

    await interaction.showModal(modal);
}

async function mostrarModalHistoriaSolo(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('modal_tutorial_aspecto') // Usamos el mismo ID para reutilizar procesarAspecto
        .setTitle('🧙‍♂️ Tu Historia');

    const historiaInput = new TextInputBuilder()
        .setCustomId('historia_personaje')
        .setLabel('Breve Historia / Descripción')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe quién eres...')
        .setRequired(false)
        .setMaxLength(200);

    // Campo oculto o dummy para la imagen (ya que procesarAspecto lo espera, aunque podemos manejar undefined)
    // Mejor modificamos procesarAspecto para que no falle si falta el campo.

    modal.addComponents(
        new ActionRowBuilder().addComponents(historiaInput)
    );

    await interaction.showModal(modal);
}

async function procesarAspecto(interaction) {
    let userData = datosPersonaje.get(interaction.user.id);
    if (!userData) {
        userData = { nombre: interaction.user.username, genero: 'No especificado' };
    }

    // Intentar leer campos solo si es una interacción de modal
    if (interaction.isModalSubmit && interaction.isModalSubmit()) {
        try {
            const historia = interaction.fields.getTextInputValue('historia_personaje');
            if (historia) userData.historia = historia;
        } catch (e) { /* Campo opcional o no existe */ }

        try {
            const imagenUrl = interaction.fields.getTextInputValue('imagen_personaje');
            if (imagenUrl) userData.imagenUrl = imagenUrl;
        } catch (e) { /* Campo opcional o no existe */ }
    }

    // Asegurar valores por defecto
    if (!userData.historia) userData.historia = 'Sin historia específica';

    userData.estado = ESTADOS.ELIGIENDO_CLASE;
    datosPersonaje.set(interaction.user.id, userData);
    guardarEstado(); // GUARDAR ESTADO

    const emojiSabio = '🧙‍♂️';
    const emojiEstrella = getEmoji('starGold', '⭐');

    // Usar la imagen del usuario si existe, sino la imagen por defecto de ElSabio
    const imagenFinal = userData.imagenUrl || 'attachment://Tutorial_Sabio.png';
    const esVideo = false; // Ya no usamos video en embed

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **Ficha de Personaje**`,
        descripcion: `${emojiEstrella} **ElSabio:** "¡Perfecto! Ya tengo todo lo necesario para tu registro inicial."\n\n` +
            `**📋 Datos Registrados:**\n` +
            `**· Nombre:** ${userData.nombre}\n` +
            `**· Género:** ${userData.genero}\n` +
            `**· Historia:** ${userData.historia}\n` +
            (userData.imagenUrl ? `**· Imagen:** [Ver Imagen](${userData.imagenUrl})\n` : '') +
            `\n**"¿Es todo correcto? Si es así, procederemos a despertar tu poder interior (Clase)."**`,
        imagen: imagenFinal,
        banner: true,
        footer: `${emojiSabio} ElSabio • Confirmación`,
        botones: [
            {
                id: 'tutorial_confirmar_ficha',
                label: 'Confirmar y Elegir Clase',
                style: ButtonStyle.Success,
                emoji: '✅'
            },
            {
                id: 'tutorial_step_nombre',
                label: 'Editar Datos',
                style: ButtonStyle.Secondary,
                emoji: '✏️'
            }
        ]
    });

    mensaje.files = [];
    if (!userData.imagenUrl) {
        mensaje.files.push({
            attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
            name: 'Tutorial_Sabio.png'
        });
    }

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else {
            await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        }
    } catch (error) {
        console.error('Error en procesarAspecto:', error);
        // Fallback sin imagen/video si falla
        try {
            mensaje.embed.setImage(null);
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components });
            } else {
                await interaction.reply({ embeds: [mensaje.embed], components: mensaje.components });
            }
        } catch (fatalError) {
            console.error('Error fatal en procesarAspecto:', fatalError);
        }
    }
}

async function mostrarSeleccionClase(interaction) {
    console.log('🚀 [DEBUG] mostrarSeleccionClase llamado');
    const userData = datosPersonaje.get(interaction.user.id);
    const nombre = userData ? userData.nombre : interaction.user.username;

    const emojiSabio = '🧙‍♂️';
    const emojiEstrella = getEmoji('starGold', '⭐');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **Elige tu Clase**`,
        descripcion: `${emojiSparkles} **ElSabio:** "¡Excelente, ${nombre}! Ahora debes elegir una clase para tu personaje."\n\n` +
            `${emojiEstrella} ***Cada clase tiene habilidades y ventajas únicas:***\n\n` +
            `🪽 **Celestial** - ${CLASES_OFICIALES.celestial.desc}\n` +
            `🔥 **Fénix** - ${CLASES_OFICIALES.fenix.desc}\n` +
            `⚔️ **Berserker** - ${CLASES_OFICIALES.berserker.desc}\n` +
            `☠️ **Inmortal** - ${CLASES_OFICIALES.inmortal.desc}\n` +
            `👹 **Demon** - ${CLASES_OFICIALES.demon.desc}\n` +
            `⚔️🌀 **Sombra** - ${CLASES_OFICIALES.sombra.desc}\n\n` +
            `*"Elige sabiamente, esta decisión definirá tu camino..."*`,
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        footer: `${emojiSabio} ElSabio • Selección de Clase`,
        botones: [] // Dejamos vacío para llenarlo manualmente con 2 filas
    });

    // Construir filas de botones manualmente para evitar el límite de 5 por fila
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('clase_celestial').setLabel('Celestial').setEmoji('🪽').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('clase_fenix').setLabel('Fénix').setEmoji('🔥').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('clase_berserker').setLabel('Berserker').setEmoji('⚔️').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('clase_inmortal').setLabel('Inmortal').setEmoji('☠️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('clase_demon').setLabel('Demon').setEmoji('👹').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('clase_sombra').setLabel('Sombra').setEmoji('🌀').setStyle(ButtonStyle.Secondary)
    );

    mensaje.components = [row1, row2];

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else {
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        }
    } catch (error) {
        console.error('Error en mostrarSeleccionClase (con imagen):', error);
        try {
            mensaje.embed.setImage(null);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components });
            } else {
                await interaction.update({ embeds: [mensaje.embed], components: mensaje.components });
            }
        } catch (fallbackError) {
            console.error('Error fatal en mostrarSeleccionClase:', fallbackError);
        }
    }
}

async function seleccionarClase(interaction) {
    const claseId = interaction.customId.replace('clase_', '');
    const claseData = CLASES_OFICIALES[claseId];
    const userData = datosPersonaje.get(interaction.user.id);

    if (!userData || !claseData) {
        await interaction.reply({ content: '❌ Error al procesar la selección de clase.', ephemeral: true });
        return;
    }

    userData.clase = claseData;
    userData.claseId = claseId;
    userData.estado = ESTADOS.ELIGIENDO_REINO;
    datosPersonaje.set(interaction.user.id, userData);
    guardarEstado(); // GUARDAR ESTADO

    const emojiSabio = '🧙‍♂️';
    const emojiTada = getEmoji('tada', '🎉');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiTada} **¡Clase Seleccionada!**`,
        descripcion: `${emojiSparkles} **ElSabio:** "¡Perfecto! Has elegido la clase **${claseData.name}** ${claseData.emoji}"\n\n` +
            `${emojiSparkles} ***Resumen del Personaje:***\n` +
            `**Nombre:** ${userData.nombre}\n` +
            `${claseData.emoji} **Clase:** ${claseData.name}\n` +
            `**Género:** ${userData.genero}\n` +
            `**Historia:** ${userData.historia}\n\n` +
            `${emojiSabio} "Excelente elección, **${userData.nombre}**. Ahora debes elegir tu región inicial donde comenzarás tu aventura."\n\n` +
            `*"Cada reino tiene sus propias características, enemigos y oportunidades únicas."*`,
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        color: COLORES.VERDE_EXITO,
        footer: `${emojiTada} PassQuirk RPG • Personaje Creado`,
        botones: [
            {
                id: 'elegir_reino_inicial',
                label: 'Elegir Reino Inicial',
                style: ButtonStyle.Primary,
                emoji: '🏰'
            }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    } catch (error) {
        console.error('Error en seleccionarClase (con video):', error);
        try {
            mensaje.embed.setImage(null);
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components });
        } catch (fallbackError) {
            console.error('Error fatal en seleccionarClase:', fallbackError);
        }
    }
}

async function mostrarSeleccionReino(interaction) {
    const emojiSabio = '🧙‍♂️';
    const emojiEstrella = getEmoji('starGold', '⭐');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSabio} **Elige tu Reino Inicial**`,
        descripcion: `${emojiSparkles} **ElSabio:** "Ahora debes elegir dónde comenzará tu aventura."\n\n` +
            `${emojiEstrella} ***Los Reinos Principales:***\n\n` +
            `🔴 **Reino de Akai** - ${REINOS_OFICIALES.akai.desc}\n` +
            `🟢 **Reino de Say** - ${REINOS_OFICIALES.say.desc}\n` +
            `🟡 **Reino de Masai** - ${REINOS_OFICIALES.masai.desc}\n\n` +
            `${emojiEstrella} ***Regiones Especiales:***\n\n` +
            `🌑 **Bosque Misterioso** - ${REINOS_OFICIALES.bosque.desc}\n` +
            `🕳️ **Cueva Oscura** - ${REINOS_OFICIALES.cueva.desc}\n\n` +
            `*"Cada región ofrece diferentes desafíos y oportunidades..."*`,
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        footer: `${emojiSabio} ElSabio • Selección de Reino`,
        componentes: [] // Se agregará el menú abajo
    });

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('seleccionar_reino')
        .setPlaceholder('Selecciona tu reino inicial...')
        .addOptions([
            {
                label: 'Reino de Akai',
                description: 'Reino de la fuerza, la guerra y la resistencia',
                value: 'akai',
                emoji: '🔴'
            },
            {
                label: 'Reino de Say',
                description: 'Reino de la magia, el conocimiento y lo ancestral',
                value: 'say',
                emoji: '🟢'
            },
            {
                label: 'Reino de Masai',
                description: 'Reino del comercio, la alquimia y la diplomacia',
                value: 'masai',
                emoji: '🟡'
            },
            {
                label: 'Bosque Misterioso',
                description: 'Lugar lleno de secretos y criaturas místicas',
                value: 'bosque',
                emoji: '🌑'
            },
            {
                label: 'Cueva Oscura',
                description: 'Profundidades inexploradas con tesoros ocultos',
                value: 'cueva',
                emoji: '🕳️'
            }
        ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);
    mensaje.components = [row];

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        // Reproducir música de Aventura
        if (musicManager) {
            const member = interaction.member;
            if (member && member.voice.channel) {
                try {
                    await musicManager.joinChannel(member.voice.channel);
                    // Música de Aventura (Combate/Exploración)
                    musicManager.playFile('e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav', true);
                } catch (musicError) {
                    console.error('Error reproduciendo música de aventura:', musicError);
                }
            }
        }
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        } else {
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
        }
    } catch (error) {
        console.error('Error en mostrarSeleccionReino (con video):', error);
        try {
            mensaje.embed.setImage(null);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components });
            } else {
                await interaction.update({ embeds: [mensaje.embed], components: mensaje.components });
            }
        } catch (fallbackError) {
            console.error('Error fatal en mostrarSeleccionReino:', fallbackError);
        }
    }
}

async function seleccionarReino(interaction) {
    const reinoId = interaction.values[0];
    const reinoData = REINOS_OFICIALES[reinoId];
    const userData = datosPersonaje.get(interaction.user.id);

    if (!userData || !reinoData) {
        await interaction.reply({ content: '❌ Error al procesar la selección de reino.', ephemeral: true });
        return;
    }

    userData.reino = reinoData;
    userData.reinoId = reinoId;
    userData.estado = ESTADOS.COMBATE_TUTORIAL;
    datosPersonaje.set(interaction.user.id, userData);
    guardarEstado(); // GUARDAR ESTADO

    const emojiSabio = '🧙‍♂️';
    const emojiEspada = getEmoji('swordGold', '⚔️');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiEspada} **¡Personaje Completado!**`,
        descripcion: `${emojiSparkles} **ElSabio:** "¡Perfecto, ${userData.nombre}! Tu personaje está listo."\n\n` +
            `${emojiSparkles} ***Resumen Final:***\n` +
            `**Nombre:** ${userData.nombre}\n` +
            `${userData.clase.emoji} **Clase:** ${userData.clase.name}\n` +
            `${reinoData.emoji} **Reino:** ${reinoData.name}\n` +
            `**Género:** ${userData.genero}\n\n` +
            `${emojiSabio} **ElSabio:** "Ahora es momento de aprender lo básico del combate. Te enfrentarás a un **Slime Verde** 🧪 en un combate de entrenamiento."\n\n` +
            `${emojiEspada} ***Tu destino empieza AHORA:***\n` +
            `**·** Combate contra monstruos\n` +
            `**·** Construye tu propio gremio\n` +
            `**·** Compra, vende, comercia y evoluciona\n` +
            `**·** Escala en el sistema de rangos\n` +
            `**·** Desbloquea Quirks y hazte leyenda\n\n` +
            `*"¿Estás listo para tu primer combate?"*`,
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        color: COLORES.VERDE_EXITO,
        footer: `${emojiEspada} PassQuirk RPG • Tutorial de Combate`,
        botones: [
            {
                id: 'iniciar_combate_tutorial',
                label: 'Iniciar Tutorial de Combate',
                style: ButtonStyle.Danger,
                emoji: '⚔️'
            }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    try {
        await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    } catch (error) {
        console.error('Error en seleccionarReino (con video):', error);
        try {
            mensaje.embed.setImage(null);
            await interaction.update({ embeds: [mensaje.embed], components: mensaje.components });
        } catch (fallbackError) {
            console.error('Error fatal en seleccionarReino:', fallbackError);
        }
    }
}

async function iniciarCombateTutorial(interaction) {
    const userData = datosPersonaje.get(interaction.user.id);

    const estadoCombate = {
        jugadorVida: 100,
        jugadorVidaMax: 100,
        enemigoVida: 80,
        enemigoVidaMax: 80,
        turno: 1,
        tienePociones: 1,
        quirkAleatorio: obtenerQuirkAleatorio()
    };

    estadosCombate.set(interaction.user.id, estadoCombate);

    const emojiSlime = '🧪';
    const emojiEspada = getEmoji('swordGold', '⚔️');
    const emojiEscudo = getEmoji('shield', '🛡️');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSlime} **¡Combate Tutorial!**`,
        descripcion: `${emojiSparkles} **¡Tu primer combate ha comenzado!**\n\n` +
            `**Enemigo:** Slime Verde ${emojiSlime}\n` +
            `**Quirk Recibido:** ${estadoCombate.quirkAleatorio.name} ✨\n\n` +
            `${crearBarraVida('Jugador', estadoCombate.jugadorVida, estadoCombate.jugadorVidaMax)}\n` +
            `${crearBarraVida('Slime Verde', estadoCombate.enemigoVida, estadoCombate.enemigoVidaMax)}\n\n` +
            `${emojiEspada} **Turno ${estadoCombate.turno} - Tu turno**\n` +
            `*Elige tu acción:*`,
        imagen: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/SlimeTutorial_Nvl1.png',
        color: COLORES.ROJO_PELIGRO,
        footer: `⚔️ Combate Tutorial • Estilo Pokémon`,
        botones: [
            { id: 'combate_atacar', label: 'Atacar', emoji: '⚔️', estilo: ButtonStyle.Danger },
            { id: 'combate_defender', label: 'Defender', emoji: '🛡️', estilo: ButtonStyle.Secondary }
        ]
    });

    // Reproducir música de Combate
    if (musicManager) {
        const member = interaction.member;
        if (member && member.voice.channel) {
            try {
                await musicManager.joinChannel(member.voice.channel);
                // Música de Combate
                musicManager.playFile('e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Lucha - Battle Cry.mp3', true);
            } catch (musicError) {
                console.error('Error reproduciendo música de combate:', musicError);
            }
        }
    }

    if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    } else {
        await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
    }
}

async function procesarTurnoCombate(interaction) {
    const accion = interaction.customId.replace('combate_', '');
    const estadoCombate = estadosCombate.get(interaction.user.id);

    if (!estadoCombate) {
        await interaction.reply({ content: '❌ Error: Estado de combate no encontrado.', ephemeral: true });
        return;
    }

    let mensajeTexto = '';
    let danoJugador = 0;
    let danoEnemigo = Math.floor(Math.random() * 15) + 10;

    if (accion === 'atacar') {
        danoJugador = Math.floor(Math.random() * 20) + 15;
        estadoCombate.enemigoVida = Math.max(0, estadoCombate.enemigoVida - danoJugador);
        mensajeTexto = `⚔️ **¡Atacaste al Slime Verde!** Causaste **${danoJugador}** de daño.\n`;
    } else if (accion === 'defender') {
        danoEnemigo = Math.floor(danoEnemigo / 2);
        mensajeTexto = `🛡️ **¡Te defendiste!** Reduces el daño enemigo a la mitad.\n`;
    }

    if (estadoCombate.enemigoVida > 0) {
        estadoCombate.jugadorVida = Math.max(0, estadoCombate.jugadorVida - danoEnemigo);
        mensajeTexto += `🧪 **El Slime Verde ataca!** Te causa **${danoEnemigo}** de daño.\n\n`;
    }

    estadoCombate.turno++;

    const emojiSlime = '🧪';
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    if (estadoCombate.enemigoVida <= 0) {
        await mostrarAtaqueFinal(interaction);
        return;
    }

    if (estadoCombate.jugadorVida <= 0) {
        await mostrarDerrota(interaction);
        return;
    }

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSlime} **Combate Tutorial - Turno ${estadoCombate.turno}**`,
        descripcion: `${mensajeTexto}` +
            `${crearBarraVida('Jugador', estadoCombate.jugadorVida, estadoCombate.jugadorVidaMax)}\n` +
            `${crearBarraVida('Slime Verde', estadoCombate.enemigoVida, estadoCombate.enemigoVidaMax)}\n\n` +
            `${emojiSparkles} **Tu turno - Elige tu acción:**`,
        color: COLORES.ROJO_PELIGRO,
        footer: `⚔️ Combate Tutorial • Turno ${estadoCombate.turno}`,
        botones: [
            { id: 'combate_atacar', label: 'Atacar', emoji: '⚔️', estilo: ButtonStyle.Danger },
            { id: 'combate_defender', label: 'Defender', emoji: '🛡️', estilo: ButtonStyle.Secondary },
            {
                id: 'combate_usar_pocion',
                label: `Usar Poción (${estadoCombate.tienePociones})`,
                emoji: '🧪',
                estilo: ButtonStyle.Success,
                disabled: estadoCombate.tienePociones <= 0
            }
        ],
        imagen: 'attachment://SlimeTutorial_Nvl1.png'
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/SlimeTutorial_Nvl1.png',
        name: 'SlimeTutorial_Nvl1.png'
    }];

    await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
}

async function usarPocion(interaction) {
    const estadoCombate = estadosCombate.get(interaction.user.id);

    if (!estadoCombate || estadoCombate.tienePociones <= 0) {
        await interaction.reply({ content: '❌ No tienes pociones disponibles.', ephemeral: true });
        return;
    }

    const curacion = 30;
    estadoCombate.jugadorVida = Math.min(estadoCombate.jugadorVidaMax, estadoCombate.jugadorVida + curacion);
    estadoCombate.tienePociones--;

    const emojiSlime = '🧪';
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiSlime} **¡Poción Usada!**`,
        descripcion: `🧪 **¡Usaste una Poción de Vida!** Recuperaste **${curacion}** puntos de vida.\n\n` +
            `${crearBarraVida('Jugador', estadoCombate.jugadorVida, estadoCombate.jugadorVidaMax)}\n` +
            `${crearBarraVida('Slime Verde', estadoCombate.enemigoVida, estadoCombate.enemigoVidaMax)}\n\n` +
            `${emojiSparkles} **Tu turno - Elige tu acción:**`,
        color: COLORES.VERDE_EXITO,
        footer: `⚔️ Combate Tutorial • Poción Usada`,
        botones: [
            { id: 'combate_atacar', label: 'Atacar', emoji: '⚔️', estilo: ButtonStyle.Danger },
            { id: 'combate_defender', label: 'Defender', emoji: '🛡️', estilo: ButtonStyle.Secondary }
        ]
    });

    await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
}

async function mostrarAtaqueFinal(interaction) {
    const emojiTada = getEmoji('tada', '🎉');
    const emojiSparkles = getEmoji('sparkleStars', '✨');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiTada} **¡El Slime está debilitado!**`,
        descripcion: `${emojiSparkles} **¡Excelente combate!** El Slime Verde está muy debilitado.\n\n` +
            `💥 **¡Es momento del ATAQUE FINAL!**\n` +
            `*Usa tu movimiento especial para terminar el combate.*\n\n` +
            `${crearBarraVida('Jugador', estadosCombate.get(interaction.user.id).jugadorVida, 100)}\n` +
            `${crearBarraVida('Slime Verde', 5, 80)} *(Muy debilitado)*`,
        color: COLORES.VERDE_EXITO,
        footer: `💥 Combate Tutorial • Ataque Final Disponible`,
        botones: [
            { id: 'combate_ataque_final', label: '💥 ATAQUE FINAL', emoji: '💥', estilo: ButtonStyle.Danger }
        ]
    });

    await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
}

async function ataqueFinalizador(interaction) {
    const userData = datosPersonaje.get(interaction.user.id);
    const estadoCombate = estadosCombate.get(interaction.user.id);

    const emojiTada = getEmoji('tada', '🎉');
    const emojiSparkles = getEmoji('sparkleStars', '✨');
    const emojiSabio = '🧙‍♂️';

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiTada} **¡VICTORIA!**`,
        descripcion: `${emojiSparkles} **¡ATAQUE FINAL EJECUTADO!**\n\n` +
            `💥 **¡Has derrotado al Slime Verde!** 🧪\n` +
            `${emojiSparkles} **¡Combate completado con éxito!**\n\n` +
            `${emojiSabio} **ElSabio:** "¡Excelente, ${userData.nombre}! Has demostrado gran habilidad en tu primer combate."\n\n` +
            `${emojiSparkles} ***Recompensas obtenidas:***\n` +
            `**·** Experiencia de combate\n` +
            `**·** Quirk: ${estadoCombate.quirkAleatorio.name}\n` +
            `**·** Conocimiento básico de combate\n\n` +
            `${emojiSabio} "Tu aventura comienza ahora desde **Space Central**, la ciudad base del universo PassQuirk."\n\n` +
            `*"¡Has completado el tutorial!"*`,
        imagen: 'attachment://Tutorial_Sabio.png',
        banner: true,
        color: COLORES.VERDE_EXITO,
        footer: `${emojiTada} PassQuirk RPG • Tutorial Completado`,
        botones: [
            { id: 'ir_space_central', label: 'Ir a Space Central', emoji: '🌟', estilo: ButtonStyle.Success }
        ]
    });

    mensaje.files = [{
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio.png',
        name: 'Tutorial_Sabio.png'
    }];

    await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });
}

async function completarTutorial(interaction) {
    const userData = datosPersonaje.get(interaction.user.id);
    const estadoCombate = estadosCombate.get(interaction.user.id);

    userData.estado = ESTADOS.TUTORIAL_COMPLETADO;
    userData.ubicacion = 'Space Central';
    datosPersonaje.set(interaction.user.id, userData);

    const emojiEstrella = getEmoji('starGold', '⭐');
    const emojiSparkles = getEmoji('sparkleStars', '✨');
    const emojiPortal = getEmoji('purplePortal', '🌀');

    const mensaje = generarMensajeEmbed({
        titulo: `${emojiEstrella} **¡Bienvenido a Space Central!**`,
        descripcion: `${emojiSparkles} **¡Has completado el tutorial!**\n\n` +
            `${emojiPortal} **Space Central** es la ciudad base del universo PassQuirk, donde comenzará tu verdadera aventura.\n\n` +
            `${emojiSparkles} ***Tu aventura comienza ahora desde aquí:***\n\n` +
            `**Personaje Creado:**\n` +
            `**·** Nombre: ${userData.nombre}\n` +
            `**·** Clase: ${userData.clase.name} ${userData.clase.emoji}\n` +
            `**·** Reino: ${userData.reino.name} ${userData.reino.emoji}\n` +
            `**·** Ubicación: Space Central 🌟\n\n` +
            `${emojiPortal} ***¿Qué quieres hacer ahora?***`,
        imagen: 'attachment://Icono_PassQuirk_V1.png',
        banner: true,
        color: COLORES.PURPURA_MISTICO,
        footer: `${emojiEstrella} PassQuirk RPG • Space Central`,
        botones: [
            { id: 'explorar_mundo', label: 'Explorar', emoji: '🗺️', estilo: ButtonStyle.Primary },
            { id: 'ver_personaje', label: 'Ver Personaje', emoji: '👤', estilo: ButtonStyle.Secondary },
            { id: 'ayuda_comandos', label: 'Ayuda', emoji: '❓', estilo: ButtonStyle.Success }
        ]
    });

    mensaje.files.push({
        attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Icono - PassQuirk V1.png',
        name: 'Icono_PassQuirk_V1.png'
    });

    await interaction.update({ embeds: [mensaje.embed], components: mensaje.components, files: mensaje.files });

    // Cambiar a música de Aventura (Space Central)
    if (musicManager) {
        musicManager.playFile('e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav', true);
    }

    try {
        const player = playerDB.getOrCreatePlayer(interaction.user.id, interaction.user.username);

        playerDB.updatePlayer(interaction.user.id, {
            class: userData.claseId,
            exploration: {
                ...player.exploration,
                currentZone: userData.reinoId,
                unlockedZones: [userData.reinoId, 'Space Central']
            },
            stats: {
                ...player.stats,
                hp: 100
            },
            quirks: [{
                ...estadoCombate.quirkAleatorio,
                acquiredAt: new Date().toISOString(),
                level: 1,
                experience: 0
            }]
        });

        if (estadoCombate.quirkAleatorio && estadoCombate.quirkAleatorio.id) {
            playerDB.awakenPassquirk(interaction.user.id, estadoCombate.quirkAleatorio.id);
        }

        console.log('Personaje guardado exitosamente:', userData.nombre);
    } catch (error) {
        console.error('Error al guardar personaje:', error);
    }

    datosPersonaje.delete(interaction.user.id);
    estadosCombate.delete(interaction.user.id);
}

async function mostrarDerrota(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('💔 **Derrota en el Tutorial**')
        .setDescription(
            '¡Oh no! Has sido derrotado en el tutorial.\n\n' +
            'No te preocupes, esto es solo práctica. ¡Inténtalo de nuevo!'
        )
        .setColor(COLORES.ROJO_PELIGRO);

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('reiniciar_combate')
            .setLabel('Intentar de Nuevo')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔄')
    );

    await interaction.update({ embeds: [embed], components: [row] });
}

// --- EXPORTACIÓN DEL COMANDO ---

module.exports = {
    data: new SlashCommandBuilder()
        .setName('passquirkrpg')
        .setDescription('Inicia tu aventura en PassQuirk RPG'),

    async execute(interaction) {
        console.log('🚀 [DEBUG] passquirkrpg command executed (MONOLITHIC VERSION)');
        try {
            const { client } = interaction;

            // Primero, verificar si el jugador ya existe en la base de datos (tutorial completado)
            const existingPlayer = await playerDB.getPlayer(interaction.user.id);

            if (existingPlayer) {
                // Jugador ya tiene personaje creado - mostrar gestión de personajes
                const emojiSabio = '🧙‍♂️';
                const emojiEstrella = '⭐';

                // --- REDISEÑO: SELECTOR DE PERSONAJES ---
                const { getEmoji } = require('../../../bot/utils/emojiManager');

                // Deferir respuesta para evitar timeout por subida de imagen
                await interaction.deferReply({ ephemeral: true });

                const p = playerDB.players[interaction.user.id];

                // Obtener emojis animados REALES de Discord
                const sparkleEmoji = getEmoji('sparkle_stars');
                let classEmoji = getEmoji('star_purple'); // Default

                if (p.class) {
                    const classNameLower = p.class.toLowerCase();
                    if (classNameLower.includes('celestial')) classEmoji = getEmoji('star_blue');
                    else if (classNameLower.includes('fenix')) classEmoji = getEmoji('fire_pixel');
                    else if (classNameLower.includes('sombra')) classEmoji = getEmoji('star_purple');
                    else if (classNameLower.includes('berserker')) classEmoji = getEmoji('green_fire');
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${sparkleEmoji} Gestión de Personajes`)
                    .setDescription(
                        `${getEmoji('crown_green')} ¡Bienvenido de nuevo, **${interaction.user.username}**!\n\n` +
                        `Para jugar usa los comandos: \`/personaje\` \`/explorar\` \`/inventario\``
                    )
                    .setColor(0xFFFF00) // Amarillo puro
                    .setImage('attachment://Tutorial_Sabio.png')
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 256 }));

                const fechaCreacion = p.createdAt ? Math.floor(new Date(p.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000);
                const zonaActual = p.currentZone || 'Space Central';

                // Diseño mejorado de la tarjeta
                const characterCard =
                    `${sparkleEmoji} **${p.username}**\n` +
                    `${classEmoji} **${p.class || 'Aventurero'}** • Nivel ${p.level || 1}\n` +
                    `📍 **${zonaActual}**\n` +
                    `📅 Creado <t:${fechaCreacion}:R>`;

                embed.addFields({
                    name: `${getEmoji('star_yellow')} Personaje Activo`,
                    value: characterCard,
                    inline: false
                });

                embed.setFooter({
                    text: 'PassQuirk RPG • Gestión de Cuenta',
                    iconURL: 'https://i.imgur.com/6sYJbZP.png'
                });
                embed.setTimestamp();

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('passquirk_select_character')
                            .setLabel('Ver Perfil Completo')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('👤'),
                        new ButtonBuilder()
                            .setCustomId('passquirk_create_character')
                            .setLabel('Crear Nuevo')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('✨'),
                        new ButtonBuilder()
                            .setCustomId('passquirk_delete_character')
                            .setLabel('Eliminar')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🗑️')
                    );

                const files = [{
                    attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Tutorial_Sabio-1920x1080.png',
                    name: 'Tutorial_Sabio.png'
                }];

                await interaction.editReply({ embeds: [embed], components: [row], files: files });
                return;
            }

            // Verificar si hay un estado guardado para este usuario (tutorial en progreso)
            if (datosPersonaje.has(interaction.user.id)) {
                const userData = datosPersonaje.get(interaction.user.id);

                // Si ya completó el tutorial pero aún no está en DB, limpiar estado
                if (userData.estado === ESTADOS.TUTORIAL_COMPLETADO) {
                    datosPersonaje.delete(interaction.user.id);
                    guardarEstado();
                    // Continuar a iniciar tutorial de nuevo
                }

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('tutorial_continuar_progreso')
                        .setLabel('Continuar Aventura')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('▶️'),
                    new ButtonBuilder()
                        .setCustomId('tutorial_reiniciar_progreso')
                        .setLabel('Reiniciar Todo')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔄')
                );

                // Mapa de nombres amigables para los estados
                const NOMBRES_ESTADOS = {
                    [ESTADOS.NO_INICIADO]: 'Inicio',
                    [ESTADOS.CREANDO_PERSONAJE]: 'Creación de Personaje',
                    [ESTADOS.ELIGIENDO_CLASE]: 'Elección de Clase',
                    [ESTADOS.ELIGIENDO_REINO]: 'Elección de Reino',
                    [ESTADOS.COMBATE_TUTORIAL]: 'Combate Tutorial',
                    [ESTADOS.TUTORIAL_COMPLETADO]: 'Completado'
                };

                const nombreEstado = NOMBRES_ESTADOS[userData.estado] || userData.estado;

                const embedResume = new EmbedBuilder()
                    .setTitle('⚠️ ¡Aventura Encontrada!')
                    .setDescription(`Parece que dejaste tu aventura a medias en la fase: **${nombreEstado}**.\n\n` +
                        `¿Quieres continuar donde lo dejaste o empezar de cero?`)
                    .setColor(COLORES.AMARILLO_TUTORIAL);

                await interaction.reply({
                    embeds: [embedResume],
                    components: [row],
                    ephemeral: true
                });
                return;
            }

            // Iniciar el tutorial usando la lógica interna
            await iniciarTutorialElSabio(interaction);
        } catch (error) {
            console.error('❌ [ERROR FATAL] Error al ejecutar el comando /passquirkrpg:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ content: '❌ Ocurrió un error crítico al iniciar el tutorial.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Ocurrió un error crítico al iniciar el tutorial.', ephemeral: true });
            }
        }
    },

    async handleInteraction(interaction) {
        const { customId } = interaction;

        // Handler para "Ver Perfil Completo"
        if (customId === 'passquirk_select_character') {
            const perfilCmd = interaction.client.commands.get('perfil');
            if (perfilCmd) {
                await perfilCmd.execute(interaction);
            } else {
                await interaction.reply({ content: '❌ Comando de perfil no encontrado.', ephemeral: true });
            }
        }
        // Handler para "Crear Nuevo" (mostrar mensaje de límite)
        else if (customId === 'passquirk_create_character') {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Límite de Personajes')
                .setDescription(
                    '**Ya tienes un personaje activo.**\n\n' +
                    'En esta versión de PassQuirk RPG solo puedes tener **1 personaje por cuenta**.\n\n' +
                    'Si deseas crear uno nuevo, primero debes **eliminar** tu personaje actual usando el botón rojo.'
                )
                .setColor(0xFFD700)
                .setFooter({ text: 'PassQuirk RPG', iconURL: 'https://i.imgur.com/6sYJbZP.png' });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        // Handler para "Eliminar" - Primera confirmación
        else if (customId === 'passquirk_delete_character') {
            const playerDB = interaction.client.gameManager.playerDB;
            const p = playerDB.players[interaction.user.id];

            const embed = new EmbedBuilder()
                .setTitle('⚠️ Confirmación de Eliminación')
                .setDescription(
                    `**¿Estás seguro de eliminar a \`${p.username}\`?**\n\n` +
                    `**Perderás permanentemente:**\n` +
                    `• Nivel ${p.level || 1} y toda tu experiencia\n` +
                    `• Todos tus PassCoins e ítems\n` +
                    `• Tus PassQuirks desbloqueados\n` +
                    `• Todo tu progreso en el juego\n\n` +
                    `**⚠️ Esta acción NO se puede deshacer.**`
                )
                .setColor(0xFF4757)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: 'PassQuirk RPG • Peligro', iconURL: 'https://i.imgur.com/6sYJbZP.png' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('passquirk_delete_step2')
                    .setLabel('Sí, quiero eliminarlo')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚠️'),
                new ButtonBuilder()
                    .setCustomId('passquirk_cancel_delete')
                    .setLabel('No, cancelar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅')
            );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
        // Segunda confirmación
        else if (customId === 'passquirk_delete_step2') {
            const embed = new EmbedBuilder()
                .setTitle('🚨 CONFIRMACIÓN FINAL')
                .setDescription(
                    `**ÚLTIMA ADVERTENCIA**\n\n` +
                    `¿Seguro que deseas **ELIMINAR PERMANENTEMENTE** tu personaje?\n\n` +
                    `**NO PODRÁS RECUPERARLO.**`
                )
                .setColor(0xDC2626)
                .setFooter({ text: 'Esta es tu última oportunidad para cancelar' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('passquirk_confirm_delete_FINAL')
                    .setLabel('SÍ, ELIMINAR AHORA')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('💀'),
                new ButtonBuilder()
                    .setCustomId('passquirk_cancel_delete')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❌')
            );

            await interaction.update({ embeds: [embed], components: [row] });
        }
        // Eliminación FINAL
        else if (customId === 'passquirk_confirm_delete_FINAL') {
            const playerDB = interaction.client.gameManager.playerDB;

            if (playerDB.players[interaction.user.id]) {
                const username = playerDB.players[interaction.user.id].username;
                delete playerDB.players[interaction.user.id];
                playerDB.saveDatabase();

                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Personaje Eliminado')
                    .setDescription(
                        `**${username}** ha sido eliminado permanentemente.\n\n` +
                        `Usa \`/passquirkrpg\` para crear un nuevo personaje.`
                    )
                    .setColor(0x95A5A6);

                await interaction.update({ embeds: [embed], components: [] });
            } else {
                await interaction.update({ content: '❌ No se encontró personaje para eliminar.', components: [], embeds: [] });
            }
        }
        // Cancelación
        else if (customId === 'passquirk_cancel_delete') {
            const embed = new EmbedBuilder()
                .setTitle('✅ Operación Cancelada')
                .setDescription('Tu personaje está a salvo. No se realizó ningún cambio.')
                .setColor(0x10B981);

            await interaction.update({ embeds: [embed], components: [] });
        }

        try {
            if (interaction.isButton()) {
                const { customId } = interaction;
                console.log(`📨 Interacción recibida: ${customId}`);

                // Manejo de botones de reinicio/continuar
                if (customId === 'tutorial_continuar_progreso') {
                    console.log('🔘 [DEBUG] Botón tutorial_continuar_progreso clickeado');
                    const userData = datosPersonaje.get(interaction.user.id);
                    console.log('👤 [DEBUG] UserData:', JSON.stringify(userData, null, 2));

                    if (userData) {
                        try {
                            await interaction.deferUpdate();
                            console.log('⏳ [DEBUG] Interacción diferida correctamente');
                        } catch (deferError) {
                            console.error('❌ [DEBUG] Error al diferir actualización:', deferError);
                            return;
                        }

                        const embedReanudando = new EmbedBuilder()
                            .setTitle('✅ Reanudando Aventura')
                            .setDescription('Recuperando tus memorias y posición en el mundo...')
                            .setColor(COLORES.VERDE_EXITO);

                        try {
                            console.log('📝 [DEBUG] Intentando editar respuesta (Reanudando)...');
                            // Intentamos mostrar el mensaje de carga, pero si falla (400), continuamos igual
                            await interaction.editReply({
                                content: '',
                                embeds: [embedReanudando],
                                components: [],
                                files: [],
                                attachments: [] // Asegurar limpieza de adjuntos
                            });
                            console.log('✅ [DEBUG] Respuesta editada correctamente');
                        } catch (errResume) {
                            console.warn('⚠️ [DEBUG] Advertencia: No se pudo enviar mensaje de "Reanudando", continuando flujo...', errResume);
                        }

                        // Intentar reproducir música si el usuario está en voz
                        const musicManager = require('../../../bot/utils/musicManager');
                        const path = require('path');
                        if (musicManager) {
                            try {
                                const currentMember = await interaction.guild.members.fetch(interaction.user.id);
                                if (currentMember.voice.channel) {
                                    musicManager.joinChannel(currentMember.voice.channel);
                                    const musicPath = path.join(process.cwd(), 'bot/assets/music_intro.wav');
                                    musicManager.playFile(musicPath, true);
                                    console.log('🎵 [DEBUG] Música reanudada en background');
                                }
                            } catch (musicError) {
                                console.error('❌ [DEBUG] Error al reanudar música:', musicError);
                            }
                        }

                        console.log(`🔀 [DEBUG] Cambiando a estado: ${userData.estado}`);
                        switch (userData.estado) {
                            case ESTADOS.CREANDO_PERSONAJE:
                                if (userData.nombre) {
                                    if (userData.imagenUrl) {
                                        await procesarAspecto(interaction);
                                    } else {
                                        await mostrarModalAspecto(interaction);
                                    }
                                } else {
                                    await mostrarBienvenida(interaction);
                                }
                                break;
                            case ESTADOS.ELIGIENDO_CLASE:
                                await mostrarSeleccionClase(interaction);
                                break;
                            case ESTADOS.ELIGIENDO_REINO:
                                await mostrarSeleccionReino(interaction);
                                break;
                            case ESTADOS.COMBATE_TUTORIAL:
                                await iniciarCombateTutorial(interaction);
                                break;
                            default:
                                console.log('⚠️ [DEBUG] Estado desconocido o default, yendo a inicio');
                                await iniciarTutorialElSabio(interaction);
                        }
                    } else {
                        console.log('❌ [DEBUG] No se encontró userData, yendo a inicio');
                        await iniciarTutorialElSabio(interaction);
                    }
                    return;
                }

                if (customId === 'tutorial_reiniciar_progreso') {
                    datosPersonaje.delete(interaction.user.id);
                    guardarEstado();

                    const embedReinicio = new EmbedBuilder()
                        .setTitle('🔄 Aventura Reiniciada')
                        .setDescription('Borrando memorias y comenzando de nuevo...')
                        .setColor(COLORES.ROJO_PELIGRO);

                    await interaction.update({ content: '', embeds: [embedReinicio], components: [], files: [] });
                    await iniciarTutorialElSabio(interaction);
                    return;
                }

                // Manejo de botones de imagen
                if (customId === 'tutorial_aspecto_url') {
                    await mostrarModalAspectoUrl(interaction);
                    return;
                }

                if (customId === 'tutorial_aspecto_subir') {
                    await interaction.reply({
                        content: '📸 **Por favor, envía tu imagen ahora en este canal.**\n' +
                            'Tienes 20 minutos. El bot detectará automáticamente la imagen.',
                        ephemeral: true
                    });

                    const filter = m => m.author.id === interaction.user.id && m.attachments.size > 0;
                    const collector = interaction.channel.createMessageCollector({ filter, time: 1200000, max: 1 });

                    collector.on('collect', async m => {
                        const attachment = m.attachments.first();
                        const url = attachment.url;

                        let userData = datosPersonaje.get(interaction.user.id);
                        if (!userData) userData = { nombre: interaction.user.username, genero: 'No especificado' };
                        userData.imagenUrl = url;
                        datosPersonaje.set(interaction.user.id, userData);
                        guardarEstado();

                        await interaction.followUp({
                            content: '✅ **¡Imagen recibida y guardada!**\nAhora, cuéntame un poco de tu historia.',
                            components: [
                                new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('tutorial_abrir_historia')
                                        .setLabel('Escribir Historia')
                                        .setStyle(ButtonStyle.Primary)
                                        .setEmoji('📝')
                                )
                            ],
                            ephemeral: true
                        });
                    });
                    return;
                }

                if (customId === 'tutorial_abrir_historia') {
                    await mostrarModalHistoriaSolo(interaction);
                    return;
                }

                switch (customId) {
                    case 'iniciar_aventura_tutorial':
                        await iniciarTutorialElSabio(interaction);
                        break;
                    case 'tutorial_musica_si':
                    case 'tutorial_musica_no':
                        await procesarMusica(interaction);
                        break;
                    case 'tutorial_music_continue':
                        await mostrarBienvenida(interaction);
                        break;
                    case 'tutorial_music_check_joined':
                        const musicManager = require('../../../bot/utils/musicManager');
                        const path = require('path');

                        if (musicManager) {
                            const currentMember = await interaction.guild.members.fetch(interaction.member.id);
                            if (currentMember.voice.channel) {
                                // Asegurar conexión al canal del usuario
                                musicManager.joinChannel(currentMember.voice.channel); // No await para no bloquear

                                const musicPath = path.join(process.cwd(), 'bot/assets/music_intro.wav');
                                // Activar loop (true)
                                musicManager.playFile(musicPath, true);
                                console.log('🎵 Música iniciada en background');
                            }
                        }
                        await mostrarModalNombre(interaction);
                        break;
                    case 'tutorial_step_nombre':
                    case 'tutorial_open_name_modal':
                        await mostrarModalNombre(interaction);
                        break;
                    case 'tutorial_step_aspecto':
                        await mostrarModalAspecto(interaction);
                        break;
                    case 'tutorial_confirmar_ficha':
                        try {
                            await interaction.deferUpdate(); // Evitar timeout
                            await mostrarSeleccionClase(interaction);
                        } catch (error) {
                            console.error('Error en tutorial_confirmar_ficha:', error);
                            if (interaction.deferred || interaction.replied) {
                                await interaction.followUp({ content: '❌ Error al continuar. Intenta de nuevo.', ephemeral: true });
                            } else {
                                await interaction.reply({ content: '❌ Error al continuar. Intenta de nuevo.', ephemeral: true });
                            }
                        }
                        break;
                    case 'elegir_reino_inicial':
                        await mostrarSeleccionReino(interaction);
                        break;
                    case 'iniciar_combate_tutorial':
                        await iniciarCombateTutorial(interaction);
                        break;
                    case 'combate_atacar':
                        await procesarTurnoCombate(interaction, 'atacar');
                        break;
                    case 'combate_defender':
                        await procesarTurnoCombate(interaction, 'defender');
                        break;
                    case 'combate_usar_pocion':
                        await usarPocion(interaction);
                        break;
                    case 'combate_ataque_final':
                        await ataqueFinalizador(interaction);
                        break;
                    case 'ir_space_central':
                        await completarTutorial(interaction);
                        break;
                    case 'reiniciar_combate':
                        await iniciarCombateTutorial(interaction);
                        break;

                    // Selectores de clase y reino
                    case 'clase_celestial':
                    case 'clase_fenix':
                    case 'clase_berserker':
                    case 'clase_inmortal':
                    case 'clase_demon':
                    case 'clase_sombra':
                        await seleccionarClase(interaction);
                        break;

                    case 'reino_akai':
                    case 'reino_say':
                    case 'reino_masai':
                        await seleccionarReino(interaction);
                        break;

                    // Botones Post-Tutorial
                    case 'explorar_mundo':
                        await explorarCommand.execute(interaction);
                        break;
                    case 'ver_personaje':
                        await perfilCommand.execute(interaction);
                        break;
                    case 'ayuda_comandos':
                        await ayudaCommand.execute(interaction);
                        break;
                }
            } else if (interaction.isModalSubmit()) {
                if (interaction.customId === 'modal_tutorial_nombre') {
                    await procesarNombre(interaction);
                    guardarEstado(); // Guardar tras nombre
                } else if (interaction.customId === 'modal_tutorial_aspecto') {
                    await procesarAspecto(interaction);
                } else if (interaction.customId === 'modal_datos_personaje') { // Legacy fallback
                    await procesarDatosPersonaje(interaction);
                }
            } else if (interaction.isStringSelectMenu()) {
                if (interaction.customId === 'seleccionar_reino') {
                    await seleccionarReino(interaction);
                }
            }
        } catch (error) {
            console.error('Error en tutorial (monolithic):', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ha ocurrido un error en el tutorial. Por favor, inténtalo de nuevo.',
                    ephemeral: true
                });
            }
        }
    }
};