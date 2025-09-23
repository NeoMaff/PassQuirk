const { 
    SlashCommandBuilder, 
    PermissionFlagsBits, 
    ChannelType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { timeZones, getTimeZoneConfig, formatTime, formatDate, getWeather } = require('../../utils/timeConfig');
const cron = require('node-cron');
const { QuickDB } = require('quick.db');
const logger = require('../../utils/logger');
const db = new QuickDB();

// Función para actualizar los canales de tiempo
async function updateTimeChannels(client, guildId) {
    try {
        const config = await client.db.get(`timeConfig_${guildId}`);
        if (!config) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const timeChannel = guild.channels.cache.get(config.timeChannelId);
        const dateChannel = guild.channels.cache.get(config.dateChannelId);
        const weatherChannel = guild.channels.cache.get(config.weatherChannelId);

        if (!timeChannel || !dateChannel || !weatherChannel) return;

        const now = new Date();
        const timezone = config.timezone || 'Europe/Madrid';
        
        // Actualizar nombre del canal de hora
        const timeText = formatTime(now, timezone);
        await timeChannel.setName(`🕒│PassQuirkRPG - HORA: ${timeText}`).catch(console.error);

        // Actualizar nombre del canal de fecha
        const dateText = formatDate(now, timezone);
        await dateChannel.setName(`📅│PassQuirkRPG - FECHA: ${dateText}`).catch(console.error);
        
        // Actualizar nombre del canal de clima
        const weatherText = getWeather();
        await weatherChannel.setName(`🌤️│PassQuirkRPG - CLIMA: ${weatherText}`).catch(console.error);

    } catch (error) {
        logger.error('Error al actualizar canales de tiempo:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configurar-tiempo')
        .setDescription('Configura los canales de tiempo y clima para el servidor')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('categoria')
                .setDescription('Categoría donde se crearán los canales (deja en blanco para crear una nueva)')),

    async execute(interaction) {
        // Verificar permisos
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ Necesitas permisos de administrador para usar este comando.',
                ephemeral: true
            });
        }

        // Crear menú de opciones
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('config_tiempo_opciones')
                    .setPlaceholder('Selecciona una opción')
                    .addOptions([
                        {
                            label: '🆕 Configurar canales',
                            description: 'Crea o actualiza los canales de tiempo',
                            value: 'configurar'
                        },
                        {
                            label: '🔄 Actualizar ahora',
                            description: 'Actualiza manualmente los canales',
                            value: 'actualizar'
                        },
                        {
                            label: '❌ Eliminar canales',
                            description: 'Elimina los canales de tiempo',
                            value: 'eliminar'
                        },
                        {
                            label: '🌐 Cambiar zona horaria',
                            description: 'Establece una zona horaria diferente',
                            value: 'zona'
                        }
                    ])
            );

        const embed = new EmbedBuilder()
            .setColor('#6B4EFF')
            .setTitle('⏰ Configuración de Tiempo y Clima')
            .setDescription('Gestiona los canales de tiempo, fecha y clima del servidor.')
            .addFields(
                { 
                    name: 'Estado actual', 
                    value: 'Usa el menú desplegable para configurar o actualizar los canales de tiempo.'
                }
            )
            .setFooter({ 
                text: 'PassQuirk RPG - Configuración del Servidor',
                iconURL: interaction.client.user.displayAvatarURL()
            })
            .setTimestamp();

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    },

    // Manejador para las selecciones del menú
    async handleSelectMenu(interaction) {
        const opcion = interaction.values ? interaction.values[0] : interaction.customId.replace('config_tiempo_', '');
        
        // Crear botón para volver al menú principal
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('volver_menu_config')
                    .setLabel('← Volver al menú de configuración')
                    .setStyle(ButtonStyle.Secondary)
            );

        switch (opcion) {
            case 'configurar':
                await this.configurarCanales(interaction, backButton);
                break;
            case 'actualizar':
                await this.actualizarCanales(interaction, backButton);
                break;
            case 'eliminar':
                await this.eliminarCanales(interaction, backButton);
                break;
            case 'zona':
                await this.cambiarZona(interaction, backButton);
                break;
            default:
                await interaction.update({ 
                    content: '❌ Opción no reconocida',
                    components: [backButton] 
                });
        }
    },

    // Función para configurar los canales
    async configurarCanales(interaction, backButton) {
        try {
            await interaction.deferUpdate();
            
            // Crear categoría si no existe
            const categoria = await interaction.guild.channels.create({
                name: '⏰ TIEMPO Y CLIMA',
                type: ChannelType.GuildCategory,
                position: 0,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: ['ViewChannel'],
                        deny: ['SendMessages', 'AddReactions']
                    }
                ]
            });

            // Crear canales
            const [timeChannel, dateChannel, weatherChannel] = await Promise.all([
                this.crearCanalTiempo(interaction, categoria, 'HORA', '--:--'),
                this.crearCanalTiempo(interaction, categoria, 'FECHA', '--/--/----'),
                this.crearCanalTiempo(interaction, categoria, 'CLIMA', 'Desconocido', '🌤️')
            ]);

            // Guardar configuración
            await db.set(`timeConfig_${interaction.guild.id}`, {
                timeChannelId: timeChannel.id,
                dateChannelId: dateChannel.id,
                weatherChannelId: weatherChannel.id,
                categoryId: categoria.id,
                timezone: 'Europe/Madrid',
                lastUpdated: Date.now()
            });

            // Actualizar canales
            await this.actualizarCanales(interaction, backButton, '✅ Canales configurados correctamente');

        } catch (error) {
            logger.error('Error al configurar canales:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al configurar los canales.',
                components: [backButton]
            });
        }
    },

    // Función auxiliar para crear canales de tiempo
    async crearCanalTiempo(interaction, categoria, tipo, valorPorDefecto, emoji = '') {
        const nombre = emoji ? `${emoji}│PassQuirkRPG - ${tipo}: ${valorPorDefecto}` : `⏰│PassQuirkRPG - ${tipo}: ${valorPorDefecto}`;
        
        return await interaction.guild.channels.create({
            name: nombre,
            type: ChannelType.GuildVoice,
            parent: categoria,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    allow: ['ViewChannel', 'Connect'],
                    deny: ['Speak', 'Stream']
                }
            ]
        });
    },

    // Función para actualizar los canales
    async actualizarCanales(interaction, backButton, mensajeExito = '✅ Canales actualizados correctamente') {
        try {
            await interaction.deferUpdate();
            
            const config = await db.get(`timeConfig_${interaction.guild.id}`);
            if (!config) {
                return interaction.editReply({
                    content: '❌ No hay canales configurados. Usa la opción "Configurar canales".',
                    components: [backButton]
                });
            }

            await updateTimeChannels(interaction.client, interaction.guild.id);
            
            // Programar actualización si no está ya programada
            if (!cron.getTasks().some(task => task.options && task.options.guildId === interaction.guild.id)) {
                cron.schedule('* * * * *', async () => {
                    await updateTimeChannels(interaction.client, interaction.guild.id);
                }, {
                    guildId: interaction.guild.id
                });
            }

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle(mensajeExito)
                .setDescription('Los canales de tiempo han sido actualizados correctamente.')
                .addFields(
                    { name: '🕒 Canal de Hora', value: `<#${config.timeChannelId}>`, inline: true },
                    { name: '📅 Canal de Fecha', value: `<#${config.dateChannelId}>`, inline: true },
                    { name: '🌤️ Canal de Clima', value: `<#${config.weatherChannelId}>`, inline: true },
                    { name: '🌐 Zona Horaria', value: config.timezone || 'Europe/Madrid' }
                )
                .setFooter({ 
                    text: 'Los canales se actualizarán automáticamente cada minuto',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.editReply({ 
                embeds: [embed],
                components: [backButton] 
            });

        } catch (error) {
            logger.error('Error al actualizar canales:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al actualizar los canales.',
                components: [backButton]
            });
        }
    },

    // Función para eliminar los canales
    async eliminarCanales(interaction, backButton) {
        try {
            await interaction.deferUpdate();
            
            const config = await db.get(`timeConfig_${interaction.guild.id}`);
            if (!config) {
                return interaction.editReply({
                    content: '❌ No hay canales configurados para eliminar.',
                    components: [backButton]
                });
            }

            // Eliminar canales
            const guild = interaction.guild;
            const canalesAEliminar = [];
            
            if (config.timeChannelId) canalesAEliminar.push(config.timeChannelId);
            if (config.dateChannelId) canalesAEliminar.push(config.dateChannelId);
            if (config.weatherChannelId) canalesAEliminar.push(config.weatherChannelId);
            
            // Eliminar canales en paralelo
            await Promise.all(canalesAEliminar.map(id => 
                guild.channels.fetch(id)
                    .then(channel => channel.delete())
                    .catch(() => {})
            ));

            // Eliminar categoría si existe
            if (config.categoryId) {
                try {
                    const categoria = await guild.channels.fetch(config.categoryId);
                    if (categoria) await categoria.delete();
                } catch {}
            }

            // Eliminar configuración
            await db.delete(`timeConfig_${interaction.guild.id}`);

            // Detener la tarea programada si existe
            const tasks = cron.getTasks();
            const task = tasks.find(t => t.options && t.options.guildId === interaction.guild.id);
            if (task) task.stop();

            const embed = new EmbedBuilder()
                .setColor('#4CAF50')
                .setTitle('✅ Canales eliminados correctamente')
                .setDescription('Los canales de tiempo han sido eliminados del servidor.')
                .setFooter({ 
                    text: 'Puedes volver a configurarlos en cualquier momento',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.editReply({ 
                embeds: [embed],
                components: [backButton] 
            });

        } catch (error) {
            logger.error('Error al eliminar canales:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al eliminar los canales.',
                components: [backButton]
            });
        }
    },

    // Función para cambiar la zona horaria
    async cambiarZona(interaction, backButton) {
        try {
            await interaction.deferUpdate();
            
            // Crear menú de zonas horarias
            const zonas = [
                { label: '🇪🇸 Madrid (España)', value: 'Europe/Madrid' },
                { label: '🇲🇽 Ciudad de México', value: 'America/Mexico_City' },
                { label: '🇦🇷 Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
                { label: '🇨🇴 Bogotá', value: 'America/Bogota' },
                { label: '🇨🇱 Santiago', value: 'America/Santiago' },
                { label: '🇺🇾 Montevideo', value: 'America/Montevideo' },
                { label: '🇺🇸 Nueva York', value: 'America/New_York' },
                { label: '🇪🇸 Islas Canarias', value: 'Atlantic/Canary' },
                { label: '🌍 UTC', value: 'UTC' }
            ];

            const menuZonas = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('seleccionar_zona')
                        .setPlaceholder('Selecciona una zona horaria')
                        .addOptions(zonas)
                );

            const embed = new EmbedBuilder()
                .setColor('#2196F3')
                .setTitle('🌍 Cambiar Zona Horaria')
                .setDescription('Selecciona tu zona horaria para actualizar los canales de tiempo.')
                .setFooter({ 
                    text: 'La hora se actualizará automáticamente',
                    iconURL: interaction.client.user.displayAvatarURL()
                });

            await interaction.editReply({ 
                embeds: [embed],
                components: [menuZonas, backButton] 
            });

        } catch (error) {
            logger.error('Error al cambiar zona horaria:', error);
            await interaction.editReply({
                content: '❌ Ocurrió un error al cambiar la zona horaria.',
                components: [backButton]
            });
        }
    }
};

// Exportar la función de actualización para usarla en otros módulos
module.exports.updateTimeChannels = updateTimeChannels;

async function updateTimeChannels(client, guildId) {
    try {
        const config = await client.db.get(`timeConfig_${guildId}`);
        if (!config) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const timeChannel = guild.channels.cache.get(config.timeChannelId);
        const dateChannel = guild.channels.cache.get(config.dateChannelId);

        if (!timeChannel || !dateChannel) return;

        const now = new Date();
        const timezone = config.timezone || 'Europe/Madrid';
        
        // Actualizar nombre del canal de hora
        const timeText = formatTime(now, timezone);
        if (timeChannel.name !== `🕒│hora-${timeText}`) {
            await timeChannel.setName(`🕒│hora-${timeText}`).catch(console.error);
        }

        // Actualizar nombre del canal de fecha (solo si cambia el día)
        const dateText = formatDate(now, timezone);
        const formattedDate = dateText.charAt(0).toUpperCase() + dateText.slice(1); // Capitalizar primera letra
        if (dateChannel.name !== `📅│${formattedDate}`) {
            await dateChannel.setName(`📅│${formattedDate}`).catch(console.error);
        }

    } catch (error) {
        console.error('Error al actualizar canales de tiempo:', error);
    }
}
