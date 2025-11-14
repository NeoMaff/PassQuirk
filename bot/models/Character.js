const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    country: { type: String, required: true },
    timezone: { type: String, required: true },

    // Class and Level
    class: {
        type: String,
        enum: ['Guerrero', 'Mago', 'Arquero', 'Ladrón', 'Ninja'],
        required: true
    },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    expToNextLevel: { type: Number, default: 1000 },

    // Stats
    stats: {
        // Primary Stats
        strength: { type: Number, default: 10 },      // Ataque físico
        dexterity: { type: Number, default: 10 },     // Precisión y evasión
        intelligence: { type: Number, default: 10 },  // Poder mágico
        constitution: { type: Number, default: 10 },  // Puntos de vida
        luck: { type: Number, default: 10 },          // Críticos y recompensas
        speed: { type: Number, default: 10 },         // Velocidad/iniciativa

        // Derived Stats
        maxHp: { type: Number, default: 100 },
        currentHp: { type: Number, default: 100 },
        maxMana: { type: Number, default: 50 },
        currentMana: { type: Number, default: 50 },
        maxEnergy: { type: Number, default: 100 },
        currentEnergy: { type: Number, default: 100 },

        // Combat Stats
        attack: { type: Number, default: 10 },
        defense: { type: Number, default: 10 },
        magicPower: { type: Number, default: 10 },
        magicDefense: { type: Number, default: 10 },
        criticalChance: { type: Number, default: 5 },
        criticalDamage: { type: Number, default: 150 },
        evasion: { type: Number, default: 5 },
        accuracy: { type: Number, default: 95 }
    },

    // Skills and Abilities
    skills: [{
        skillId: String,
        name: String,
        description: String,
        type: { type: String, enum: ['physical', 'magical', 'status', 'healing'] },
        element: String,
        power: Number,
        accuracy: Number,
        manaCost: Number,
        actionPoints: Number,
        cooldown: Number,
        lastUsed: Date,
        level: { type: Number, default: 1 },
        maxLevel: { type: Number, default: 10 }
    }],

    // Equipment
    equipment: {
        head: { type: mongoose.Schema.Types.Mixed, default: null },
        chest: { type: mongoose.Schema.Types.Mixed, default: null },
        hands: { type: mongoose.Schema.Types.Mixed, default: null },
        legs: { type: mongoose.Schema.Types.Mixed, default: null },
        feet: { type: mongoose.Schema.Types.Mixed, default: null },
        weapon: { type: mongoose.Schema.Types.Mixed, default: null },
        offhand: { type: mongoose.Schema.Types.Mixed, default: null },
        accessory1: { type: mongoose.Schema.Types.Mixed, default: null },
        accessory2: { type: mongoose.Schema.Types.Mixed, default: null }
    },

    // Location and Progress
    location: {
        region: { type: String, default: 'Reino de Akai' },
        zone: { type: String, default: 'Ciudad Inicial' },
        coordinates: { x: Number, y: Number }
    },

    // Quests
    quests: {
        active: [{
            questId: String,
            name: String,
            description: String,
            type: String,
            objectives: [{
                description: String,
                current: Number,
                required: Number,
                completed: Boolean
            }],
            rewards: mongoose.Schema.Types.Mixed,
            startedAt: Date
        }],
        completed: [{
            questId: String,
            completedAt: Date,
            rewards: mongoose.Schema.Types.Mixed
        }]
    },

    // Achievements
    achievements: [{
        achievementId: String,
        name: String,
        description: String,
        unlockedAt: Date,
        rewards: mongoose.Schema.Types.Mixed
    }],

    // Guild
    guild: {
        guildId: { type: String, default: null },
        rank: { type: String, default: 'Recluta' },
        joinedAt: Date,
        contribution: { type: Number, default: 0 }
    },

    // Combat Stats
    combatStats: {
        totalBattles: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        enemiesDefeated: { type: Number, default: 0 },
        bossesDefeated: { type: Number, default: 0 },
        damageDealt: { type: Number, default: 0 },
        damageTaken: { type: Number, default: 0 },
        healingDone: { type: Number, default: 0 }
    },

    // Status Effects
    statusEffects: [{
        effectId: String,
        name: String,
        type: String,
        duration: Number,
        power: Number,
        appliedAt: Date
    }],

    // Exploration
    exploration: {
        totalDistance: { type: Number, default: 0 },
        areasDiscovered: [String],
        itemsFound: { type: Number, default: 0 },
        quirksFound: { type: Number, default: 0 }
    },

    // PassQuirks (creatures)
    passquirks: [{
        quirkId: String,
        name: String,
        level: Number,
        rarity: String,
        stats: mongoose.Schema.Types.Mixed,
        capturedAt: Date
    }],

    // Titles
    titles: [{
        titleId: String,
        name: String,
        unlockedAt: Date
    }],
    activeTitle: { type: String, default: null },

    // Tutorial Progress
    tutorialCompleted: { type: Boolean, default: false },
    tutorialStep: { type: Number, default: 0 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
});

