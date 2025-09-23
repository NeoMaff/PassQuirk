const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const { PASSQUIRKS, QUIRKS_BY_CLASS, ENEMIES_BY_ZONE, ITEMS, RARITY_SYSTEM, BASE_CLASSES } = require('../data/passquirk-official-data.js');
const { playerDB } = require('../data/player-database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('passquirk')
        .setDescription('🌟 Sistema principal de PassQuirk RPG - Tu aventura isekai comienza aquí')
        .addSubcommand(subcommand =>
            subcommand
                .setName('perfil')
                .setDescription('👤 Ver tu perfil de héroe y estadísticas'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('despertar')
                .setDescription('✨ Despertar tu PassQuirk y comenzar tu aventura'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clase')
                .setDescription('🎭 Gestionar tu clase de héroe')
                .addStringOption(option =>
                    option.setName('accion')
                        .setDescription('Acción a realizar')
                        .setRequired(true)
                        .addChoices(
                            { name: '📊 Ver información', value: 'info' },
                            { name: '🔄 Cambiar clase', value: 'change' },
                            { name: '📈 Ver estadísticas', value: 'stats' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('quirks')
                .setDescription('⚡ Gestionar tus Quirks y habilidades')
                .addStringOption(option =>
                    option.setName('accion')
                        .setDescription('Acción a realizar')
                        .setRequired(true)
                        .addChoices(
                            { name: '📋 Ver mis Quirks', value: 'list' },
                            { name: '🔍 Información de Quirk', value: 'info' },
                            { name: '⚡ Usar habilidad', value: 'use' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('explorar')
                .setDescription('🗺️ Explorar las tierras de PassQuirk')
                .addStringOption(option =>
                    option.setName('zona')
                        .setDescription('Zona a explorar')
                        .setRequired(false)
                        .addChoices(
                            { name: '🌟 Reino de Akai', value: 'akai' },
                            { name: '🌿 Reino de Say', value: 'say' },
                            { name: '🏜️ Reino de Masai', value: 'masai' },
                            { name: '❄️ Montañas Heladas', value: 'montanas' },
                            { name: '🌪️ Desierto de las Ilusiones', value: 'desierto' },
                            { name: '👹 Isla del Rey Demonio', value: 'demonio' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('batalla')
                .setDescription('⚔️ Entrar en combate épico')
                .addStringOption(option =>
                    option.setName('enemigo')
                        .setDescription('Tipo de enemigo a enfrentar')
                        .setRequired(false)
                        .addChoices(
                            { name: '🎲 Aleatorio', value: 'random' },
                            { name: '🔥 Elemental', value: 'elemental' },
                            { name: '🐲 Dragón', value: 'dragon' },
                            { name: '👹 Jefe', value: 'boss' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('inventario')
                .setDescription('🎒 Gestionar tu inventario y objetos')
                .addStringOption(option =>
                    option.setName('accion')
                        .setDescription('Acción a realizar')
                        .setRequired(false)
                        .addChoices(
                            { name: '📋 Ver inventario', value: 'view' },
                            { name: '🍬 Usar objeto', value: 'use' },
                            { name: '⚔️ Equipar', value: 'equip' },
                            { name: '📊 Estadísticas', value: 'stats' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('actividad')
                .setDescription('🏃‍♂️ Registrar actividades de la vida real para ganar poder')
                .addStringOption(option =>
                    option.setName('tipo')
                        .setDescription('Tipo de actividad realizada')
                        .setRequired(true)
                        .addChoices(
                            { name: '📚 Estudiar', value: 'study' },
                            { name: '💪 Ejercicio', value: 'exercise' },
                            { name: '🧘 Meditación', value: 'meditation' },
                            { name: '🎨 Trabajo creativo', value: 'creative' },
                            { name: '🎬 Edición de video', value: 'video_editing' },
                            { name: '🏃 Cardio', value: 'cardio' },
                            { name: '📖 Lectura', value: 'reading' }
                        ))
                .addIntegerOption(option =>
                    option.setName('duracion')
                        .setDescription('Duración en minutos')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(480))
                .addStringOption(option =>
                    option.setName('descripcion')
                        .setDescription('Descripción opcional de la actividad')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('tienda')
                .setDescription('🏪 Visitar la tienda de objetos y equipamiento'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ranking')
                .setDescription('🏆 Ver el ranking de héroes del servidor'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('mundo')
                .setDescription('🌍 Información sobre el mundo de PassQuirk')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        
        try {
            switch (subcommand) {
                case 'perfil':
                    await this.handlePerfil(interaction);
                    break;
                case 'despertar':
                    await this.handleDespertar(interaction);
                    break;
                case 'clase':
                    await this.handleClase(interaction);
                    break;
                case 'quirks':
                    await this.handleQuirks(interaction);
                    break;
                case 'explorar':
                    await this.handleExplorar(interaction);
                    break;
                case 'batalla':
                    await this.handleBatalla(interaction);
                    break;
                case 'inventario':
                    await this.handleInventario(interaction);
                    break;
                case 'actividad':
                    await this.handleActividad(interaction);
                    break;
                case 'tienda':
                    await this.handleTienda(interaction);
                    break;
                case 'ranking':
                    await this.handleRanking(interaction);
                    break;
                case 'mundo':
                    await this.handleMundo(interaction);
                    break;
                default:
                    await interaction.reply({ content: '❌ Subcomando no reconocido.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error en comando passquirk:', error);
            await interaction.reply({ content: '❌ Ocurrió un error al procesar el comando.', ephemeral: true });
        }
    },

    async handlePerfil(interaction) {
        const player = playerDB.getOrCreatePlayer(interaction.user.id, interaction.user.username);
        
        const progressBar = this.createProgressBar(player.experience, player.experienceToNext);
        const passquirkName = player.passquirk ? PASSQUIRKS[player.passquirk]?.name || 'Desconocido' : 'Sin despertar';
        
        const embed = new EmbedBuilder()
            .setTitle(`👤 Perfil de ${player.username}`)
            .setDescription(`**${player.rank}**\n\n🌟 **Nivel ${player.level}** | ⚡ **${passquirkName}** | 🎭 **${player.class}**`)
            .setColor('#FFD700')
            .addFields(
                { name: '📊 Progreso', value: `${progressBar}\n${player.experience}/${player.experienceToNext} EXP`, inline: false },
                { name: '💪 Poder Real', value: `${player.realPower} puntos`, inline: true },
                { name: '🏃‍♂️ Actividades', value: `${player.activities.total} total\n🔥 ${player.activities.streak} días seguidos`, inline: true },
                { name: '⚔️ Combates', value: `${player.battle.wins}W / ${player.battle.losses}L`, inline: true },
                { name: '💰 Oro', value: `${player.inventory.gold} monedas`, inline: true },
                { name: '🗺️ Exploración', value: `${player.exploration.unlockedZones.length} zonas`, inline: true },
                { name: '⚡ Quirks', value: `${player.quirks.length} desbloqueados`, inline: true }
            )
            .setFooter({ text: `Última actividad: ${player.lastSeen ? new Date(player.lastSeen).toLocaleDateString() : 'Nunca'}` })
            .setThumbnail(interaction.user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });
    },

    async handleDespertar(interaction) {
        const player = playerDB.getOrCreatePlayer(interaction.user.id, interaction.user.username);
        
        if (player.passquirk) {
            const currentPassquirk = PASSQUIRKS[player.passquirk];
            const embed = new EmbedBuilder()
                .setTitle('✨ PassQuirk ya Despertado')
                .setDescription(`Ya tienes el PassQuirk **${currentPassquirk.name}** despertado.\n\n${currentPassquirk.element} ${currentPassquirk.description}`)
                .setColor('#FF6B6B')
                .addFields(
                    { name: '🎭 Clases Compatibles', value: currentPassquirk.compatible_classes.join(', ') },
                    { name: '🌟 Rareza', value: currentPassquirk.rarity }
                );
            
            return await interaction.reply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setTitle('✨ Despertar de PassQuirk')
            .setDescription('🌟 **¡Bienvenido al mundo de PassQuirk!**\n\nEn este mundo isekai, tus actividades de la vida real se convierten en poder épico. Cada hora de estudio, ejercicio o trabajo creativo te otorga experiencia y habilidades únicas.\n\n**PassQuirks Disponibles:**')
            .setColor('#FF6B6B');

        // Mostrar PassQuirks disponibles
        let passquirkList = '';
        Object.entries(PASSQUIRKS).slice(0, 5).forEach(([id, passquirk]) => {
            passquirkList += `${passquirk.element} **${passquirk.name}** - ${passquirk.description}\n`;
        });

        embed.addFields(
            { name: '🎭 PassQuirks Iniciales', value: passquirkList },
            { name: '🎯 Siguiente Paso', value: 'Elige tu PassQuirk y comienza a registrar actividades reales para ganar poder.' }
        );

        // Crear menú de selección de PassQuirks
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_passquirk')
            .setPlaceholder('🌟 Elige tu PassQuirk')
            .addOptions(
                Object.entries(PASSQUIRKS).slice(0, 10).map(([id, passquirk]) => ({
                    label: passquirk.name,
                    description: passquirk.description.substring(0, 100),
                    value: id,
                    emoji: passquirk.element
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ embeds: [embed], components: [row] });
    },

    async handleClase(interaction) {
        const accion = interaction.options.getString('accion');
        
        const embed = new EmbedBuilder()
            .setTitle('🎭 Sistema de Clases')
            .setColor('#4ECDC4');

        if (accion === 'info') {
            let clasesList = '';
            Object.entries(BASE_CLASSES).forEach(([nombre, data]) => {
                clasesList += `${nombre}\n**HP:** ${data.baseStats.hp} | **MP:** ${data.baseStats.mp} | **ATK:** ${data.baseStats.attack}\n**Especialidades:** ${data.specialties.join(', ')}\n\n`;
            });
            
            embed.setDescription('**Clases Disponibles:**\n\n' + clasesList);
        } else {
            embed.setDescription('🚧 **Sistema en desarrollo**\n\nFuncionalidades próximas:\n• Cambio de clase\n• Evolución de clase\n• Estadísticas detalladas\n• Habilidades por clase');
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleQuirks(interaction) {
        const accion = interaction.options.getString('accion');
        
        const embed = new EmbedBuilder()
            .setTitle('⚡ Sistema de Quirks')
            .setColor('#9B59B6');

        if (accion === 'list') {
            let quirksList = '';
            Object.entries(QUIRKS_BY_CLASS).slice(0, 3).forEach(([clase, quirks]) => {
                quirksList += `**${clase}:**\n`;
                Object.entries(quirks).forEach(([nombre, data]) => {
                    quirksList += `• ${nombre} (${data.rarity})\n`;
                });
                quirksList += '\n';
            });
            
            embed.setDescription('**Quirks por Clase:**\n\n' + quirksList);
            embed.setFooter({ text: 'Usa /passquirk quirks info para ver habilidades específicas' });
        } else {
            embed.setDescription('🚧 **Sistema en desarrollo**\n\nFuncionalidades próximas:\n• Información detallada de Quirks\n• Uso de habilidades en combate\n• Evolución de Quirks\n• Combinaciones especiales');
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleExplorar(interaction) {
        const zona = interaction.options.getString('zona');
        
        const embed = new EmbedBuilder()
            .setTitle('🗺️ Exploración de PassQuirk')
            .setColor('#27AE60');

        if (zona) {
            const zonaNames = {
                'akai': 'Reino de Akai',
                'say': 'Reino de Say',
                'masai': 'Reino de Masai',
                'montanas': 'Montañas Heladas',
                'desierto': 'Desierto de las Ilusiones',
                'demonio': 'Isla del Rey Demonio'
            };
            
            const zoneName = zonaNames[zona];
            const zoneData = ENEMIES_BY_ZONE[zoneName];
            
            if (zoneData) {
                let enemiesList = '';
                zoneData.enemies.slice(0, 5).forEach(enemy => {
                    enemiesList += `${enemy.name} (${enemy.rarity})\n`;
                });
                
                embed.setDescription(`**Explorando: ${zoneName}**\n\n**Nivel recomendado:** ${zoneData.level_range[0]}-${zoneData.level_range[1]}\n\n**Enemigos encontrados:**\n${enemiesList}`);
            }
        } else {
            let zonasList = '';
            Object.entries(ENEMIES_BY_ZONE).forEach(([nombre, data]) => {
                zonasList += `**${nombre}** (Nivel ${data.level_range[0]}-${data.level_range[1]})\n`;
            });
            
            embed.setDescription('**Zonas Disponibles:**\n\n' + zonasList);
            embed.setFooter({ text: 'Usa /passquirk explorar zona:<nombre> para explorar una zona específica' });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleBatalla(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('⚔️ Sistema de Batalla')
            .setDescription('🚧 **Sistema en desarrollo**\n\n**Próximas funcionalidades:**\n• Combate por turnos épico\n• Uso de Quirks y habilidades\n• Sistema de daño elemental\n• Recompensas por victoria\n• Batallas contra jefes legendarios')
            .setColor('#E74C3C')
            .addFields(
                { name: '🎯 Tipos de Combate', value: '• Aleatorio\n• Elemental\n• Dragones\n• Jefes de zona', inline: true },
                { name: '🏆 Recompensas', value: '• Experiencia\n• Objetos raros\n• Nuevos Quirks\n• Monedas de oro', inline: true }
            );

        await interaction.reply({ embeds: [embed] });
    },

    async handleInventario(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎒 Inventario')
            .setDescription('🚧 **Sistema en desarrollo**\n\n**Próximas funcionalidades:**\n• Gestión de objetos\n• Equipamiento de armas y armaduras\n• Objetos consumibles\n• Artefactos legendarios')
            .setColor('#F39C12');

        // Mostrar algunos objetos de ejemplo
        let itemsList = '';
        Object.entries(ITEMS.consumables).forEach(([nombre, data]) => {
            itemsList += `${data.emoji} **${nombre}** (${data.rarity})\n${data.effect}\n\n`;
        });

        embed.addFields(
            { name: '🍬 Objetos Disponibles', value: itemsList }
        );

        await interaction.reply({ embeds: [embed] });
    },

    async handleActividad(interaction) {
        const tipo = interaction.options.getString('tipo');
        const duracion = interaction.options.getInteger('duracion');
        const descripcion = interaction.options.getString('descripcion') || 'Sin descripción';
        
        // Mapeo de actividades a emojis y poder
        const activityMap = {
            'study': { emoji: '📚', name: 'Estudio', power: 2, stat: 'Inteligencia' },
            'exercise': { emoji: '💪', name: 'Ejercicio', power: 3, stat: 'Fuerza' },
            'meditation': { emoji: '🧘', name: 'Meditación', power: 1.5, stat: 'Sabiduría' },
            'creative': { emoji: '🎨', name: 'Trabajo Creativo', power: 2.5, stat: 'Creatividad' },
            'video_editing': { emoji: '🎬', name: 'Edición de Video', power: 3, stat: 'Técnica' },
            'cardio': { emoji: '🏃', name: 'Cardio', power: 2.5, stat: 'Resistencia' },
            'reading': { emoji: '📖', name: 'Lectura', power: 1.8, stat: 'Conocimiento' }
        };
        
        const activity = activityMap[tipo];
        const powerGained = Math.floor(activity.power * duracion);
        const expGained = Math.floor(duracion * 1.5);
        const statGained = Math.floor(duracion/10);
        
        // Registrar actividad en la base de datos
        const player = playerDB.getOrCreatePlayer(interaction.user.id, interaction.user.username);
        const oldLevel = player.level;
        
        const activityData = {
            type: tipo,
            name: activity.name,
            duration: duracion,
            description: descripcion,
            powerGained: powerGained,
            expGained: expGained,
            statGained: statGained,
            stat: activity.stat
        };
        
        const updatedPlayer = playerDB.addActivity(interaction.user.id, activityData);
        
        // Actualizar estadística específica
        const statKey = activity.stat.toLowerCase().replace(' ', '');
        if (updatedPlayer.stats[statKey] !== undefined) {
            updatedPlayer.stats[statKey] += statGained;
            playerDB.updatePlayer(interaction.user.id, updatedPlayer);
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🏃‍♂️ Actividad Registrada')
            .setDescription(`${activity.emoji} **${activity.name}** completada con éxito!\n\n**Duración:** ${duracion} minutos\n**Descripción:** ${descripcion}`)
            .setColor('#2ECC71')
            .addFields(
                { name: '⚡ Poder Ganado', value: `+${powerGained} puntos`, inline: true },
                { name: '📈 Experiencia', value: `+${expGained} EXP`, inline: true },
                { name: '📊 Estadística', value: `+${statGained} ${activity.stat}`, inline: true },
                { name: '🔥 Racha Actual', value: `${updatedPlayer.activities.streak} días`, inline: true },
                { name: '🏃‍♂️ Total Actividades', value: `${updatedPlayer.activities.total}`, inline: true },
                { name: '💪 Poder Real Total', value: `${updatedPlayer.realPower} puntos`, inline: true }
            )
            .setFooter({ text: 'Sigue registrando actividades para fortalecer tu héroe!' });
        
        // Verificar si subió de nivel
        if (updatedPlayer.level > oldLevel) {
            embed.addFields(
                { name: '🌟 ¡NIVEL SUBIDO!', value: `¡Felicidades! Ahora eres nivel ${updatedPlayer.level}`, inline: false }
            );
            embed.setColor('#FFD700');
        }
        
        await interaction.reply({ embeds: [embed] });
    },

    async handleTienda(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏪 Tienda de PassQuirk')
            .setDescription('🚧 **Sistema en desarrollo**\n\n**Próximas funcionalidades:**\n• Compra de objetos con monedas\n• Equipamiento especial\n• Pociones y consumibles\n• Artefactos únicos')
            .setColor('#8E44AD');

        await interaction.reply({ embeds: [embed] });
    },

    async handleRanking(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏆 Ranking de Héroes')
            .setDescription('🚧 **Sistema en desarrollo**\n\n**Próximas funcionalidades:**\n• Ranking por nivel\n• Ranking por poder real\n• Ranking por actividades\n• Logros del servidor')
            .setColor('#F1C40F');

        await interaction.reply({ embeds: [embed] });
    },

    async handleMundo(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🌍 El Mundo de PassQuirk')
            .setDescription('**Bienvenido al universo isekai de PassQuirk**\n\nEn este mundo, tus actividades de la vida real se transforman en poder épico. Cada momento de crecimiento personal se convierte en una aventura legendaria.\n\n**🌟 Zonas del Mundo:**')
            .setColor('#3498DB');

        let worldInfo = '';
        Object.entries(ENEMIES_BY_ZONE).forEach(([zona, data]) => {
            worldInfo += `**${zona}** (Nivel ${data.level_range[0]}-${data.level_range[1]})\n`;
        });

        embed.addFields(
            { name: '🗺️ Regiones', value: worldInfo },
            { name: '⚡ Sistema de Poder', value: 'Tus actividades reales = Poder en el juego\n• Estudiar = Inteligencia\n• Ejercicio = Fuerza\n• Creatividad = Magia' },
            { name: '🎯 Objetivo', value: 'Conviértete en el héroe más poderoso combinando crecimiento personal con aventura épica.' }
        );

        await interaction.reply({ embeds: [embed] });
    },

    // Método auxiliar para crear barra de progreso
    createProgressBar(current, max, length = 10) {
        const percentage = Math.min(current / max, 1);
        const filled = Math.floor(percentage * length);
        const empty = length - filled;
        
        const filledBar = '█'.repeat(filled);
        const emptyBar = '░'.repeat(empty);
        
        return `${filledBar}${emptyBar} ${Math.floor(percentage * 100)}%`;
    }
};

// Manejador de eventos para interacciones
module.exports.handleSelectMenu = async (interaction) => {
    if (interaction.customId === 'select_passquirk') {
        const passquirkId = interaction.values[0];
        const passquirk = PASSQUIRKS[passquirkId];
        
        if (!passquirk) {
            return await interaction.reply({ content: '❌ PassQuirk no encontrado.', ephemeral: true });
        }
        
        // Despertar el PassQuirk
        const player = playerDB.awakenPassquirk(interaction.user.id, passquirkId);
        
        if (!player) {
            return await interaction.reply({ content: '❌ Error al despertar PassQuirk.', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🌟 ¡PassQuirk Despertado!')
            .setDescription(`¡Felicidades! Has despertado el PassQuirk **${passquirk.name}**\n\n${passquirk.element} ${passquirk.description}`)
            .setColor('#FFD700')
            .addFields(
                { name: '🎭 Clases Compatibles', value: passquirk.compatible_classes.join(', ') },
                { name: '🌟 Rareza', value: passquirk.rarity },
                { name: '🎯 Siguiente Paso', value: 'Comienza a registrar actividades con `/passquirk actividad` para ganar poder y experiencia.' }
            )
            .setFooter({ text: 'Tu aventura en PassQuirk ha comenzado oficialmente.' });
        
        await interaction.update({ embeds: [embed], components: [] });
    }
};