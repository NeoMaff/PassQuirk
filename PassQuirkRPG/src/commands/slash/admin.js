const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { loadTutorialState, saveTutorialState } = require('../../../bot/utils/persistence');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Comandos de administración')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset_tutorial')
                .setDescription('Resetea el progreso del tutorial de un usuario')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('El usuario a resetear')
                        .setRequired(true)))
        .addSubcommandGroup(group =>
            group
                .setName('economy')
                .setDescription('Gestión de economía')
                .addSubcommand(sub =>
                    sub
                        .setName('add_money')
                        .setDescription('Añadir PassCoins a un usuario')
                        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
                        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true)))
                .addSubcommand(sub =>
                    sub
                        .setName('remove_money')
                        .setDescription('Quitar PassCoins a un usuario')
                        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
                        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Cantidad').setRequired(true))))
        .addSubcommandGroup(group =>
            group
                .setName('player')
                .setDescription('Gestión de jugadores')
                .addSubcommand(sub =>
                    sub
                        .setName('set_level')
                        .setDescription('Establecer nivel de un usuario')
                        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
                        .addIntegerOption(opt => opt.setName('nivel').setDescription('Nivel (1-100)').setRequired(true)))),
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const group = interaction.options.getSubcommandGroup();

        // --- RESET TUTORIAL ---
        if (subcommand === 'reset_tutorial') {
            const targetUser = interaction.options.getUser('usuario');
            const state = loadTutorialState();
            if (state.has(targetUser.id)) {
                state.delete(targetUser.id);
                saveTutorialState(state);
                await interaction.reply(`✅ Progreso del tutorial borrado para ${targetUser.username}.`);
            } else {
                await interaction.reply(`⚠️ No se encontraron datos de tutorial para ${targetUser.username}.`);
            }
            return;
        }

        // --- ECONOMY COMMANDS ---
        if (group === 'economy') {
            const targetUser = interaction.options.getUser('usuario');
            const amount = interaction.options.getInteger('cantidad');
            const player = await client.gameManager.getPlayer(targetUser.id);

            if (!player) {
                await interaction.reply({ content: `❌ El usuario ${targetUser.username} no tiene un personaje creado.`, ephemeral: true });
                return;
            }

            if (!player.economy) player.economy = { passcoins: 0, gems: 0 };

            if (subcommand === 'add_money') {
                player.economy.passcoins += amount;
                await client.gameManager.playerDB.savePlayer(player);
                await interaction.reply(`✅ Se han añadido **${amount} PassCoins** a ${targetUser.username}. Nuevo saldo: ${player.economy.passcoins}.`);
            } else if (subcommand === 'remove_money') {
                player.economy.passcoins = Math.max(0, player.economy.passcoins - amount);
                await client.gameManager.playerDB.savePlayer(player);
                await interaction.reply(`✅ Se han retirado **${amount} PassCoins** a ${targetUser.username}. Nuevo saldo: ${player.economy.passcoins}.`);
            }
            return;
        }

        // --- PLAYER COMMANDS ---
        if (group === 'player') {
            const targetUser = interaction.options.getUser('usuario');
            const player = await client.gameManager.getPlayer(targetUser.id);

            if (!player) {
                await interaction.reply({ content: `❌ El usuario ${targetUser.username} no tiene un personaje creado.`, ephemeral: true });
                return;
            }

            if (subcommand === 'set_level') {
                const level = interaction.options.getInteger('nivel');
                player.level = level;
                // Recalcular stats base (simple)
                player.stats.maxHp = 100 + ((level - 1) * 10);
                player.stats.hp = player.stats.maxHp;
                player.stats.maxMp = 50 + ((level - 1) * 5);
                player.stats.mp = player.stats.maxMp;

                await client.gameManager.playerDB.savePlayer(player);
                await interaction.reply(`✅ Nivel de ${targetUser.username} establecido a **${level}**. Stats recalculados.`);
            }
            return;
        }
    },
};
