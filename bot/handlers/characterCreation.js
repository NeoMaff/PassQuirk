const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const Character = require('../models/Character');
const User = require('../models/User');
const { PassQuirkEmbed, SuccessEmbed } = require('../utils/embedStyles');
const { CLASSES, STARTER_ITEMS } = require('../utils/gameData');
const { COUNTRIES, TimeWeatherSystem } = require('../utils/timeWeatherSystem');

// Store temporary character creation data
const creationData = new Map();

// Handle country selection
async function handleCountrySelection(interaction) {
    const country = interaction.values[0];
    const userId = interaction.user.id;

    // Store country selection
    if (!creationData.has(userId)) {
        creationData.set(userId, {});
    }
    creationData.get(userId).country = country;
    creationData.get(userId).timezone = TimeWeatherSystem.getTimezoneForCountry(country);

    // Step 2: Class Selection
    const classEmbed = new PassQuirkEmbed()
        .setTitle('⚔️ Selecciona tu Clase')
        .setDescription(
            '**Cada clase tiene su propio estilo de juego único:**\n\n' +
            Object.values(CLASSES).map(c =>
                `${c.emoji} **${c.name}**\n` +
                `${c.description}\n` +
                `*${c.passive.name}:* ${c.passive.description}`
            ).join('\n\n')
        );

    const classSelect = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_class')
                .setPlaceholder('⚔️ Elige tu clase')
                .addOptions(
                    Object.values(CLASSES).map(c => ({
                        label: c.name,
                        value: c.name,
                        description: c.description.substring(0, 100),
                        emoji: c.emoji
                    }))
                )
        );

    await interaction.update({
        embeds: [classEmbed],
        components: [classSelect]
    });
}

// Handle class selection
async function handleClassSelection(interaction) {
    const className = interaction.values[0];
    const userId = interaction.user.id;

    // Store class selection
    if (!creationData.has(userId)) {
        return await interaction.reply({
            content: '❌ Error: Por favor usa `/start` para comenzar de nuevo.',
            ephemeral: true
        });
    }

    creationData.get(userId).class = className;

    // Step 3: Character Name and Gender
    const nameEmbed = new PassQuirkEmbed()
        .setTitle('✍️ Dale un nombre a tu personaje')
        .setDescription(
            `Has elegido la clase **${className}** ${CLASSES[className].emoji}\n\n` +
            'Ahora es momento de darle un nombre único a tu aventurero.\n' +
            '**Haz clic en el botón de abajo para ingresar el nombre de tu personaje.**'
        );

    const nameButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('character_name_modal')
                .setLabel('Ingresar Nombre')
                .setEmoji('✍️')
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.update({
        embeds: [nameEmbed],
        components: [nameButton]
    });
}

// Show name modal
async function showNameModal(interaction) {
    const modal = new ModalBuilder()
        .setCustomId('character_name_submit')
        .setTitle('Nombre de tu Personaje');

    const nameInput = new TextInputBuilder()
        .setCustomId('character_name')
        .setLabel('¿Cómo se llamará tu personaje?')
        .setStyle(TextInputStyle.Short)
        .setMinLength(2)
        .setMaxLength(20)
        .setPlaceholder('Ej: Aragorn, Merlin, Robin...')
        .setRequired(true);

    const genderInput = new TextInputBuilder()
        .setCustomId('character_gender')
        .setLabel('Género (male, female, other)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(10)
        .setPlaceholder('male, female, other')
        .setRequired(false);

    modal.addComponents(
        new ActionRowBuilder().addComponents(nameInput),
        new ActionRowBuilder().addComponents(genderInput)
    );

    await interaction.showModal(modal);
}

// Handle name submission and create character
async function handleNameSubmit(interaction) {
    const userId = interaction.user.id;
    const characterName = interaction.fields.getTextInputValue('character_name');
    const gender = interaction.fields.getTextInputValue('character_gender') || 'other';

    if (!creationData.has(userId)) {
        return await interaction.reply({
            content: '❌ Error: Los datos de creación expiraron. Por favor usa `/start` para comenzar de nuevo.',
            ephemeral: true
        });
    }

    const data = creationData.get(userId);

    await interaction.deferReply();

    try {
        // Create User record
        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({
                userId,
                username: interaction.user.username,
                balance: 1000,
                gems: 0,
                pg: 0
            });
            await user.save();
        }

        // Create Character
        const selectedClass = CLASSES[data.class];
        const character = new Character({
            userId,
            name: characterName,
            gender: gender.toLowerCase(),
            country: data.country,
            timezone: data.timezone,
            class: data.class,
            level: 1,
            experience: 0,
            expToNextLevel: 1000,
            stats: {
                ...selectedClass.baseStats,
                maxHp: 100,
                currentHp: 100,
                maxMana: 50,
                currentMana: 50,
                maxEnergy: 100,
                currentEnergy: 100,
                attack: 10 + selectedClass.baseStats.strength,
                defense: 10 + selectedClass.baseStats.constitution * 0.5,
                magicPower: 10 + selectedClass.baseStats.intelligence,
                magicDefense: 10 + selectedClass.baseStats.intelligence * 0.5,
                criticalChance: 5 + selectedClass.baseStats.luck * 0.5,
                criticalDamage: 150,
                evasion: 5 + selectedClass.baseStats.dexterity * 0.3,
                accuracy: 95 + selectedClass.baseStats.dexterity * 0.2,
                speed: selectedClass.baseStats.speed
            },
            skills: selectedClass.startingSkills.map(skillId => ({
                skillId,
                level: 1,
                maxLevel: 10
            })),
            location: {
                region: 'Reino de Akai',
                zone: 'Ciudad Inicial'
            },
            tutorialCompleted: false,
            tutorialStep: 0
        });

        // Update derived stats
        character.updateDerivedStats();

        await character.save();

        // Add starter items to user inventory
        const starterItems = STARTER_ITEMS[data.class] || [];
        for (const itemId of starterItems) {
            await user.addItem({
                itemId,
                amount: 1
            });
        }

        // Clear creation data
        creationData.delete(userId);

        // Success message
        const successEmbed = new SuccessEmbed(
            `¡Bienvenido a PassQuirk RPG, **${characterName}**!`,
            {
                title: '✅ ¡Personaje Creado!',
                fields: [
                    {
                        name: '⚔️ Clase',
                        value: `${selectedClass.emoji} ${data.class}`,
                        inline: true
                    },
                    {
                        name: '🌍 País',
                        value: data.country,
                        inline: true
                    },
                    {
                        name: '📍 Ubicación Inicial',
                        value: 'Reino de Akai - Ciudad Inicial',
                        inline: true
                    },
                    {
                        name: '🎒 Objetos Iniciales',
                        value: starterItems.length > 0 ? starterItems.join(', ') : 'Ninguno',
                        inline: false
                    },
                    {
                        name: '📚 Próximos Pasos',
                        value: [
                            '• Usa `/personaje` para ver tu perfil',
                            '• Usa `/explorar` para comenzar a explorar',
                            '• Usa `/combate` para entrar en batalla',
                            '• Usa `/misiones` para ver misiones disponibles'
                        ].join('\n'),
                        inline: false
                    }
                ]
            }
        );

        await interaction.editReply({ embeds: [successEmbed] });

    } catch (error) {
        console.error('Error creating character:', error);
        creationData.delete(userId);
        await interaction.editReply({
            content: '❌ Hubo un error al crear tu personaje. Por favor, intenta de nuevo con `/start`.'
        });
    }
}

module.exports = {
    handleCountrySelection,
    handleClassSelection,
    showNameModal,
    handleNameSubmit
};
