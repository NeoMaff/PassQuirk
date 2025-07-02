// Advanced economy system using quick.db. Supports per-guild balances, bank, configurable settings,
// and cooldowns similar to UnbelievaBoat.

const { QuickDB } = require('quick.db');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new QuickDB({ file: path.join(DATA_DIR, 'advanced_economy.sqlite') });

// Default configuration per guild
const DEFAULT_CONFIG = {
    currencyName: 'Coins',
    startingBalance: 0,
    work: { min: 50, max: 150, cooldown: 60 * 60 * 1000 }, // 1h
    daily: { amount: 500, cooldown: 24 * 60 * 60 * 1000 }, // 24h
};

function guildKey(guildId) {
    return `guild_${guildId}`;
}

// Ensure guild config exists
async function ensureGuild(guildId) {
    const key = guildKey(guildId);
    let config = await db.get(`${key}.config`);
    if (!config) {
        await db.set(`${key}.config`, DEFAULT_CONFIG);
    }
}

// CONFIG FUNCTIONS
async function getConfig(guildId) {
    await ensureGuild(guildId);
    return db.get(`${guildKey(guildId)}.config`);
}

async function setConfigField(guildId, field, value) {
    await ensureGuild(guildId);
    await db.set(`${guildKey(guildId)}.config.${field}`, value);
}

// USER BALANCE FUNCTIONS
async function ensureUser(guildId, userId) {
    await ensureGuild(guildId);
    const exists = await db.has(`${guildKey(guildId)}.users.${userId}`);
    if (!exists) {
        const config = await getConfig(guildId);
        await db.set(`${guildKey(guildId)}.users.${userId}`, {
            wallet: config.startingBalance,
            bank: 0,
            lastWork: 0,
            lastDaily: 0,
        });
    }
}

async function getUser(guildId, userId) {
    await ensureUser(guildId, userId);
    return db.get(`${guildKey(guildId)}.users.${userId}`);
}

async function setUser(guildId, userId, data) {
    await db.set(`${guildKey(guildId)}.users.${userId}`, data);
}

async function addWallet(guildId, userId, amount) {
    const user = await getUser(guildId, userId);
    user.wallet += amount;
    await setUser(guildId, userId, user);
    return user;
}

async function addBank(guildId, userId, amount) {
    const user = await getUser(guildId, userId);
    user.bank += amount;
    await setUser(guildId, userId, user);
    return user;
}

async function setBalance(guildId, userId, amount) {
    const user = await getUser(guildId, userId);
    user.wallet = amount;
    await setUser(guildId, userId, user);
    return user;
}

// Cooldown helpers
function remaining(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h}h ${m}m ${s}s`;
}

// WORK COMMAND
async function work(guildId, userId) {
    await ensureUser(guildId, userId);
    const user = await getUser(guildId, userId);
    const cfg = await getConfig(guildId);
    const now = Date.now();
    if (now - user.lastWork < cfg.work.cooldown) {
        throw new Error(`Cooldown:${remaining(cfg.work.cooldown - (now - user.lastWork))}`);
    }
    const earnings = Math.floor(Math.random() * (cfg.work.max - cfg.work.min + 1)) + cfg.work.min;
    user.lastWork = now;
    user.wallet += earnings;
    await setUser(guildId, userId, user);
    return { user, earnings };
}

// DAILY COMMAND
async function daily(guildId, userId) {
    await ensureUser(guildId, userId);
    const user = await getUser(guildId, userId);
    const cfg = await getConfig(guildId);
    const now = Date.now();
    if (now - user.lastDaily < cfg.daily.cooldown) {
        throw new Error(`Cooldown:${remaining(cfg.daily.cooldown - (now - user.lastDaily))}`);
    }
    const earnings = cfg.daily.amount;
    user.lastDaily = now;
    user.wallet += earnings;
    await setUser(guildId, userId, user);
    return { user, earnings };
}

// DEPOSIT & WITHDRAW
async function deposit(guildId, userId, amount) {
    const user = await getUser(guildId, userId);
    if (user.wallet < amount) throw new Error('Fondos insuficientes');
    user.wallet -= amount;
    user.bank += amount;
    await setUser(guildId, userId, user);
    return user;
}

async function withdraw(guildId, userId, amount) {
    const user = await getUser(guildId, userId);
    if (user.bank < amount) throw new Error('Fondos insuficientes');
    user.bank -= amount;
    user.wallet += amount;
    await setUser(guildId, userId, user);
    return user;
}

// PAY
async function pay(guildId, fromId, toId, amount) {
    if (fromId === toId) throw new Error('No puedes pagarte a ti mismo');
    const fromUser = await getUser(guildId, fromId);
    const toUser = await getUser(guildId, toId);
    if (fromUser.wallet < amount) throw new Error('Fondos insuficientes');
    fromUser.wallet -= amount;
    toUser.wallet += amount;
    await setUser(guildId, fromId, fromUser);
    await setUser(guildId, toId, toUser);
    return { fromUser, toUser };
}

// LEADERBOARD
async function getLeaderboard(guildId, limit = 10) {
    await ensureGuild(guildId);
    const users = await db.get(`${guildKey(guildId)}.users`) || {};
    const sorted = Object.entries(users)
        .sort((a, b) => (b[1].wallet + b[1].bank) - (a[1].wallet + a[1].bank))
        .slice(0, limit)
        .map(([userId, data]) => ({ userId, total: data.wallet + data.bank, wallet: data.wallet, bank: data.bank }));
    return sorted;
}

module.exports = {
    getConfig,
    setConfigField,
    getUser,
    addWallet,
    addBank,
    setBalance,
    work,
    daily,
    deposit,
    withdraw,
    pay,
    getLeaderboard,
};
