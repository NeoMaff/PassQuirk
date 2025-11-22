const UserManager = require('./bot/database/userManager');

async function checkLevel() {
    const um = new UserManager();
    try {
        const user = await um.getUser('1012429');
        if (!user) {
            console.log('Usuario no encontrado');
            process.exit(0);
        }
        console.log('===== DATOS DEL USUARIO =====');
        console.log('Username:', user.username || 'N/A');
        console.log('Nivel:', user.stats?.level || 1);
        console.log('XP:', user.stats?.xp || 0);
        console.log('Has Character:', !!user.character);
        if (user.character) {
            console.log('Character Name:', user.character.name || 'N/A');
        }
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
}

checkLevel();
