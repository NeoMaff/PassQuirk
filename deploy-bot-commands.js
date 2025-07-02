const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Helper to read files recursively
function getFilesRecursive(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getFilesRecursive(entryPath));
        } else if (entry.name.endsWith('.js')) {
            results.push(entryPath);
        }
    }
    return results;
}

// Load commands from Info-Bot directory
const commandsPath = path.join(__dirname, 'Info-Bot/bot/commands');
const commandFiles = getFilesRecursive(commandsPath);

for (const filePath of commandFiles) {
    try {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded command: ${command.data.name}`);
        } else {
            console.log(`❌ Command at ${filePath} missing required properties`);
        }
    } catch (error) {
        console.error(`❌ Error loading command at ${filePath}:`, error.message);
    }
}

// Deploy commands
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);
        
        if (process.env.GUILD_ID) {
            // Deploy to specific guild (faster for development)
            const data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} guild commands.`);
        } else {
            // Deploy globally (takes up to 1 hour)
            const data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${data.length} global commands.`);
        }
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
})();