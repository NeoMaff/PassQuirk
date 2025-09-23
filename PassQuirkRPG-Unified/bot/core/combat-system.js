// ⚔️ COMBAT SYSTEM - Sistema de Combate Épico de PassQuirk RPG
// Inspirado en Solo Leveling y sistemas de combate por turnos épicos

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { classSystem } = require('./class-system');
const { worldEngine } = require('./world-engine');

/**
 * 👹 Definición de enemigos por rareza y región
 */
const ENEMY_TEMPLATES = {
    // 🟢 ENEMIGOS COMUNES (Nivel 1-25)
    common: {
        slime: {
            name: 'Slime',
            emoji: '🟢',
            description: 'Una criatura gelatinosa básica',
            baseStats: { hp: 30, attack: 8, defense: 3, speed: 5 },
            levelMultiplier: 1.2,
            skills: ['bounce_attack'],
            loot: {
                coins: [5, 15],
                exp: [10, 25],
                items: ['slime_gel']
            },
            weaknesses: ['fire', 'ice'],
            resistances: ['physical']
        },
        goblin: {
            name: 'Goblin',
            emoji: '👺',
            description: 'Un pequeño humanoide agresivo',
            baseStats: { hp: 45, attack: 12, defense: 6, speed: 8 },
            levelMultiplier: 1.3,
            skills: ['slash', 'dirty_trick'],
            loot: {
                coins: [8, 20],
                exp: [15, 30],
                items: ['rusty_dagger', 'goblin_ear']
            },
            weaknesses: ['light'],
            resistances: ['dark']
        },
        wild_wolf: {
            name: 'Lobo Salvaje',
            emoji: '🐺',
            description: 'Un depredador feroz del bosque',
            baseStats: { hp: 60, attack: 15, defense: 8, speed: 12 },
            levelMultiplier: 1.4,
            skills: ['bite', 'howl'],
            loot: {
                coins: [10, 25],
                exp: [20, 35],
                items: ['wolf_fang', 'wolf_pelt']
            },
            weaknesses: ['fire'],
            resistances: ['ice']
        }
    },

    // 🔵 ENEMIGOS POCO COMUNES (Nivel 20-50)
    uncommon: {
        orc_warrior: {
            name: 'Guerrero Orco',
            emoji: '👹',
            description: 'Un guerrero orco con armadura pesada',
            baseStats: { hp: 120, attack: 25, defense: 18, speed: 6 },
            levelMultiplier: 1.5,
            skills: ['heavy_strike', 'war_cry', 'shield_bash'],
            loot: {
                coins: [25, 50],
                exp: [40, 80],
                items: ['orc_axe', 'iron_armor_piece']
            },
            weaknesses: ['magic'],
            resistances: ['physical']
        },
        ice_elemental: {
            name: 'Elemental de Hielo',
            emoji: '❄️',
            description: 'Un ser de hielo puro y magia fría',
            baseStats: { hp: 100, attack: 30, defense: 12, speed: 10 },
            levelMultiplier: 1.6,
            skills: ['ice_shard', 'freeze', 'blizzard'],
            loot: {
                coins: [30, 60],
                exp: [50, 90],
                items: ['ice_crystal', 'frozen_core']
            },
            weaknesses: ['fire'],
            resistances: ['ice', 'water']
        }
    },

    // 🟡 ENEMIGOS RAROS (Nivel 45-75)
    rare: {
        shadow_assassin: {
            name: 'Asesino de las Sombras',
            emoji: '🥷',
            description: 'Un asesino que se mueve entre las sombras',
            baseStats: { hp: 150, attack: 45, defense: 15, speed: 25 },
            levelMultiplier: 1.7,
            skills: ['shadow_strike', 'vanish', 'poison_blade', 'critical_hit'],
            loot: {
                coins: [50, 100],
                exp: [80, 150],
                items: ['shadow_blade', 'stealth_cloak']
            },
            weaknesses: ['light'],
            resistances: ['dark', 'poison']
        },
        crystal_golem: {
            name: 'Gólem de Cristal',
            emoji: '💎',
            description: 'Un guardián de cristal con poder ancestral',
            baseStats: { hp: 300, attack: 35, defense: 40, speed: 5 },
            levelMultiplier: 1.8,
            skills: ['crystal_slam', 'reflect_magic', 'crystal_rain'],
            loot: {
                coins: [75, 150],
                exp: [100, 200],
                items: ['crystal_shard', 'golem_core']
            },
            weaknesses: ['sonic'],
            resistances: ['physical', 'magic']
        }
    },

    // 🟣 ENEMIGOS ÉPICOS (Nivel 70-100)
    epic: {
        dragon_whelp: {
            name: 'Dragón Joven',
            emoji: '🐲',
            description: 'Un dragón joven pero ya poderoso',
            baseStats: { hp: 500, attack: 60, defense: 35, speed: 15 },
            levelMultiplier: 2.0,
            skills: ['fire_breath', 'wing_attack', 'dragon_roar', 'flame_aura'],
            loot: {
                coins: [100, 250],
                exp: [200, 400],
                items: ['dragon_scale', 'fire_gem', 'dragon_claw']
            },
            weaknesses: ['ice'],
            resistances: ['fire', 'physical']
        },
        void_wraith: {
            name: 'Espectro del Vacío',
            emoji: '👻',
            description: 'Una entidad del vacío que consume la realidad',
            baseStats: { hp: 400, attack: 70, defense: 20, speed: 30 },
            levelMultiplier: 2.2,
            skills: ['void_drain', 'phase_shift', 'reality_tear', 'soul_steal'],
            loot: {
                coins: [150, 300],
                exp: [250, 500],
                items: ['void_essence', 'spectral_cloth']
            },
            weaknesses: ['light', 'holy'],
            resistances: ['dark', 'void', 'physical']
        }
    },

    // 🔴 JEFES LEGENDARIOS (Nivel 90+)
    legendary: {
        ancient_dragon: {
            name: 'Dragón Ancestral',
            emoji: '🔥',
            description: 'Un dragón milenario con poder devastador',
            baseStats: { hp: 1000, attack: 100, defense: 60, speed: 20 },
            levelMultiplier: 2.5,
            skills: ['inferno_breath', 'meteor_strike', 'dragon_fury', 'ancient_magic'],
            loot: {
                coins: [500, 1000],
                exp: [1000, 2000],
                items: ['ancient_scale', 'dragon_heart', 'legendary_gem']
            },
            weaknesses: ['ice', 'holy'],
            resistances: ['fire', 'dark', 'physical']
        },
        void_emperor: {
            name: 'Emperador del Vacío',
            emoji: '👑',
            description: 'El señor supremo del vacío infinito',
            baseStats: { hp: 2000, attack: 150, defense: 80, speed: 25 },
            levelMultiplier: 3.0,
            skills: ['reality_collapse', 'void_storm', 'dimension_rift', 'absolute_zero'],
            loot: {
                coins: [1000, 2000],
                exp: [2000, 5000],
                items: ['void_crown', 'reality_fragment', 'emperor_essence']
            },
            weaknesses: ['creation', 'light'],
            resistances: ['void', 'dark', 'all_elements']
        }
    }
};

