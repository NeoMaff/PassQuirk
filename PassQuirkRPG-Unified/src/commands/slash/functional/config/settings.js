// ⚙️ CONFIGURACIÓN AVANZADA - Sistema de configuración personalizable para PassQuirk RPG
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('⚙️ Configuración avanzada del bot y personalización de la experiencia')
        .addSubcommand(subcommand =>
            subcommand
                .setName('personal')
                .setDescription('🎨 Configuración personal del jugador')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('servidor')
                .setDescription('🏰 Configuración del servidor (Solo administradores)')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('notificaciones')
                .setDescription('🔔 Gestionar notificaciones y alertas')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('privacidad')
                .setDescription('🔒 Configuración de privacidad y datos')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('interfaz')
                .setDescription('🎭 Personalizar la interfaz y apariencia')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('exportar')
                .setDescription('📤 Exportar configuración actual')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('importar')
                .setDescription('📥 Importar configuración desde archivo')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('🔄 Restablecer configuración a valores por defecto')
        ),

    async execute(interaction, client) {
        try {
            const subcommand = interaction.options.getSubcommand();
            
            switch (subcommand) {
                case 'personal':
                    return await this.showPersonalSettings(interaction, client);
                case 'servidor':
                    return await this.showServerSettings(interaction, client);
                case 'notificaciones':
                    return await this.showNotificationSettings(interaction, client);
                case 'privacidad':
                    return await this.showPrivacySettings(interaction, client);
                case 'interfaz':
                    return await this.showInterfaceSettings(interaction, client);
                case 'exportar':
                    return await this.exportSettings(interaction, client);
                case 'importar':
                    return await this.importSettings(interaction, client);
                case 'reset':
                    return await this.resetSettings(interaction, client);
                default:
                    return await this.showMainSettings(interaction, client);
            }
        } catch (error) {
            console.error('Error en configuración:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al acceder a la configuración. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    /**
     * Panel principal de configuración
     */
    async showMainSettings(interaction, client) {
        const userSettings = await this.getUserSettings(interaction.user.id, client);
        
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Centro de Configuración - PassQuirk RPG')
            .setDescription(
                '**Personaliza tu experiencia de juego** 🎨\n\n' +
                '🎯 **Configuración Rápida:**\n' +
                '• 🎨 **Personal:** Personalización del perfil y preferencias\n' +
                '• 🔔 **Notificaciones:** Alertas y recordatorios\n' +
                '• 🔒 **Privacidad:** Control de datos y visibilidad\n' +
                '• 🎭 **Interfaz:** Apariencia y diseño\n\n' +
                '🏰 **Administración:**\n' +
                '• 🏰 **Servidor:** Configuración global (Admin)\n' +
                '• 📤 **Exportar/Importar:** Backup de configuración\n' +
                '• 🔄 **Reset:** Restaurar valores por defecto\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#6C5CE7')
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '🎨 Configuración Actual',
                    value: `\`\`\`yaml\n` +
                           `🌍  Idioma: ${userSettings.language || 'Español'}\n` +
                           `🎭  Tema: ${userSettings.theme || 'Clásico'}\n` +
                           `🔔  Notificaciones: ${userSettings.notifications ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `🔒  Perfil público: ${userSettings.publicProfile ? '✅ Sí' : '❌ No'}\n` +
                           `⚡  Modo rápido: ${userSettings.fastMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '📊 Estadísticas de Uso',
                    value: `\`\`\`yaml\n` +
                           `🎮  Comandos usados: ${userSettings.stats?.commandsUsed || 0}\n` +
                           `⏰  Tiempo total: ${this.formatPlayTime(userSettings.stats?.totalPlayTime)}\n` +
                           `🔧  Configuraciones: ${userSettings.stats?.settingsChanged || 0}\n` +
                           `📅  Último cambio: ${this.formatDate(userSettings.lastModified)}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🚀 Configuración Rápida',
                    value: '**Presets disponibles:**\n' +
                           '🎮 **Gamer:** Notificaciones mínimas, interfaz rápida\n' +
                           '🎨 **Casual:** Experiencia completa y visual\n' +
                           '🔒 **Privado:** Máxima privacidad y seguridad\n' +
                           '⚡ **Competitivo:** Optimizado para rendimiento',
                    inline: false
                }
            )
            .setFooter({ text: 'Usa los botones para navegar por las diferentes secciones' });

        const selectRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('settings_navigation')
                    .setPlaceholder('🎯 Selecciona una categoría de configuración...')
                    .addOptions([
                        {
                            label: 'Configuración Personal',
                            description: 'Personaliza tu perfil y preferencias',
                            value: 'personal',
                            emoji: '🎨'
                        },
                        {
                            label: 'Notificaciones',
                            description: 'Gestiona alertas y recordatorios',
                            value: 'notificaciones',
                            emoji: '🔔'
                        },
                        {
                            label: 'Privacidad',
                            description: 'Control de datos y visibilidad',
                            value: 'privacidad',
                            emoji: '🔒'
                        },
                        {
                            label: 'Interfaz',
                            description: 'Personalizar apariencia',
                            value: 'interfaz',
                            emoji: '🎭'
                        },
                        {
                            label: 'Configuración del Servidor',
                            description: 'Ajustes globales (Admin)',
                            value: 'servidor',
                            emoji: '🏰'
                        }
                    ])
            );

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('settings_preset_gamer')
                    .setLabel('🎮 Gamer')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('settings_preset_casual')
                    .setLabel('🎨 Casual')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('settings_preset_private')
                    .setLabel('🔒 Privado')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('settings_preset_competitive')
                    .setLabel('⚡ Competitivo')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⚡')
            );

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('settings_export')
                    .setLabel('📤 Exportar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📤'),
                new ButtonBuilder()
                    .setCustomId('settings_import')
                    .setLabel('📥 Importar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📥'),
                new ButtonBuilder()
                    .setCustomId('settings_reset')
                    .setLabel('🔄 Reset')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('settings_help')
                    .setLabel('❓ Ayuda')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [selectRow, buttonRow, actionRow]
        });
    },

    /**
     * Configuración personal del jugador
     */
    async showPersonalSettings(interaction, client) {
        const userSettings = await this.getUserSettings(interaction.user.id, client);
        
        const embed = new EmbedBuilder()
            .setTitle('🎨 Configuración Personal')
            .setDescription(
                '**Personaliza tu experiencia de juego** ✨\n\n' +
                'Ajusta estos valores según tus preferencias personales.\n' +
                'Los cambios se aplicarán inmediatamente.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#FF6B6B')
            .addFields(
                {
                    name: '🌍 Idioma y Región',
                    value: `\`\`\`yaml\n` +
                           `🗣️  Idioma: ${userSettings.language || 'Español'}\n` +
                           `🌍  Región: ${userSettings.region || 'América'}\n` +
                           `🕐  Zona horaria: ${userSettings.timezone || 'UTC-5'}\n` +
                           `📅  Formato fecha: ${userSettings.dateFormat || 'DD/MM/YYYY'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🎭 Personalización',
                    value: `\`\`\`yaml\n` +
                           `🎨  Tema: ${userSettings.theme || 'Clásico'}\n` +
                           `🌈  Color favorito: ${userSettings.favoriteColor || 'Azul'}\n` +
                           `😀  Emoji favorito: ${userSettings.favoriteEmoji || '⭐'}\n` +
                           `🎵  Sonidos: ${userSettings.sounds ? '✅ Activados' : '❌ Desactivados'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '⚡ Rendimiento',
                    value: `\`\`\`yaml\n` +
                           `🚀  Modo rápido: ${userSettings.fastMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `📱  Modo móvil: ${userSettings.mobileMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `🔄  Auto-refresh: ${userSettings.autoRefresh ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `⏱️  Timeout: ${userSettings.timeout || 30}s\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🎮 Preferencias de Juego',
                    value: `\`\`\`yaml\n` +
                           `🎯  Dificultad: ${userSettings.difficulty || 'Normal'}\n` +
                           `🎲  Modo aleatorio: ${userSettings.randomMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `🏆  Mostrar logros: ${userSettings.showAchievements ? '✅ Sí' : '❌ No'}\n` +
                           `📊  Estadísticas: ${userSettings.showStats ? '✅ Públicas' : '❌ Privadas'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '💬 Comunicación',
                    value: `\`\`\`yaml\n` +
                           `📢  Mensajes públicos: ${userSettings.publicMessages ? '✅ Permitidos' : '❌ Bloqueados'}\n` +
                           `💌  DMs: ${userSettings.allowDMs ? '✅ Permitidos' : '❌ Bloqueados'}\n` +
                           `🤝  Invitaciones: ${userSettings.allowInvites ? '✅ Permitidas' : '❌ Bloqueadas'}\n` +
                           `🔔  Menciones: ${userSettings.allowMentions ? '✅ Permitidas' : '❌ Bloqueadas'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🔧 Configuración Avanzada',
                    value: `\`\`\`yaml\n` +
                           `🐛  Modo debug: ${userSettings.debugMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `📝  Logs detallados: ${userSettings.verboseLogs ? '✅ Activados' : '❌ Desactivados'}\n` +
                           `🔄  Backup automático: ${userSettings.autoBackup ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `⚠️  Modo experimental: ${userSettings.experimentalMode ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `\`\`\``,
                    inline: true
                }
            )
            .setFooter({ text: 'Usa los botones para modificar cada configuración' });

        const selectRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('personal_settings_category')
                    .setPlaceholder('🎯 Selecciona una categoría para modificar...')
                    .addOptions([
                        {
                            label: 'Idioma y Región',
                            description: 'Cambiar idioma, región y formato',
                            value: 'language',
                            emoji: '🌍'
                        },
                        {
                            label: 'Personalización',
                            description: 'Tema, colores y apariencia',
                            value: 'appearance',
                            emoji: '🎭'
                        },
                        {
                            label: 'Rendimiento',
                            description: 'Optimización y velocidad',
                            value: 'performance',
                            emoji: '⚡'
                        },
                        {
                            label: 'Preferencias de Juego',
                            description: 'Dificultad y opciones de juego',
                            value: 'gameplay',
                            emoji: '🎮'
                        },
                        {
                            label: 'Comunicación',
                            description: 'Mensajes y notificaciones',
                            value: 'communication',
                            emoji: '💬'
                        },
                        {
                            label: 'Configuración Avanzada',
                            description: 'Opciones para usuarios expertos',
                            value: 'advanced',
                            emoji: '🔧'
                        }
                    ])
            );

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('personal_quick_edit')
                    .setLabel('✏️ Edición Rápida')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('✏️'),
                new ButtonBuilder()
                    .setCustomId('personal_save')
                    .setLabel('💾 Guardar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💾'),
                new ButtonBuilder()
                    .setCustomId('personal_reset')
                    .setLabel('🔄 Restablecer')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('settings_back_main')
                    .setLabel('🔙 Volver')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [selectRow, buttonRow]
        });
    },

    /**
     * Configuración de notificaciones
     */
    async showNotificationSettings(interaction, client) {
        const userSettings = await this.getUserSettings(interaction.user.id, client);
        
        const embed = new EmbedBuilder()
            .setTitle('🔔 Configuración de Notificaciones')
            .setDescription(
                '**Gestiona tus alertas y recordatorios** 📢\n\n' +
                'Controla qué notificaciones quieres recibir y cuándo.\n' +
                'Puedes personalizar cada tipo de notificación.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#4ECDC4')
            .addFields(
                {
                    name: '🎮 Notificaciones de Juego',
                    value: `\`\`\`yaml\n` +
                           `⚔️  Combates: ${userSettings.notifications?.combat ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `🎯  Misiones: ${userSettings.notifications?.quests ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `🏆  Logros: ${userSettings.notifications?.achievements ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `📈  Subida de nivel: ${userSettings.notifications?.levelUp ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `💰  Economía: ${userSettings.notifications?.economy ? '✅ Activadas' : '❌ Desactivadas'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '⏰ Recordatorios',
                    value: `\`\`\`yaml\n` +
                           `🔋  Energía llena: ${userSettings.notifications?.energyFull ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `📅  Misiones diarias: ${userSettings.notifications?.dailyQuests ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `🎁  Recompensas: ${userSettings.notifications?.rewards ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `🛒  Tienda: ${userSettings.notifications?.shop ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `🎪  Eventos: ${userSettings.notifications?.events ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🔧 Configuración Avanzada',
                    value: `\`\`\`yaml\n` +
                           `📱  Método: ${userSettings.notifications?.method || 'Discord'}\n` +
                           `🕐  Horario: ${userSettings.notifications?.schedule || '24h'}\n` +
                           `🔊  Sonido: ${userSettings.notifications?.sound ? '✅ Activado' : '❌ Desactivado'}\n` +
                           `⏱️  Frecuencia: ${userSettings.notifications?.frequency || 'Normal'}\n` +
                           `🎯  Prioridad: ${userSettings.notifications?.priority || 'Media'}\n` +
                           `\`\`\``,
                    inline: false
                }
            )
            .setFooter({ text: 'Las notificaciones se enviarán según tu configuración' });

        const toggleRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('notification_toggle')
                    .setPlaceholder('🔔 Activar/Desactivar notificaciones...')
                    .addOptions([
                        {
                            label: 'Todas las Notificaciones',
                            description: 'Activar o desactivar todo',
                            value: 'all',
                            emoji: '🔔'
                        },
                        {
                            label: 'Notificaciones de Combate',
                            description: 'Alertas de batallas y PvP',
                            value: 'combat',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Misiones y Quests',
                            description: 'Progreso y completado',
                            value: 'quests',
                            emoji: '🎯'
                        },
                        {
                            label: 'Logros y Recompensas',
                            description: 'Nuevos logros desbloqueados',
                            value: 'achievements',
                            emoji: '🏆'
                        },
                        {
                            label: 'Recordatorios',
                            description: 'Energía, misiones diarias, etc.',
                            value: 'reminders',
                            emoji: '⏰'
                        }
                    ])
            );

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('notification_test')
                    .setLabel('🧪 Probar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🧪'),
                new ButtonBuilder()
                    .setCustomId('notification_schedule')
                    .setLabel('⏰ Horarios')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏰'),
                new ButtonBuilder()
                    .setCustomId('notification_customize')
                    .setLabel('🎨 Personalizar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎨'),
                new ButtonBuilder()
                    .setCustomId('settings_back_main')
                    .setLabel('🔙 Volver')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [toggleRow, buttonRow]
        });
    },

    // Funciones auxiliares
    async getUserSettings(userId, client) {
        // Simulación de obtener configuración del usuario
        // En implementación real, esto vendría de la base de datos
        return {
            language: 'Español',
            theme: 'Clásico',
            notifications: true,
            publicProfile: true,
            fastMode: false,
            stats: {
                commandsUsed: 150,
                totalPlayTime: 7200000, // 2 horas en ms
                settingsChanged: 5
            },
            lastModified: new Date().toISOString(),
            notifications: {
                combat: true,
                quests: true,
                achievements: true,
                levelUp: true,
                economy: false,
                energyFull: true,
                dailyQuests: true,
                rewards: true,
                shop: false,
                events: true,
                method: 'Discord',
                schedule: '24h',
                sound: true,
                frequency: 'Normal',
                priority: 'Media'
            }
        };
    },

    formatPlayTime(milliseconds) {
        if (!milliseconds) return '0h 0m';
        const hours = Math.floor(milliseconds / 3600000);
        const minutes = Math.floor((milliseconds % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    },

    formatDate(dateString) {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES');
    },

    // Métodos placeholder para otras configuraciones
    async showServerSettings(interaction, client) {
        // Verificar permisos de administrador
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return await interaction.reply({
                content: '❌ Solo los administradores pueden acceder a la configuración del servidor.',
                ephemeral: true
            });
        }
        
        // Implementar configuración del servidor
        return await interaction.reply({
            content: '🏰 **Configuración del Servidor** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    },

    async showPrivacySettings(interaction, client) {
        return await interaction.reply({
            content: '🔒 **Configuración de Privacidad** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    },

    async showInterfaceSettings(interaction, client) {
        return await interaction.reply({
            content: '🎭 **Configuración de Interfaz** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    },

    async exportSettings(interaction, client) {
        return await interaction.reply({
            content: '📤 **Exportar Configuración** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    },

    async importSettings(interaction, client) {
        return await interaction.reply({
            content: '📥 **Importar Configuración** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    },

    async resetSettings(interaction, client) {
        return await interaction.reply({
            content: '🔄 **Restablecer Configuración** - En desarrollo\n\nEsta función estará disponible próximamente.',
            ephemeral: true
        });
    }
};