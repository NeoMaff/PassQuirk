// 📈 PROGRESSION SYSTEM - Sistema de Progresión de PassQuirk RPG
// Maneja niveles, experiencia, estadísticas y evolución de personajes

const { PassQuirkEmbed } = require('../utils/embedStyles');
const { classSystem } = require('./class-system');
const { worldEngine } = require('./world-engine');

/**
 * 📊 Curva de experiencia y niveles
 */
const LEVEL_CURVE = {
    // Fórmula: EXP requerida = base * (nivel^exponente) + (nivel * multiplicador)
    base: 100,
    exponent: 1.5,
    multiplier: 50,
    maxLevel: 999
};

/**
 * 🎯 Fuentes de experiencia y sus multiplicadores
 */
const EXP_SOURCES = {
    // Actividades del mundo real
    study: {
        name: 'Estudiar',
        baseExp: 25,
        cooldown: 3600, // 1 hora
        maxDaily: 10,
        description: 'Estudiar cualquier materia o habilidad'
    },
    
    exercise: {
        name: 'Ejercitarse',
        baseExp: 30,
        cooldown: 7200, // 2 horas
        maxDaily: 6,
        description: 'Actividad física o entrenamiento'
    },
    
    work: {
        name: 'Trabajar',
        baseExp: 40,
        cooldown: 14400, // 4 horas
        maxDaily: 3,
        description: 'Trabajo productivo o proyectos'
    },
    
    read: {
        name: 'Leer',
        baseExp: 20,
        cooldown: 1800, // 30 minutos
        maxDaily: 12,
        description: 'Leer libros, artículos o documentos'
    },
    
    create: {
        name: 'Crear',
        baseExp: 35,
        cooldown: 5400, // 1.5 horas
        maxDaily: 8,
        description: 'Actividades creativas como arte, música, escritura'
    },
    
    socialize: {
        name: 'Socializar',
        baseExp: 15,
        cooldown: 3600, // 1 hora
        maxDaily: 8,
        description: 'Interacciones sociales positivas'
    },
    
    meditate: {
        name: 'Meditar',
        baseExp: 20,
        cooldown: 7200, // 2 horas
        maxDaily: 4,
        description: 'Meditación o mindfulness'
    },
    
    learn_skill: {
        name: 'Aprender Habilidad',
        baseExp: 50,
        cooldown: 10800, // 3 horas
        maxDaily: 4,
        description: 'Aprender una nueva habilidad específica'
    },
    
    // Actividades del juego
    combat_victory: {
        name: 'Victoria en Combate',
        baseExp: 100,
        cooldown: 0,
        maxDaily: -1, // Sin límite
        description: 'Ganar batallas contra enemigos'
    },
    
    quest_complete: {
        name: 'Completar Misión',
        baseExp: 150,
        cooldown: 0,
        maxDaily: -1,
        description: 'Completar misiones del juego'
    },
    
    exploration: {
        name: 'Exploración',
        baseExp: 75,
        cooldown: 3600, // 1 hora
        maxDaily: 8,
        description: 'Explorar nuevas regiones'
    },
    
    daily_login: {
        name: 'Conexión Diaria',
        baseExp: 50,
        cooldown: 86400, // 24 horas
        maxDaily: 1,
        description: 'Conectarse al juego diariamente'
    }
};

/**
 * 🏆 Sistema de logros y sus recompensas
 */
