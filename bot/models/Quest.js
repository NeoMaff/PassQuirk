const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
    questId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },

    // Quest Type
    type: {
        type: String,
        enum: ['main', 'side', 'daily', 'weekly', 'epic', 'guild'],
        required: true
    },

    // Quest Requirements
    requirements: {
        level: { type: Number, default: 1 },
        class: [String], // Empty = all classes
        previousQuests: [String], // Quest IDs that must be completed
        region: String,
        guild: { type: Boolean, default: false }
    },

    // Objectives
    objectives: [{
        objectiveId: String,
        description: String,
        type: {
            type: String,
            enum: ['kill', 'collect', 'talk', 'explore', 'craft', 'deliver']
        },
        target: String, // Enemy ID, Item ID, NPC ID, Location ID
        targetName: String,
        required: Number,
        optional: { type: Boolean, default: false }
    }],

    // Rewards
    rewards: {
        experience: { type: Number, default: 0 },
        gold: { type: Number, default: 0 },
        gems: { type: Number, default: 0 },
        items: [{
            itemId: String,
            amount: Number,
            guaranteed: { type: Boolean, default: true },
            chance: { type: Number, default: 100 }
        }],
        title: String,
        skill: String
    },

    // Dialogue
    dialogue: {
        start: [{
            npcId: String,
            npcName: String,
            text: String
        }],
        progress: [{
            condition: String, // e.g., "objective_1_50%"
            npcId: String,
            npcName: String,
            text: String
        }],
        complete: [{
            npcId: String,
            npcName: String,
            text: String
        }]
    },

    // Quest Giver
    questGiver: {
        npcId: String,
        npcName: String,
        location: String
    },

    // Time Limits
    timeLimit: { type: Number, default: null }, // In seconds
    cooldown: { type: Number, default: 0 }, // Time before can be repeated (daily/weekly)

    // Quest Chain
    chain: {
        isPartOfChain: { type: Boolean, default: false },
        chainId: String,
        order: Number,
        nextQuest: String
    },

    // Difficulty
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'very_hard', 'nightmare'],
        default: 'easy'
    },

    // Recommended Level
    recommendedLevel: Number,

    // Repeatable
    repeatable: { type: Boolean, default: false },

    // Active
    active: { type: Boolean, default: true },

    // Story/Lore
    lore: String,

    // Metadata
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp before saving
questSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Static method to get quests by type
questSchema.statics.getByType = function(type) {
    return this.find({ type, active: true });
};

// Static method to get available quests for character
questSchema.statics.getAvailableForCharacter = async function(character) {
    const completedQuestIds = character.quests.completed.map(q => q.questId);

    return this.find({
        active: true,
        'requirements.level': { $lte: character.level },
        questId: { $nin: completedQuestIds },
        $or: [
            { 'requirements.class': { $size: 0 } },
            { 'requirements.class': character.class }
        ],
        $or: [
            { 'requirements.previousQuests': { $size: 0 } },
            { 'requirements.previousQuests': { $all: completedQuestIds } }
        ]
    });
};

// Method to check if objectives are complete
questSchema.methods.checkObjectivesComplete = function(progress) {
    for (const objective of this.objectives) {
        if (objective.optional) continue;

        const progressObj = progress.find(p => p.objectiveId === objective.objectiveId);
        if (!progressObj || progressObj.current < objective.required) {
            return false;
        }
    }
    return true;
};

// Indexes
questSchema.index({ questId: 1 });
questSchema.index({ type: 1, active: 1 });
questSchema.index({ 'requirements.level': 1 });
questSchema.index({ 'chain.chainId': 1, 'chain.order': 1 });

const Quest = mongoose.model('Quest', questSchema);

module.exports = Quest;
