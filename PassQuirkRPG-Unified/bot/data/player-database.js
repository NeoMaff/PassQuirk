const fs = require('fs');
const path = require('path');

// Ruta del archivo de base de datos
const DB_PATH = path.join(__dirname, 'players.json');

// Estructura base de un jugador
const DEFAULT_PLAYER = {
    userId: '',
    username: '',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    passquirk: null,
    class: 'Novato',
    stats: {
        hp: 100,
        mp: 50,
        attack: 10,
        defense: 8,
        speed: 5,
        intelligence: 5,
        strength: 5,
        wisdom: 5,
        creativity: 5,
        technique: 5,
        resistance: 5,
        knowledge: 5
    },
    quirks: [],
    inventory: {
        items: {},
        equipment: {
            weapon: null,
            armor: null,
            accessory: null
        },
        gold: 100
    },
    activities: {
        total: 0,
        today: 0,
        streak: 0,
        lastActivity: null,
        history: []
    },
    exploration: {
        currentZone: null,
        unlockedZones: ['Reino de Akai'],
        discoveries: [],
        explorationTime: 0
    },
    battle: {
        wins: 0,
        losses: 0,
        currentBattle: null,
        battleHistory: []
    },
    achievements: [],
    realPower: 0,
    rank: 'Héroe en Entrenamiento',
    createdAt: new Date().toISOString(),
    lastSeen: new Date().toISOString()
};

class PlayerDatabase {
    constructor() {
        this.players = this.loadDatabase();
    }

