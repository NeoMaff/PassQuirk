// ⚔️ CLASS SYSTEM - Sistema de Clases y Quirks de PassQuirk RPG
// Inspirado en Boku no Hero Academia y Solo Leveling

const { PassQuirkEmbed } = require('../utils/embedStyles');

/**
 * 🎭 Definición de todas las clases disponibles en PassQuirk
 */
const CLASSES = {
    // 🗡️ CLASES DE COMBATE
    warrior: {
        id: 'warrior',
        name: '⚔️ Guerrero',
        description: 'Maestro del combate cuerpo a cuerpo, tanque natural',
        emoji: '⚔️',
        color: 0xff4444,
        category: 'combat',
        baseStats: {
            strength: 8,
            defense: 7,
            agility: 4,
            intelligence: 3,
            luck: 3,
            charisma: 4
        },
        statGrowth: {
            strength: 0.8,
            defense: 0.7,
            agility: 0.3,
            intelligence: 0.2,
            luck: 0.2,
            charisma: 0.3
        },
        quirks: [
            {
                name: 'Furia Berserker',
                description: '+50% daño cuando la vida está por debajo del 30%',
                type: 'passive',
                rarity: 'rare',
                unlockLevel: 10
            },
            {
                name: 'Escudo Inquebrantable',
                description: 'Reduce el daño recibido en un 25% durante 3 turnos',
                type: 'active',
                rarity: 'epic',
                unlockLevel: 25,
                cooldown: 5
            },
            {
                name: 'Golpe Devastador',
                description: 'Ataque que ignora la defensa enemiga',
                type: 'ultimate',
                rarity: 'legendary',
                unlockLevel: 50,
                cooldown: 10
            }
        ],
        workBonus: {
            'physical_training': 1.5,
            'security': 1.3,
            'construction': 1.2
        },
        preferredRegions: ['akai', 'say'],
        evolution: {
            level: 100,
            options: ['paladin', 'berserker', 'guardian']
        }
    },

    mage: {
        id: 'mage',
        name: '🔮 Mago',
        description: 'Maestro de las artes arcanas y la magia elemental',
        emoji: '🔮',
        color: 0x4444ff,
        category: 'magic',
        baseStats: {
            strength: 2,
            defense: 3,
            agility: 5,
            intelligence: 9,
            luck: 6,
            charisma: 4
        },
        statGrowth: {
            strength: 0.1,
            defense: 0.2,
            agility: 0.4,
            intelligence: 0.9,
            luck: 0.5,
            charisma: 0.3
        },
        quirks: [
            {
                name: 'Maestría Elemental',
                description: 'Los hechizos elementales tienen 20% más de efectividad',
                type: 'passive',
                rarity: 'rare',
                unlockLevel: 15
            },
            {
                name: 'Barrera Mágica',
                description: 'Crea un escudo que absorbe daño mágico',
                type: 'active',
                rarity: 'epic',
                unlockLevel: 30,
                cooldown: 4
            },
            {
                name: 'Meteoro Arcano',
                description: 'Invoca un meteoro que causa daño masivo en área',
                type: 'ultimate',
                rarity: 'legendary',
                unlockLevel: 60,
                cooldown: 15
            }
        ],
        workBonus: {
            'research': 1.6,
            'teaching': 1.4,
            'programming': 1.3
        },
        preferredRegions: ['zephyr', 'void'],
        evolution: {
            level: 100,
            options: ['archmage', 'elementalist', 'necromancer']
        }
    },

    rogue: {
        id: 'rogue',
        name: '🗡️ Pícaro',
        description: 'Maestro de las sombras, velocidad y sigilo',
        emoji: '🗡️',
        color: 0x444444,
        category: 'stealth',
        baseStats: {
            strength: 5,
            defense: 4,
            agility: 9,
            intelligence: 6,
            luck: 7,
            charisma: 5
        },
        statGrowth: {
            strength: 0.4,
            defense: 0.3,
            agility: 0.8,
            intelligence: 0.5,
            luck: 0.6,
            charisma: 0.4
        },
        quirks: [
            {
                name: 'Golpe Crítico',
                description: '+15% probabilidad de crítico, +100% daño crítico',
                type: 'passive',
                rarity: 'rare',
                unlockLevel: 12
            },
            {
                name: 'Invisibilidad',
                description: 'Se vuelve invisible por 2 turnos, +50% daño en el siguiente ataque',
                type: 'active',
                rarity: 'epic',
                unlockLevel: 28,
                cooldown: 6
            },
            {
                name: 'Mil Cortes',
                description: 'Realiza múltiples ataques en un solo turno',
                type: 'ultimate',
                rarity: 'legendary',
                unlockLevel: 55,
                cooldown: 12
            }
        ],
        workBonus: {
            'investigation': 1.5,
            'trading': 1.4,
            'exploration': 1.6
        },
        preferredRegions: ['masai', 'void'],
        evolution: {
            level: 100,
            options: ['assassin', 'shadow_dancer', 'trickster']
        }
    },

    // 🛡️ CLASES DE SOPORTE
    healer: {
        id: 'healer',
        name: '💚 Sanador',
        description: 'Maestro de la curación y el apoyo a aliados',
        emoji: '💚',
        color: 0x44ff44,
        category: 'support',
        baseStats: {
            strength: 3,
            defense: 5,
            agility: 4,
            intelligence: 7,
            luck: 5,
            charisma: 8
        },
        statGrowth: {
            strength: 0.2,
            defense: 0.4,
            agility: 0.3,
            intelligence: 0.6,
            luck: 0.4,
            charisma: 0.7
        },
        quirks: [
            {
                name: 'Curación Mejorada',
                description: 'Todas las curaciones son 30% más efectivas',
                type: 'passive',
                rarity: 'rare',
                unlockLevel: 8
            },
            {
                name: 'Bendición Grupal',
                description: 'Otorga buffs a todo el grupo por 5 turnos',
                type: 'active',
                rarity: 'epic',
                unlockLevel: 22,
                cooldown: 8
            },
            {
                name: 'Resurrección',
                description: 'Revive a un aliado caído con 50% de vida',
                type: 'ultimate',
                rarity: 'legendary',
                unlockLevel: 45,
                cooldown: 20
            }
        ],
        workBonus: {
            'healthcare': 1.7,
            'counseling': 1.5,
            'volunteering': 1.4
        },
        preferredRegions: ['akai', 'zephyr'],
        evolution: {
            level: 100,
            options: ['priest', 'druid', 'oracle']
        }
    },

    // 🎯 CLASES ESPECIALES
    scholar: {
        id: 'scholar',
        name: '📚 Erudito',
        description: 'Maestro del conocimiento y la sabiduría antigua',
        emoji: '📚',
        color: 0xffaa00,
        category: 'knowledge',
        baseStats: {
            strength: 2,
            defense: 4,
            agility: 3,
            intelligence: 10,
            luck: 4,
            charisma: 6
        },
        statGrowth: {
            strength: 0.1,
            defense: 0.3,
            agility: 0.2,
            intelligence: 1.0,
            luck: 0.3,
            charisma: 0.5
        },
        quirks: [
            {
                name: 'Conocimiento Ancestral',
                description: '+25% EXP de todas las fuentes',
                type: 'passive',
                rarity: 'epic',
                unlockLevel: 5
            },
            {
                name: 'Análisis Completo',
                description: 'Revela todas las estadísticas y debilidades del enemigo',
                type: 'active',
                rarity: 'rare',
                unlockLevel: 20,
                cooldown: 3
            },
            {
                name: 'Sabiduría Infinita',
                description: 'Acceso temporal a cualquier habilidad de cualquier clase',
                type: 'ultimate',
                rarity: 'mythic',
                unlockLevel: 70,
                cooldown: 25
            }
        ],
        workBonus: {
            'research': 1.8,
            'teaching': 1.6,
            'writing': 1.5,
            'studying': 2.0
        },
        preferredRegions: ['masai', 'void'],
        evolution: {
            level: 100,
            options: ['sage', 'loremaster', 'time_keeper']
        }
    },

    artist: {
        id: 'artist',
        name: '🎨 Artista',
        description: 'Creador de belleza que inspira y motiva',
        emoji: '🎨',
        color: 0xff44aa,
        category: 'creative',
        baseStats: {
            strength: 3,
            defense: 3,
            agility: 6,
            intelligence: 7,
            luck: 6,
            charisma: 9
        },
        statGrowth: {
            strength: 0.2,
            defense: 0.2,
            agility: 0.5,
            intelligence: 0.6,
            luck: 0.5,
            charisma: 0.8
        },
        quirks: [
            {
                name: 'Inspiración Creativa',
                description: 'Los aliados ganan +20% EXP cuando están cerca',
                type: 'passive',
                rarity: 'rare',
                unlockLevel: 10
            },
            {
                name: 'Obra Maestra',
                description: 'Crea una obra que otorga buffs permanentes al grupo',
                type: 'active',
                rarity: 'epic',
                unlockLevel: 35,
                cooldown: 10
            },
            {
                name: 'Realidad Artística',
                description: 'Materializa una creación artística que altera la batalla',
                type: 'ultimate',
                rarity: 'legendary',
                unlockLevel: 65,
                cooldown: 18
            }
        ],
        workBonus: {
            'creative_work': 1.9,
            'design': 1.6,
            'entertainment': 1.4,
            'video_editing': 1.7
        },
        preferredRegions: ['akai', 'zephyr'],
        evolution: {
            level: 100,
            options: ['master_artist', 'reality_painter', 'muse']
        }
    }
};

