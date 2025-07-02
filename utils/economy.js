const fs = require('fs').promises;
const path = require('path');

const ECONOMY_FILE = path.join(__dirname, '../data/economy.json');

// Asegurarse de que el archivo de economía existe
async function ensureEconomyFile() {
    try {
        // Asegurarse de que el directorio exista
        await fs.mkdir(path.dirname(ECONOMY_FILE), { recursive: true });
        await fs.access(ECONOMY_FILE);
    } catch {
        await fs.writeFile(ECONOMY_FILE, JSON.stringify({ users: {} }, null, 2));
    }
}

// Obtener todos los datos de economía
async function getEconomyData() {
    await ensureEconomyFile();
    const data = await fs.readFile(ECONOMY_FILE, 'utf8');
    return JSON.parse(data);
}

// Guardar datos de economía
async function saveEconomyData(data) {
    await fs.writeFile(ECONOMY_FILE, JSON.stringify(data, null, 2));
}

// Crear un nuevo usuario en el sistema de economía
async function createUser(userId) {
    const data = await getEconomyData();
    data.users[userId] = {
        coins: 0,
        bank: 0,
        lastDaily: null,
        lastWork: null
    };
    await saveEconomyData(data);
    return data.users[userId];
}

// Obtener balance de un usuario
async function getUserBalance(userId) {
    const data = await getEconomyData();
    return data.users[userId];
}

// Actualizar balance de un usuario
async function updateBalance(userId, amount) {
    const data = await getEconomyData();
    if (!data.users[userId]) {
        await createUser(userId);
    }
    data.users[userId].coins += amount;
    await saveEconomyData(data);
    return data.users[userId];
}

// Transferir monedas entre usuarios
async function transferCoins(fromUserId, toUserId, amount) {
    const data = await getEconomyData();
    
    if (!data.users[fromUserId]) {
        throw new Error('Usuario remitente no encontrado');
    }
    
    if (!data.users[toUserId]) {
        await createUser(toUserId);
    }
    
    if (data.users[fromUserId].coins < amount) {
        throw new Error('Fondos insuficientes');
    }
    
    data.users[fromUserId].coins -= amount;
    data.users[toUserId].coins += amount;
    
    await saveEconomyData(data);
    return {
        from: data.users[fromUserId],
        to: data.users[toUserId]
    };
}

module.exports = {
    createUser,
    getUserBalance,
    updateBalance,
    transferCoins
}; 