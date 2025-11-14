const mongoose = require('mongoose');

const combatSchema = new mongoose.Schema({
    combatId: { type: String, required: true, unique: true },
    type: {
        type: String,
        enum: ['pve', 'pvp', 'boss', 'dungeon'],
        required: true
    },

    // Participants
    participants: [{
        userId: String,
        characterId: String,
        name: String,
        team: { type: String, enum: ['ally', 'enemy'] },
        isNPC: { type: Boolean, default: false },

        // Combat Stats
        stats: {
            maxHp: Number,
            currentHp: Number,
            maxMana: Number,
            currentMana: Number,
            attack: Number,
            defense: Number,
            magicPower: Number,
            magicDefense: Number,
            speed: Number,
            criticalChance: Number,
            criticalDamage: Number,
            evasion: Number,
            accuracy: Number
        },

        // Available Skills
        skills: [{
            skillId: String,
            name: String,
            manaCost: Number,
            actionPoints: Number,
            cooldown: Number,
            lastUsed: Number
        }],

        // Status Effects
        statusEffects: [{
            effectId: String,
            name: String,
            type: String,
            duration: Number,
            power: Number,
            appliedTurn: Number
        }],

        // Combat State
        actionPoints: { type: Number, default: 5 },
        defending: { type: Boolean, default: false },
        defeated: { type: Boolean, default: false },
        position: Number
    }],

    // Combat State
    state: {
        type: String,
        enum: ['waiting', 'active', 'finished', 'fled'],
        default: 'waiting'
    },

    // Turn Management
    currentTurn: { type: Number, default: 0 },
    turnOrder: [Number], // Indices of participants in order
    currentParticipantIndex: { type: Number, default: 0 },

    // Combat Log
    log: [{
        turn: Number,
        action: String,
        actor: String,
        target: String,
        damage: Number,
        healing: Number,
        effect: String,
        critical: Boolean,
        miss: Boolean,
        timestamp: { type: Date, default: Date.now }
    }],

    // Rewards (for PvE)
    rewards: {
        experience: Number,
        gold: Number,
        items: [{
            itemId: String,
            name: String,
            rarity: String,
            amount: Number
        }]
    },

    // Environment
    terrain: {
        type: String,
        enum: ['plains', 'forest', 'mountain', 'desert', 'swamp', 'cave', 'city'],
        default: 'plains'
    },
    weather: String,

    // Metadata
    startedAt: { type: Date, default: Date.now },
    finishedAt: Date,
    winner: String,
    duration: Number
});

// Method to calculate turn order
combatSchema.methods.calculateTurnOrder = function() {
    const order = this.participants
        .map((p, index) => ({ index, speed: p.stats.speed }))
        .sort((a, b) => b.speed - a.speed)
        .map(p => p.index);

    this.turnOrder = order;
    return order;
};

// Method to get current participant
combatSchema.methods.getCurrentParticipant = function() {
    if (this.turnOrder.length === 0) return null;
    const index = this.turnOrder[this.currentParticipantIndex];
    return this.participants[index];
};

// Method to advance turn
combatSchema.methods.nextTurn = function() {
    this.currentParticipantIndex++;

    // If we've gone through all participants, start a new round
    if (this.currentParticipantIndex >= this.turnOrder.length) {
        this.currentParticipantIndex = 0;
        this.currentTurn++;

        // Process status effects at start of new turn
        this.processStatusEffects();
    }

    // Skip defeated participants
    let current = this.getCurrentParticipant();
    while (current && current.defeated) {
        this.currentParticipantIndex++;
        if (this.currentParticipantIndex >= this.turnOrder.length) {
            this.currentParticipantIndex = 0;
            this.currentTurn++;
            this.processStatusEffects();
        }
        current = this.getCurrentParticipant();
    }

    // Restore action points
    if (current) {
        current.actionPoints = Math.min(current.actionPoints + 2, 5);
        current.defending = false;
    }
};