/**
 * 🌟 Quirks especiales que pueden ser desbloqueados por cualquier clase
 */
const UNIVERSAL_QUIRKS = {
    // Quirks de Rareza Común
    lucky_find: {
        name: 'Hallazgo Afortunado',
        description: '+10% probabilidad de encontrar objetos raros',
        type: 'passive',
        rarity: 'common',
        unlockCondition: 'find_100_items'
    },
    
    fast_learner: {
        name: 'Aprendizaje Rápido',
        description: '+15% EXP de actividades de estudio',
        type: 'passive',
        rarity: 'common',
        unlockCondition: 'study_50_hours'
    },
    
    // Quirks de Rareza Poco Común
    iron_will: {
        name: 'Voluntad de Hierro',
        description: 'Inmune a efectos de miedo y confusión',
        type: 'passive',
        rarity: 'uncommon',
        unlockCondition: 'survive_10_boss_fights'
    },
    
    social_butterfly: {
        name: 'Mariposa Social',
        description: '+25% EXP cuando juegas con otros usuarios',
        type: 'passive',
        rarity: 'uncommon',
        unlockCondition: 'interact_with_50_users'
    },
    
    // Quirks de Rareza Rara
    time_management: {
        name: 'Gestión del Tiempo',
        description: 'Reduce todos los cooldowns en 20%',
        type: 'passive',
        rarity: 'rare',
        unlockCondition: 'complete_100_daily_tasks'
    },
    
    elemental_affinity: {
        name: 'Afinidad Elemental',
        description: 'Resistencia +50% a un elemento aleatorio cada día',
        type: 'passive',
        rarity: 'rare',
        unlockCondition: 'defeat_elemental_bosses'
    },
    
    // Quirks de Rareza Épica
    phoenix_heart: {
        name: 'Corazón de Fénix',
        description: 'Revive automáticamente una vez por combate con 25% de vida',
        type: 'passive',
        rarity: 'epic',
        unlockCondition: 'die_and_revive_10_times'
    },
    
    master_of_all: {
        name: 'Maestro de Todo',
        description: 'Puede usar habilidades básicas de cualquier clase',
        type: 'passive',
        rarity: 'epic',
        unlockCondition: 'reach_level_50_all_classes'
    },
    
    // Quirks de Rareza Legendaria
    reality_bender: {
        name: 'Doblegador de Realidad',
        description: 'Una vez por día, puede cambiar el resultado de cualquier acción',
        type: 'active',
        rarity: 'legendary',
        unlockCondition: 'complete_void_dungeon',
        cooldown: 86400 // 24 horas
    },
    
    one_for_all: {
        name: 'One For All',
        description: 'Acumula poder de todos los usuarios del servidor',
        type: 'ultimate',
        rarity: 'mythic',
        unlockCondition: 'be_chosen_by_server',
        cooldown: 604800 // 7 días
    }
};