const ACHIEVEMENTS = {
    // Logros de nivel
    first_steps: {
        id: 'first_steps',
        name: 'Primeros Pasos',
        description: 'Alcanza el nivel 5',
        condition: { type: 'level', value: 5 },
        rewards: { exp: 100, coins: 50, title: 'Novato' },
        rarity: 'common'
    },
    
    rising_star: {
        id: 'rising_star',
        name: 'Estrella Ascendente',
        description: 'Alcanza el nivel 25',
        condition: { type: 'level', value: 25 },
        rewards: { exp: 500, coins: 250, quirk: 'fast_learner' },
        rarity: 'uncommon'
    },
    
    hero_in_training: {
        id: 'hero_in_training',
        name: 'Héroe en Entrenamiento',
        description: 'Alcanza el nivel 50',
        condition: { type: 'level', value: 50 },
        rewards: { exp: 1000, coins: 500, title: 'Héroe Novato' },
        rarity: 'rare'
    },
    
    legendary_hero: {
        id: 'legendary_hero',
        name: 'Héroe Legendario',
        description: 'Alcanza el nivel 100',
        condition: { type: 'level', value: 100 },
        rewards: { exp: 5000, coins: 2000, quirk: 'phoenix_heart' },
        rarity: 'legendary'
    },
    
    // Logros de combate
    first_victory: {
        id: 'first_victory',
        name: 'Primera Victoria',
        description: 'Gana tu primera batalla',
        condition: { type: 'combat_wins', value: 1 },
        rewards: { exp: 50, coins: 25 },
        rarity: 'common'
    },
    
    monster_slayer: {
        id: 'monster_slayer',
        name: 'Cazador de Monstruos',
        description: 'Derrota 100 enemigos',
        condition: { type: 'combat_wins', value: 100 },
        rewards: { exp: 1000, coins: 500, title: 'Cazador' },
        rarity: 'rare'
    },
    
    boss_hunter: {
        id: 'boss_hunter',
        name: 'Cazador de Jefes',
        description: 'Derrota 10 jefes legendarios',
        condition: { type: 'boss_defeats', value: 10 },
        rewards: { exp: 2000, coins: 1000, quirk: 'iron_will' },
        rarity: 'epic'
    },
    
    // Logros de actividades reales
    dedicated_student: {
        id: 'dedicated_student',
        name: 'Estudiante Dedicado',
        description: 'Estudia 50 veces',
        condition: { type: 'study_count', value: 50 },
        rewards: { exp: 500, coins: 200, title: 'Erudito' },
        rarity: 'uncommon'
    },
    
    fitness_enthusiast: {
        id: 'fitness_enthusiast',
        name: 'Entusiasta del Fitness',
        description: 'Ejercítate 100 veces',
        condition: { type: 'exercise_count', value: 100 },
        rewards: { exp: 750, coins: 300, title: 'Atleta' },
        rarity: 'rare'
    },
    
    creative_soul: {
        id: 'creative_soul',
        name: 'Alma Creativa',
        description: 'Realiza 75 actividades creativas',
        condition: { type: 'create_count', value: 75 },
        rewards: { exp: 600, coins: 250, quirk: 'social_butterfly' },
        rarity: 'uncommon'
    },
    
    // Logros especiales
    streak_master: {
        id: 'streak_master',
        name: 'Maestro de Rachas',
        description: 'Mantén una racha de 30 días',
        condition: { type: 'daily_streak', value: 30 },
        rewards: { exp: 1500, coins: 750, quirk: 'time_management' },
        rarity: 'epic'
    },
    
    social_butterfly: {
        id: 'social_butterfly_achievement',
        name: 'Mariposa Social',
        description: 'Interactúa con 50 usuarios diferentes',
        condition: { type: 'unique_interactions', value: 50 },
        rewards: { exp: 800, coins: 400, title: 'Sociable' },
        rarity: 'rare'
    }
};

/**
 * 🎖️ Títulos disponibles y sus efectos
 */
const TITLES = {
    novato: {
        name: 'Novato',
        description: 'Un nuevo aventurero',
        effects: { exp_bonus: 1.05 },
        rarity: 'common'
    },
    
    erudito: {
        name: 'Erudito',
        description: 'Amante del conocimiento',
        effects: { study_exp_bonus: 1.2 },
        rarity: 'uncommon'
    },
    
    atleta: {
        name: 'Atleta',
        description: 'Maestro del ejercicio físico',
        effects: { exercise_exp_bonus: 1.2 },
        rarity: 'uncommon'
    },
    
    cazador: {
        name: 'Cazador',
        description: 'Experto en combate',
        effects: { combat_exp_bonus: 1.15 },
        rarity: 'rare'
    },
    
    heroe_novato: {
        name: 'Héroe Novato',
        description: 'Un héroe en ascenso',
        effects: { exp_bonus: 1.1, coin_bonus: 1.05 },
        rarity: 'rare'
    },
    
    sociable: {
        name: 'Sociable',
        description: 'Maestro de las relaciones sociales',
        effects: { social_exp_bonus: 1.25 },
        rarity: 'rare'
    }
};