// Update timestamp before saving
characterSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add experience
characterSchema.methods.addExperience = async function(amount) {
    this.experience += amount;
    let levelsGained = 0;

    // Check for level ups
    while (this.experience >= this.expToNextLevel) {
        this.experience -= this.expToNextLevel;
        this.level++;
        levelsGained++;

        // Update stats on level up
        this.stats.strength += 2;
        this.stats.dexterity += 2;
        this.stats.intelligence += 2;
        this.stats.constitution += 2;
        this.stats.luck += 1;
        this.stats.speed += 1;

        // Recalculate derived stats
        this.updateDerivedStats();

        // Calculate next level requirement
        this.expToNextLevel = Math.floor(1000 * Math.pow(1.5, this.level - 1));
    }

    await this.save();
    return levelsGained;
};

// Method to update derived stats
characterSchema.methods.updateDerivedStats = function() {
    const classModifiers = {
        'Guerrero': { hp: 15, mana: 3, attack: 3, defense: 2 },
        'Mago': { hp: 8, mana: 8, attack: 1, defense: 1, magicPower: 3 },
        'Arquero': { hp: 10, mana: 5, attack: 2, defense: 1 },
        'Ladrón': { hp: 9, mana: 4, attack: 2, defense: 1 },
        'Ninja': { hp: 10, mana: 5, attack: 2, defense: 1 }
    };

    const modifier = classModifiers[this.class] || classModifiers['Guerrero'];

    // Calculate HP and Mana
    this.stats.maxHp = 100 + (this.level * modifier.hp) + (this.stats.constitution * 5);
    this.stats.maxMana = 50 + (this.level * modifier.mana) + (this.stats.intelligence * 3);
    this.stats.maxEnergy = 100 + (this.level * 2);

    // Calculate combat stats
    this.stats.attack = 10 + (this.level * modifier.attack) + this.stats.strength;
    this.stats.defense = 10 + (this.level * modifier.defense) + (this.stats.constitution * 0.5);
    this.stats.magicPower = 10 + (this.level * (modifier.magicPower || 1)) + this.stats.intelligence;
    this.stats.magicDefense = 10 + (this.level * 1) + (this.stats.intelligence * 0.5);

    // Calculate secondary stats
    this.stats.criticalChance = 5 + (this.stats.luck * 0.5);
    this.stats.evasion = 5 + (this.stats.dexterity * 0.3);
    this.stats.accuracy = 95 + (this.stats.dexterity * 0.2);
};

// Method to heal
characterSchema.methods.heal = async function(amount, type = 'hp') {
    if (type === 'hp') {
        this.stats.currentHp = Math.min(this.stats.currentHp + amount, this.stats.maxHp);
    } else if (type === 'mana') {
        this.stats.currentMana = Math.min(this.stats.currentMana + amount, this.stats.maxMana);
    } else if (type === 'energy') {
        this.stats.currentEnergy = Math.min(this.stats.currentEnergy + amount, this.stats.maxEnergy);
    }
    await this.save();
    return this;
};

// Method to take damage
characterSchema.methods.takeDamage = async function(amount) {
    this.stats.currentHp = Math.max(0, this.stats.currentHp - amount);
    this.combatStats.damageTaken += amount;
    await this.save();
    return this.stats.currentHp <= 0;
};

// Method to rest (full heal)
characterSchema.methods.rest = async function() {
    this.stats.currentHp = this.stats.maxHp;
    this.stats.currentMana = this.stats.maxMana;
    this.stats.currentEnergy = this.stats.maxEnergy;
    this.statusEffects = [];
    await this.save();
    return this;
};

// Method to add quest
characterSchema.methods.addQuest = function(quest) {
    this.quests.active.push({
        ...quest,
        startedAt: new Date()
    });
};

// Method to complete quest
characterSchema.methods.completeQuest = function(questId, rewards) {
    const questIndex = this.quests.active.findIndex(q => q.questId === questId);
    if (questIndex === -1) return false;

    const quest = this.quests.active[questIndex];
    this.quests.completed.push({
        questId: quest.questId,
        completedAt: new Date(),
        rewards: rewards
    });

    this.quests.active.splice(questIndex, 1);
    return true;
};

// Indexes
characterSchema.index({ userId: 1 });
characterSchema.index({ level: -1, experience: -1 });
characterSchema.index({ 'location.region': 1 });

const Character = mongoose.model('Character', characterSchema);

module.exports = Character;
