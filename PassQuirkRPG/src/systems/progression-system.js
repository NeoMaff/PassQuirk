/**
 * Sistema de Progresión para PassQuirk RPG
 * 
 * Este sistema maneja todas las mecánicas de progresión del jugador:
 * - Experiencia y niveles
 * - Estadísticas y puntos de atributo
 * - Perfiles de jugador
 * - Tablas de clasificación
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embedStyles');
const animatedEmojis = require('../utils/animatedEmojis');

class ProgressionSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeStatSessions = new Map();
        
        // Configuración de experiencia por nivel
        this.expRequiredPerLevel = level => Math.floor(100 * Math.pow(1.2, level - 1));
        
        // Costo de respec en oro
        this.respecCost = level => Math.floor(500 * Math.pow(1.1, level - 1));
        
        // Límite de tiempo para sesiones de asignación de estadísticas (5 minutos)
        this.STAT_SESSION_TIMEOUT = 5 * 60 * 1000;
    }
    
    /**
     * Añade experiencia a un jugador y maneja subidas de nivel
     * @param {Object} player - Datos del jugador
     * @param {number} expAmount - Cantidad de experiencia a añadir
     * @returns {Object} Resultado con información de nivel y experiencia
     */
    async addExp(player, expAmount) {
        if (!player || expAmount <= 0) return { success: false };
        
        const userId = player.userId;
        const oldLevel = player.level;
        let newLevel = oldLevel;
        let currentExp = player.experience + expAmount;
        let expForNextLevel = this.expRequiredPerLevel(newLevel);
        let leveledUp = false;
        let statPointsGained = 0;
        
        // Comprobar si el jugador sube de nivel
        while (currentExp >= expForNextLevel) {
            currentExp -= expForNextLevel;
            newLevel++;
            leveledUp = true;
            statPointsGained += 3; // 3 puntos de estadística por nivel
            expForNextLevel = this.expRequiredPerLevel(newLevel);
        }
        
        // Actualizar datos del jugador en la base de datos
        await this.gameManager.database.updatePlayer(userId, {
            level: newLevel,
            experience: currentExp,
            statPoints: player.statPoints + statPointsGained
        });
        
        return {
            success: true,
            oldLevel,
            newLevel,
            leveledUp,
            currentExp,
            expForNextLevel,
            statPointsGained
        };
    }
    
    /**
     * Añade puntos de estadística a un atributo específico
     * @param {Object} player - Datos del jugador
     * @param {string} stat - Estadística a mejorar (strength, intelligence, endurance, agility, luck)
     * @param {number} points - Cantidad de puntos a añadir
     * @returns {Object} Resultado de la operación
     */
    async addStatPoints(player, stat, points) {
        if (!player || points <= 0 || player.statPoints < points) {
            return { success: false, reason: 'Puntos insuficientes' };
        }
        
        const validStats = ['strength', 'intelligence', 'endurance', 'agility', 'luck'];
        if (!validStats.includes(stat)) {
            return { success: false, reason: 'Estadística inválida' };
        }
        
        const userId = player.userId;
        const stats = { ...player.stats };
        stats[stat] += points;
        
        // Actualizar estadísticas y puntos disponibles
        await this.gameManager.database.updatePlayer(userId, {
            stats,
            statPoints: player.statPoints - points
        });
        
        // Actualizar estadísticas derivadas
        await this.updateDerivedStats(userId);
        
        return { success: true, stat, points, newValue: stats[stat] };
    }
    
    /**
     * Reinicia y redistribuye los puntos de estadística de un jugador
     * @param {Object} player - Datos del jugador
     * @returns {Object} Resultado de la operación
     */
    async respecStats(player) {
        if (!player) return { success: false };
        
        const userId = player.userId;
        const cost = this.respecCost(player.level);
        
        // Verificar si el jugador tiene suficiente oro
        if (player.gold < cost) {
            return { success: false, reason: 'Oro insuficiente', cost };
        }
        
        // Calcular puntos totales a redistribuir
        const baseStats = { strength: 5, intelligence: 5, endurance: 5, agility: 5, luck: 5 };
        const currentStats = player.stats;
        let totalPoints = 0;
        
        for (const stat of ['strength', 'intelligence', 'endurance', 'agility', 'luck']) {
            totalPoints += currentStats[stat] - baseStats[stat];
        }
        
        // Actualizar jugador con estadísticas base y puntos disponibles
        await this.gameManager.database.updatePlayer(userId, {
            stats: baseStats,
            statPoints: player.statPoints + totalPoints,
            gold: player.gold - cost
        });
        
        // Actualizar estadísticas derivadas
        await this.updateDerivedStats(userId);
        
        return { success: true, cost, totalPoints };
    }
    
    /**
     * Actualiza las estadísticas derivadas basadas en las estadísticas base
     * @param {string} userId - ID del usuario
     */
    async updateDerivedStats(userId) {
        const player = await this.gameManager.database.getPlayer(userId);
        if (!player) return;
        
        const { strength, intelligence, endurance, agility, luck } = player.stats;
        
        // Calcular estadísticas derivadas
        const derivedStats = {
            hp: 100 + (endurance * 10),
            mp: 50 + (intelligence * 5),
            physicalDamage: 10 + (strength * 2),
            magicalDamage: 10 + (intelligence * 2),
            defense: 5 + (endurance * 1.5),
            evasion: 5 + (agility * 1.5),
            criticalChance: 5 + (luck * 0.5)
        };
        
        // Actualizar estadísticas derivadas en la base de datos
        await this.gameManager.database.updatePlayer(userId, { derivedStats });
    }
    
    /**
     * Muestra el perfil de un jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} targetPlayer - Jugador objetivo (si es diferente del que ejecuta el comando)
     */
    async showProfile(interaction, targetPlayer = null) {
        const player = targetPlayer || await this.gameManager.database.getPlayer(interaction.user.id);
        if (!player) {
            return interaction.reply({ content: 'No se encontró el perfil del jugador.', ephemeral: true });
        }
        
        // Obtener datos del jugador
        const { level, experience, gold, statPoints, stats, derivedStats, quirks, class: playerClass } = player;
        const expRequired = this.expRequiredPerLevel(level);
        const expPercentage = Math.floor((experience / expRequired) * 100);
        
        // Crear barra de experiencia
        const expBar = this.createProgressBar(expPercentage, 10);
        
        // Obtener quirk principal si existe
        const mainQuirk = quirks && quirks.length > 0 ? quirks[0] : null;
        const quirkData = mainQuirk ? this.gameManager.gameData.QUIRKS[mainQuirk.id] : null;
        
        // Crear embed del perfil
        const embed = new EmbedBuilder()
            .setColor(COLORS.PROFILE)
            .setTitle(`${animatedEmojis.starPurple} Perfil de ${player.username}`)
            .setDescription(`*${playerClass ? this.gameManager.gameData.CLASSES[playerClass].philosophy : 'Sin clase seleccionada'}*`)
            .addFields(
                { name: `${EMOJIS.LEVEL} Nivel`, value: `${level}`, inline: true },
                { name: `${EMOJIS.CLASS || '🧙'} Clase`, value: playerClass ? this.gameManager.gameData.CLASSES[playerClass].name : 'Sin clase', inline: true },
                { name: `${EMOJIS.GOLD} Oro`, value: `${gold.toLocaleString()}`, inline: true },
                { name: `${EMOJIS.EXP} Experiencia`, value: `${expBar} ${experience}/${expRequired} (${expPercentage}%)`, inline: false },
                { name: `${EMOJIS.STAT_POINTS || '🔰'} Puntos de Estadística`, value: `${statPoints}`, inline: true },
                { name: `${EMOJIS.QUIRK || '✨'} Quirks`, value: quirks && quirks.length > 0 ? `${quirks.length}/${this.getQuirkLimit(level)}` : '0/1', inline: true },
                { name: '\u200B', value: '\u200B', inline: true },
                { name: '📊 Estadísticas Base', value: `
${EMOJIS.STRENGTH || '💪'} Fuerza: ${stats.strength}
${EMOJIS.INTELLIGENCE || '🧠'} Inteligencia: ${stats.intelligence}
${EMOJIS.ENDURANCE || '🛡️'} Resistencia: ${stats.endurance}
${EMOJIS.AGILITY || '💨'} Agilidad: ${stats.agility}
${EMOJIS.LUCK || '🍀'} Suerte: ${stats.luck}`, inline: true },
                { name: '🔥 Estadísticas Derivadas', value: `
${EMOJIS.HP} HP: ${derivedStats.hp}
${EMOJIS.MP} Energía: ${derivedStats.mp}
${EMOJIS.ATTACK} Daño Físico: ${derivedStats.physicalDamage}
${EMOJIS.MAGIC || '✨'} Daño Mágico: ${derivedStats.magicalDamage}
${EMOJIS.DEFENSE} Defensa: ${derivedStats.defense}
${EMOJIS.EVASION || '👟'} Evasión: ${derivedStats.evasion}
${EMOJIS.CRITICAL || '⚡'} Crítico: ${derivedStats.criticalChance}%`, inline: true }
            )
            .setFooter({ text: `PassQuirk RPG • ID: ${player.userId}` });
        
        // Añadir información del quirk principal si existe
        if (quirkData) {
            embed.addFields({
                name: `${animatedEmojis.sparkleStars} Quirk Principal: ${quirkData.name}`,
                value: `${quirkData.description}\nNivel: ${mainQuirk.level} • Rareza: ${quirkData.rarity}`,
                inline: false
            });
        }
        
        // Añadir estadísticas de juego si existen
        if (player.gameStats) {
            const { combatWins = 0, combatLosses = 0, explorations = 0, enemiesDefeated = 0, bossesDefeated = 0, treasuresFound = 0 } = player.gameStats;
            
            embed.addFields({
                name: `${animatedEmojis.swordGold || '⚔️'} Estadísticas de Juego`,
                value: `Victorias en Combate: ${combatWins}\nDerrotas en Combate: ${combatLosses}\nExploraciones: ${explorations}\nEnemigos Derrotados: ${enemiesDefeated}\nJefes Derrotados: ${bossesDefeated}\nTesoros Encontrados: ${treasuresFound}`,
                inline: false
            });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
    
    /**
     * Notifica al jugador sobre una subida de nivel
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} levelUpResult - Resultado de la subida de nivel
     */
    async handleLevelUp(interaction, levelUpResult) {
        const { newLevel, statPointsGained } = levelUpResult;
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle(`${animatedEmojis.tada} ¡Subida de Nivel!`)
            .setDescription(`Has alcanzado el nivel **${newLevel}**`)
            .addFields(
                { name: `${EMOJIS.STAT_POINTS || '🔰'} Puntos de Estadística Ganados`, value: `+${statPointsGained}`, inline: true },
                { name: `${EMOJIS.LEVEL} Nuevo Nivel`, value: `${newLevel}`, inline: true }
            )
            .setFooter({ text: 'Usa /stats para asignar tus puntos de estadística' });
        
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
    
    /**
     * Muestra la ganancia de experiencia al jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {number} expAmount - Cantidad de experiencia ganada
     * @param {Object} expResult - Resultado de añadir experiencia
     */
    async handleExpGain(interaction, expAmount, expResult) {
        const { currentExp, expForNextLevel } = expResult;
        const expPercentage = Math.floor((currentExp / expForNextLevel) * 100);
        const expBar = this.createProgressBar(expPercentage, 10);
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.INFO)
            .setTitle(`${EMOJIS.EXP} Experiencia Ganada`)
            .setDescription(`Has ganado **${expAmount}** puntos de experiencia`)
            .addFields(
                { name: 'Progreso', value: `${expBar} ${currentExp}/${expForNextLevel} (${expPercentage}%)`, inline: false }
            );
        
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
    
    /**
     * Maneja la asignación de puntos de estadística
     * @param {Object} interaction - Interacción de Discord
     */
    async handleStatAllocation(interaction) {
        const userId = interaction.user.id;
        const player = await this.gameManager.database.getPlayer(userId);
        
        if (!player) {
            return interaction.reply({ content: 'No se encontró tu perfil de jugador.', ephemeral: true });
        }
        
        if (player.statPoints <= 0) {
            return interaction.reply({ content: 'No tienes puntos de estadística disponibles.', ephemeral: true });
        }
        
        // Crear embed de asignación de estadísticas
        const embed = this.createStatAllocationEmbed(player);
        
        // Crear botones para cada estadística
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`stat_strength_${userId}`)
                    .setLabel('Fuerza')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(EMOJIS.STRENGTH || '💪'),
                new ButtonBuilder()
                    .setCustomId(`stat_intelligence_${userId}`)
                    .setLabel('Inteligencia')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(EMOJIS.INTELLIGENCE || '🧠'),
                new ButtonBuilder()
                    .setCustomId(`stat_endurance_${userId}`)
                    .setLabel('Resistencia')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(EMOJIS.ENDURANCE || '🛡️')
            );
        
        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`stat_agility_${userId}`)
                    .setLabel('Agilidad')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(EMOJIS.AGILITY || '💨'),
                new ButtonBuilder()
                    .setCustomId(`stat_luck_${userId}`)
                    .setLabel('Suerte')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji(EMOJIS.LUCK || '🍀'),
                new ButtonBuilder()
                    .setCustomId(`respec_${userId}`)
                    .setLabel('Reiniciar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🔄')
            );
        
        // Enviar mensaje y registrar sesión activa
        const response = await interaction.reply({ embeds: [embed], components: [row, row2], ephemeral: true });
        
        // Registrar sesión de asignación de estadísticas
        this.activeStatSessions.set(userId, {
            messageId: response.id,
            channelId: interaction.channelId,
            timestamp: Date.now(),
            timeout: setTimeout(() => {
                this.activeStatSessions.delete(userId);
                
                // Intentar actualizar el mensaje para quitar los botones
                try {
                    const embed = new EmbedBuilder()
                        .setColor(COLORS.WARNING)
                        .setTitle('Sesión Expirada')
                        .setDescription('La sesión de asignación de estadísticas ha expirado.');
                    
                    interaction.editReply({ embeds: [embed], components: [] }).catch(() => {});
                } catch (error) {
                    console.error('Error al expirar sesión de estadísticas:', error);
                }
            }, this.STAT_SESSION_TIMEOUT)
        });
    }
    
    /**
     * Callback para los botones de selección de estadística
     * @param {Object} interaction - Interacción de botón
     */
    async statButtonCallback(interaction) {
        const [_, stat, userId] = interaction.customId.split('_');
        
        // Verificar que el usuario que hizo clic es el propietario de la sesión
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'Esta no es tu sesión de asignación de estadísticas.', ephemeral: true });
        }
        
        const session = this.activeStatSessions.get(userId);
        if (!session) {
            return interaction.reply({ content: 'La sesión de asignación de estadísticas ha expirado.', ephemeral: true });
        }
        
        const player = await this.gameManager.database.getPlayer(userId);
        if (!player || player.statPoints <= 0) {
            return interaction.reply({ content: 'No tienes puntos de estadística disponibles.', ephemeral: true });
        }
        
        // Crear botones para seleccionar cantidad de puntos
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`add_${stat}_1_${userId}`)
                    .setLabel('1 Punto')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`add_${stat}_5_${userId}`)
                    .setLabel('5 Puntos')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(player.statPoints < 5),
                new ButtonBuilder()
                    .setCustomId(`add_${stat}_10_${userId}`)
                    .setLabel('10 Puntos')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(player.statPoints < 10),
                new ButtonBuilder()
                    .setCustomId(`add_${stat}_all_${userId}`)
                    .setLabel(`Todo (${player.statPoints})`)
                    .setStyle(ButtonStyle.Success)
            );
        
        // Mostrar diálogo de selección de cantidad
        const statNames = {
            strength: 'Fuerza',
            intelligence: 'Inteligencia',
            endurance: 'Resistencia',
            agility: 'Agilidad',
            luck: 'Suerte'
        };
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(`Asignar Puntos a ${statNames[stat]}`)
            .setDescription(`Tienes **${player.statPoints}** puntos disponibles.\n¿Cuántos puntos quieres asignar a ${statNames[stat]}?`);
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    
    /**
     * Callback para los botones de añadir puntos
     * @param {Object} interaction - Interacción de botón
     */
    async addStatCallback(interaction) {
        const [_, stat, amount, userId] = interaction.customId.split('_');
        
        // Verificar que el usuario que hizo clic es el propietario de la sesión
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'Esta no es tu sesión de asignación de estadísticas.', ephemeral: true });
        }
        
        const session = this.activeStatSessions.get(userId);
        if (!session) {
            return interaction.reply({ content: 'La sesión de asignación de estadísticas ha expirado.', ephemeral: true });
        }
        
        const player = await this.gameManager.database.getPlayer(userId);
        if (!player || player.statPoints <= 0) {
            return interaction.reply({ content: 'No tienes puntos de estadística disponibles.', ephemeral: true });
        }
        
        // Determinar la cantidad de puntos a añadir
        let pointsToAdd = parseInt(amount);
        if (amount === 'all') {
            pointsToAdd = player.statPoints;
        }
        
        // Asegurarse de que no exceda los puntos disponibles
        pointsToAdd = Math.min(pointsToAdd, player.statPoints);
        
        // Añadir los puntos a la estadística
        const result = await this.addStatPoints(player, stat, pointsToAdd);
        
        if (!result.success) {
            return interaction.reply({ content: `Error al asignar puntos: ${result.reason}`, ephemeral: true });
        }
        
        // Obtener jugador actualizado
        const updatedPlayer = await this.gameManager.database.getPlayer(userId);
        
        // Actualizar el embed de asignación de estadísticas
        const embed = this.createStatAllocationEmbed(updatedPlayer);
        
        // Actualizar el mensaje original
        try {
            const channel = await this.gameManager.client.channels.fetch(session.channelId);
            const message = await channel.messages.fetch(session.messageId);
            
            // Recrear los botones para cada estadística
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`stat_strength_${userId}`)
                        .setLabel('Fuerza')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(EMOJIS.STRENGTH || '💪'),
                    new ButtonBuilder()
                        .setCustomId(`stat_intelligence_${userId}`)
                        .setLabel('Inteligencia')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(EMOJIS.INTELLIGENCE || '🧠'),
                    new ButtonBuilder()
                        .setCustomId(`stat_endurance_${userId}`)
                        .setLabel('Resistencia')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(EMOJIS.ENDURANCE || '🛡️')
                );
            
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`stat_agility_${userId}`)
                        .setLabel('Agilidad')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(EMOJIS.AGILITY || '💨'),
                    new ButtonBuilder()
                        .setCustomId(`stat_luck_${userId}`)
                        .setLabel('Suerte')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji(EMOJIS.LUCK || '🍀'),
                    new ButtonBuilder()
                        .setCustomId(`respec_${userId}`)
                        .setLabel('Reiniciar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔄')
                );
            
            await message.edit({ embeds: [embed], components: [row, row2] });
        } catch (error) {
            console.error('Error al actualizar mensaje de estadísticas:', error);
        }
        
        // Mostrar confirmación
        const statNames = {
            strength: 'Fuerza',
            intelligence: 'Inteligencia',
            endurance: 'Resistencia',
            agility: 'Agilidad',
            luck: 'Suerte'
        };
        
        const confirmEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle('Puntos Asignados')
            .setDescription(`Has asignado **${pointsToAdd}** puntos a **${statNames[stat]}**.\nNuevo valor: **${result.newValue}**`);
        
        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }
    
    /**
     * Callback para el botón de respec
     * @param {Object} interaction - Interacción de botón
     */
    async respecButtonCallback(interaction) {
        const [_, userId] = interaction.customId.split('_');
        
        // Verificar que el usuario que hizo clic es el propietario de la sesión
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'Esta no es tu sesión de asignación de estadísticas.', ephemeral: true });
        }
        
        const player = await this.gameManager.database.getPlayer(userId);
        if (!player) {
            return interaction.reply({ content: 'No se encontró tu perfil de jugador.', ephemeral: true });
        }
        
        // Calcular costo de respec
        const cost = this.respecCost(player.level);
        
        // Verificar si el jugador tiene suficiente oro
        if (player.gold < cost) {
            return interaction.reply({ 
                content: `No tienes suficiente oro para reiniciar tus estadísticas. Necesitas ${cost} oro.`, 
                ephemeral: true 
            });
        }
        
        // Crear botones de confirmación
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`respec_confirm_${userId}`)
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`respec_cancel_${userId}`)
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        const embed = new EmbedBuilder()
            .setColor(COLORS.WARNING)
            .setTitle('Confirmar Reinicio de Estadísticas')
            .setDescription(`¿Estás seguro de que quieres reiniciar tus estadísticas?\n\nCosto: **${cost}** oro\n\nTus estadísticas volverán a los valores base (5) y recuperarás todos los puntos gastados.`);
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    
    /**
     * Callback para confirmar o cancelar el respec
     * @param {Object} interaction - Interacción de botón
     */
    async respecConfirmCallback(interaction) {
        const [_, action, userId] = interaction.customId.split('_');
        
        // Verificar que el usuario que hizo clic es el propietario de la sesión
        if (interaction.user.id !== userId) {
            return interaction.reply({ content: 'Esta no es tu sesión de asignación de estadísticas.', ephemeral: true });
        }
        
        // Si se cancela, simplemente informar
        if (action === 'cancel') {
            return interaction.reply({ content: 'Reinicio de estadísticas cancelado.', ephemeral: true });
        }
        
        // Si se confirma, proceder con el respec
        const player = await this.gameManager.database.getPlayer(userId);
        if (!player) {
            return interaction.reply({ content: 'No se encontró tu perfil de jugador.', ephemeral: true });
        }
        
        // Realizar el respec
        const result = await this.respecStats(player);
        
        if (!result.success) {
            return interaction.reply({ 
                content: `Error al reiniciar estadísticas: ${result.reason}`, 
                ephemeral: true 
            });
        }
        
        // Obtener jugador actualizado
        const updatedPlayer = await this.gameManager.database.getPlayer(userId);
        
        // Actualizar el embed de asignación de estadísticas si la sesión sigue activa
        const session = this.activeStatSessions.get(userId);
        if (session) {
            try {
                const embed = this.createStatAllocationEmbed(updatedPlayer);
                
                const channel = await this.gameManager.client.channels.fetch(session.channelId);
                const message = await channel.messages.fetch(session.messageId);
                
                // Recrear los botones para cada estadística
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`stat_strength_${userId}`)
                            .setLabel('Fuerza')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(EMOJIS.STRENGTH || '💪'),
                        new ButtonBuilder()
                            .setCustomId(`stat_intelligence_${userId}`)
                            .setLabel('Inteligencia')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(EMOJIS.INTELLIGENCE || '🧠'),
                        new ButtonBuilder()
                            .setCustomId(`stat_endurance_${userId}`)
                            .setLabel('Resistencia')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(EMOJIS.ENDURANCE || '🛡️')
                    );
                
                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`stat_agility_${userId}`)
                            .setLabel('Agilidad')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(EMOJIS.AGILITY || '💨'),
                        new ButtonBuilder()
                            .setCustomId(`stat_luck_${userId}`)
                            .setLabel('Suerte')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji(EMOJIS.LUCK || '🍀'),
                        new ButtonBuilder()
                            .setCustomId(`respec_${userId}`)
                            .setLabel('Reiniciar')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji('🔄')
                    );
                
                await message.edit({ embeds: [embed], components: [row, row2] });
            } catch (error) {
                console.error('Error al actualizar mensaje de estadísticas después de respec:', error);
            }
        }
        
        // Mostrar confirmación
        const confirmEmbed = new EmbedBuilder()
            .setColor(COLORS.SUCCESS)
            .setTitle('Estadísticas Reiniciadas')
            .setDescription(`Has reiniciado tus estadísticas por **${result.cost}** oro.\n\nHas recuperado **${result.totalPoints}** puntos de estadística.`);
        
        await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
    }
    
    /**
     * Crea una tabla de clasificación de jugadores
     * @param {Object} interaction - Interacción de Discord
     * @param {string} category - Categoría de la clasificación (level, combat, enemies, bosses, explorations)
     */
    async showLeaderboard(interaction, category = 'level') {
        // Obtener todos los jugadores
        const allPlayers = await this.gameManager.database.getAllPlayers();
        
        if (!allPlayers || allPlayers.length === 0) {
            return interaction.reply({ content: 'No hay jugadores registrados en la clasificación.', ephemeral: true });
        }
        
        // Ordenar jugadores según la categoría
        let sortedPlayers = [];
        let title = '';
        let description = '';
        let fieldName = '';
        let fieldValue = '';
        
        switch (category) {
            case 'level':
                sortedPlayers = allPlayers.sort((a, b) => b.level - a.level || b.experience - a.experience);
                title = `${animatedEmojis.crownGold || '👑'} Clasificación por Nivel`;
                description = 'Los aventureros más poderosos del reino';
                fieldName = 'Nivel';
                fieldValue = player => `**${player.level}** (${player.experience} EXP)`;
                break;
                
            case 'combat':
                sortedPlayers = allPlayers.sort((a, b) => {
                    const aWins = a.gameStats?.combatWins || 0;
                    const bWins = b.gameStats?.combatWins || 0;
                    return bWins - aWins;
                });
                title = `${animatedEmojis.swordGold || '⚔️'} Clasificación por Victorias en Combate`;
                description = 'Los guerreros más letales del reino';
                fieldName = 'Victorias';
                fieldValue = player => `**${player.gameStats?.combatWins || 0}**`;
                break;
                
            case 'enemies':
                sortedPlayers = allPlayers.sort((a, b) => {
                    const aDefeated = a.gameStats?.enemiesDefeated || 0;
                    const bDefeated = b.gameStats?.enemiesDefeated || 0;
                    return bDefeated - aDefeated;
                });
                title = `${EMOJIS.ENEMY || '👹'} Clasificación por Enemigos Derrotados`;
                description = 'Los cazadores más eficientes del reino';
                fieldName = 'Enemigos';
                fieldValue = player => `**${player.gameStats?.enemiesDefeated || 0}**`;
                break;
                
            case 'bosses':
                sortedPlayers = allPlayers.sort((a, b) => {
                    const aDefeated = a.gameStats?.bossesDefeated || 0;
                    const bDefeated = b.gameStats?.bossesDefeated || 0;
                    return bDefeated - aDefeated;
                });
                title = `${EMOJIS.BOSS || '🐉'} Clasificación por Jefes Derrotados`;
                description = 'Los héroes más valientes del reino';
                fieldName = 'Jefes';
                fieldValue = player => `**${player.gameStats?.bossesDefeated || 0}**`;
                break;
                
            case 'explorations':
                sortedPlayers = allPlayers.sort((a, b) => {
                    const aExplorations = a.gameStats?.explorations || 0;
                    const bExplorations = b.gameStats?.explorations || 0;
                    return bExplorations - aExplorations;
                });
                title = `${EMOJIS.EXPLORATION || '🧭'} Clasificación por Exploraciones`;
                description = 'Los aventureros más intrépidos del reino';
                fieldName = 'Exploraciones';
                fieldValue = player => `**${player.gameStats?.explorations || 0}**`;
                break;
        }
        
        // Limitar a los 10 mejores jugadores
        const topPlayers = sortedPlayers.slice(0, 10);
        
        // Crear embed de clasificación
        const embed = new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(title)
            .setDescription(description);
        
        // Añadir los jugadores al embed
        let leaderboardText = '';
        
        for (let i = 0; i < topPlayers.length; i++) {
            const player = topPlayers[i];
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
            
            leaderboardText += `${medal} **${player.username}** • ${fieldName}: ${fieldValue(player)}\n`;
        }
        
        embed.addFields({ name: 'Top 10 Jugadores', value: leaderboardText || 'No hay jugadores en la clasificación.', inline: false });
        
        // Verificar si el jugador que ejecuta el comando está en el top 10
        const userId = interaction.user.id;
        const userRank = sortedPlayers.findIndex(player => player.userId === userId);
        
        if (userRank !== -1 && userRank >= 10) {
            const player = sortedPlayers[userRank];
            embed.addFields({ 
                name: 'Tu Posición', 
                value: `**#${userRank + 1}** ${player.username} • ${fieldName}: ${fieldValue(player)}`, 
                inline: false 
            });
        }
        
        await interaction.reply({ embeds: [embed] });
    }
    
    /**
     * Crea un embed para la asignación de estadísticas
     * @param {Object} player - Datos del jugador
     * @returns {EmbedBuilder} Embed para asignación de estadísticas
     */
    createStatAllocationEmbed(player) {
        const { stats, statPoints, derivedStats } = player;
        
        return new EmbedBuilder()
            .setColor(COLORS.PRIMARY)
            .setTitle(`${EMOJIS.STAT_POINTS || '🔰'} Asignación de Estadísticas`)
            .setDescription(`Tienes **${statPoints}** puntos de estadística disponibles.\nSelecciona una estadística para asignar puntos.`)
            .addFields(
                { 
                    name: '📊 Estadísticas Base', 
                    value: `${EMOJIS.STRENGTH || '💪'} Fuerza: ${stats.strength}\n${EMOJIS.INTELLIGENCE || '🧠'} Inteligencia: ${stats.intelligence}\n${EMOJIS.ENDURANCE || '🛡️'} Resistencia: ${stats.endurance}\n${EMOJIS.AGILITY || '💨'} Agilidad: ${stats.agility}\n${EMOJIS.LUCK || '🍀'} Suerte: ${stats.luck}`, 
                    inline: true 
                },
                { 
                    name: '🔥 Estadísticas Derivadas', 
                    value: `${EMOJIS.HP} HP: ${derivedStats.hp}\n${EMOJIS.MP} Energía: ${derivedStats.mp}\n${EMOJIS.ATTACK} Daño Físico: ${derivedStats.physicalDamage}\n${EMOJIS.MAGIC || '✨'} Daño Mágico: ${derivedStats.magicalDamage}\n${EMOJIS.DEFENSE} Defensa: ${derivedStats.defense}\n${EMOJIS.EVASION || '👟'} Evasión: ${derivedStats.evasion}\n${EMOJIS.CRITICAL || '⚡'} Crítico: ${derivedStats.criticalChance}%`, 
                    inline: true 
                }
            )
            .setFooter({ text: 'Usa los botones para asignar puntos a tus estadísticas' });
    }
    
    /**
     * Crea una barra de progreso visual
     * @param {number} percent - Porcentaje de progreso (0-100)
     * @param {number} size - Tamaño de la barra
     * @returns {string} Barra de progreso visual
     */
    createProgressBar(percent, size = 10) {
        const filledChar = '█';
        const emptyChar = '░';
        
        const filledSize = Math.round(size * (percent / 100));
        const emptySize = size - filledSize;
        
        return filledChar.repeat(filledSize) + emptyChar.repeat(emptySize);
    }
    
    /**
     * Obtiene el límite de quirks según el nivel del jugador
     * @param {number} level - Nivel del jugador
     * @returns {number} Límite de quirks
     */
    getQuirkLimit(level) {
        if (level >= 30) return 5;
        if (level >= 20) return 4;
        if (level >= 10) return 3;
        if (level >= 5) return 2;
        return 1;
    }
}

module.exports = ProgressionSystem;