/**
 * 📈 Clase principal del sistema de progresión
 */
class ProgressionSystem {
    constructor() {
        this.levelCurve = LEVEL_CURVE;
        this.expSources = EXP_SOURCES;
        this.achievements = ACHIEVEMENTS;
        this.titles = TITLES;
    }

    /**
     * 🧮 Calcula la experiencia requerida para un nivel específico
     */
    calculateExpForLevel(level) {
        if (level <= 1) return 0;
        
        const { base, exponent, multiplier } = this.levelCurve;
        return Math.floor(base * Math.pow(level, exponent) + (level * multiplier));
    }

    /**
     * 📊 Calcula la experiencia total requerida hasta un nivel
     */
    calculateTotalExpForLevel(level) {
        let totalExp = 0;
        for (let i = 2; i <= level; i++) {
            totalExp += this.calculateExpForLevel(i);
        }
        return totalExp;
    }

    /**
     * 🎯 Determina el nivel basado en la experiencia total
     */
    calculateLevelFromExp(totalExp) {
        let level = 1;
        let expUsed = 0;
        
        while (level < this.levelCurve.maxLevel) {
            const expForNextLevel = this.calculateExpForLevel(level + 1);
            if (expUsed + expForNextLevel > totalExp) {
                break;
            }
            expUsed += expForNextLevel;
            level++;
        }
        
        return {
            level,
            currentExp: totalExp - expUsed,
            expForNext: this.calculateExpForLevel(level + 1),
            totalExp
        };
    }

    /**
     * ⭐ Otorga experiencia a un jugador
     */
    awardExperience(playerData, source, amount = null, multiplier = 1.0) {
        const expSource = this.expSources[source];
        if (!expSource) {
            throw new Error(`Fuente de experiencia no válida: ${source}`);
        }
        
        // Calcular experiencia base
        let baseExp = amount || expSource.baseExp;
        
        // Aplicar multiplicadores de clase
        const classBonus = this.getClassExpBonus(playerData.class, source);
        baseExp *= classBonus;
        
        // Aplicar multiplicadores de título
        const titleBonus = this.getTitleExpBonus(playerData.activeTitle, source);
        baseExp *= titleBonus;
        
        // Aplicar multiplicadores globales del mundo
        baseExp = worldEngine.applyGlobalEffects(baseExp, 'exp');
        
        // Aplicar multiplicador adicional
        const finalExp = Math.floor(baseExp * multiplier);
        
        // Actualizar experiencia del jugador
        const oldLevel = this.calculateLevelFromExp(playerData.totalExp || 0).level;
        playerData.totalExp = (playerData.totalExp || 0) + finalExp;
        const newLevelData = this.calculateLevelFromExp(playerData.totalExp);
        
        // Verificar subida de nivel
        const leveledUp = newLevelData.level > oldLevel;
        const levelsGained = newLevelData.level - oldLevel;
        
        if (leveledUp) {
            this.handleLevelUp(playerData, oldLevel, newLevelData.level);
        }
        
        return {
            expGained: finalExp,
            oldLevel,
            newLevel: newLevelData.level,
            leveledUp,
            levelsGained,
            currentExp: newLevelData.currentExp,
            expForNext: newLevelData.expForNext,
            totalExp: playerData.totalExp
        };
    }

    /**
     * 🎓 Maneja la subida de nivel
     */
    handleLevelUp(playerData, oldLevel, newLevel) {
        console.log(`🎉 ${playerData.username} subió del nivel ${oldLevel} al ${newLevel}!`);
        
        // Actualizar estadísticas
        this.updateStatsOnLevelUp(playerData, oldLevel, newLevel);
        
        // Verificar nuevos Quirks desbloqueados
        this.checkNewQuirks(playerData, newLevel);
        
        // Verificar logros de nivel
        this.checkLevelAchievements(playerData, newLevel);
        
        // Verificar evolución de clase
        this.checkClassEvolution(playerData, newLevel);
        
        // Recompensar subida de nivel
        const levelRewards = this.calculateLevelUpRewards(oldLevel, newLevel);
        playerData.coins = (playerData.coins || 0) + levelRewards.coins;
        
        return levelRewards;
    }

