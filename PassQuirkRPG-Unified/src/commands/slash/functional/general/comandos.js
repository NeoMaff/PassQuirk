// 🔧 LISTA DE COMANDOS INTERACTIVA - Explorador completo de comandos
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comandos')
        .setDescription('🔧 Explorador interactivo de todos los comandos disponibles')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Filtrar comandos por categoría')
                .setRequired(false)
                .addChoices(
                    { name: '🎮 Juego Principal', value: 'juego' },
                    { name: '💰 Economía', value: 'economia' },
                    { name: '⚙️ Configuración', value: 'configuracion' },
                    { name: '👥 Administración', value: 'admin' },
                    { name: '🔧 Utilidades', value: 'utilidades' },
                    { name: '🎯 RPG Avanzado', value: 'rpg' }
                )
        )
        .addStringOption(option =>
            option.setName('buscar')
                .setDescription('Buscar un comando específico')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const categoria = interaction.options.getString('categoria');
            const busqueda = interaction.options.getString('buscar');
            
            if (busqueda) {
                return await this.searchCommands(interaction, busqueda);
            }
            
            if (categoria) {
                return await this.showCategoryCommands(interaction, categoria);
            }
            
            return await this.showMainCommandList(interaction);
        } catch (error) {
            console.error('Error en lista de comandos:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al cargar los comandos. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    /**
     * Lista principal de comandos
     */
    async showMainCommandList(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🔧 Explorador de Comandos - PassQuirk RPG')
            .setDescription(
                '**¡Descubre todos los comandos disponibles!** 🎮\n\n' +
                '🎯 **Navegación:**\n' +
                '• Usa el menú desplegable para explorar por categorías\n' +
                '• Los botones te llevan a las secciones más usadas\n' +
                '• Usa `/comandos buscar:nombre` para encontrar comandos específicos\n\n' +
                '💡 **Tip:** Haz clic en cualquier comando para ver información detallada\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#3498DB')
            .setThumbnail('https://cdn.discordapp.com/emojis/123456789.png') // Placeholder
            .addFields(
                {
                    name: '🎮 Comandos Principales',
                    value: '• `/passquirkrpg` - Comando principal del juego\n' +
                           '• `/panel` - Panel de información avanzado\n' +
                           '• `/tutorial` - Tutorial interactivo\n' +
                           '• `/help` - Sistema de ayuda completo\n' +
                           '• `/settings` - Configuración personalizada',
                    inline: true
                },
                {
                    name: '💰 Economía Básica',
                    value: '• `/balance` - Ver tu dinero actual\n' +
                           '• `/work` - Trabajar por monedas\n' +
                           '• `/shop` - Tienda del juego\n' +
                           '• `/pay` - Transferir dinero\n' +
                           '• `/daily` - Recompensa diaria',
                    inline: true
                },
                {
                    name: '📊 Estadísticas del Sistema',
                    value: `\`\`\`yaml\n` +
                           `🔧  Total de comandos: 45+\n` +
                           `📂  Categorías: 6\n` +
                           `🎮  Comandos de juego: 15\n` +
                           `💰  Comandos de economía: 12\n` +
                           `⚙️  Comandos de config: 8\n` +
                           `👥  Comandos de admin: 10\n` +
                           `\`\`\``,
                    inline: false
                },
                {
                    name: '🚀 Accesos Rápidos',
                    value: '• **Nuevo jugador:** `/tutorial` → `/passquirkrpg crear`\n' +
                           '• **Ver progreso:** `/panel` → `/passquirkrpg perfil`\n' +
                           '• **Ganar dinero:** `/work` → `/daily` → `/shop`\n' +
                           '• **Configurar:** `/settings` → `/config`\n' +
                           '• **Ayuda:** `/help` → `/comandos buscar:tema`',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Usa los controles para explorar • PassQuirk RPG v2.0' 
            });

        const categoryRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('commands_category_select')
                    .setPlaceholder('🔍 Explorar comandos por categoría...')
                    .addOptions([
                        {
                            label: 'Juego Principal',
                            description: 'Comandos core del RPG',
                            value: 'juego',
                            emoji: '🎮'
                        },
                        {
                            label: 'Sistema Económico',
                            description: 'Dinero, tienda y transacciones',
                            value: 'economia',
                            emoji: '💰'
                        },
                        {
                            label: 'RPG Avanzado',
                            description: 'Combate, clases y habilidades',
                            value: 'rpg',
                            emoji: '🎯'
                        },
                        {
                            label: 'Configuración',
                            description: 'Personalización y ajustes',
                            value: 'configuracion',
                            emoji: '⚙️'
                        },
                        {
                            label: 'Administración',
                            description: 'Comandos para moderadores',
                            value: 'admin',
                            emoji: '👥'
                        },
                        {
                            label: 'Utilidades',
                            description: 'Herramientas y funciones extra',
                            value: 'utilidades',
                            emoji: '🔧'
                        }
                    ])
            );

        const quickAccessRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('commands_game')
                    .setLabel('🎮 Juego')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('commands_economy')
                    .setLabel('💰 Economía')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💰'),
                new ButtonBuilder()
                    .setCustomId('commands_config')
                    .setLabel('⚙️ Config')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚙️'),
                new ButtonBuilder()
                    .setCustomId('commands_admin')
                    .setLabel('👥 Admin')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('👥')
            );

        const utilityRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('commands_search')
                    .setLabel('🔍 Buscar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('commands_favorites')
                    .setLabel('⭐ Favoritos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⭐'),
                new ButtonBuilder()
                    .setCustomId('commands_recent')
                    .setLabel('🕒 Recientes')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🕒'),
                new ButtonBuilder()
                    .setCustomId('commands_help')
                    .setLabel('❓ Ayuda')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('❓')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [categoryRow, quickAccessRow, utilityRow]
        });
    },

    /**
     * Comandos por categoría específica
     */
    async showCategoryCommands(interaction, categoria) {
        const commandData = this.getCommandData(categoria);
        
        const embed = new EmbedBuilder()
            .setTitle(`${commandData.emoji} ${commandData.title}`)
            .setDescription(commandData.description)
            .setColor(commandData.color)
            .addFields(commandData.fields)
            .setFooter({ text: `Categoría: ${commandData.title} • ${commandData.commands.length} comandos disponibles` });

        const navigationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`commands_${categoria}_detailed`)
                    .setLabel('📖 Ver Detalles')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📖'),
                new ButtonBuilder()
                    .setCustomId(`commands_${categoria}_examples`)
                    .setLabel('💡 Ejemplos')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💡'),
                new ButtonBuilder()
                    .setCustomId(`commands_${categoria}_permissions`)
                    .setLabel('🔐 Permisos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔐'),
                new ButtonBuilder()
                    .setCustomId('commands_back_main')
                    .setLabel('🔙 Volver')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [navigationRow]
        });
    },

    /**
     * Búsqueda de comandos
     */
    async searchCommands(interaction, query) {
        const searchResults = this.performCommandSearch(query);
        
        if (searchResults.length === 0) {
            return await interaction.reply({
                content: `🔍 **Búsqueda: "${query}"**\n\n❌ No se encontraron comandos.\n\n💡 **Sugerencias:**\n• Intenta con términos más generales\n• Revisa la ortografía\n• Usa `/comandos` para ver todas las categorías`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🔍 Comandos encontrados: "${query}"`)
            .setDescription(
                `Se encontraron **${searchResults.length}** comando(s):\n\n` +
                searchResults.map((result, index) => 
                    `**${index + 1}.** \`/${result.name}\` ${result.emoji}\n` +
                    `📝 ${result.description}\n` +
                    `📂 *Categoría: ${result.category}*\n` +
                    `🔧 *Uso: ${result.usage}*\n`
                ).join('\n')
            )
            .setColor('#4ECDC4')
            .setFooter({ text: `Búsqueda realizada • ${searchResults.length} comandos encontrados` });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('commands_search_new')
                    .setLabel('🔍 Nueva Búsqueda')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('commands_back_main')
                    .setLabel('🔙 Volver al Inicio')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    },

    /**
     * Datos de comandos por categoría
     */
    getCommandData(categoria) {
        const commandDatabase = {
            juego: {
                emoji: '🎮',
                title: 'Comandos de Juego Principal',
                description: '**Comandos core del sistema RPG** 🎮\n\nEstos son los comandos principales para jugar PassQuirk RPG.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#E74C3C',
                commands: ['passquirkrpg', 'panel', 'tutorial', 'dialogo'],
                fields: [
                    {
                        name: '🎯 Comandos Principales',
                        value: '• `/passquirkrpg` - Comando principal del juego\n' +
                               '  ↳ Crear personaje, ver perfil, inventario, combate\n' +
                               '• `/panel` - Panel de información avanzado\n' +
                               '  ↳ Estadísticas detalladas y progreso\n' +
                               '• `/tutorial` - Tutorial interactivo paso a paso\n' +
                               '  ↳ Aprende a jugar con guías interactivas',
                        inline: false
                    },
                    {
                        name: '💬 Interacción',
                        value: '• `/dialogo` - Interactuar con NPCs\n' +
                               '  ↳ Habla con personajes del mundo\n' +
                               '• `/chat` - Sistema de chat del juego\n' +
                               '  ↳ Comunicación entre jugadores',
                        inline: true
                    },
                    {
                        name: '📊 Información',
                        value: '• `/stats` - Ver estadísticas detalladas\n' +
                               '• `/leaderboard` - Tabla de clasificación\n' +
                               '• `/achievements` - Ver logros obtenidos',
                        inline: true
                    }
                ]
            },
            economia: {
                emoji: '💰',
                title: 'Comandos de Economía',
                description: '**Sistema económico completo** 💰\n\nGestiona tu dinero, compra items y comercia con otros jugadores.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#F39C12',
                commands: ['balance', 'work', 'shop', 'pay', 'daily'],
                fields: [
                    {
                        name: '💰 Gestión de Dinero',
                        value: '• `/balance` - Ver tu dinero actual\n' +
                               '  ↳ Monedas, gemas y otros recursos\n' +
                               '• `/pay <usuario> <cantidad>` - Transferir dinero\n' +
                               '  ↳ Envía dinero a otros jugadores\n' +
                               '• `/transactions` - Historial de transacciones\n' +
                               '  ↳ Ver movimientos de dinero',
                        inline: false
                    },
                    {
                        name: '💼 Ganar Dinero',
                        value: '• `/work` - Trabajar por monedas\n' +
                               '• `/daily` - Recompensa diaria\n' +
                               '• `/weekly` - Recompensa semanal\n' +
                               '• `/lottery` - Participar en lotería',
                        inline: true
                    },
                    {
                        name: '🛒 Comercio',
                        value: '• `/shop` - Tienda principal\n' +
                               '• `/market` - Mercado de jugadores\n' +
                               '• `/auction` - Casa de subastas\n' +
                               '• `/trade` - Intercambiar items',
                        inline: true
                    }
                ]
            },
            rpg: {
                emoji: '🎯',
                title: 'Comandos RPG Avanzado',
                description: '**Sistema RPG completo** 🎯\n\nCombate, clases, habilidades y aventuras épicas.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#9B59B6',
                commands: ['combat', 'skills', 'quest', 'dungeon', 'guild'],
                fields: [
                    {
                        name: '⚔️ Sistema de Combate',
                        value: '• `/combat` - Iniciar combate\n' +
                               '• `/duel <usuario>` - Duelo PvP\n' +
                               '• `/arena` - Arena de combate\n' +
                               '• `/raid` - Raids cooperativas',
                        inline: true
                    },
                    {
                        name: '🎭 Clases y Habilidades',
                        value: '• `/class` - Gestionar tu clase\n' +
                               '• `/skills` - Ver habilidades\n' +
                               '• `/levelup` - Subir de nivel\n' +
                               '• `/talent` - Árbol de talentos',
                        inline: true
                    },
                    {
                        name: '🗺️ Aventuras',
                        value: '• `/quest` - Misiones disponibles\n' +
                               '• `/explore` - Explorar zonas\n' +
                               '• `/dungeon` - Entrar a mazmorras\n' +
                               '• `/travel` - Viajar entre zonas',
                        inline: false
                    }
                ]
            },
            configuracion: {
                emoji: '⚙️',
                title: 'Comandos de Configuración',
                description: '**Personaliza tu experiencia** ⚙️\n\nConfigura el bot y personaliza tu experiencia de juego.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#3498DB',
                commands: ['settings', 'config', 'language', 'theme'],
                fields: [
                    {
                        name: '🎨 Personalización',
                        value: '• `/settings` - Configuración personal\n' +
                               '• `/theme` - Cambiar tema visual\n' +
                               '• `/language` - Cambiar idioma\n' +
                               '• `/notifications` - Configurar notificaciones',
                        inline: true
                    },
                    {
                        name: '🔧 Configuración del Servidor',
                        value: '• `/config` - Panel de configuración\n' +
                               '• `/prefix` - Cambiar prefijo\n' +
                               '• `/channels` - Configurar canales\n' +
                               '• `/roles` - Configurar roles',
                        inline: true
                    },
                    {
                        name: '📊 Datos y Privacidad',
                        value: '• `/privacy` - Configuración de privacidad\n' +
                               '• `/export` - Exportar datos\n' +
                               '• `/import` - Importar configuración\n' +
                               '• `/reset` - Restablecer configuración',
                        inline: false
                    }
                ]
            },
            admin: {
                emoji: '👥',
                title: 'Comandos de Administración',
                description: '**Herramientas para moderadores** 👥\n\nComandos exclusivos para administradores y moderadores.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#E67E22',
                commands: ['admin', 'moderation', 'economy-admin', 'server-config'],
                fields: [
                    {
                        name: '🛡️ Moderación',
                        value: '• `/ban <usuario>` - Banear usuario\n' +
                               '• `/kick <usuario>` - Expulsar usuario\n' +
                               '• `/mute <usuario>` - Silenciar usuario\n' +
                               '• `/warn <usuario>` - Advertir usuario',
                        inline: true
                    },
                    {
                        name: '💰 Economía Admin',
                        value: '• `/eco give` - Dar dinero\n' +
                               '• `/eco take` - Quitar dinero\n' +
                               '• `/eco reset` - Resetear economía\n' +
                               '• `/eco stats` - Estadísticas económicas',
                        inline: true
                    },
                    {
                        name: '⚙️ Configuración del Servidor',
                        value: '• `/server-config` - Configuración avanzada\n' +
                               '• `/logs` - Configurar logs\n' +
                               '• `/automod` - Configurar automoderación\n' +
                               '• `/backup` - Crear respaldo de configuración',
                        inline: false
                    }
                ]
            },
            utilidades: {
                emoji: '🔧',
                title: 'Comandos de Utilidades',
                description: '**Herramientas útiles** 🔧\n\nComandos de utilidad y herramientas adicionales.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#95A5A6',
                commands: ['help', 'comandos', 'ping', 'info'],
                fields: [
                    {
                        name: '📚 Información',
                        value: '• `/help` - Sistema de ayuda\n' +
                               '• `/comandos` - Lista de comandos\n' +
                               '• `/info` - Información del bot\n' +
                               '• `/about` - Acerca del proyecto',
                        inline: true
                    },
                    {
                        name: '🔧 Herramientas',
                        value: '• `/ping` - Latencia del bot\n' +
                               '• `/uptime` - Tiempo en línea\n' +
                               '• `/status` - Estado del sistema\n' +
                               '• `/version` - Versión del bot',
                        inline: true
                    },
                    {
                        name: '📊 Estadísticas',
                        value: '• `/stats` - Estadísticas del servidor\n' +
                               '• `/usage` - Uso de comandos\n' +
                               '• `/performance` - Rendimiento del bot\n' +
                               '• `/analytics` - Análisis de uso',
                        inline: false
                    }
                ]
            }
        };

        return commandDatabase[categoria] || commandDatabase.juego;
    },

    /**
     * Realizar búsqueda en la base de datos de comandos
     */
    performCommandSearch(query) {
        const commandDatabase = [
            { name: 'passquirkrpg', description: 'Comando principal del juego RPG', category: 'Juego', emoji: '🎮', usage: '/passquirkrpg [opción]' },
            { name: 'panel', description: 'Panel de información avanzado', category: 'Juego', emoji: '📊', usage: '/panel [tipo]' },
            { name: 'tutorial', description: 'Tutorial interactivo del juego', category: 'Juego', emoji: '🎓', usage: '/tutorial [sección]' },
            { name: 'balance', description: 'Ver tu dinero actual', category: 'Economía', emoji: '💰', usage: '/balance' },
            { name: 'work', description: 'Trabajar para ganar dinero', category: 'Economía', emoji: '💼', usage: '/work' },
            { name: 'shop', description: 'Tienda del juego', category: 'Economía', emoji: '🛒', usage: '/shop [categoría]' },
            { name: 'pay', description: 'Transferir dinero a otro usuario', category: 'Economía', emoji: '💸', usage: '/pay <usuario> <cantidad>' },
            { name: 'daily', description: 'Recompensa diaria', category: 'Economía', emoji: '📅', usage: '/daily' },
            { name: 'settings', description: 'Configuración personal', category: 'Configuración', emoji: '⚙️', usage: '/settings [opción]' },
            { name: 'config', description: 'Configuración del servidor', category: 'Configuración', emoji: '🔧', usage: '/config [subcomando]' },
            { name: 'help', description: 'Sistema de ayuda completo', category: 'Utilidades', emoji: '❓', usage: '/help [categoría]' },
            { name: 'comandos', description: 'Lista de todos los comandos', category: 'Utilidades', emoji: '📋', usage: '/comandos [categoría]' },
            { name: 'combat', description: 'Sistema de combate', category: 'RPG', emoji: '⚔️', usage: '/combat [tipo]' },
            { name: 'quest', description: 'Misiones disponibles', category: 'RPG', emoji: '🎯', usage: '/quest [acción]' },
            { name: 'explore', description: 'Explorar nuevas zonas', category: 'RPG', emoji: '🗺️', usage: '/explore [zona]' }
        ];

        const queryLower = query.toLowerCase();
        return commandDatabase.filter(cmd => 
            cmd.name.toLowerCase().includes(queryLower) ||
            cmd.description.toLowerCase().includes(queryLower) ||
            cmd.category.toLowerCase().includes(queryLower)
        ).slice(0, 8); // Limitar a 8 resultados
    }
};