const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PassQuirkEmbed } = require('../../utils/embedStyles');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('⚙️ Panel de configuración completo del servidor PassQuirk RPG')
        .setDefaultMemberPermissions('0') // Solo administradores
        .addSubcommand(subcommand =>
            subcommand
                .setName('tiempo')
                .setDescription('⏰ Configura canales de tiempo, fecha y clima')
                .addChannelOption(option =>
                    option.setName('categoria')
                        .setDescription('Categoría donde crear los canales (opcional)')
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('canales')
                .setDescription('📢 Configura canales del servidor')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('roles')
                .setDescription('🎭 Configura roles y permisos')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('modulos')
                .setDescription('🎮 Habilita/deshabilita módulos del juego')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('panel')
                .setDescription('🎛️ Abre el panel de configuración interactivo')
        ),

    async execute(interaction) {
        // Verificar permisos
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({
                content: '❌ Necesitas permisos de administrador para usar este comando.',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();
        
        // Manejar subcomandos específicos
        switch (subcommand) {
            case 'tiempo':
                return await this.handleTiempoConfig(interaction);
            case 'canales':
                return await this.handleCanalesConfig(interaction);
            case 'roles':
                return await this.handleRolesConfig(interaction);
            case 'modulos':
                return await this.handleModulosConfig(interaction);
            case 'panel':
            default:
                return await this.showMainPanel(interaction);
        }
    },

    async showMainPanel(interaction) {
        // Crear menú de selección de categorías de configuración
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('categoria_configuracion')
                    .setPlaceholder('Selecciona una categoría de configuración')
                    .addOptions([
                        {
                            label: '⏰ Tiempo y Fecha',
                            description: 'Configura los canales de tiempo y fecha',
                            value: 'tiempo',
                            emoji: '⏰'
                        },
                        {
                            label: '🔧 Ajustes Generales',
                            description: 'Configura los ajustes generales del bot',
                            value: 'ajustes',
                            emoji: '🔧'
                        },
                        {
                            label: '🎭 Roles y Permisos',
                            description: 'Configura los roles y permisos del servidor',
                            value: 'roles',
                            emoji: '🎭'
                        },
                        {
                            label: '📢 Canales',
                            description: 'Configura los canales del servidor',
                            value: 'canales',
                            emoji: '📢'
                        },
                        {
                            label: '🎮 Módulos del Juego',
                            description: 'Habilita/deshabilita módulos del juego',
                            value: 'modulos',
                            emoji: '🎮'
                        }
                    ])
            );

        const embed = new PassQuirkEmbed()
            .setTitle('⚙️ Panel de Configuración - PassQuirk RPG')
            .setDescription('**¡Bienvenido al centro de control del reino!** ⚔️\n\nDesde aquí puedes configurar todos los aspectos de tu servidor PassQuirk RPG. Selecciona una categoría para comenzar a personalizar tu experiencia épica.')
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '⚡ Estado del Sistema', value: '✅ Configuración cargada correctamente', inline: true },
                { name: '🔢 Versión', value: '**v1.0.0** - Alfa', inline: true },
                { name: '🏰 Reino', value: interaction.guild.name, inline: true },
                { name: '\u200B', value: '\u200B', inline: false },
                { name: '🎯 Categorías Disponibles', value: '⏰ Tiempo • 🔧 Ajustes • 🎭 Roles • 📢 Canales • 🎮 Módulos', inline: false }
            )
            .setImage('https://i.imgur.com/config_banner.png')
            .setFooter({ 
                text: `⚡ Panel de Configuración PassQuirk RPG | Solicitado por ${interaction.user.username}`, 
                iconURL: interaction.user.displayAvatarURL() 
            });

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    },

    // Manejadores específicos para cada subcomando
    async handleTiempoConfig(interaction) {
        const categoria = interaction.options.getChannel('categoria');
        
        const embed = new PassQuirkEmbed()
            .setTitle('⏰ Configuración de Tiempo y Clima')
            .setDescription('Configura los canales automáticos de tiempo, fecha y clima del servidor.')
            .addFields(
                { name: '🕒 Canal de Hora', value: 'Muestra la hora actual', inline: true },
                { name: '📅 Canal de Fecha', value: 'Muestra la fecha actual', inline: true },
                { name: '🌤️ Canal de Clima', value: 'Muestra el clima del reino', inline: true }
            );
        
        // Aquí iría la lógica específica de configuración de tiempo
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleCanalesConfig(interaction) {
        const embed = new PassQuirkEmbed()
            .setTitle('📢 Configuración de Canales')
            .setDescription('Gestiona los canales especiales del servidor PassQuirk RPG.');
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleRolesConfig(interaction) {
        const embed = new PassQuirkEmbed()
            .setTitle('🎭 Configuración de Roles')
            .setDescription('Configura los roles y permisos del servidor.');
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    async handleModulosConfig(interaction) {
        const embed = new PassQuirkEmbed()
            .setTitle('🎮 Configuración de Módulos')
            .setDescription('Habilita o deshabilita módulos específicos del juego.');
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },

    // Manejador para las selecciones del menú de configuración
    async handleSelectMenu(interaction) {
        const categoria = interaction.values ? interaction.values[0] : interaction.customId.replace('config_', '');
        
        // Crear botón para volver al menú principal
        const backButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('volver_menu_config')
                    .setLabel('← Volver al menú de configuración')
                    .setStyle(ButtonStyle.Secondary)
            );

        let embed;

        switch (categoria) {
            case 'tiempo':
                embed = await this.getTiempoConfig(interaction);
                break;
            case 'ajustes':
                embed = this.getAjustesConfig(interaction);
                break;
            case 'roles':
                embed = this.getRolesConfig(interaction);
                break;
            case 'canales':
                embed = this.getCanalesConfig(interaction);
                break;
            case 'modulos':
                embed = this.getModulosConfig(interaction);
                break;
            default:
                embed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setDescription('❌ Categoría no reconocida');
        }

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ 
                embeds: [embed], 
                components: [backButton] 
            });
        } else {
            await interaction.reply({ 
                embeds: [embed], 
                components: [backButton],
                ephemeral: true 
            });
        }
    },

    // Configuración de Tiempo
    async getTiempoConfig(interaction) {
        const config = await db.get(`timeConfig_${interaction.guild.id}`) || {};
        
        const embed = new EmbedBuilder()
            .setColor('#4CAF50')
            .setTitle('⏰ Configuración de Tiempo y Fecha')
            .setDescription('Configura los canales de tiempo, fecha y clima del servidor.')
            .addFields(
                { 
                    name: 'Canales Configurados', 
                    value: config.timeChannelId ? 
                        `✅ Hora: <#${config.timeChannelId}>\n✅ Fecha: <#${config.dateChannelId}>\n✅ Clima: <#${config.weatherChannelId}>` : 
                        '❌ No se han configurado canales de tiempo.'
                },
                {
                    name: 'Zona Horaria',
                    value: config.timezone || 'No configurada (Predeterminada: Europe/Madrid)'
                },
                {
                    name: 'Comandos Disponibles',
                    value: '`/configurar-tiempo` - Configura los canales de tiempo\n' +
                           '`/cambiar-zona` - Cambia la zona horaria\n' +
                           '`/actualizar-clima` - Actualiza manualmente el clima'
                }
            )
            .setFooter({ 
                text: 'Usa los botones para gestionar la configuración',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        return embed;
    },

    // Configuración General
    getAjustesConfig(interaction) {
        return new EmbedBuilder()
            .setColor('#2196F3')
            .setTitle('🔧 Ajustes Generales')
            .setDescription('Configura los ajustes generales del servidor.')
            .addFields(
                { name: 'Prefijo de Comandos', value: '`/` (Slash Commands)', inline: true },
                { name: 'Idioma', value: 'Español', inline: true },
                { name: 'Mensajes de Bienvenida', value: '✅ Activados', inline: true },
                { name: 'Niveles', value: '✅ Activados', inline: true },
                { name: 'Logs', value: '❌ Desactivados', inline: true },
                { name: 'Notificaciones', value: '✅ Activadas', inline: true }
            )
            .setFooter({ 
                text: 'Usa los botones para modificar la configuración',
                iconURL: interaction.client.user.displayAvatarURL()
            });
    },

    // Configuración de Roles
    getRolesConfig(interaction) {
        return new EmbedBuilder()
            .setColor('#9C27B0')
            .setTitle('🎭 Configuración de Roles')
            .setDescription('Gestiona los roles y permisos del servidor.')
            .addFields(
                { name: 'Rol de Administrador', value: '`@Administrador`', inline: true },
                { name: 'Rol de Moderador', value: '`@Moderador`', inline: true },
                { name: 'Rol de Miembro', value: '`@Miembro`', inline: true },
                { name: 'Rol de Muted', value: '`@Silenciado`', inline: true },
                { name: 'Auto-Roles', value: '❌ No configurados', inline: true },
                { name: 'Roles de Nivel', value: '✅ Activados', inline: true }
            )
            .setFooter({ 
                text: 'Usa los botones para gestionar los roles',
                iconURL: interaction.client.user.displayAvatarURL()
            });
    },

    // Configuración de Canales
    getCanalesConfig(interaction) {
        return new EmbedBuilder()
            .setColor('#FF9800')
            .setTitle('📢 Configuración de Canales')
            .setDescription('Gestiona los canales del servidor.')
            .addFields(
                { name: 'Canal de Bienvenidas', value: '`#bienvenidas`', inline: true },
                { name: 'Canal de Reglas', value: '`#reglas`', inline: true },
                { name: 'Canal de Anuncios', value: '`#anuncios`', inline: true },
                { name: 'Canal de Sugerencias', value: '`#sugerencias`', inline: true },
                { name: 'Canal de Reportes', value: '`#reportes`', inline: true },
                { name: 'Canal de Comandos', value: '`#comandos`', inline: true }
            )
            .setFooter({ 
                text: 'Usa los botones para configurar los canales',
                iconURL: interaction.client.user.displayAvatarURL()
            });
    },

    // Configuración de Módulos
    getModulosConfig(interaction) {
        return new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('🎮 Módulos del Juego')
            .setDescription('Habilita o deshabilita módulos del juego.')
            .addFields(
                { name: 'Sistema de Niveles', value: '✅ Activado', inline: true },
                { name: 'Economía', value: '✅ Activada', inline: true },
                { name: 'Misiones', value: '✅ Activadas', inline: true },
                { name: 'Combate', value: '✅ Activado', inline: true },
                { name: 'Clanes', value: '❌ Desactivado', inline: true },
                { name: 'Eventos', value: '✅ Activados', inline: true },
                { name: 'Tienda', value: '✅ Activada', inline: true },
                { name: 'Logros', value: '❌ Desactivados', inline: true },
                { name: 'Casino', value: '❌ Desactivado', inline: true }
            )
            .setFooter({ 
                text: 'Usa los botones para gestionar los módulos',
                iconURL: interaction.client.user.displayAvatarURL()
            });
    }
};
