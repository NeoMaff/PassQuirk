require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

// Initialize Discord client with necessary intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
    ]
});

// Collections to store commands and events
client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();

// Helper to read files recursively (only .js)
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

// Load commands
async function loadCommands() {
    const commandsPath = path.join(__dirname, 'bot/commands');
    if (!fs.existsSync(commandsPath)) {
        console.log('ℹ️ No commands directory found, skipping...');
        return;
    }
    const commandFiles = getFilesRecursive(commandsPath);
    for (const filePath of commandFiles) {
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Command loaded: ${command.data.name}`);
        } else {
            console.log(`❌ The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load events
function loadEvents() {
    const eventsPath = path.join(__dirname, 'bot/events');
    if (!fs.existsSync(eventsPath)) {
        console.log('ℹ️ No events directory found, skipping...');
        return;
    }
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
        
        console.log(`✅ Event loaded: ${event.name}`);
    }
}

// Load button handlers
function loadButtons() {
    const buttonsPath = path.join(__dirname, 'bot/buttons');
    
    // Check if buttons directory exists
    if (!fs.existsSync(buttonsPath)) {
        console.log('ℹ️ No buttons directory found, skipping...');
        return;
    }
    
    const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.js'));
    
    for (const file of buttonFiles) {
        const filePath = path.join(buttonsPath, file);
        const button = require(filePath);
        
        if ('id' in button && 'execute' in button) {
            client.buttons.set(button.id, button);
            console.log(`✅ Button loaded: ${button.id}`);
        } else {
            console.log(`❌ The button at ${filePath} is missing a required "id" or "execute" property.`);
        }
    }
}

// Load select menu handlers
function loadSelectMenus() {
    const selectMenusPath = path.join(__dirname, 'bot/selectMenus');
    
    // Check if selectMenus directory exists
    if (!fs.existsSync(selectMenusPath)) {
        console.log('ℹ️ No selectMenus directory found, skipping...');
        return;
    }
    
    const selectMenuFiles = fs.readdirSync(selectMenusPath).filter(file => file.endsWith('.js'));
    
    for (const file of selectMenuFiles) {
        const filePath = path.join(selectMenusPath, file);
        const menu = require(filePath);
        
        if ('id' in menu && 'execute' in menu) {
            client.selectMenus.set(menu.id, menu);
            console.log(`✅ Select menu loaded: ${menu.id}`);
        } else {
            console.log(`❌ The select menu at ${filePath} is missing a required "id" or "execute" property.`);
        }
    }
}

// Deploy commands to Discord
async function deployCommands() {
    try {
        console.log('🔄 Started refreshing application (/) commands.');
        
        const commands = [];
        const commandsPath = path.join(__dirname, 'bot/commands');
        
        // Check if commands directory exists
        if (!fs.existsSync(commandsPath)) {
            console.log('ℹ️ No commands directory found, skipping command deployment...');
            return;
        }
        
        const commandFiles = getFilesRecursive(commandsPath);
        for (const filePath of commandFiles) {
            try {
                const command = require(filePath);
                if ('data' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`⚠️ Command at ${filePath} is missing 'data' property, skipping...`);
                }
            } catch (error) {
                console.error(`❌ Error loading command from ${filePath}:`, error);
            }
        }
        const rest = new REST({ version: '10' }).setToken(config.bot.token);
        
        // Deploy commands to all guilds
        if (config.bot.guildId) {
            await rest.put(
                Routes.applicationGuildCommands(config.bot.clientId, config.bot.guildId),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${commands.length} application (/) commands for guild ${config.bot.guildId}`);
        } else {
            // Deploy global commands (may take up to an hour to propagate)
            await rest.put(
                Routes.applicationCommands(config.bot.clientId),
                { body: commands },
            );
            console.log(`✅ Successfully reloaded ${commands.length} application (/) commands globally`);
        }
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}

// Initialize the bot
async function init() {
    try {
        // Load all handlers
        await loadCommands();
        loadEvents();
        loadButtons();
        loadSelectMenus();
        
        // Deploy slash commands en cada arranque
        await deployCommands();
        
        // Log in to Discord
        await client.login(config.bot.token);
        
        console.log(`✅ ${client.user.tag} is online!`);
    } catch (error) {
        console.error('❌ Error initializing the bot:', error);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the bot
init();
