// 📊 PANEL DE DATOS AVANZADO - Sistema de paneles mejorado para PassQuirk RPG
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('📊 Panel de datos avanzado con información detallada del jugador')
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo de panel a mostrar')
                .setRequired(false)
                .addChoices(
                    { name: '👤 Perfil Completo', value: 'perfil' },
                    { name: '📊 Estadísticas', value: 'stats' },
                    { name: '🎒 Inventario', value: 'inventario' },
                    { name: '🏆 Logros', value: 'logros' },
                    { name: '🎯 Misiones', value: 'misiones' },
                    { name: '💰 Economía', value: 'economia' },
                    { name: '⚔️ Combate', value: 'combate' },
                    { name: '🗺️ Exploración', value: 'exploracion' }
                )
        )
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Ver el panel de otro usuario (opcional)')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        try {
            const tipo = interaction.options.getString('tipo') || 'perfil';
            const targetUser = interaction.options.getUser('usuario') || interaction.user;
            
            // Verificar si el usuario tiene un personaje
            const playerData = await client.gameManager.getPlayerData(targetUser.id);
            if (!playerData || !playerData.characterName) {
                return await interaction.reply({
                    content: `❌ ${targetUser.id === interaction.user.id ? 'No tienes' : 'Este usuario no tiene'} un personaje creado. Usa \`/passquirkrpg\` para crear uno.`,
                    ephemeral: true
                });
            }

            switch (tipo) {
                case 'perfil':
                    return await this.showProfilePanel(interaction, playerData, targetUser);
                case 'stats':
                    return await this.showStatsPanel(interaction, playerData, targetUser);
                case 'inventario':
                    return await this.showInventoryPanel(interaction, playerData, targetUser);
                case 'logros':
                    return await this.showAchievementsPanel(interaction, playerData, targetUser);
                case 'misiones':
                    return await this.showQuestsPanel(interaction, playerData, targetUser);
                case 'economia':
                    return await this.showEconomyPanel(interaction, playerData, targetUser);
                case 'combate':
                    return await this.showCombatPanel(interaction, playerData, targetUser);
                case 'exploracion':
                    return await this.showExplorationPanel(interaction, playerData, targetUser);
                default:
                    return await this.showProfilePanel(interaction, playerData, targetUser);
            }
        } catch (error) {
            console.error('Error en panel:', error);
            await interaction.reply({
                content: '❌ Ocurrió un error al cargar el panel. ¡Inténtalo de nuevo!',
                ephemeral: true
            });
        }
    },

    /**
     * Panel de perfil completo
     */
    async showProfilePanel(interaction, playerData, targetUser) {
        const isOwnProfile = targetUser.id === interaction.user.id;
        const nextLevelXP = this.calculateNextLevelXP(playerData.level);
        const totalStats = Object.values(playerData.stats).reduce((a, b) => a + b, 0);
        const rank = this.getRankByLevel(playerData.level);
        const progressBar = this.createProgressBar(playerData.experience, nextLevelXP, 20);
        
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${playerData.characterName} - Perfil Completo`)
            .setDescription(
                `**${playerData.characterClass}** ${rank} | 💪 **Poder Total:** ${totalStats}\n` +
                `📍 **${playerData.location.region}** - ${playerData.location.zone}\n\n` +
                `${progressBar} **${playerData.experience}**/${nextLevelXP} XP\n\n` +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor(this.getClassColor(playerData.characterClass))
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '⚔️ Estadísticas de Combate',
                    value: `\`\`\`yaml\n` +
                           `❤️  HP: ${playerData.stats.hp}/${playerData.stats.maxHp}\n` +
                           `💙  MP: ${playerData.stats.mp}/${playerData.stats.maxMp}\n` +
                           `⚔️  ATK: ${playerData.stats.attack}\n` +
                           `🛡️  DEF: ${playerData.stats.defense}\n` +
                           `⚡  SPD: ${playerData.stats.speed}\n` +
                           `🎯  LCK: ${playerData.stats.luck}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '💰 Recursos',
                    value: `\`\`\`yaml\n` +
                           `🪙  Monedas: ${playerData.currencies.balance.toLocaleString()}\n` +
                           `💎  Gemas: ${playerData.currencies.gems.toLocaleString()}\n` +
                           `⚡  PG: ${playerData.currencies.pg.toLocaleString()}\n` +
                           `🔋  Energía: ${playerData.currencies.energy}/100\n` +
                           `🎫  Tickets: ${playerData.currencies.tickets || 0}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '🎭 Quirks Activos',
                    value: playerData.quirks.length > 0 
                        ? playerData.quirks.slice(0, 3).map(quirk => `🌟 ${quirk.name || `Quirk ${quirk}`}`).join('\n')
                        : '❌ Sin Quirks activos',
                    inline: true
                },
                {
                    name: '🏆 Progreso General',
                    value: `\`\`\`yaml\n` +
                           `📊  Nivel: ${playerData.level} ⭐\n` +
                           `🏆  Logros: ${playerData.achievements.length}/50\n` +
                           `📜  Misiones: ${playerData.quests.daily.length}/5\n` +
                           `👹  Enemigos: ${playerData.stats.enemiesDefeated || 0}\n` +
                           `🗺️  Zonas: ${playerData.stats.zonesExplored || 1}/25\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '⚔️ Equipo Actual',
                    value: `\`\`\`yaml\n` +
                           `🗡️  Arma: ${playerData.equipment.weapon || 'Espada Básica'}\n` +
                           `🛡️  Armadura: ${playerData.equipment.armor || 'Túnica Inicial'}\n` +
                           `💍  Accesorio: ${playerData.equipment.accessory || 'Ninguno'}\n` +
                           `👢  Botas: ${playerData.equipment.boots || 'Botas Básicas'}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '📈 Actividad Reciente',
                    value: `\`\`\`yaml\n` +
                           `🕐  Última conexión: ${this.formatLastSeen(playerData.lastActivity)}\n` +
                           `🎯  Última misión: ${playerData.lastQuest || 'Ninguna'}\n` +
                           `⚔️  Último combate: ${playerData.lastCombat || 'Ninguno'}\n` +
                           `🗺️  Última exploración: ${playerData.lastExploration || 'Ninguna'}\n` +
                           `\`\`\``,
                    inline: true
                }
            )
            .setFooter({ 
                text: `${isOwnProfile ? 'Tu perfil' : `Perfil de ${targetUser.username}`} • Actualizado: ${new Date().toLocaleString('es-ES')}` 
            });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('panel_navigation')
                    .setPlaceholder('📊 Cambiar vista del panel...')
                    .addOptions([
                        {
                            label: 'Estadísticas Detalladas',
                            description: 'Ver stats completas y comparativas',
                            value: 'stats',
                            emoji: '📊'
                        },
                        {
                            label: 'Inventario',
                            description: 'Items, equipo y consumibles',
                            value: 'inventario',
                            emoji: '🎒'
                        },
                        {
                            label: 'Logros',
                            description: 'Progreso y recompensas',
                            value: 'logros',
                            emoji: '🏆'
                        },
                        {
                            label: 'Misiones',
                            description: 'Quests activas y completadas',
                            value: 'misiones',
                            emoji: '🎯'
                        },
                        {
                            label: 'Análisis de Combate',
                            description: 'Estadísticas de batalla',
                            value: 'combate',
                            emoji: '⚔️'
                        }
                    ])
            );

        const buttonRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('panel_refresh')
                    .setLabel('🔄 Actualizar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔄'),
                new ButtonBuilder()
                    .setCustomId('panel_compare')
                    .setLabel('⚖️ Comparar')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('⚖️')
                    .setDisabled(!isOwnProfile),
                new ButtonBuilder()
                    .setCustomId('panel_export')
                    .setLabel('📤 Exportar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📤'),
                new ButtonBuilder()
                    .setCustomId('panel_share')
                    .setLabel('🔗 Compartir')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔗')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow, buttonRow]
        });
    },

    /**
     * Panel de estadísticas detalladas
     */
    async showStatsPanel(interaction, playerData, targetUser) {
        const totalStats = Object.values(playerData.stats).reduce((a, b) => a + b, 0);
        const avgStat = Math.round(totalStats / Object.keys(playerData.stats).length);
        const statDistribution = this.calculateStatDistribution(playerData.stats);
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 ${playerData.characterName} - Análisis Estadístico`)
            .setDescription(
                `**Análisis completo de estadísticas y rendimiento** 📈\n\n` +
                `💪 **Poder Total:** ${totalStats} | 📊 **Promedio:** ${avgStat}\n` +
                `🎯 **Especialización:** ${this.getSpecialization(playerData.stats)}\n\n` +
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )
            .setColor('#4ECDC4')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                {
                    name: '⚔️ Estadísticas Base',
                    value: `\`\`\`yaml\n` +
                           `❤️  Vida (HP):     ${playerData.stats.hp}/${playerData.stats.maxHp} ${this.createStatBar(playerData.stats.hp, playerData.stats.maxHp)}\n` +
                           `💙  Maná (MP):     ${playerData.stats.mp}/${playerData.stats.maxMp} ${this.createStatBar(playerData.stats.mp, playerData.stats.maxMp)}\n` +
                           `⚔️  Ataque:        ${playerData.stats.attack} ${this.createStatBar(playerData.stats.attack, 100)}\n` +
                           `🛡️  Defensa:       ${playerData.stats.defense} ${this.createStatBar(playerData.stats.defense, 100)}\n` +
                           `⚡  Velocidad:     ${playerData.stats.speed} ${this.createStatBar(playerData.stats.speed, 100)}\n` +
                           `🎯  Suerte:        ${playerData.stats.luck} ${this.createStatBar(playerData.stats.luck, 100)}\n` +
                           `\`\`\``,
                    inline: false
                },
                {
                    name: '📈 Distribución de Stats',
                    value: statDistribution,
                    inline: true
                },
                {
                    name: '🏆 Rankings',
                    value: `\`\`\`yaml\n` +
                           `🌟  Nivel Global: ${playerData.level}\n` +
                           `🏅  Rango: ${this.getRankByLevel(playerData.level)}\n` +
                           `📊  Percentil: Top ${this.calculatePercentile(playerData.level)}%\n` +
                           `🎯  Clase Rank: #${this.getClassRank(playerData)}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '⚔️ Estadísticas de Combate',
                    value: `\`\`\`yaml\n` +
                           `👹  Enemigos derrotados: ${playerData.stats.enemiesDefeated || 0}\n` +
                           `🏆  Victorias PvP: ${playerData.stats.pvpWins || 0}\n` +
                           `💀  Derrotas PvP: ${playerData.stats.pvpLosses || 0}\n` +
                           `🎯  Ratio W/L: ${this.calculateWinRate(playerData.stats)}\n` +
                           `💥  Daño total: ${playerData.stats.totalDamage || 0}\n` +
                           `🛡️  Daño bloqueado: ${playerData.stats.damageBlocked || 0}\n` +
                           `\`\`\``,
                    inline: false
                },
                {
                    name: '🗺️ Exploración',
                    value: `\`\`\`yaml\n` +
                           `🌍  Zonas exploradas: ${playerData.stats.zonesExplored || 1}/25\n` +
                           `🏰  Dungeons completados: ${playerData.stats.dungeonsCompleted || 0}\n` +
                           `💎  Tesoros encontrados: ${playerData.stats.treasuresFound || 0}\n` +
                           `🗝️  Secretos descubiertos: ${playerData.stats.secretsFound || 0}\n` +
                           `\`\`\``,
                    inline: true
                },
                {
                    name: '📊 Progreso Semanal',
                    value: `\`\`\`yaml\n` +
                           `✨  XP ganada: ${playerData.weeklyStats?.xpGained || 0}\n` +
                           `💰  Monedas ganadas: ${playerData.weeklyStats?.coinsEarned || 0}\n` +
                           `⚔️  Combates: ${playerData.weeklyStats?.combats || 0}\n` +
                           `📜  Misiones: ${playerData.weeklyStats?.questsCompleted || 0}\n` +
                           `\`\`\``,
                    inline: true
                }
            )
            .setFooter({ text: 'Estadísticas actualizadas en tiempo real' });

        const actionRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('stats_detailed')
                    .setLabel('📊 Vista Detallada')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📊'),
                new ButtonBuilder()
                    .setCustomId('stats_compare')
                    .setLabel('⚖️ Comparar Stats')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⚖️'),
                new ButtonBuilder()
                    .setCustomId('stats_history')
                    .setLabel('📈 Historial')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📈'),
                new ButtonBuilder()
                    .setCustomId('panel_back_profile')
                    .setLabel('🔙 Perfil')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔙')
            );

        return await interaction.reply({
            embeds: [embed],
            components: [actionRow]
        });
    },

    // Funciones auxiliares
    calculateNextLevelXP(level) {
        return Math.floor(100 * Math.pow(1.5, level - 1));
    },

    getRankByLevel(level) {
        if (level >= 100) return '🌟 Leyenda';
        if (level >= 80) return '👑 Maestro';
        if (level >= 60) return '💎 Experto';
        if (level >= 40) return '🥇 Veterano';
        if (level >= 20) return '🥈 Avanzado';
        if (level >= 10) return '🥉 Intermedio';
        return '🌱 Novato';
    },

    getClassColor(characterClass) {
        const colors = {
            'Guerrero': '#FF6B6B',
            'Mago': '#4ECDC4',
            'Pícaro': '#45B7D1',
            'Sanador': '#96CEB4',
            'Erudito': '#FFEAA7',
            'Artista': '#DDA0DD'
        };
        return colors[characterClass] || '#6C5CE7';
    },

    createProgressBar(current, max, length = 20) {
        const percentage = Math.min(current / max, 1);
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.round(percentage * 100)}%`;
    },

    createStatBar(value, max, length = 10) {
        const percentage = Math.min(value / max, 1);
        const filled = Math.round(length * percentage);
        const empty = length - filled;
        return `[${'▰'.repeat(filled)}${'▱'.repeat(empty)}]`;
    },

    formatLastSeen(timestamp) {
        if (!timestamp) return 'Nunca';
        const now = new Date();
        const last = new Date(timestamp);
        const diff = now - last;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
        if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
        if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        return 'Ahora mismo';
    },

    calculateStatDistribution(stats) {
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        return Object.entries(stats)
            .map(([stat, value]) => {
                const percentage = Math.round((value / total) * 100);
                return `${stat}: ${percentage}%`;
            })
            .join('\n');
    },

    getSpecialization(stats) {
        const maxStat = Math.max(...Object.values(stats));
        const specialStat = Object.entries(stats).find(([_, value]) => value === maxStat);
        return specialStat ? specialStat[0] : 'Balanceado';
    },

    calculatePercentile(level) {
        // Simulación de percentil basado en nivel
        return Math.max(1, Math.min(99, Math.round(100 - (level / 100) * 90)));
    },

    getClassRank(playerData) {
        // Simulación de ranking por clase
        return Math.floor(Math.random() * 1000) + 1;
    },

    calculateWinRate(stats) {
        const wins = stats.pvpWins || 0;
        const losses = stats.pvpLosses || 0;
        const total = wins + losses;
        return total > 0 ? `${Math.round((wins / total) * 100)}%` : 'N/A';
    }
};