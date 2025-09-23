// ❓ SISTEMA DE AYUDA INTERACTIVO - Guía completa para PassQuirk RPG
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('❓ Sistema de ayuda interactivo con guías completas')
        .addStringOption(option =>
            option.setName('categoria')
                .setDescription('Categoría específica de ayuda')
                .setRequired(false)
                .addChoices(
                    { name: '🚀 Primeros Pasos', value: 'inicio' },
                    { name: '⚔️ Sistema de Combate', value: 'combate' },
                    { name: '🎭 Clases y Habilidades', value: 'clases' },
                    { name: '💰 Sistema Económico', value: 'economia' },
                    { name: '🎯 Misiones y Quests', value: 'misiones' },
                    { name: '🏆 Logros y Progreso', value: 'logros' },
                    { name: '🗺️ Exploración', value: 'exploracion' },
                    { name: '⚙️ Configuración', value: 'configuracion' },
                    { name: '🤝 Multijugador', value: 'multijugador' },
                    { name: '🔧 Comandos', value: 'comandos' }
                )
        )
        .addStringOption(option =>
            option.setName('buscar')
                .setDescription('Buscar ayuda sobre un tema específico')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const categoria = interaction.options.getString('categoria');
            const busqueda = interaction.options.getString('buscar');
            
            if (busqueda) {
                return await this.searchHelp(interaction, busqueda);
            }
            
            if (categoria) {
                return await this.showCategoryHelp(interaction, categoria);
            }
            
            return await this.showMainHelp(interaction);
        } catch (error) {
            console.error('Error en sistema de ayuda:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al cargar la ayuda. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    /**
     * Panel principal de ayuda
     */
    async showMainHelp(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('❓ Centro de Ayuda - PassQuirk RPG')
            .setDescription(
                '**¡Bienvenido al sistema de ayuda interactivo!** 🎮\n\n' +
                '🎯 **Navegación Rápida:**\n' +
                '• Usa el menú desplegable para explorar categorías\n' +
                '• Los botones te llevan a las secciones más populares\n' +
                '• Usa `/help buscar:tema` para búsquedas específicas\n\n' +
                '🚀 **¿Nuevo en PassQuirk RPG?**\n' +
                'Te recomendamos empezar con "Primeros Pasos" para una introducción completa.\n\n' +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#6C5CE7')
            .setThumbnail('https://cdn.discordapp.com/emojis/123456789.png') // Placeholder
            .addFields(
                {
                    name: '🎮 Categorías Principales',
                    value: '🚀 **Primeros Pasos** - Guía para nuevos jugadores\n' +
                           '⚔️ **Combate** - Mecánicas de batalla y estrategia\n' +
                           '🎭 **Clases** - Información sobre todas las clases\n' +
                           '💰 **Economía** - Sistema de monedas y comercio\n' +
                           '🎯 **Misiones** - Quests y objetivos\n' +
                           '🏆 **Logros** - Sistema de progreso y recompensas',
                    inline: true
                },
                {
                    name: '🔧 Herramientas Útiles',
                    value: '🗺️ **Exploración** - Mapas y ubicaciones\n' +
                           '⚙️ **Configuración** - Personalización del bot\n' +
                           '🤝 **Multijugador** - Juego cooperativo\n' +
                           '🔧 **Comandos** - Lista completa de comandos\n' +
                           '🆘 **Soporte** - Reportar bugs y sugerencias\n' +
                           '📚 **FAQ** - Preguntas frecuentes',
                    inline: true
                },
                {
                    name: '📊 Estadísticas de Ayuda',
                    value: `\`\`\`yaml\n` +
                           `📖  Artículos: 150+\n` +
                           `🎥  Tutoriales: 25\n` +
                           `❓  FAQ: 50\n` +
                           `🔄  Última actualización: Hoy\n` +
                           `\`\`\``,
                    inline: false
                },
                {
                    name: '🎯 Accesos Rápidos',
                    value: '• `/tutorial` - Tutorial interactivo paso a paso\n' +
                           '• `/panel` - Ver tu perfil y estadísticas\n' +
                           '• `/settings` - Configurar el bot\n' +
                           '• `/passquirkrpg` - Comando principal del juego\n' +
                           '• `/help buscar:tema` - Buscar ayuda específica',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Usa los controles interactivos para navegar • PassQuirk RPG v2.0' 
            });

        const categoryRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_category_select')
                    .setPlaceholder('📚 Selecciona una categoría de ayuda...')
                    .addOptions([
                        {
                            label: 'Primeros Pasos',
                            description: 'Guía completa para nuevos jugadores',
                            value: 'inicio',
                            emoji: '🚀'
                        },
                        {
                            label: 'Sistema de Combate',
                            description: 'Mecánicas de batalla y estrategia',
                            value: 'combate',
                            emoji: '⚔️'
                        },
                        {
                            label: 'Clases y Habilidades',
                            description: 'Información detallada de cada clase',
                            value: 'clases',
                            emoji: '🎭'
                        },
                        {
                            label: 'Sistema Económico',
                            description: 'Monedas, comercio y recursos',
                            value: 'economia',
                            emoji: '💰'
                        },
                        {
                            label: 'Misiones y Quests',
                            description: 'Objetivos y recompensas',
                            value: 'misiones',
                            emoji: '🎯'
                        },
                        {
                            label: 'Exploración',
                            description: 'Mapas, zonas y descubrimientos',
                            value: 'exploracion',
                            emoji: '🗺️'
                        },
                        {
                            label: 'Configuración',
                            description: 'Personalizar tu experiencia',
                            value: 'configuracion',
                            emoji: '⚙️'
                        },
                        {
                            label: 'Lista de Comandos',
                            description: 'Todos los comandos disponibles',
                            value: 'comandos',
                            emoji: '🔧'
                        }
                    ])
            );

        const quickAccessRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_getting_started')
                    .setLabel('🚀 Empezar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🚀'),
                new ButtonBuilder()
                    .setCustomId('help_commands')
                    .setLabel('🔧 Comandos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔧'),
                new ButtonBuilder()
                    .setCustomId('help_faq')
                    .setLabel('❓ FAQ')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('❓'),
                new ButtonBuilder()
                    .setCustomId('help_support')
                    .setLabel('🆘 Soporte')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🆘')
            );

        const utilityRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_search')
                    .setLabel('🔍 Buscar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('help_tutorial')
                    .setLabel('🎓 Tutorial')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎓'),
                new ButtonBuilder()
                    .setCustomId('help_tips')
                    .setLabel('💡 Consejos')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💡'),
                new ButtonBuilder()
                    .setCustomId('help_updates')
                    .setLabel('📰 Novedades')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📰')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [categoryRow, quickAccessRow, utilityRow]
        });
    },

    /**
     * Ayuda por categoría específica
     */
    async showCategoryHelp(interaction, categoria) {
        const helpData = this.getHelpData(categoria);
        
        const embed = new EmbedBuilder()
            .setTitle(`${helpData.emoji} ${helpData.title}`)
            .setDescription(helpData.description)
            .setColor(helpData.color)
            .addFields(helpData.fields)
            .setFooter({ text: `Categoría: ${helpData.title} • Usa los botones para navegar` });

        const navigationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`help_${categoria}_detailed`)
                    .setLabel('📖 Guía Detallada')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📖'),
                new ButtonBuilder()
                    .setCustomId(`help_${categoria}_examples`)
                    .setLabel('💡 Ejemplos')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💡'),
                new ButtonBuilder()
                    .setCustomId(`help_${categoria}_tips`)
                    .setLabel('🎯 Consejos')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🎯'),
                new ButtonBuilder()
                    .setCustomId('help_back_main')
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
     * Búsqueda de ayuda
     */
    async searchHelp(interaction, query) {
        const searchResults = this.performSearch(query);
        
        if (searchResults.length === 0) {
            return await interaction.reply({
                content: `🔍 **Búsqueda: "${query}"**\n\n❌ No se encontraron resultados.\n\n💡 **Sugerencias:**\n• Intenta con términos más generales\n• Revisa la ortografía\n• Usa `/help` para ver todas las categorías`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🔍 Resultados de búsqueda: "${query}"`)
            .setDescription(
                `Se encontraron **${searchResults.length}** resultado(s):\n\n` +
                searchResults.map((result, index) => 
                    `**${index + 1}.** ${result.emoji} **${result.title}**\n` +
                    `${result.description}\n` +
                    `📂 *Categoría: ${result.category}*\n`
                ).join('\n')
            )
            .setColor('#4ECDC4')
            .setFooter({ text: `Búsqueda realizada • ${searchResults.length} resultados encontrados` });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_search_new')
                    .setLabel('🔍 Nueva Búsqueda')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔍'),
                new ButtonBuilder()
                    .setCustomId('help_back_main')
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
     * Datos de ayuda por categoría
     */
    getHelpData(categoria) {
        const helpDatabase = {
            inicio: {
                emoji: '🚀',
                title: 'Primeros Pasos en PassQuirk RPG',
                description: '**¡Bienvenido a PassQuirk RPG!** 🎮\n\nEsta guía te ayudará a dar tus primeros pasos en el juego.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#FF6B6B',
                fields: [
                    {
                        name: '1️⃣ Crear tu Personaje',
                        value: '• Usa `/passquirkrpg crear` para empezar\n• Elige tu clase (Guerrero, Mago, Pícaro, etc.)\n• Personaliza tu nombre de personaje\n• ¡Tu aventura comienza aquí!',
                        inline: false
                    },
                    {
                        name: '2️⃣ Comandos Básicos',
                        value: '• `/panel` - Ver tu perfil y estadísticas\n• `/passquirkrpg perfil` - Información del personaje\n• `/passquirkrpg inventario` - Ver tus items\n• `/help` - Acceder a esta ayuda',
                        inline: true
                    },
                    {
                        name: '3️⃣ Primeras Acciones',
                        value: '• `/work` - Ganar monedas básicas\n• `/passquirkrpg explorar` - Descubrir nuevas zonas\n• `/passquirkrpg combate` - Luchar contra enemigos\n• `/tutorial` - Tutorial interactivo',
                        inline: true
                    },
                    {
                        name: '4️⃣ Consejos Importantes',
                        value: '🎯 **Gestiona tu energía** - Se regenera con el tiempo\n💰 **Ahorra monedas** - Para comprar mejor equipo\n📈 **Sube de nivel** - Mejora tus estadísticas\n🎭 **Experimenta** - Cada clase tiene su estilo único',
                        inline: false
                    }
                ]
            },
            combate: {
                emoji: '⚔️',
                title: 'Sistema de Combate',
                description: '**Domina el arte de la batalla** ⚔️\n\nAprende las mecánicas de combate para convertirte en un guerrero legendario.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#E74C3C',
                fields: [
                    {
                        name: '⚔️ Mecánicas Básicas',
                        value: '• **ATK** - Determina tu daño base\n• **DEF** - Reduce el daño recibido\n• **SPD** - Orden de turnos en combate\n• **LCK** - Probabilidad de críticos',
                        inline: true
                    },
                    {
                        name: '🎯 Tipos de Combate',
                        value: '• **PvE** - Contra enemigos del juego\n• **PvP** - Contra otros jugadores\n• **Dungeons** - Mazmorras especiales\n• **Raids** - Jefes cooperativos',
                        inline: true
                    },
                    {
                        name: '🏆 Estrategias Avanzadas',
                        value: '• Usa habilidades de clase estratégicamente\n• Gestiona tu MP para habilidades especiales\n• Equipa el gear adecuado para cada situación\n• Estudia las debilidades de tus enemigos',
                        inline: false
                    }
                ]
            },
            clases: {
                emoji: '🎭',
                title: 'Clases y Habilidades',
                description: '**Descubre tu estilo de juego perfecto** 🎭\n\nCada clase tiene habilidades únicas y estilos de combate diferentes.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#9B59B6',
                fields: [
                    {
                        name: '⚔️ Guerrero',
                        value: '• **Especialidad:** Combate cuerpo a cuerpo\n• **Fortalezas:** Alta defensa y HP\n• **Habilidades:** Golpe devastador, Escudo\n• **Ideal para:** Tanques y principiantes',
                        inline: true
                    },
                    {
                        name: '🔮 Mago',
                        value: '• **Especialidad:** Magia y hechizos\n• **Fortalezas:** Alto daño mágico\n• **Habilidades:** Bola de fuego, Curación\n• **Ideal para:** Daño a distancia',
                        inline: true
                    },
                    {
                        name: '🗡️ Pícaro',
                        value: '• **Especialidad:** Velocidad y críticos\n• **Fortalezas:** Alta velocidad y suerte\n• **Habilidades:** Ataque furtivo, Evasión\n• **Ideal para:** Jugadores estratégicos',
                        inline: true
                    },
                    {
                        name: '💚 Sanador',
                        value: '• **Especialidad:** Soporte y curación\n• **Fortalezas:** Habilidades de apoyo\n• **Habilidades:** Curación, Bendición\n• **Ideal para:** Juego cooperativo',
                        inline: true
                    },
                    {
                        name: '📚 Erudito',
                        value: '• **Especialidad:** Conocimiento y magia\n• **Fortalezas:** Versatilidad mágica\n• **Habilidades:** Análisis, Hechizos únicos\n• **Ideal para:** Jugadores experimentados',
                        inline: true
                    },
                    {
                        name: '🎨 Artista',
                        value: '• **Especialidad:** Habilidades creativas\n• **Fortalezas:** Efectos únicos\n• **Habilidades:** Inspiración, Arte marcial\n• **Ideal para:** Estilo único de juego',
                        inline: true
                    }
                ]
            },
            economia: {
                emoji: '💰',
                title: 'Sistema Económico',
                description: '**Gestiona tus recursos sabiamente** 💰\n\nAprende a ganar, ahorrar e invertir tus recursos para maximizar tu progreso.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#F39C12',
                fields: [
                    {
                        name: '💰 Tipos de Moneda',
                        value: '• **🪙 Monedas** - Moneda básica del juego\n• **💎 Gemas** - Moneda premium\n• **⚡ PG** - Puntos de Guild\n• **🎫 Tickets** - Para eventos especiales',
                        inline: true
                    },
                    {
                        name: '💼 Formas de Ganar',
                        value: '• **Trabajo** - `/work` para ingresos básicos\n• **Combate** - Derrotar enemigos\n• **Misiones** - Completar quests\n• **Comercio** - Vender items',
                        inline: true
                    },
                    {
                        name: '🛒 Gastos Inteligentes',
                        value: '• **Equipo** - Mejora tus estadísticas\n• **Consumibles** - Pociones y buffs\n• **Upgrades** - Mejoras permanentes\n• **Cosmetics** - Personalización',
                        inline: false
                    }
                ]
            },
            comandos: {
                emoji: '🔧',
                title: 'Lista de Comandos',
                description: '**Todos los comandos disponibles** 🔧\n\nReferencia completa de comandos organizados por categoría.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                color: '#3498DB',
                fields: [
                    {
                        name: '🎮 Comandos Principales',
                        value: '• `/passquirkrpg` - Comando principal del juego\n• `/panel` - Panel de información avanzado\n• `/tutorial` - Tutorial interactivo\n• `/help` - Sistema de ayuda',
                        inline: true
                    },
                    {
                        name: '💰 Economía',
                        value: '• `/balance` - Ver tu dinero\n• `/work` - Trabajar por monedas\n• `/shop` - Tienda del juego\n• `/pay` - Transferir dinero',
                        inline: true
                    },
                    {
                        name: '⚙️ Configuración',
                        value: '• `/settings` - Configuración avanzada\n• `/config` - Configuración del servidor\n• `/language` - Cambiar idioma\n• `/theme` - Cambiar tema visual',
                        inline: false
                    }
                ]
            }
        };

        return helpDatabase[categoria] || helpDatabase.inicio;
    },

    /**
     * Realizar búsqueda en la base de datos de ayuda
     */
    performSearch(query) {
        const searchDatabase = [
            { title: 'Crear Personaje', description: 'Cómo crear tu primer personaje', category: 'Primeros Pasos', emoji: '👤' },
            { title: 'Sistema de Combate', description: 'Mecánicas de batalla y estrategia', category: 'Combate', emoji: '⚔️' },
            { title: 'Clases Disponibles', description: 'Información sobre todas las clases', category: 'Clases', emoji: '🎭' },
            { title: 'Ganar Monedas', description: 'Formas de obtener recursos', category: 'Economía', emoji: '💰' },
            { title: 'Comandos Básicos', description: 'Lista de comandos esenciales', category: 'Comandos', emoji: '🔧' },
            { title: 'Configuración', description: 'Personalizar tu experiencia', category: 'Configuración', emoji: '⚙️' },
            { title: 'Misiones Diarias', description: 'Quests y objetivos diarios', category: 'Misiones', emoji: '🎯' },
            { title: 'Exploración', description: 'Descubrir nuevas zonas', category: 'Exploración', emoji: '🗺️' }
        ];

        const queryLower = query.toLowerCase();
        return searchDatabase.filter(item => 
            item.title.toLowerCase().includes(queryLower) ||
            item.description.toLowerCase().includes(queryLower) ||
            item.category.toLowerCase().includes(queryLower)
        ).slice(0, 5); // Limitar a 5 resultados
    }
};