/**
 * ⚔️ Habilidades de combate disponibles
 */
const COMBAT_SKILLS = {
    // Habilidades básicas
    attack: {
        name: 'Ataque',
        description: 'Un ataque básico',
        type: 'physical',
        power: 1.0,
        accuracy: 95,
        cost: 0
    },
    
    // Habilidades de enemigos
    bounce_attack: {
        name: 'Ataque Rebote',
        description: 'El slime rebota para atacar',
        type: 'physical',
        power: 0.8,
        accuracy: 90,
        cost: 0
    },
    
    fire_breath: {
        name: 'Aliento de Fuego',
        description: 'Exhala llamas devastadoras',
        type: 'fire',
        power: 1.5,
        accuracy: 85,
        cost: 0,
        effects: ['burn']
    },
    
    ice_shard: {
        name: 'Fragmento de Hielo',
        description: 'Lanza proyectiles de hielo',
        type: 'ice',
        power: 1.2,
        accuracy: 90,
        cost: 0,
        effects: ['freeze']
    },
    
    shadow_strike: {
        name: 'Golpe Sombra',
        description: 'Ataque desde las sombras',
        type: 'dark',
        power: 1.3,
        accuracy: 95,
        cost: 0,
        effects: ['critical_chance']
    }
};

/**
 * 🎮 Efectos de estado en combate
 */
