const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const DialogueSystem = require('../systems/dialogueSystem');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('passquirkrpg')
        .setDescription('¡Comienza tu aventura en el mundo de PassQuirk RPG!'),
    
    async execute(interaction) {
        // Verificar si el usuario ya tiene un personaje creado
        const hasCharacter = false; // Aquí iría la lógica para verificar en la base de datos
        
        if (hasCharacter) {
            // Si ya tiene personaje, mostrar menú principal
            return showMainMenu(interaction);
        } else {
            // Si no tiene personaje, iniciar el tutorial
            return startTutorial(interaction);
        }
    }
};

// Función para mostrar el menú principal
async function showMainMenu(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('🏰 Menú Principal - PassQuirk RPG')
        .setDescription('¡Bienvenido de nuevo, aventurero! ¿Qué te gustaría hacer?')
        .setColor('#6C63FF')
        .setThumbnail('attachment://logo.png');

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('explore')
                .setLabel('🌍 Explorar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('inventory')
                .setLabel('🎒 Inventario')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('character')
                .setLabel('👤 Personaje')
                .setStyle(ButtonStyle.Secondary)
        );

    await interaction.reply({
        embeds: [embed],
        components: [row],
        files: [{
            attachment: './assets/images/logo.png',
            name: 'logo.png'
        }]
    });
}

// Función para iniciar el tutorial
async function startTutorial(interaction) {
    try {
        // Mostrar mensaje de carga
        await interaction.deferReply({ ephemeral: false });
        
        // Verificar si el sistema de diálogos está inicializado
        if (!dialogueSystem) {
            throw new Error('El sistema de diálogos no está inicializado');
        }
        
        // Mostrar el diálogo de bienvenida
        const welcomeMessage = await dialogueSystem.showDialogue(interaction, 'welcome');
        
        if (welcomeMessage) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(welcomeMessage);
            } else {
                await interaction.reply(welcomeMessage);
            }
        }
    } catch (error) {
        console.error('Error al iniciar el tutorial:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Error')
            .setDescription('¡Vaya! Parece que hubo un error al iniciar el tutorial. Por favor, inténtalo de nuevo más tarde.');
        
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}
