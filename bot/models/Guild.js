const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    tag: { type: String, required: true, unique: true, maxlength: 5 },
    description: { type: String, default: 'A new guild' },
    icon: { type: String, default: null },

    // Leader and Officers
    leader: { type: String, required: true },
    officers: [{ type: String }],

    // Members
    members: [{
        userId: String,
        username: String,
        rank: {
            type: String,
            enum: ['Líder', 'Oficial', 'Veterano', 'Miembro', 'Recluta'],
            default: 'Recluta'
        },
        contribution: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now },
        lastActive: Date
    }],

    // Guild Stats
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    totalMembers: { type: Number, default: 1 },
    maxMembers: { type: Number, default: 50 },

    // Guild Resources
    treasury: { type: Number, default: 0 },
    guildPoints: { type: Number, default: 0 },

    // Guild Perks
    perks: [{
        perkId: String,
        name: String,
        level: Number,
        effect: mongoose.Schema.Types.Mixed
    }],

    // Guild Storage (shared items)
    storage: [{
        itemId: String,
        name: String,
        amount: Number,
        depositedBy: String,
        depositedAt: Date
    }],

    // Guild Settings
    settings: {
        joinType: {
            type: String,
            enum: ['open', 'approval', 'invite'],
            default: 'approval'
        },
        minLevel: { type: Number, default: 1 },
        language: { type: String, default: 'es' },
        region: String
    },

    // Guild Activities
    activities: [{
        type: String,
        description: String,
        userId: String,
        username: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Guild Wars
    wars: [{
        opponentGuildId: String,
        opponentGuildName: String,
        status: {
            type: String,
            enum: ['pending', 'active', 'finished'],
            default: 'pending'
        },
        startedAt: Date,
        finishedAt: Date,
        score: {
            own: { type: Number, default: 0 },
            opponent: { type: Number, default: 0 }
        },
        winner: String
    }],

    // Statistics
    stats: {
        totalCombats: { type: Number, default: 0 },
        totalVictories: { type: Number, default: 0 },
        bossesDefeated: { type: Number, default: 0 },
        dungeonsCleared: { type: Number, default: 0 },
        totalContribution: { type: Number, default: 0 }
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp before saving
guildSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add member
guildSchema.methods.addMember = async function(userId, username, rank = 'Recluta') {
    if (this.totalMembers >= this.maxMembers) {
        return { success: false, message: 'Guild is full' };
    }

    const existingMember = this.members.find(m => m.userId === userId);
    if (existingMember) {
        return { success: false, message: 'User is already a member' };
    }

    this.members.push({
        userId,
        username,
        rank,
        contribution: 0,
        joinedAt: new Date(),
        lastActive: new Date()
    });

    this.totalMembers++;

    this.activities.push({
        type: 'member_join',
        description: `${username} se unió al gremio`,
        userId,
        username
    });

    await this.save();
    return { success: true };
};

// Method to remove member
guildSchema.methods.removeMember = async function(userId) {
    const memberIndex = this.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) {
        return { success: false, message: 'User is not a member' };
    }

    const member = this.members[memberIndex];
    this.members.splice(memberIndex, 1);
    this.totalMembers--;

    // Remove from officers if applicable
    const officerIndex = this.officers.indexOf(userId);
    if (officerIndex !== -1) {
        this.officers.splice(officerIndex, 1);
    }

    this.activities.push({
        type: 'member_leave',
        description: `${member.username} dejó el gremio`,
        userId,
        username: member.username
    });

    await this.save();
    return { success: true };
};

// Method to promote member
guildSchema.methods.promoteMember = async function(userId, newRank) {
    const member = this.members.find(m => m.userId === userId);
    if (!member) {
        return { success: false, message: 'User is not a member' };
    }

    const oldRank = member.rank;
    member.rank = newRank;

    // Add/remove from officers
    if (newRank === 'Oficial' && !this.officers.includes(userId)) {
        this.officers.push(userId);
    } else if (newRank !== 'Oficial' && newRank !== 'Líder') {
        const officerIndex = this.officers.indexOf(userId);
        if (officerIndex !== -1) {
            this.officers.splice(officerIndex, 1);
        }
    }

    this.activities.push({
        type: 'member_promoted',
        description: `${member.username} fue promovido de ${oldRank} a ${newRank}`,
        userId,
        username: member.username
    });

    await this.save();
    return { success: true };
};

// Method to add contribution
guildSchema.methods.addContribution = async function(userId, amount) {
    const member = this.members.find(m => m.userId === userId);
    if (!member) {
        return { success: false, message: 'User is not a member' };
    }

    member.contribution += amount;
    this.guildPoints += amount;
    this.stats.totalContribution += amount;

    await this.save();
    return { success: true };
};

// Method to add to treasury
guildSchema.methods.addToTreasury = async function(amount, userId, username) {
    this.treasury += amount;

    this.activities.push({
        type: 'treasury_deposit',
        description: `${username} depositó ${amount} monedas en la tesorería`,
        userId,
        username
    });

    await this.save();
    return { success: true };
};

// Method to add guild experience
guildSchema.methods.addExperience = async function(amount) {
    this.experience += amount;
    let levelsGained = 0;

    const expRequired = this.level * 10000;

    while (this.experience >= expRequired) {
        this.experience -= expRequired;
        this.level++;
        levelsGained++;

        // Increase max members every 5 levels
        if (this.level % 5 === 0) {
            this.maxMembers += 10;
        }

        this.activities.push({
            type: 'guild_levelup',
            description: `¡El gremio subió al nivel ${this.level}!`,
            userId: 'system',
            username: 'Sistema'
        });
    }

    if (levelsGained > 0) {
        await this.save();
    }

    return levelsGained;
};

// Indexes
guildSchema.index({ guildId: 1 });
guildSchema.index({ name: 1 });
guildSchema.index({ tag: 1 });
guildSchema.index({ 'members.userId': 1 });
guildSchema.index({ level: -1 });

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;
