const { SlashCommandBuilder } = require('discord.js');
const { ProfileEmbed, ErrorEmbed, COLORS } = require('../utils/embedStyles');
const User = require('../models/User');

const CLASSES = {
    warrior: { name: '⚔️ Guerrero', color: '#FF6B6B' },
    mage: { name: '🔮 Mago', color: '#4ECDC4' },
    archer: { name: '🏹 Arquero', color: '#95E1D3' },
    rogue: { name: '🗡️ Ladrón', color: '#F38181' }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('personaje')
        .setDescription('Muestra la información de tu personaje')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Ver el personaje de otro usuario')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const userId = targetUser.id;

        try {
            const user = await User.findOne({ discordId: userId });

            if (!user || !user.character) {
                return interaction.reply({
                    embeds: [new ErrorEmbed(
                        targetUser.id === interaction.user.id
                            ? 'No tienes un personaje creado. Usa `/crearpersonaje` para empezar tu aventura.'
                            : `${targetUser.username} no tiene un personaje creado.`,
                        {
                            tip: targetUser.id === interaction.user.id
                                ? 'Completa el tutorial con `/tutorial` antes de crear tu personaje.'
                                : null
                        }
                    )],
                    ephemeral: true
                });
            }

            const { character, balance, gems, pg, stats } = user;
            const classInfo = CLASSES[character.class] || { name: character.class, color: COLORS.PRIMARY };

            // Crear el embed del perfil
            const embed = new ProfileEmbed(
                targetUser,
                {
                    level: character.level,
                    xp: character.xp,
                    xpToNext: character.xpToNext,
                    balance: balance,
                    gems: gems,
                    pg: pg,
                    battles: stats.battles,
                    victories: stats.victories,
                    playtime: stats.playtime
                }
            );

            embed.setColor(classInfo.color);
            embed.setTitle(`${character.name} • ${classInfo.name}`);

            // Añadir estadísticas del personaje
            const statsText = [
                `⚔️ **Fuerza:** ${character.stats.fuerza}`,
                `🎯 **Destreza:** ${character.stats.destreza}`,
                `🧠 **Inteligencia:** ${character.stats.inteligencia}`,
                `❤️ **Constitución:** ${character.stats.constitucion}`,
                `🍀 **Suerte:** ${character.stats.suerte}`
            ].join('\n');

            embed.addFields({
                name: '📊 Estadísticas del Personaje',
                value: statsText,
                inline: true
            });

            // Añadir salud y energía
            const healthBar = this.createBar(character.stats.hp, character.stats.maxHp, 10);
            const paBar = this.createBar(character.stats.pa, character.stats.maxPa, 10);

            embed.addFields({
                name: '⚡ Estado',
                value: `❤️ **HP:** ${healthBar}\n${character.stats.hp}/${character.stats.maxHp}\n\n` +
                       `💙 **PA:** ${paBar}\n${character.stats.pa}/${character.stats.maxPa}`,
                inline: true
            });

            // Añadir habilidades
            if (character.skills && character.skills.length > 0) {
                embed.addFields({
                    name: '✨ Habilidades',
                    value: character.skills.map(skill => `• ${skill}`).join('\n'),
                    inline: false
                });
            }

            // Añadir equipo
            const equipment = [];
            if (character.equipment?.weapon) equipment.push(`⚔️ **Arma:** ${character.equipment.weapon}`);
            if (character.equipment?.armor) equipment.push(`🛡️ **Armadura:** ${character.equipment.armor}`);
            if (character.equipment?.accessory) equipment.push(`💍 **Accesorio:** ${character.equipment.accessory}`);

            if (equipment.length > 0) {
                embed.addFields({
                    name: '🎒 Equipamiento',
                    value: equipment.join('\n'),
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '🎒 Equipamiento',
                    value: '*Sin equipo equipado*',
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error fetching character:', error);
            await interaction.reply({
                embeds: [new ErrorEmbed('Hubo un error al obtener la información del personaje.')],
                ephemeral: true
            });
        }
    },

    createBar(current, max, size = 10) {
        const progress = Math.min(Math.round((current / max) * size), size);
        return `[${'█'.repeat(progress)}${'░'.repeat(size - progress)}]`;
    }
};
