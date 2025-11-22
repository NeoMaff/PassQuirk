/**
 * Sistema de Combate para PassQuirk RPG
 * 
 * Este sistema maneja todas las mecánicas de combate del juego:
 * - Iniciar combates contra enemigos
 * - Calcular daño y efectos
 * - Gestionar turnos y acciones
 * - Determinar resultados y recompensas
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { COLORS, EMOJIS } = require('../utils/embedStyles');

class CombatSystem {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.activeBattles = new Map();
        this.battleTimeouts = new Map();
        
        // Tiempo máximo de inactividad en batalla (5 minutos)
        this.MAX_BATTLE_IDLE_TIME = 5 * 60 * 1000;
    }
    
    /**
     * Inicia una batalla para un jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} player - Datos del jugador
     * @param {Object} enemy - Datos del enemigo (opcional, si no se proporciona se selecciona uno aleatorio)
     * @returns {Object} Datos de la batalla iniciada
     */
    async startBattle(interaction, player, enemy = null) {
        const userId = player.userId;
        
        // Verificar si el jugador ya está en una batalla
        if (this.activeBattles.has(userId)) {
            throw new Error('Ya estás en una batalla. Termínala antes de iniciar otra.');
        }
        
        // Si no se proporciona un enemigo, seleccionar uno aleatorio según el nivel del jugador
        if (!enemy) {
            enemy = this.gameManager.getRandomEnemy(player.level, player.exploration?.currentZone);
        }
        
        // Crear datos de la batalla
        const battle = {
            id: `battle_${userId}_${Date.now()}`,
            player: {
                ...player,
                currentHP: player.stats.hp,
                currentMP: player.stats.mp,
                buffs: [],
                debuffs: []
            },
            enemy: {
                ...enemy,
                currentHP: enemy.hp,
                buffs: [],
                debuffs: []
            },
            turn: 1,
            currentTurn: 'player', // 'player' o 'enemy'
            log: [],
            status: 'active', // 'active', 'victory', 'defeat', 'fled'
            startTime: Date.now(),
            lastActionTime: Date.now()
        };
        
        // Registrar la batalla activa
        this.activeBattles.set(userId, battle);
        
        // Iniciar temporizador de inactividad
        this.startBattleTimeout(userId);
        
        // Crear sesión de juego
        const sessionId = this.gameManager.startSession(userId, 'combat', { battleId: battle.id });
        battle.sessionId = sessionId;
        
        // Mostrar el embed de batalla inicial
        await this.showBattleEmbed(interaction, battle);
        
        return battle;
    }
    
    /**
     * Muestra el embed de batalla actualizado
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} battle - Datos de la batalla
     */
    async showBattleEmbed(interaction, battle) {
        const { player, enemy, turn, currentTurn, log, status } = battle;
        
        // Calcular porcentajes de HP para las barras de progreso
        const playerHPPercent = Math.max(0, Math.min(100, Math.floor((player.currentHP / player.stats.hp) * 100)));
        const enemyHPPercent = Math.max(0, Math.min(100, Math.floor((enemy.currentHP / enemy.hp) * 100)));
        
        // Crear barras de HP
        const playerHPBar = this.createHPBar(playerHPPercent);
        const enemyHPBar = this.createHPBar(enemyHPPercent);
        
        // Crear embed
        const embed = new EmbedBuilder()
            .setTitle(`⚔️ Batalla: ${player.name} vs ${enemy.name}`)
            .setColor(status === 'active' ? COLORS.SYSTEM.COMBAT : 
                      status === 'victory' ? COLORS.SYSTEM.SUCCESS : 
                      status === 'defeat' ? COLORS.SYSTEM.ERROR : 
                      COLORS.SYSTEM.WARNING)
            .addFields(
                { name: `${player.name} (Nivel ${player.level})`, value: `HP: ${player.currentHP}/${player.stats.hp} ${playerHPBar}\nMP: ${player.currentMP}/${player.stats.mp}`, inline: false },
                { name: `${enemy.name} (Nivel ${enemy.level})`, value: `HP: ${enemy.currentHP}/${enemy.hp} ${enemyHPBar}`, inline: false },
                { name: `Turno ${turn}`, value: `Es el turno de: **${currentTurn === 'player' ? player.name : enemy.name}**`, inline: false }
            );
        
        // Añadir log de batalla (últimas 3 entradas)
        if (log.length > 0) {
            const recentLog = log.slice(-3).join('\n');
            embed.addFields({ name: 'Acciones recientes', value: recentLog, inline: false });
        }
        
        // Añadir mensaje de estado si la batalla ha terminado
        if (status !== 'active') {
            let statusMessage = '';
            let rewardsMessage = '';
            
            if (status === 'victory') {
                statusMessage = `¡Victoria! Has derrotado a ${enemy.name}.`;
                
                // Mostrar recompensas si existen
                if (battle.rewards) {
                    const { experience, gold, items } = battle.rewards;
                    rewardsMessage = `Recompensas:\n`;
                    rewardsMessage += `${EMOJIS.STATS.EXPERIENCE} Experiencia: +${experience}\n`;
                    rewardsMessage += `${EMOJIS.STATS.GOLD} Oro: +${gold}\n`;
                    
                    if (items && items.length > 0) {
                        rewardsMessage += `${EMOJIS.SYSTEM.ITEM} Objetos: ${items.map(item => item.name).join(', ')}\n`;
                    }
                }
            } else if (status === 'defeat') {
                statusMessage = `¡Derrota! Has sido vencido por ${enemy.name}.`;
            } else if (status === 'fled') {
                statusMessage = `Has huido de la batalla contra ${enemy.name}.`;
            }
            
            embed.addFields({ name: 'Resultado', value: statusMessage, inline: false });
            
            if (rewardsMessage) {
                embed.addFields({ name: 'Recompensas', value: rewardsMessage, inline: false });
            }
        }
        
        // Añadir imagen del enemigo si existe
        if (enemy.image) {
            embed.setImage(enemy.image);
        }
        
        // Crear botones de acción
        const buttons = [];
        
        if (status === 'active' && currentTurn === 'player') {
            // Botones de combate
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`battle_attack_${battle.id}`)
                        .setLabel('Atacar')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('⚔️'),
                    new ButtonBuilder()
                        .setCustomId(`battle_skill_${battle.id}`)
                        .setLabel('Habilidad')
                        .setStyle(ButtonStyle.Primary)
                        .setEmoji('✨'),
                    new ButtonBuilder()
                        .setCustomId(`battle_item_${battle.id}`)
                        .setLabel('Objeto')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎒'),
                    new ButtonBuilder()
                        .setCustomId(`battle_flee_${battle.id}`)
                        .setLabel('Huir')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('🏃')
                );
            
            buttons.push(actionRow);
        } else if (status !== 'active') {
            // Botones post-batalla
            const actionRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`battle_continue_${battle.id}`)
                        .setLabel('Continuar')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✅')
                );
            
            buttons.push(actionRow);
        }
        
        // Enviar o actualizar mensaje
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: buttons });
        } else {
            await interaction.reply({ embeds: [embed], components: buttons });
        }
    }
    
    /**
     * Crea una barra de HP visual
     * @param {number} percent - Porcentaje de HP (0-100)
     * @returns {string} Barra de HP en formato de texto
     */
    createHPBar(percent) {
        const filledBlocks = Math.floor(percent / 10);
        const emptyBlocks = 10 - filledBlocks;
        
        let color;
        if (percent > 50) color = '🟩'; // Verde
        else if (percent > 25) color = '🟨'; // Amarillo
        else color = '🟥'; // Rojo
        
        return color.repeat(filledBlocks) + '⬜'.repeat(emptyBlocks);
    }
    
    /**
     * Procesa una acción de ataque del jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {string} battleId - ID de la batalla
     */
    async processAttack(interaction, battleId) {
        const userId = interaction.user.id;
        const battle = this.activeBattles.get(userId);
        
        if (!battle || battle.id !== battleId || battle.status !== 'active') {
            await interaction.reply({ content: 'Esta batalla ya no está activa.', ephemeral: true });
            return;
        }
        
        if (battle.currentTurn !== 'player') {
            await interaction.reply({ content: 'No es tu turno.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Calcular daño base
        const player = battle.player;
        const enemy = battle.enemy;
        
        const attackPower = player.stats.attack;
        const defense = enemy.defense;
        
        // Fórmula de daño: ataque * (1 - defensa/(defensa + 100))
        let damage = Math.floor(attackPower * (1 - defense / (defense + 100)));
        
        // Variación aleatoria (±10%)
        const variation = 0.9 + Math.random() * 0.2;
        damage = Math.floor(damage * variation);
        
        // Aplicar daño
        enemy.currentHP = Math.max(0, enemy.currentHP - damage);
        
        // Registrar acción en el log
        battle.log.push(`${player.name} ataca a ${enemy.name} y causa ${damage} de daño.`);
        
        // Actualizar tiempo de última acción
        battle.lastActionTime = Date.now();
        
        // Verificar si el enemigo ha sido derrotado
        if (enemy.currentHP <= 0) {
            await this.endBattle(interaction, battle, 'victory');
            return;
        }
        
        // Cambiar turno
        battle.currentTurn = 'enemy';
        
        // Mostrar batalla actualizada
        await this.showBattleEmbed(interaction, battle);
        
        // Procesar turno del enemigo después de un breve retraso
        setTimeout(() => this.processEnemyTurn(interaction, battle), 1500);
    }
    
    /**
     * Procesa el turno del enemigo
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} battle - Datos de la batalla
     */
    async processEnemyTurn(interaction, battle) {
        if (battle.status !== 'active') return;
        
        const player = battle.player;
        const enemy = battle.enemy;
        
        // Calcular daño del enemigo
        const attackPower = enemy.attack;
        const defense = player.stats.defense;
        
        // Fórmula de daño: ataque * (1 - defensa/(defensa + 100))
        let damage = Math.floor(attackPower * (1 - defense / (defense + 100)));
        
        // Variación aleatoria (±10%)
        const variation = 0.9 + Math.random() * 0.2;
        damage = Math.floor(damage * variation);
        
        // Aplicar daño
        player.currentHP = Math.max(0, player.currentHP - damage);
        
        // Registrar acción en el log
        battle.log.push(`${enemy.name} ataca a ${player.name} y causa ${damage} de daño.`);
        
        // Verificar si el jugador ha sido derrotado
        if (player.currentHP <= 0) {
            await this.endBattle(interaction, battle, 'defeat');
            return;
        }
        
        // Incrementar turno y cambiar a jugador
        battle.turn++;
        battle.currentTurn = 'player';
        
        // Mostrar batalla actualizada
        await this.showBattleEmbed(interaction, battle);
    }
    
    /**
     * Procesa una acción de habilidad del jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {string} battleId - ID de la batalla
     */
    async processSkill(interaction, battleId) {
        // Implementación básica - mostrar menú de selección de habilidades
        await interaction.reply({
            content: 'Funcionalidad de habilidades en desarrollo. Por ahora, usa el ataque básico.',
            ephemeral: true
        });
    }
    
    /**
     * Procesa una acción de uso de objeto del jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {string} battleId - ID de la batalla
     */
    async processItem(interaction, battleId) {
        // Implementación básica - mostrar menú de selección de objetos
        await interaction.reply({
            content: 'Funcionalidad de objetos en desarrollo. Por ahora, usa el ataque básico.',
            ephemeral: true
        });
    }
    
    /**
     * Procesa una acción de huida del jugador
     * @param {Object} interaction - Interacción de Discord
     * @param {string} battleId - ID de la batalla
     */
    async processFlee(interaction, battleId) {
        const userId = interaction.user.id;
        const battle = this.activeBattles.get(userId);
        
        if (!battle || battle.id !== battleId || battle.status !== 'active') {
            await interaction.reply({ content: 'Esta batalla ya no está activa.', ephemeral: true });
            return;
        }
        
        await interaction.deferUpdate();
        
        // Calcular probabilidad de huida (basada en velocidad del jugador vs enemigo)
        const playerSpeed = battle.player.stats.speed;
        const enemySpeed = battle.enemy.speed;
        
        const fleeChance = Math.min(0.8, 0.5 + (playerSpeed - enemySpeed) * 0.03);
        
        if (Math.random() < fleeChance) {
            // Huida exitosa
            battle.log.push(`${battle.player.name} ha huido con éxito.`);
            await this.endBattle(interaction, battle, 'fled');
        } else {
            // Huida fallida
            battle.log.push(`${battle.player.name} intentó huir pero no lo consiguió.`);
            
            // Cambiar turno al enemigo
            battle.currentTurn = 'enemy';
            
            // Mostrar batalla actualizada
            await this.showBattleEmbed(interaction, battle);
            
            // Procesar turno del enemigo después de un breve retraso
            setTimeout(() => this.processEnemyTurn(interaction, battle), 1500);
        }
    }
    
    /**
     * Finaliza una batalla
     * @param {Object} interaction - Interacción de Discord
     * @param {Object} battle - Datos de la batalla
     * @param {string} result - Resultado ('victory', 'defeat', 'fled')
     */
    async endBattle(interaction, battle, result) {
        const userId = battle.player.userId;
        
        // Actualizar estado de la batalla
        battle.status = result;
        battle.endTime = Date.now();
        
        // Calcular recompensas si es victoria
        if (result === 'victory') {
            const enemy = battle.enemy;
            const player = battle.player;
            
            // Experiencia base por nivel del enemigo
            const baseExp = enemy.level * 10;
            
            // Modificador por rareza del enemigo
            const rarityMultiplier = {
                'Común': 1,
                'Poco común': 1.2,
                'Raro': 1.5,
                'Épico': 2,
                'Legendario': 3,
                'Mítico': 5
            }[enemy.rarity || 'Común'];
            
            // Experiencia total
            const experience = Math.floor(baseExp * rarityMultiplier);
            
            // Oro base por nivel del enemigo
            const baseGold = enemy.level * 5;
            
            // Oro total (con variación aleatoria)
            const gold = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
            
            // Objetos (implementación básica)
            const items = [];
            
            // Guardar recompensas en la batalla
            battle.rewards = { experience, gold, items };
            
            // Actualizar jugador en la base de datos
            try {
                // Obtener datos actualizados del jugador
                const updatedPlayer = await this.gameManager.getPlayer(userId);
                
                // Actualizar experiencia y oro
                updatedPlayer.experience += experience;
                updatedPlayer.inventory.gold += gold;
                
                // Verificar si sube de nivel
                while (updatedPlayer.experience >= updatedPlayer.experienceToNext) {
                    updatedPlayer.experience -= updatedPlayer.experienceToNext;
                    updatedPlayer.level += 1;
                    updatedPlayer.experienceToNext = Math.floor(100 * Math.pow(1.1, updatedPlayer.level));
                    
                    // Aumentar estadísticas por subida de nivel
                    updatedPlayer.stats.hp += 5;
                    updatedPlayer.stats.mp += 3;
                    updatedPlayer.stats.attack += 2;
                    updatedPlayer.stats.defense += 2;
                    updatedPlayer.stats.speed += 1;
                    
                    // Registrar subida de nivel en el log
                    battle.log.push(`¡${updatedPlayer.name} ha subido al nivel ${updatedPlayer.level}!`);
                }
                
                // Actualizar estadísticas de combate
                updatedPlayer.battle = updatedPlayer.battle || {};
                updatedPlayer.battle.wins = (updatedPlayer.battle.wins || 0) + 1;
                
                // Guardar jugador actualizado
                await this.gameManager.playerDB.savePlayer(updatedPlayer);
                
            } catch (error) {
                console.error('Error al actualizar jugador tras victoria:', error);
            }
        } else if (result === 'defeat') {
            // Actualizar estadísticas de derrota
            try {
                const updatedPlayer = await this.gameManager.getPlayer(userId);
                updatedPlayer.battle = updatedPlayer.battle || {};
                updatedPlayer.battle.losses = (updatedPlayer.battle.losses || 0) + 1;
                await this.gameManager.playerDB.savePlayer(updatedPlayer);
            } catch (error) {
                console.error('Error al actualizar estadísticas de derrota:', error);
            }
        }
        
        // Mostrar batalla actualizada con resultado
        await this.showBattleEmbed(interaction, battle);
        
        // Finalizar sesión de juego
        if (battle.sessionId) {
            this.gameManager.endSession(battle.sessionId);
        }
        
        // Limpiar temporizador
        this.clearBattleTimeout(userId);
        
        // Mantener la batalla en el mapa por un tiempo para referencia
        setTimeout(() => {
            this.activeBattles.delete(userId);
        }, 5 * 60 * 1000); // Eliminar después de 5 minutos
    }
    
    /**
     * Inicia un temporizador para finalizar batallas inactivas
     * @param {string} userId - ID del usuario
     */
    startBattleTimeout(userId) {
        // Limpiar temporizador existente si hay uno
        this.clearBattleTimeout(userId);
        
        // Crear nuevo temporizador
        const timeout = setTimeout(() => {
            const battle = this.activeBattles.get(userId);
            if (battle && battle.status === 'active') {
                // Verificar si ha pasado el tiempo máximo de inactividad
                const timeSinceLastAction = Date.now() - battle.lastActionTime;
                if (timeSinceLastAction >= this.MAX_BATTLE_IDLE_TIME) {
                    // Finalizar batalla por inactividad
                    battle.log.push('Batalla finalizada por inactividad.');
                    battle.status = 'defeat';
                    battle.endTime = Date.now();
                    
                    // Eliminar batalla después de un tiempo
                    setTimeout(() => {
                        this.activeBattles.delete(userId);
                    }, 5 * 60 * 1000);
                    
                    // Finalizar sesión de juego
                    if (battle.sessionId) {
                        this.gameManager.endSession(battle.sessionId);
                    }
                } else {
                    // Reiniciar temporizador
                    this.startBattleTimeout(userId);
                }
            }
        }, this.MAX_BATTLE_IDLE_TIME);
        
        // Guardar referencia al temporizador
        this.battleTimeouts.set(userId, timeout);
    }
    
    /**
     * Limpia el temporizador de batalla de un usuario
     * @param {string} userId - ID del usuario
     */
    clearBattleTimeout(userId) {
        const timeout = this.battleTimeouts.get(userId);
        if (timeout) {
            clearTimeout(timeout);
            this.battleTimeouts.delete(userId);
        }
    }
    
    /**
     * Maneja la interacción con botones de batalla
     * @param {Object} interaction - Interacción de botón
     * @returns {boolean} True si la interacción fue manejada, false en caso contrario
     */
    async handleButtonInteraction(interaction) {
        const customId = interaction.customId;
        
        // Verificar si es un botón de batalla
        if (!customId.startsWith('battle_')) return false;
        
        const [prefix, action, battleId] = customId.split('_');
        const userId = interaction.user.id;
        
        // Verificar que el usuario tiene una batalla activa
        const battle = this.activeBattles.get(userId);
        if (!battle || battle.id !== battleId) {
            await interaction.reply({ content: 'Esta batalla ya no está activa.', ephemeral: true });
            return true;
        }
        
        // Manejar diferentes acciones
        switch (action) {
            case 'attack':
                await this.processAttack(interaction, battleId);
                break;
            case 'skill':
                await this.processSkill(interaction, battleId);
                break;
            case 'item':
                await this.processItem(interaction, battleId);
                break;
            case 'flee':
                await this.processFlee(interaction, battleId);
                break;
            case 'continue':
                // Eliminar la batalla y redirigir al jugador
                this.activeBattles.delete(userId);
                await interaction.update({ content: 'Batalla finalizada.', embeds: [], components: [] });
                break;
            default:
                return false;
        }
        
        return true;
    }
}

module.exports = CombatSystem;