/**
 * 🎭 Clase principal del sistema de clases
 */
class ClassSystem {
    constructor() {
        this.classes = CLASSES;
        this.universalQuirks = UNIVERSAL_QUIRKS;
    }

    /**
     * 📋 Obtiene información de una clase específica
     */
    getClass(classId) {
        return this.classes[classId] || null;
    }

    /**
     * 📜 Obtiene todas las clases disponibles
     */
    getAllClasses() {
        return Object.values(this.classes);
    }

    /**
     * 🎯 Obtiene clases por categoría
     */
    getClassesByCategory(category) {
        return Object.values(this.classes).filter(cls => cls.category === category);
    }

    /**
     * 📊 Calcula las estadísticas de un jugador basado en su clase y nivel
     */
    calculatePlayerStats(classId, level, baseStats = {}) {
        const playerClass = this.getClass(classId);
        if (!playerClass) return null;

        const stats = { ...playerClass.baseStats };
        
        // Aplicar crecimiento por nivel
        Object.keys(stats).forEach(stat => {
            const growth = playerClass.statGrowth[stat] || 0;
            stats[stat] += Math.floor(growth * (level - 1));
        });

        // Aplicar bonificaciones base del jugador
        Object.keys(baseStats).forEach(stat => {
            if (stats[stat] !== undefined) {
                stats[stat] += baseStats[stat] || 0;
            }
        });

        return stats;
    }