const STATUS_EFFECTS = {
    burn: {
        name: 'Quemadura',
        emoji: '🔥',
        description: 'Recibe daño de fuego cada turno',
        duration: 3,
        effect: 'damage_over_time',
        value: 0.1 // 10% del ataque que lo causó
    },
    
    freeze: {
        name: 'Congelado',
        emoji: '❄️',
        description: 'No puede actuar por un turno',
        duration: 1,
        effect: 'skip_turn',
        value: 1
    },
    
    poison: {
        name: 'Envenenado',
        emoji: '☠️',
        description: 'Pierde vida gradualmente',
        duration: 5,
        effect: 'damage_over_time',
        value: 0.05
    },
    
    buff_attack: {
        name: 'Fuerza',
        emoji: '💪',
        description: 'Ataque aumentado',
        duration: 3,
        effect: 'stat_modifier',
        stat: 'attack',
        value: 1.5
    },
    
    buff_defense: {
        name: 'Defensa',
        emoji: '🛡️',
        description: 'Defensa aumentada',
        duration: 3,
        effect: 'stat_modifier',
        stat: 'defense',
        value: 1.5
    }
};

/**
 * ⚔️ Clase principal del sistema de combate
 */
class CombatSystem {
    constructor() {
        this.activeBattles = new Map();
        this.enemyTemplates = ENEMY_TEMPLATES;
        this.combatSkills = COMBAT_SKILLS;
        this.statusEffects = STATUS_EFFECTS;
    }