    /**
     * 📊 Actualiza las estadísticas al subir de nivel
     */
    updateStatsOnLevelUp(playerData, oldLevel, newLevel) {
        const levelsGained = newLevel - oldLevel;
        const playerClass = classSystem.getClass(playerData.class);
        
        if (!playerClass) return;
        
        // Aplicar crecimiento de estadísticas
        Object.keys(playerClass.statGrowth).forEach(stat => {
            const growth = playerClass.statGrowth[stat] * levelsGained;
            playerData.stats = playerData.stats || {};
            playerData.stats[stat] = (playerData.stats[stat] || 0) + Math.floor(growth);
        });
        
        // Actualizar HP máximo
        const hpGrowth = (playerClass.statGrowth.strength || 0) * 5 * levelsGained;
        playerData.maxHp = (playerData.maxHp || 100) + Math.floor(hpGrowth);
        playerData.currentHp = playerData.maxHp; // Curar completamente al subir de nivel
    }

    /**
     * 🌟 Verifica nuevos Quirks desbloqueados
     */
    checkNewQuirks(playerData, newLevel) {
        const availableQuirks = classSystem.getAvailableQuirks(playerData.class, newLevel);
        const unlockedQuirks = [];
        
        // Verificar Quirks de clase
        availableQuirks.classQuirks.forEach(quirk => {
            if (quirk.unlockLevel === newLevel) {
                playerData.unlockedQuirks = playerData.unlockedQuirks || [];
                if (!playerData.unlockedQuirks.includes(quirk.name)) {
                    playerData.unlockedQuirks.push(quirk.name);
                    unlockedQuirks.push(quirk);
                }
            }
        });
        
        return unlockedQuirks;
    }