    /**
     * 🌟 Obtiene los Quirks disponibles para una clase en un nivel específico
     */
    getAvailableQuirks(classId, level) {
        const playerClass = this.getClass(classId);
        if (!playerClass) return [];

        const classQuirks = playerClass.quirks.filter(quirk => quirk.unlockLevel <= level);
        const universalQuirks = Object.values(this.universalQuirks);
        
        return {
            classQuirks,
            universalQuirks
        };
    }

    /**
     * 💼 Calcula el bonus de trabajo para una clase específica
     */
    getWorkBonus(classId, workType) {
        const playerClass = this.getClass(classId);
        if (!playerClass || !playerClass.workBonus) return 1.0;
        
        return playerClass.workBonus[workType] || 1.0;
    }

    /**
     * 🗺️ Obtiene las regiones preferidas de una clase
     */
    getPreferredRegions(classId) {
        const playerClass = this.getClass(classId);
        return playerClass ? playerClass.preferredRegions : [];
    }

    /**
     * 🔄 Verifica si una clase puede evolucionar
     */
    canEvolve(classId, level) {
        const playerClass = this.getClass(classId);
        if (!playerClass || !playerClass.evolution) return false;
        
        return level >= playerClass.evolution.level;
    }

    /**
     * 🦋 Obtiene las opciones de evolución para una clase
     */
    getEvolutionOptions(classId) {
        const playerClass = this.getClass(classId);
        return playerClass && playerClass.evolution ? playerClass.evolution.options : [];
    }

    /**
     * 🎲 Genera una clase aleatoria para nuevos jugadores
     */
    getRandomClass() {
        const classIds = Object.keys(this.classes);
        const randomIndex = Math.floor(Math.random() * classIds.length);
        return classIds[randomIndex];
    }

