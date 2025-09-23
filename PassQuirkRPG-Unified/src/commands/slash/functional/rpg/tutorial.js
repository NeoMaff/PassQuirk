// 🎓 TUTORIAL INTERACTIVO PASSQUIRK RPG - Sistema de tutorial mejorado
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tutorial')
        .setDescription('🎓 Tutorial interactivo completo de PassQuirk RPG')
        .addStringOption(option =>
            option.setName('seccion')
                .setDescription('Sección específica del tutorial')
                .setRequired(false)
                .addChoices(
                    { name: '🚀 Inicio Rápido', value: 'inicio' },
                    { name: '⚔️ Sistema de Combate', value: 'combate' },
                    { name: '🎭 Clases y Quirks', value: 'clases' },
                    { name: '🗺️ Exploración', value: 'exploracion' },
                    { name: '💰 Economía', value: 'economia' },
                    { name: '🏰 Gremios', value: 'gremios' },
                    { name: '🎯 Misiones', value: 'misiones' },
                    { name: '🏆 Logros', value: 'logros' }
                )
        ),

    async execute(interaction, client) {
        try {
            const seccion = interaction.options.getString('seccion');
            
            if (!seccion) {
                return await this.showMainTutorial(interaction);
            }
            
            switch (seccion) {
                case 'inicio':
                    return await this.showQuickStart(interaction);
                case 'combate':
                    return await this.showCombatTutorial(interaction);
                case 'clases':
                    return await this.showClassesTutorial(interaction);
                case 'exploracion':
                    return await this.showExplorationTutorial(interaction);
                case 'economia':
                    return await this.showEconomyTutorial(interaction);
                case 'gremios':
                    return await this.showGuildsTutorial(interaction);
                case 'misiones':
                    return await this.showQuestsTutorial(interaction);
                case 'logros':
                    return await this.showAchievementsTutorial(interaction);
                default:
                    return await this.showMainTutorial(interaction);
            }
        } catch (error) {
            console.error('Error en tutorial:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al cargar el tutorial. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    /**
     * Tutorial principal con navegación
     */
    async showMainTutorial(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎓 Tutorial PassQuirk RPG - Guía Completa')
            .setDescription(
                '**¡Bienvenido al mundo de PassQuirk RPG!** 🌟\n\n' +
                'Este es un RPG único donde tus actividades de la vida real se convierten en poder dentro del juego. ' +
                'Estudiar, trabajar, ejercitarte y completar tareas te otorgarán experiencia y recompensas.\n\n' +
                '📚 **Selecciona una sección para aprender:**\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#6C5CE7')
            .setThumbnail('https://i.imgur.com/passquirk-logo.png')
            .addFields(
                {
                    name: '🚀 Inicio Rápido',
                    value: 'Primeros pasos y creación de personaje',
                    inline: true
                },
                {
                    name: '⚔️ Sistema de Combate',
                    value: 'Mecánicas de batalla y estrategia',
                    inline: true
                },
                {
                    name: '🎭 Clases y Quirks',
                    value: 'Especialización y habilidades únicas',
                    inline: true
                },
                {
                    name: '🗺️ Exploración',
                    value: 'Navegación por el mundo de PassQuirk',
                    inline: true
                },
                {
                    name: '💰 Economía',
                    value: 'Monedas, gemas y sistema de comercio',
                    inline: true
                },
                {
                    name: '🏰 Gremios',
                    value: 'Únete a otros jugadores y coopera',
                    inline: true
                },
                {
                    name: '🎯 Misiones',
                    value: 'Quests diarias y épicas',
                    inline: true
                },
                {
                    name: '🏆 Logros',
                    value: 'Sistema de recompensas y progreso',
                    inline: true
                },
                {
                    name: '💡 Consejos Pro',
                    value: 'Estrategias avanzadas para dominar el juego',
                    inline: true
                }
            )
            .setFooter({ text: 'Usa los botones para navegar por las secciones' });

        const navigationRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('tutorial_navigation')
                    .setPlaceholder('📖 Selecciona una sección del tutorial...')
                    .addOptions([
                        {
                            label: 'Inicio Rápido',
                            description: 'Primeros pasos en PassQuirk RPG',
                            value: 'inicio',
                            emoji: '🚀'
                        },
                        {
                            label: 'Sistema de Combate',
                            description: 'Aprende a luchar efectivamente',
                            value: 'combate',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Clases y Quirks',
                            description: 'Especialización de personaje',
                            value: 'clases',
                            emoji: '🎭'
                        },
                        {
                            label: 'Exploración',
                            description: 'Navega por el mundo',
                            value: 'exploracion',
                            emoji: '🗺️'
                        },
                        {
                            label: 'Economía',
                            description: 'Gestión de recursos',
                            value: 'economia',
                            emoji: '💰'
                        }
                    ])
            );

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_start_game')
                    .setLabel('🎮 Empezar a Jugar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎮'),
                new ButtonBuilder()
                    .setCustomId('tutorial_tips')
                    .setLabel('💡 Consejos Pro')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('💡'),
                new ButtonBuilder()
                    .setCustomId('tutorial_support')
                    .setLabel('🆘 Soporte')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🆘')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [navigationRow, actionRow]
        });
    },

    /**
     * Tutorial de inicio rápido
     */
    async showQuickStart(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🚀 Inicio Rápido - Primeros Pasos')
            .setDescription(
                '**¡Comienza tu aventura en 5 pasos simples!** ⚡\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#00D2FF')
            .addFields(
                {
                    name: '1️⃣ Crear tu Personaje',
                    value: '```\n/passquirkrpg\n```\n' +
                           '• Elige tu clase inicial\n' +
                           '• Selecciona un nombre único\n' +
                           '• Recibe tu equipo inicial',
                    inline: false
                },
                {
                    name: '2️⃣ Explorar tu Primera Zona',
                    value: '```\n/passquirkrpg accion:explorar\n```\n' +
                           '• Descubre el Reino de Akai\n' +
                           '• Encuentra tesoros ocultos\n' +
                           '• Conoce NPCs importantes',
                    inline: false
                },
                {
                    name: '3️⃣ Tu Primer Combate',
                    value: '```\n/passquirkrpg accion:combate\n```\n' +
                           '• Enfrenta enemigos básicos\n' +
                           '• Aprende las mecánicas\n' +
                           '• Gana experiencia y botín',
                    inline: false
                },
                {
                    name: '4️⃣ Gestionar Recursos',
                    value: '```\n/balance\n```\n' +
                           '• Revisa tus monedas y gemas\n' +
                           '• Compra equipo mejorado\n' +
                           '• Invierte en mejoras',
                    inline: false
                },
                {
                    name: '5️⃣ Completar Misiones',
                    value: '```\n/passquirkrpg accion:stats\n```\n' +
                           '• Acepta misiones diarias\n' +
                           '• Completa objetivos\n' +
                           '• Desbloquea nuevas áreas',
                    inline: false
                }
            )
            .setFooter({ text: '💡 Consejo: Completa las misiones diarias para progresar más rápido' });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_create_character')
                    .setLabel('🆕 Crear Personaje')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🆕'),
                new ButtonBuilder()
                    .setCustomId('tutorial_back_main')
                    .setLabel('🔙 Volver al Menú')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙'),
                new ButtonBuilder()
                    .setCustomId('tutorial_next_combat')
                    .setLabel('⚔️ Siguiente: Combate')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('⚔️')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    },

    /**
     * Tutorial del sistema de combate
     */
    async showCombatTutorial(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Sistema de Combate - Domina la Batalla')
            .setDescription(
                '**¡Conviértete en un maestro del combate!** 🥊\n\n' +
                'El combate en PassQuirk RPG combina estrategia, timing y gestión de recursos.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#FF6B6B')
            .addFields(
                {
                    name: '🎯 Mecánicas Básicas',
                    value: '• **Ataque**: Daño físico directo\n' +
                           '• **Defensa**: Reduce daño recibido\n' +
                           '• **Habilidades**: Ataques especiales\n' +
                           '• **Críticos**: Daño aumentado (suerte)',
                    inline: true
                },
                {
                    name: '🔥 Tipos de Combate',
                    value: '• **PvE**: Contra monstruos\n' +
                           '• **PvP**: Contra otros jugadores\n' +
                           '• **Jefes**: Enemigos épicos\n' +
                           '• **Torneos**: Competencias',
                    inline: true
                },
                {
                    name: '⚡ Estrategias Avanzadas',
                    value: '• **Timing**: Usa habilidades en el momento correcto\n' +
                           '• **Combos**: Encadena ataques\n' +
                           '• **Elementos**: Aprovecha debilidades\n' +
                           '• **Equipo**: Optimiza tu build',
                    inline: false
                },
                {
                    name: '🛡️ Clases en Combate',
                    value: '```yaml\n' +
                           'Guerrero: Alto daño físico y resistencia\n' +
                           'Mago: Habilidades mágicas devastadoras\n' +
                           'Pícaro: Ataques críticos y velocidad\n' +
                           'Sanador: Soporte y curación\n' +
                           'Erudito: Buffs y debuffs estratégicos\n' +
                           'Artista: Habilidades únicas e inspiración\n' +
                           '```',
                    inline: false
                }
            )
            .setFooter({ text: '💡 Consejo: Experimenta con diferentes estrategias para cada enemigo' });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_practice_combat')
                    .setLabel('🥊 Practicar Combate')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🥊'),
                new ButtonBuilder()
                    .setCustomId('tutorial_back_main')
                    .setLabel('🔙 Volver al Menú')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙'),
                new ButtonBuilder()
                    .setCustomId('tutorial_next_classes')
                    .setLabel('🎭 Siguiente: Clases')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🎭')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    },

    /**
     * Tutorial de consejos profesionales
     */
    async showProTips(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('💡 Consejos Pro - Domina PassQuirk RPG')
            .setDescription(
                '**¡Secretos de los mejores jugadores!** 🏆\n\n' +
                'Estos consejos te ayudarán a progresar más rápido y eficientemente.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#FFD93D')
            .addFields(
                {
                    name: '⏰ Gestión del Tiempo',
                    value: '• Completa misiones diarias temprano\n' +
                           '• Usa la energía antes de que se llene\n' +
                           '• Programa actividades AFK\n' +
                           '• Aprovecha eventos especiales',
                    inline: true
                },
                {
                    name: '💰 Optimización Económica',
                    value: '• Invierte en equipo que dure\n' +
                           '• Vende items innecesarios\n' +
                           '• Participa en el mercado\n' +
                           '• Ahorra para upgrades importantes',
                    inline: true
                },
                {
                    name: '🎯 Progresión Eficiente',
                    value: '• Enfócate en una especialización\n' +
                           '• Balancea PvE y PvP\n' +
                           '• Únete a un gremio activo\n' +
                           '• Completa logros sistemáticamente',
                    inline: false
                },
                {
                    name: '🔥 Secretos Avanzados',
                    value: '```yaml\n' +
                           '• Combina Quirks para efectos únicos\n' +
                           '• Estudia patrones de enemigos\n' +
                           '• Usa el clima a tu favor\n' +
                           '• Explora áreas ocultas\n' +
                           '• Participa en eventos de temporada\n' +
                           '```',
                    inline: false
                }
            )
            .setFooter({ text: '🌟 Recuerda: La consistencia es clave para el éxito' });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_advanced_guide')
                    .setLabel('📚 Guía Avanzada')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📚'),
                new ButtonBuilder()
                    .setCustomId('tutorial_back_main')
                    .setLabel('🔙 Volver al Menú')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    }
};