    // Cargar base de datos desde archivo
    loadDatabase() {
        try {
            if (fs.existsSync(DB_PATH)) {
                const data = fs.readFileSync(DB_PATH, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error cargando base de datos:', error);
        }
        return {};
    }

    // Guardar base de datos en archivo
    saveDatabase() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.players, null, 2));
        } catch (error) {
            console.error('Error guardando base de datos:', error);
        }
    }

    // Obtener jugador por ID
    getPlayer(userId) {
        return this.players[userId] || null;
    }

    // Crear nuevo jugador
    createPlayer(userId, username) {
        const newPlayer = { ...DEFAULT_PLAYER };
        newPlayer.userId = userId;
        newPlayer.username = username;
        
        this.players[userId] = newPlayer;
        this.saveDatabase();
        
        return newPlayer;
    }

    // Obtener o crear jugador
    getOrCreatePlayer(userId, username) {
        let player = this.getPlayer(userId);
        if (!player) {
            player = this.createPlayer(userId, username);
        } else {
            // Actualizar última vez visto
            player.lastSeen = new Date().toISOString();
            this.saveDatabase();
        }
        return player;
    }

    // Actualizar jugador
    updatePlayer(userId, updates) {
        if (this.players[userId]) {
            this.players[userId] = { ...this.players[userId], ...updates };
            this.players[userId].lastSeen = new Date().toISOString();
            this.saveDatabase();
            return this.players[userId];
        }
        return null;
    }

    // Añadir experiencia
    addExperience(userId, exp) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        player.experience += exp;
        
        // Verificar subida de nivel
        while (player.experience >= player.experienceToNext) {
            player.experience -= player.experienceToNext;
            player.level++;
            player.experienceToNext = this.calculateExpToNext(player.level);
            
            // Aumentar estadísticas al subir de nivel
            this.levelUpStats(player);
        }

        this.updatePlayer(userId, player);
        return player;
    }

    // Calcular experiencia necesaria para siguiente nivel
    calculateExpToNext(level) {
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    // Aumentar estadísticas al subir de nivel
    levelUpStats(player) {
        const statGrowth = {
            hp: 15,
            mp: 8,
            attack: 3,
            defense: 2,
            speed: 2
        };

        Object.entries(statGrowth).forEach(([stat, growth]) => {
            player.stats[stat] += growth;
        });
    }

    // Registrar actividad
    addActivity(userId, activityData) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        const activity = {
            ...activityData,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        player.activities.history.push(activity);
        player.activities.total++;
        player.realPower += activityData.powerGained || 0;

        // Verificar si es actividad de hoy
        const today = new Date().toDateString();
        const activityDate = new Date(activity.timestamp).toDateString();
        
        if (today === activityDate) {
            player.activities.today++;
        }

        // Actualizar racha
        this.updateStreak(player);
        
        // Añadir experiencia
        this.addExperience(userId, activityData.expGained || 0);
        
        return player;
    }

    // Actualizar racha de actividades
    updateStreak(player) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const lastActivity = player.activities.lastActivity ? new Date(player.activities.lastActivity) : null;
        
        if (lastActivity) {
            const lastActivityDate = lastActivity.toDateString();
            const todayString = today.toDateString();
            const yesterdayString = yesterday.toDateString();
            
            if (lastActivityDate === todayString) {
                // Ya registró actividad hoy, mantener racha
            } else if (lastActivityDate === yesterdayString) {
                // Actividad de ayer, continuar racha
                player.activities.streak++;
            } else {
                // Rompió la racha
                player.activities.streak = 1;
            }
        } else {
            // Primera actividad
            player.activities.streak = 1;
        }
        
        player.activities.lastActivity = today.toISOString();
    }

    // Añadir objeto al inventario
    addItem(userId, itemId, quantity = 1) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        if (!player.inventory.items[itemId]) {
            player.inventory.items[itemId] = 0;
        }
        
        player.inventory.items[itemId] += quantity;
        this.updatePlayer(userId, player);
        
        return player;
    }

    // Usar objeto del inventario
    useItem(userId, itemId, quantity = 1) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        if (!player.inventory.items[itemId] || player.inventory.items[itemId] < quantity) {
            return null; // No tiene suficientes objetos
        }

        player.inventory.items[itemId] -= quantity;
        
        if (player.inventory.items[itemId] <= 0) {
            delete player.inventory.items[itemId];
        }

        this.updatePlayer(userId, player);
        return player;
    }

    // Equipar objeto
    equipItem(userId, itemId, slot) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        // Desequipar objeto actual si existe
        if (player.inventory.equipment[slot]) {
            this.addItem(userId, player.inventory.equipment[slot], 1);
        }

        // Equipar nuevo objeto
        player.inventory.equipment[slot] = itemId;
        this.useItem(userId, itemId, 1);
        
        return player;
    }

    // Obtener ranking de jugadores
    getRanking(sortBy = 'level', limit = 10) {
        const players = Object.values(this.players);
        
        players.sort((a, b) => {
            switch (sortBy) {
                case 'level':
                    return b.level - a.level || b.experience - a.experience;
                case 'realPower':
                    return b.realPower - a.realPower;
                case 'activities':
                    return b.activities.total - a.activities.total;
                default:
                    return b.level - a.level;
            }
        });

        return players.slice(0, limit);
    }

    // Obtener estadísticas del servidor
    getServerStats() {
        const players = Object.values(this.players);
        
        return {
            totalPlayers: players.length,
            totalActivities: players.reduce((sum, p) => sum + p.activities.total, 0),
            totalRealPower: players.reduce((sum, p) => sum + p.realPower, 0),
            averageLevel: players.length > 0 ? players.reduce((sum, p) => sum + p.level, 0) / players.length : 0,
            activeToday: players.filter(p => {
                const today = new Date().toDateString();
                const lastSeen = new Date(p.lastSeen).toDateString();
                return today === lastSeen;
            }).length
        };
    }

    // Despertar PassQuirk
    awakenPassquirk(userId, passquirkId) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        player.passquirk = passquirkId;
        this.updatePlayer(userId, player);
        
        return player;
    }

    // Cambiar clase
    changeClass(userId, newClass) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        player.class = newClass;
        this.updatePlayer(userId, player);
        
        return player;
    }

    // Añadir Quirk
    addQuirk(userId, quirkData) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        player.quirks.push({
            ...quirkData,
            acquiredAt: new Date().toISOString(),
            level: 1,
            experience: 0
        });
        
        this.updatePlayer(userId, player);
        return player;
    }

    // Desbloquear zona
    unlockZone(userId, zoneName) {
        const player = this.getPlayer(userId);
        if (!player) return null;

        if (!player.exploration.unlockedZones.includes(zoneName)) {
            player.exploration.unlockedZones.push(zoneName);
            this.updatePlayer(userId, player);
        }
        
        return player;
    }
}

// Instancia singleton
const playerDB = new PlayerDatabase();

module.exports = {
    PlayerDatabase,
    playerDB,
    DEFAULT_PLAYER
};