    /**
     * 🎯 Recomienda una clase basada en las preferencias del jugador
     */
    recommendClass(preferences = {}) {
        const { playstyle, workType, personality } = preferences;
        
        let recommendations = [];
        
        // Recomendar basado en estilo de juego
        if (playstyle === 'aggressive') {
            recommendations.push('warrior', 'rogue');
        } else if (playstyle === 'strategic') {
            recommendations.push('mage', 'scholar');
        } else if (playstyle === 'supportive') {
            recommendations.push('healer', 'artist');
        }
        
        // Recomendar basado en tipo de trabajo
        if (workType === 'creative') {
            recommendations.push('artist', 'mage');
        } else if (workType === 'academic') {
            recommendations.push('scholar', 'mage');
        } else if (workType === 'physical') {
            recommendations.push('warrior', 'rogue');
        }
        
        // Si no hay recomendaciones específicas, devolver una aleatoria
        if (recommendations.length === 0) {
            return this.getRandomClass();
        }
        
        // Devolver la recomendación más frecuente
        const classCount = {};
        recommendations.forEach(cls => {
            classCount[cls] = (classCount[cls] || 0) + 1;
        });
        
        return Object.keys(classCount).reduce((a, b) => 
            classCount[a] > classCount[b] ? a : b
        );
    }

    /**
     * 🏆 Verifica si un jugador cumple las condiciones para desbloquear un Quirk universal
     */
    checkQuirkUnlockCondition(quirkId, playerData) {
        const quirk = this.universalQuirks[quirkId];
        if (!quirk) return false;
        
        const condition = quirk.unlockCondition;
        
        // Aquí se implementarían las verificaciones específicas
        // Por ahora, devolvemos true para testing
        return true;
    }

    /**
     * 📈 Calcula el poder total de un jugador
     */
    calculateTotalPower(classId, level, quirks = [], equipment = []) {
        const stats = this.calculatePlayerStats(classId, level);
        if (!stats) return 0;
        
        let basePower = Object.values(stats).reduce((sum, stat) => sum + stat, 0);
        
        // Aplicar bonificaciones de Quirks
        quirks.forEach(quirk => {
            // Implementar lógica de bonificaciones de Quirks
            basePower *= 1.1; // Placeholder
        });
        
        // Aplicar bonificaciones de equipo
        equipment.forEach(item => {
            // Implementar lógica de bonificaciones de equipo
            basePower *= 1.05; // Placeholder
        });
        
        return Math.floor(basePower);
    }

    /**
     * 🎨 Genera un embed con información de una clase
     */
    generateClassEmbed(classId) {
        const playerClass = this.getClass(classId);
        if (!playerClass) return null;
        
        const embed = new PassQuirkEmbed()
            .setTitle(`${playerClass.emoji} ${playerClass.name}`)
            .setDescription(playerClass.description)
            .setColor(playerClass.color)
            .addField('📊 Estadísticas Base', 
                Object.entries(playerClass.baseStats)
                    .map(([stat, value]) => `${stat}: ${value}`)
                    .join('\n'), true)
            .addField('📈 Crecimiento por Nivel',
                Object.entries(playerClass.statGrowth)
                    .map(([stat, value]) => `${stat}: +${value}`)
                    .join('\n'), true)
            .addField('🌟 Quirks de Clase',
                playerClass.quirks.slice(0, 3)
                    .map(quirk => `**${quirk.name}** (Lv.${quirk.unlockLevel})\n${quirk.description}`)
                    .join('\n\n'))
            .addField('💼 Bonificaciones de Trabajo',
                Object.entries(playerClass.workBonus || {})
                    .map(([work, bonus]) => `${work}: +${Math.round((bonus - 1) * 100)}%`)
                    .join('\n') || 'Ninguna')
            .addField('🗺️ Regiones Preferidas',
                playerClass.preferredRegions.join(', ') || 'Todas');
                
        return embed;
    }
}

// Crear instancia singleton del sistema de clases
const classSystem = new ClassSystem();

module.exports = {
    ClassSystem,
    classSystem,
    CLASSES,
    UNIVERSAL_QUIRKS
};