    /**
     * 🎲 Genera un enemigo basado en la región y nivel del jugador
     */
    generateEnemy(regionId, playerLevel, rarity = null) {
        // Determinar rareza si no se especifica
        if (!rarity) {
            rarity = this.determineEnemyRarity(playerLevel);
        }
        
        const enemyPool = this.enemyTemplates[rarity];
        if (!enemyPool) return null;
        
        const enemyTypes = Object.keys(enemyPool);
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const template = enemyPool[randomType];
        
        // Calcular nivel del enemigo (±3 niveles del jugador)
        const enemyLevel = Math.max(1, playerLevel + Math.floor(Math.random() * 7) - 3);
        
        // Crear instancia del enemigo
        const enemy = {
            id: `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: template.name,
            emoji: template.emoji,
            description: template.description,
            level: enemyLevel,
            rarity: rarity,
            region: regionId,
            
            // Calcular estadísticas escaladas
            stats: this.scaleEnemyStats(template.baseStats, enemyLevel, template.levelMultiplier),
            maxHp: 0, // Se calculará después
            currentHp: 0,
            
            skills: [...template.skills],
            weaknesses: [...template.weaknesses],
            resistances: [...template.resistances],
            statusEffects: [],
            
            loot: template.loot
        };
        
        // Establecer HP máximo y actual
        enemy.maxHp = enemy.stats.hp;
        enemy.currentHp = enemy.stats.hp;
        
        return enemy;
    }

    /**
     * 📊 Escala las estadísticas del enemigo según su nivel
     */
    scaleEnemyStats(baseStats, level, multiplier) {
        const scaledStats = {};
        
        Object.keys(baseStats).forEach(stat => {
            scaledStats[stat] = Math.floor(baseStats[stat] * Math.pow(multiplier, level - 1));
        });
        
        return scaledStats;
    }

    /**
     * 🎯 Determina la rareza del enemigo basada en el nivel del jugador
     */
    determineEnemyRarity(playerLevel) {
        const rand = Math.random();
        
        if (playerLevel < 20) {
            return rand < 0.8 ? 'common' : 'uncommon';
        } else if (playerLevel < 50) {
            if (rand < 0.5) return 'common';
            if (rand < 0.85) return 'uncommon';
            return 'rare';
        } else if (playerLevel < 80) {
            if (rand < 0.3) return 'uncommon';
            if (rand < 0.7) return 'rare';
            return 'epic';
        } else {
            if (rand < 0.2) return 'rare';
            if (rand < 0.6) return 'epic';
            return 'legendary';
        }
    }

    /**
     * ⚔️ Inicia una batalla entre jugador y enemigo
     */
    startBattle(playerId, playerData, enemy) {
        const battleId = `battle_${playerId}_${Date.now()}`;
        
        const battle = {
            id: battleId,
            playerId: playerId,
            player: {
                ...playerData,
                currentHp: playerData.hp || 100,
                maxHp: playerData.hp || 100,
                statusEffects: []
            },
            enemy: enemy,
            turn: 1,
            currentTurn: 'player', // 'player' o 'enemy'
            battleLog: [],
            startTime: new Date(),
            status: 'active' // 'active', 'victory', 'defeat', 'fled'
        };
        
        this.activeBattles.set(battleId, battle);
        
        // Agregar mensaje inicial al log
        this.addToBattleLog(battle, `🎯 ¡${enemy.emoji} ${enemy.name} (Lv.${enemy.level}) aparece!`);
        
        return battle;
    }

    /**
     * 🎮 Procesa una acción del jugador en combate
     */
    processPlayerAction(battleId, action, target = null) {
        const battle = this.activeBattles.get(battleId);
        if (!battle || battle.status !== 'active' || battle.currentTurn !== 'player') {
            return { success: false, message: 'No es tu turno o la batalla no está activa' };
        }
        
        let result = { success: true, message: '', battleEnded: false };
        
        switch (action.type) {
            case 'attack':
                result = this.executeAttack(battle, 'player', action.skill || 'attack');
                break;
            case 'defend':
                result = this.executeDefend(battle, 'player');
                break;
            case 'use_item':
                result = this.executeUseItem(battle, 'player', action.item);
                break;
            case 'flee':
                result = this.executeFlee(battle);
                break;
            default:
                result = { success: false, message: 'Acción no válida' };
        }
        
        if (result.success && !result.battleEnded) {
            // Cambiar turno al enemigo
            battle.currentTurn = 'enemy';
            
            // Procesar turno del enemigo automáticamente
            setTimeout(() => {
                this.processEnemyTurn(battleId);
            }, 2000); // 2 segundos de delay para dramatismo
        }
        
        return result;
    }

    /**
     * 🤖 Procesa el turno del enemigo (IA)
     */
    processEnemyTurn(battleId) {
        const battle = this.activeBattles.get(battleId);
        if (!battle || battle.status !== 'active' || battle.currentTurn !== 'enemy') {
            return;
        }
        
        // IA simple: elegir acción basada en la situación
        const enemyAction = this.determineEnemyAction(battle);
        
        let result;
        switch (enemyAction.type) {
            case 'attack':
                result = this.executeAttack(battle, 'enemy', enemyAction.skill);
                break;
            case 'special':
                result = this.executeSpecialAbility(battle, 'enemy', enemyAction.ability);
                break;
        }
        
        if (!result.battleEnded) {
            // Cambiar turno al jugador
            battle.currentTurn = 'player';
            battle.turn++;
            
            // Procesar efectos de estado
            this.processStatusEffects(battle);
        }
    }

    /**
     * 🧠 Determina la acción del enemigo usando IA básica
     */
    determineEnemyAction(battle) {
        const enemy = battle.enemy;
        const playerHpPercent = battle.player.currentHp / battle.player.maxHp;
        
        // Si el jugador tiene poca vida, atacar agresivamente
        if (playerHpPercent < 0.3 && Math.random() < 0.8) {
            const strongSkills = enemy.skills.filter(skill => 
                this.combatSkills[skill] && this.combatSkills[skill].power > 1.2
            );
            
            if (strongSkills.length > 0) {
                return {
                    type: 'attack',
                    skill: strongSkills[Math.floor(Math.random() * strongSkills.length)]
                };
            }
        }
        
        // Acción aleatoria normal
        const availableSkills = enemy.skills.filter(skill => this.combatSkills[skill]);
        const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
        
        return {
            type: 'attack',
            skill: randomSkill || 'attack'
        };
    }

    /**
     * ⚔️ Ejecuta un ataque en combate
     */
    executeAttack(battle, attacker, skillName) {
        const skill = this.combatSkills[skillName] || this.combatSkills.attack;
        const isPlayer = attacker === 'player';
        const attackerData = isPlayer ? battle.player : battle.enemy;
        const defenderData = isPlayer ? battle.enemy : battle.player;
        
        // Calcular precisión
        const hitChance = skill.accuracy + (attackerData.stats?.agility || 0) - (defenderData.stats?.speed || 0);
        const hit = Math.random() * 100 < hitChance;
        
        if (!hit) {
            const message = `${isPlayer ? '🎯' : attackerData.emoji} ${attackerData.name || 'Tú'} usa ${skill.name} pero falla!`;
            this.addToBattleLog(battle, message);
            return { success: true, message, damage: 0 };
        }
        
        // Calcular daño base
        const baseAttack = attackerData.stats?.attack || attackerData.attack || 10;
        const baseDamage = Math.floor(baseAttack * skill.power);
        
        // Aplicar defensa
        const defense = defenderData.stats?.defense || defenderData.defense || 0;
        let finalDamage = Math.max(1, baseDamage - Math.floor(defense * 0.5));
        
        // Verificar crítico
        const critChance = 5 + (attackerData.stats?.luck || 0);
        const isCritical = Math.random() * 100 < critChance;
        if (isCritical) {
            finalDamage = Math.floor(finalDamage * 1.5);
        }
        
        // Aplicar resistencias y debilidades
        const effectiveness = this.calculateTypeEffectiveness(skill.type, defenderData);
        finalDamage = Math.floor(finalDamage * effectiveness);
        
        // Aplicar daño
        defenderData.currentHp = Math.max(0, defenderData.currentHp - finalDamage);
        
        // Crear mensaje de combate
        let message = `${isPlayer ? '🎯' : attackerData.emoji} ${attackerData.name || 'Tú'} usa ${skill.name}!`;
        if (isCritical) message += ' ¡CRÍTICO!';
        if (effectiveness > 1) message += ' ¡Es súper efectivo!';
        if (effectiveness < 1) message += ' No es muy efectivo...';
        message += ` (${finalDamage} daño)`;
        
        this.addToBattleLog(battle, message);
        
        // Aplicar efectos de estado si los hay
        if (skill.effects) {
            skill.effects.forEach(effect => {
                this.applyStatusEffect(defenderData, effect);
            });
        }
        
        // Verificar si la batalla terminó
        const battleEnded = this.checkBattleEnd(battle);
        
        return {
            success: true,
            message,
            damage: finalDamage,
            critical: isCritical,
            effectiveness,
            battleEnded
        };
    }

    /**
     * 🛡️ Ejecuta una acción de defensa
     */
    executeDefend(battle, defender) {
        const isPlayer = defender === 'player';
        const defenderData = isPlayer ? battle.player : battle.enemy;
        
        // Aplicar buff de defensa temporal
        this.applyStatusEffect(defenderData, 'buff_defense');
        
        const message = `${isPlayer ? '🛡️ Tú' : defenderData.emoji + ' ' + defenderData.name} adopta una postura defensiva!`;
        this.addToBattleLog(battle, message);
        
        return { success: true, message, battleEnded: false };
    }

    /**
     * 🏃 Ejecuta un intento de huida
     */
    executeFlee(battle) {
        const fleeChance = 50 + (battle.player.stats?.agility || 0) - (battle.enemy.stats?.speed || 0);
        const success = Math.random() * 100 < fleeChance;
        
        if (success) {
            battle.status = 'fled';
            this.addToBattleLog(battle, '🏃 ¡Logras escapar de la batalla!');
            return { success: true, message: 'Escapaste exitosamente', battleEnded: true };
        } else {
            this.addToBattleLog(battle, '🏃 ¡No puedes escapar!');
            return { success: true, message: 'No pudiste escapar', battleEnded: false };
        }
    }

    /**
     * 🧪 Calcula la efectividad de tipo (fuego vs hielo, etc.)
     */
    calculateTypeEffectiveness(attackType, defender) {
        if (!attackType || attackType === 'physical') return 1.0;
        
        // Verificar debilidades
        if (defender.weaknesses && defender.weaknesses.includes(attackType)) {
            return 1.5;
        }
        
        // Verificar resistencias
        if (defender.resistances && defender.resistances.includes(attackType)) {
            return 0.75;
        }
        
        return 1.0;
    }

    /**
     * 🌟 Aplica un efecto de estado a un combatiente
     */
    applyStatusEffect(target, effectName) {
        const effectTemplate = this.statusEffects[effectName];
        if (!effectTemplate) return;
        
        const effect = {
            ...effectTemplate,
            remainingDuration: effectTemplate.duration,
            appliedAt: Date.now()
        };
        
        // Verificar si ya tiene el efecto (renovar duración)
        const existingIndex = target.statusEffects.findIndex(e => e.name === effect.name);
        if (existingIndex >= 0) {
            target.statusEffects[existingIndex] = effect;
        } else {
            target.statusEffects.push(effect);
        }
    }

    /**
     * ⏰ Procesa todos los efectos de estado activos
     */
    processStatusEffects(battle) {
        [battle.player, battle.enemy].forEach(combatant => {
            combatant.statusEffects = combatant.statusEffects.filter(effect => {
                // Aplicar efecto
                switch (effect.effect) {
                    case 'damage_over_time':
                        const damage = Math.floor((combatant.maxHp || 100) * effect.value);
                        combatant.currentHp = Math.max(0, combatant.currentHp - damage);
                        this.addToBattleLog(battle, 
                            `${effect.emoji} ${combatant.name || 'Tú'} recibe ${damage} daño por ${effect.name}`);
                        break;
                    
                    case 'skip_turn':
                        // Este efecto se maneja en el procesamiento de turnos
                        break;
                }
                
                // Reducir duración
                effect.remainingDuration--;
                
                // Remover si expiró
                if (effect.remainingDuration <= 0) {
                    this.addToBattleLog(battle, 
                        `${combatant.name || 'Tú'} se recupera de ${effect.name}`);
                    return false;
                }
                
                return true;
            });
        });
        
        // Verificar si la batalla terminó por efectos de estado
        this.checkBattleEnd(battle);
    }

    /**
     * 🏁 Verifica si la batalla ha terminado
     */
    checkBattleEnd(battle) {
        if (battle.player.currentHp <= 0) {
            battle.status = 'defeat';
            this.addToBattleLog(battle, '💀 Has sido derrotado...');
            this.endBattle(battle);
            return true;
        }
        
        if (battle.enemy.currentHp <= 0) {
            battle.status = 'victory';
            this.addToBattleLog(battle, '🎉 ¡Victoria! Has derrotado al enemigo!');
            this.calculateRewards(battle);
            this.endBattle(battle);
            return true;
        }
        
        return false;
    }

    /**
     * 🎁 Calcula las recompensas de la batalla
     */
    calculateRewards(battle) {
        if (battle.status !== 'victory') return null;
        
        const enemy = battle.enemy;
        const loot = enemy.loot;
        
        // Calcular recompensas base
        const baseCoins = loot.coins[0] + Math.random() * (loot.coins[1] - loot.coins[0]);
        const baseExp = loot.exp[0] + Math.random() * (loot.exp[1] - loot.exp[0]);
        
        // Aplicar multiplicadores por rareza
        const rarityMultipliers = {
            common: 1.0,
            uncommon: 1.2,
            rare: 1.5,
            epic: 2.0,
            legendary: 3.0
        };
        
        const multiplier = rarityMultipliers[enemy.rarity] || 1.0;
        
        const rewards = {
            coins: Math.floor(baseCoins * multiplier),
            exp: Math.floor(baseExp * multiplier),
            items: []
        };
        
        // Determinar objetos obtenidos
        if (loot.items && loot.items.length > 0) {
            loot.items.forEach(item => {
                const dropChance = this.getItemDropChance(enemy.rarity);
                if (Math.random() < dropChance) {
                    rewards.items.push(item);
                }
            });
        }
        
        battle.rewards = rewards;
        
        // Agregar al log
        this.addToBattleLog(battle, `💰 Recompensas: ${rewards.coins} monedas, ${rewards.exp} EXP`);
        if (rewards.items.length > 0) {
            this.addToBattleLog(battle, `🎁 Objetos obtenidos: ${rewards.items.join(', ')}`);
        }
        
        return rewards;
    }

    /**
     * 🎲 Obtiene la probabilidad de drop de objetos según rareza
     */
    getItemDropChance(rarity) {
        const dropChances = {
            common: 0.3,
            uncommon: 0.4,
            rare: 0.6,
            epic: 0.8,
            legendary: 0.9
        };
        
        return dropChances[rarity] || 0.3;
    }

    /**
     * 🏁 Finaliza una batalla
     */
    endBattle(battle) {
        battle.endTime = new Date();
        battle.duration = battle.endTime - battle.startTime;
        
        // La batalla se mantiene en memoria por un tiempo para consultas
        setTimeout(() => {
            this.activeBattles.delete(battle.id);
        }, 300000); // 5 minutos
    }

    /**
     * 📝 Agrega un mensaje al log de batalla
     */
    addToBattleLog(battle, message) {
        battle.battleLog.push({
            message,
            timestamp: new Date(),
            turn: battle.turn
        });
    }

    /**
     * 🔍 Obtiene una batalla activa
     */
    getBattle(battleId) {
        return this.activeBattles.get(battleId);
    }

    /**
     * 📊 Genera un embed con el estado actual de la batalla
     */
    generateBattleEmbed(battleId) {
        const battle = this.getBattle(battleId);
        if (!battle) return null;
        
        const player = battle.player;
        const enemy = battle.enemy;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`⚔️ Batalla - Turno ${battle.turn}`)
            .setDescription(`${enemy.emoji} **${enemy.name}** (Lv.${enemy.level})\n${enemy.description}`)
            .setColor(this.getBattleColor(battle.status))
            .addField('🎯 Tu Estado', 
                `❤️ HP: ${player.currentHp}/${player.maxHp}\n` +
                `⚔️ ATK: ${player.stats?.attack || player.attack || 10}\n` +
                `🛡️ DEF: ${player.stats?.defense || player.defense || 5}\n` +
                `⚡ AGI: ${player.stats?.agility || player.agility || 5}`, true)
            .addField(`${enemy.emoji} Estado del Enemigo`,
                `❤️ HP: ${enemy.currentHp}/${enemy.maxHp}\n` +
                `⚔️ ATK: ${enemy.stats.attack}\n` +
                `🛡️ DEF: ${enemy.stats.defense}\n` +
                `⚡ SPD: ${enemy.stats.speed}`, true)
            .addField('📜 Últimas Acciones',
                battle.battleLog.slice(-3).map(log => log.message).join('\n') || 'La batalla comienza...');
        
        // Agregar efectos de estado si los hay
        const playerEffects = player.statusEffects.map(e => e.emoji + e.name).join(' ');
        const enemyEffects = enemy.statusEffects.map(e => e.emoji + e.name).join(' ');
        
        if (playerEffects || enemyEffects) {
            embed.addField('🌟 Efectos Activos',
                `**Tú:** ${playerEffects || 'Ninguno'}\n` +
                `**${enemy.name}:** ${enemyEffects || 'Ninguno'}`);
        }
        
        return embed;
    }

    /**
     * 🎨 Obtiene el color del embed según el estado de la batalla
     */
    getBattleColor(status) {
        const colors = {
            active: 0xffaa00,
            victory: 0x00ff00,
            defeat: 0xff0000,
            fled: 0x888888
        };
        
        return colors[status] || colors.active;
    }
}

// Crear instancia singleton del sistema de combate
const combatSystem = new CombatSystem();

module.exports = {
    CombatSystem,
    combatSystem,
    ENEMY_TEMPLATES,
    COMBAT_SKILLS,
    STATUS_EFFECTS
};