    /**
     * 🏆 Verifica logros de nivel
     */
    checkLevelAchievements(playerData, newLevel) {
        const unlockedAchievements = [];
        
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.condition.type === 'level' && 
                achievement.condition.value === newLevel &&
                !this.hasAchievement(playerData, achievement.id)) {
                
                this.unlockAchievement(playerData, achievement.id);
                unlockedAchievements.push(achievement);
            }
        });
        
        return unlockedAchievements;
    }

    /**
     * 🦋 Verifica si la clase puede evolucionar
     */
    checkClassEvolution(playerData, newLevel) {
        return classSystem.canEvolve(playerData.class, newLevel);
    }

    /**
     * 💰 Calcula recompensas por subir de nivel
     */
    calculateLevelUpRewards(oldLevel, newLevel) {
        const levelsGained = newLevel - oldLevel;
        const baseCoins = 25;
        
        return {
            coins: baseCoins * levelsGained * newLevel,
            hp_restored: true
        };
    }

    /**
     * 🎯 Obtiene bonus de experiencia por clase
     */
    getClassExpBonus(classId, source) {
        const playerClass = classSystem.getClass(classId);
        if (!playerClass || !playerClass.workBonus) return 1.0;
        
        // Mapear fuentes de EXP a tipos de trabajo
        const sourceToWorkType = {
            study: 'research',
            exercise: 'physical_training',
            work: 'general_work',
            create: 'creative_work',
            read: 'research',
            socialize: 'social_work'
        };
        
        const workType = sourceToWorkType[source];
        return workType ? (playerClass.workBonus[workType] || 1.0) : 1.0;
    }

    /**
     * 🏅 Obtiene bonus de experiencia por título
     */
    getTitleExpBonus(titleId, source) {
        if (!titleId) return 1.0;
        
        const title = this.titles[titleId];
        if (!title || !title.effects) return 1.0;
        
        // Verificar bonus específico de la fuente
        const specificBonus = title.effects[`${source}_exp_bonus`];
        if (specificBonus) return specificBonus;
        
        // Verificar bonus general de EXP
        return title.effects.exp_bonus || 1.0;
    }

    /**
     * 🏆 Desbloquea un logro
     */
    unlockAchievement(playerData, achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement) return false;
        
        playerData.achievements = playerData.achievements || [];
        if (playerData.achievements.includes(achievementId)) return false;
        
        playerData.achievements.push(achievementId);
        
        // Aplicar recompensas
        if (achievement.rewards) {
            if (achievement.rewards.exp) {
                playerData.totalExp = (playerData.totalExp || 0) + achievement.rewards.exp;
            }
            if (achievement.rewards.coins) {
                playerData.coins = (playerData.coins || 0) + achievement.rewards.coins;
            }
            if (achievement.rewards.title) {
                playerData.availableTitles = playerData.availableTitles || [];
                if (!playerData.availableTitles.includes(achievement.rewards.title)) {
                    playerData.availableTitles.push(achievement.rewards.title);
                }
            }
            if (achievement.rewards.quirk) {
                playerData.unlockedQuirks = playerData.unlockedQuirks || [];
                if (!playerData.unlockedQuirks.includes(achievement.rewards.quirk)) {
                    playerData.unlockedQuirks.push(achievement.rewards.quirk);
                }
            }
        }
        
        console.log(`🏆 ${playerData.username} desbloqueó el logro: ${achievement.name}`);
        return true;
    }

    /**
     * ✅ Verifica si un jugador tiene un logro específico
     */
    hasAchievement(playerData, achievementId) {
        return playerData.achievements && playerData.achievements.includes(achievementId);
    }

    /**
     * 📊 Verifica y actualiza el progreso de logros
     */
    updateAchievementProgress(playerData, actionType, value = 1) {
        const unlockedAchievements = [];
        
        // Incrementar contador de la acción
        const counterKey = `${actionType}_count`;
        playerData[counterKey] = (playerData[counterKey] || 0) + value;
        
        // Verificar logros relacionados
        Object.values(this.achievements).forEach(achievement => {
            if (achievement.condition.type === counterKey &&
                playerData[counterKey] >= achievement.condition.value &&
                !this.hasAchievement(playerData, achievement.id)) {
                
                this.unlockAchievement(playerData, achievement.id);
                unlockedAchievements.push(achievement);
            }
        });
        
        return unlockedAchievements;
    }

    /**
     * 🎖️ Cambia el título activo del jugador
     */
    setActiveTitle(playerData, titleId) {
        if (!titleId) {
            playerData.activeTitle = null;
            return true;
        }
        
        const title = this.titles[titleId];
        if (!title) return false;
        
        playerData.availableTitles = playerData.availableTitles || [];
        if (!playerData.availableTitles.includes(titleId)) return false;
        
        playerData.activeTitle = titleId;
        return true;
    }

    /**
     * 📈 Genera estadísticas de progresión del jugador
     */
    generateProgressionStats(playerData) {
        const levelData = this.calculateLevelFromExp(playerData.totalExp || 0);
        const nextLevelExp = this.calculateExpForLevel(levelData.level + 1);
        const progressPercent = Math.floor((levelData.currentExp / nextLevelExp) * 100);
        
        return {
            level: levelData.level,
            currentExp: levelData.currentExp,
            expForNext: nextLevelExp,
            totalExp: levelData.totalExp,
            progressPercent,
            achievementsUnlocked: (playerData.achievements || []).length,
            totalAchievements: Object.keys(this.achievements).length,
            quirksUnlocked: (playerData.unlockedQuirks || []).length,
            activeTitle: playerData.activeTitle,
            availableTitles: playerData.availableTitles || []
        };
    }

    /**
     * 🎨 Genera un embed con información de progresión
     */
    generateProgressionEmbed(playerData) {
        const stats = this.generateProgressionStats(playerData);
        const playerClass = classSystem.getClass(playerData.class);
        
        const embed = new PassQuirkEmbed()
            .setTitle(`📈 Progresión de ${playerData.username}`)
            .setDescription(`${playerClass?.emoji || '🎭'} **${playerClass?.name || 'Sin Clase'}** - Nivel ${stats.level}`)
            .setColor(playerClass?.color || 0x00ff00)
            .addField('⭐ Experiencia',
                `**Actual:** ${stats.currentExp.toLocaleString()}/${stats.expForNext.toLocaleString()} EXP\n` +
                `**Total:** ${stats.totalExp.toLocaleString()} EXP\n` +
                `**Progreso:** ${this.generateProgressBar(stats.progressPercent)} ${stats.progressPercent}%`)
            .addField('🏆 Logros',
                `**Desbloqueados:** ${stats.achievementsUnlocked}/${stats.totalAchievements}\n` +
                `**Quirks:** ${stats.quirksUnlocked} únicos`, true)
            .addField('🎖️ Título Activo',
                stats.activeTitle ? 
                    `**${this.titles[stats.activeTitle]?.name || 'Desconocido'}**\n${this.titles[stats.activeTitle]?.description || ''}` :
                    'Ninguno', true);
        
        // Agregar próximos hitos
        const nextMilestones = this.getNextMilestones(playerData, stats.level);
        if (nextMilestones.length > 0) {
            embed.addField('🎯 Próximos Hitos',
                nextMilestones.slice(0, 3).map(milestone => 
                    `**Nivel ${milestone.level}:** ${milestone.description}`
                ).join('\n'));
        }
        
        return embed;
    }

    /**
     * 📊 Genera una barra de progreso visual
     */
    generateProgressBar(percent, length = 10) {
        const filled = Math.floor((percent / 100) * length);
        const empty = length - filled;
        return '█'.repeat(filled) + '░'.repeat(empty);
    }

    /**
     * 🎯 Obtiene los próximos hitos importantes
     */
    getNextMilestones(playerData, currentLevel) {
        const milestones = [];
        
        // Hitos de nivel
        const levelMilestones = [5, 10, 15, 20, 25, 30, 40, 50, 75, 100];
        levelMilestones.forEach(level => {
            if (level > currentLevel) {
                milestones.push({
                    level,
                    type: 'level',
                    description: `Nuevas habilidades y recompensas`
                });
            }
        });
        
        // Hitos de evolución de clase
        if (classSystem.canEvolve(playerData.class, 100) && currentLevel < 100) {
            milestones.push({
                level: 100,
                type: 'evolution',
                description: 'Evolución de clase disponible'
            });
        }
        
        return milestones.sort((a, b) => a.level - b.level);
    }

    /**
     * 🔄 Reinicia el progreso diario
     */
    resetDailyProgress(playerData) {
        playerData.dailyExpSources = {};
        playerData.lastDailyReset = new Date().toDateString();
    }

    /**
     * ✅ Verifica si se puede usar una fuente de EXP
     */
    canUseExpSource(playerData, source) {
        const expSource = this.expSources[source];
        if (!expSource) return false;
        
        const now = Date.now();
        const today = new Date().toDateString();
        
        // Verificar si necesita reset diario
        if (playerData.lastDailyReset !== today) {
            this.resetDailyProgress(playerData);
        }
        
        playerData.dailyExpSources = playerData.dailyExpSources || {};
        playerData.expSourceCooldowns = playerData.expSourceCooldowns || {};
        
        const sourceData = playerData.dailyExpSources[source] || { count: 0, lastUsed: 0 };
        
        // Verificar límite diario
        if (expSource.maxDaily > 0 && sourceData.count >= expSource.maxDaily) {
            return { canUse: false, reason: 'daily_limit', resetTime: 'mañana' };
        }
        
        // Verificar cooldown
        const timeSinceLastUse = now - (sourceData.lastUsed || 0);
        if (timeSinceLastUse < expSource.cooldown * 1000) {
            const remainingTime = (expSource.cooldown * 1000) - timeSinceLastUse;
            return { 
                canUse: false, 
                reason: 'cooldown', 
                remainingTime: Math.ceil(remainingTime / 1000 / 60) // minutos
            };
        }
        
        return { canUse: true };
    }

    /**
     * 📝 Registra el uso de una fuente de EXP
     */
    recordExpSourceUsage(playerData, source) {
        const now = Date.now();
        
        playerData.dailyExpSources = playerData.dailyExpSources || {};
        playerData.dailyExpSources[source] = playerData.dailyExpSources[source] || { count: 0, lastUsed: 0 };
        
        playerData.dailyExpSources[source].count++;
        playerData.dailyExpSources[source].lastUsed = now;
    }
}

// Crear instancia singleton del sistema de progresión
const progressionSystem = new ProgressionSystem();

module.exports = {
    ProgressionSystem,
    progressionSystem,
    LEVEL_CURVE,
    EXP_SOURCES,
    ACHIEVEMENTS,
    TITLES
};