// Method to process status effects
combatSchema.methods.processStatusEffects = function() {
    for (const participant of this.participants) {
        if (participant.defeated) continue;

        for (let i = participant.statusEffects.length - 1; i >= 0; i--) {
            const effect = participant.statusEffects[i];
            const turnsActive = this.currentTurn - effect.appliedTurn;

            // Apply effect
            if (effect.type === 'poison' || effect.type === 'burn' || effect.type === 'bleed') {
                const damage = Math.floor(participant.stats.maxHp * (effect.power / 100));
                participant.stats.currentHp = Math.max(0, participant.stats.currentHp - damage);

                this.log.push({
                    turn: this.currentTurn,
                    action: 'status_damage',
                    actor: effect.name,
                    target: participant.name,
                    damage: damage,
                    effect: effect.type
                });

                if (participant.stats.currentHp <= 0) {
                    participant.defeated = true;
                }
            } else if (effect.type === 'regen') {
                const healing = Math.floor(participant.stats.maxHp * (effect.power / 100));
                participant.stats.currentHp = Math.min(participant.stats.maxHp, participant.stats.currentHp + healing);

                this.log.push({
                    turn: this.currentTurn,
                    action: 'status_healing',
                    actor: effect.name,
                    target: participant.name,
                    healing: healing,
                    effect: effect.type
                });
            }

            // Remove expired effects
            if (turnsActive >= effect.duration) {
                participant.statusEffects.splice(i, 1);
                this.log.push({
                    turn: this.currentTurn,
                    action: 'status_expired',
                    actor: effect.name,
                    target: participant.name,
                    effect: effect.type
                });
            }
        }
    }
};

// Method to check if combat is over
combatSchema.methods.checkCombatEnd = function() {
    const allyAlive = this.participants.some(p => p.team === 'ally' && !p.defeated);
    const enemyAlive = this.participants.some(p => p.team === 'enemy' && !p.defeated);

    if (!allyAlive) {
        this.state = 'finished';
        this.winner = 'enemy';
        this.finishedAt = new Date();
        this.duration = this.finishedAt - this.startedAt;
        return 'defeat';
    } else if (!enemyAlive) {
        this.state = 'finished';
        this.winner = 'ally';
        this.finishedAt = new Date();
        this.duration = this.finishedAt - this.startedAt;
        return 'victory';
    }

    return null;
};

// Method to execute attack
combatSchema.methods.executeAttack = function(attackerIndex, targetIndex, skill = null) {
    const attacker = this.participants[attackerIndex];
    const target = this.participants[targetIndex];

    if (attacker.defeated || target.defeated) {
        return { success: false, message: 'Invalid target or attacker is defeated' };
    }

    // Check if skill and mana
    if (skill && attacker.stats.currentMana < skill.manaCost) {
        return { success: false, message: 'Not enough mana' };
    }

    // Check action points
    const apCost = skill ? skill.actionPoints : 1;
    if (attacker.actionPoints < apCost) {
        return { success: false, message: 'Not enough action points' };
    }

    // Calculate hit chance
    const hitChance = attacker.stats.accuracy - target.stats.evasion;
    const hit = Math.random() * 100 < hitChance;

    if (!hit) {
        attacker.actionPoints -= apCost;
        this.log.push({
            turn: this.currentTurn,
            action: 'attack',
            actor: attacker.name,
            target: target.name,
            miss: true
        });
        return { success: true, miss: true, message: 'Attack missed!' };
    }

    // Calculate damage
    let baseDamage;
    if (skill) {
        if (skill.type === 'physical') {
            baseDamage = attacker.stats.attack * skill.power - target.stats.defense;
        } else if (skill.type === 'magical') {
            baseDamage = attacker.stats.magicPower * skill.power - target.stats.magicDefense;
        }
        attacker.stats.currentMana -= skill.manaCost;
    } else {
        baseDamage = attacker.stats.attack - target.stats.defense;
    }

    baseDamage = Math.max(1, baseDamage);

    // Check for critical hit
    const isCritical = Math.random() * 100 < attacker.stats.criticalChance;
    if (isCritical) {
        baseDamage = Math.floor(baseDamage * (attacker.stats.criticalDamage / 100));
    }

    // Apply damage reduction if defending
    if (target.defending) {
        baseDamage = Math.floor(baseDamage * 0.5);
    }

    // Apply damage
    target.stats.currentHp = Math.max(0, target.stats.currentHp - baseDamage);
    attacker.actionPoints -= apCost;

    // Check if target is defeated
    if (target.stats.currentHp <= 0) {
        target.defeated = true;
    }

    // Log the action
    this.log.push({
        turn: this.currentTurn,
        action: skill ? 'skill' : 'attack',
        actor: attacker.name,
        target: target.name,
        damage: baseDamage,
        critical: isCritical
    });

    return {
        success: true,
        damage: baseDamage,
        critical: isCritical,
        defeated: target.defeated
    };
};

// Indexes
combatSchema.index({ combatId: 1 });
combatSchema.index({ 'participants.userId': 1 });
combatSchema.index({ state: 1 });
combatSchema.index({ startedAt: -1 });

const Combat = mongoose.model('Combat', combatSchema);

module.exports = Combat;
