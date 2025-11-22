const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const musicManager = require('../../../bot/utils/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spacecentral')
        .setDescription('Viaja a Space Central, el centro del universo PassQuirk.'),
    async execute(interaction, client) {
        const userId = interaction.user.id;
        const player = await client.gameManager.getPlayer(userId);

        if (!player) {
            await interaction.reply({ content: '❌ No tienes un personaje creado. Usa `/passquirkrpg` para comenzar.', ephemeral: true });
            return;
        }

        // Actualizar ubicación
        player.exploration.currentZone = 'Space Central';
        await client.gameManager.playerDB.savePlayer(player);

        // Reproducir música de Space Central
        if (musicManager) {
            const member = interaction.member;
            if (member && member.voice.channel) {
                try {
                    await musicManager.joinChannel(member.voice.channel);
                    musicManager.playFile('e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Música/Aventura - PassQuirk.wav', true);
                } catch (e) { console.error('Error playing Space Central music:', e); }
            }
        }

        const emojiPortal = '🌀';
        const emojiCity = '🏙️';
        const emojiHotel = '🏨';
        const emojiMap = '🗺️';
        const emojiProfile = '👤';

        // Check if this is the player's first visit
        const firstVisit = !player.exploration?.visitedSpaceCentral;

        // Mark as visited for future checks
        if (!player.exploration) player.exploration = {};
        if (!player.exploration.visitedSpaceCentral) {
            player.exploration.visitedSpaceCentral = true;
            await client.gameManager.playerDB.savePlayer(player);
        }

        let embedDescription = `${emojiPortal} **Bienvenido a Space Central**, viajero.\n\n`;

        // Add first-time visitor onboarding
        if (firstVisit) {
            embedDescription += `> [!IMPORTANT]\n` +
                `> 🗺️ **¡Guarda este lugar!**\n` +
                `> Para volver aquí en cualquier momento, usa el comando \`/spacecentral\`.\n` +
                `> Este es tu nexo principal para viajar, curarte y gestionar tu cuenta.\n\n`;
        }

        embedDescription += `Aquí puedes descansar, comerciar y prepararte para tu próxima aventura.\n\n` +
            `**Lugares de Interés:**\n` +
            `> ${emojiHotel} **Gran Hotel:** Descansa y recupera tu salud.\n` +
            `> ${emojiMap} **Portal de Exploración:** Viaja a otros reinos.\n` +
            `> ${emojiProfile} **Centro de Datos:** Consulta tu perfil.\n\n` +
            `*La ciudad nunca duerme, y las oportunidades son infinitas.*`;

        const embed = new EmbedBuilder()
            .setTitle(`${emojiCity} **Space Central**`)
            .setDescription(embedDescription)
            .setColor('#9B59B6')
            .setImage('attachment://Icono_PassQuirk_V1.png')
            .setFooter({ text: 'Space Central • Zona Segura' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('hub_hotel')
                    .setLabel('Ir al Hotel')
                    .setEmoji(emojiHotel)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('hub_explore')
                    .setLabel('Explorar')
                    .setEmoji(emojiMap)
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('hub_profile')
                    .setLabel('Perfil')
                    .setEmoji(emojiProfile)
                    .setStyle(ButtonStyle.Secondary)
            );

        const files = [{
            attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Icono - PassQuirk V1.png',
            name: 'Icono_PassQuirk_V1.png'
        }];

        await interaction.reply({ embeds: [embed], components: [row], files: files });
    },

    async handleInteraction(interaction, client) {
        const id = interaction.customId;
        const userId = interaction.user.id;
        const player = await client.gameManager.getPlayer(userId);

        if (!player) return;

        if (id === 'hub_hotel') {
            const emojiHotel = '🏨';
            const emojiCoin = '🪙';

            const embed = new EmbedBuilder()
                .setTitle(`${emojiHotel} **Gran Hotel Space Central**`)
                .setDescription(`Bienvenido al Gran Hotel. Aquí puedes descansar y recuperarte.\n\n` +
                    `**Servicios Disponibles:**\n` +
                    `> **Habitación Estándar:** Recupera 100% HP y MP.\n` +
                    `> **Costo:** 50 ${emojiCoin} PassCoins\n\n` +
                    `*Tu saldo actual:* ${player.economy?.passcoins || 0} ${emojiCoin}`)
                .setColor('#F1C40F')
                .setFooter({ text: 'Gran Hotel • Descanso Garantizado' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('hub_hotel_rent')
                        .setLabel('Alquilar Habitación (50 PC)')
                        .setEmoji('🛏️')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled((player.economy?.passcoins || 0) < 50),
                    new ButtonBuilder()
                        .setCustomId('hub_back')
                        .setLabel('Volver al Centro')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Secondary)
                );

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        } else if (id === 'hub_hotel_rent') {
            if ((player.economy?.passcoins || 0) < 50) {
                await interaction.reply({ content: '❌ No tienes suficientes PassCoins.', ephemeral: true });
                return;
            }

            // Deducir costo
            player.economy.passcoins -= 50;

            // Curar jugador
            player.stats.hp = 100 + ((player.level - 1) * 15); // Max HP calculation roughly
            player.stats.mp = 50 + ((player.level - 1) * 8);   // Max MP calculation roughly

            await client.gameManager.playerDB.savePlayer(player);

            const embed = new EmbedBuilder()
                .setTitle('🛏️ **Descanso Completado**')
                .setDescription(`Has descansado en una habitación cómoda.\n\n` +
                    `**¡HP y MP restaurados al máximo!**\n` +
                    `Saldo restante: ${player.economy.passcoins} PassCoins`)
                .setColor('#2ECC71');

            await interaction.update({ embeds: [embed], components: [] });

        } else if (id === 'hub_back') {
            const emojiPortal = '🌀';
            const emojiCity = '🏙️';
            const emojiHotel = '🏨';
            const emojiMap = '🗺️';
            const emojiProfile = '👤';

            const embed = new EmbedBuilder()
                .setTitle(`${emojiCity} **Space Central**`)
                .setDescription(`${emojiPortal} **Bienvenido a Space Central**, viajero.\n\n` +
                    `Aquí puedes descansar, comerciar y prepararte para tu próxima aventura.\n\n` +
                    `**Lugares de Interés:**\n` +
                    `> ${emojiHotel} **Gran Hotel:** Descansa y recupera tu salud.\n` +
                    `> ${emojiMap} **Portal de Exploración:** Viaja a otros reinos.\n` +
                    `> ${emojiProfile} **Centro de Datos:** Consulta tu perfil.\n\n` +
                    `*La ciudad nunca duerme, y las oportunidades son infinitas.*`)
                .setColor('#9B59B6')
                .setFooter({ text: 'Space Central • Zona Segura' });

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder().setCustomId('hub_hotel').setLabel('Ir al Hotel').setEmoji(emojiHotel).setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('hub_explore').setLabel('Explorar').setEmoji(emojiMap).setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('hub_profile').setLabel('Perfil').setEmoji(emojiProfile).setStyle(ButtonStyle.Secondary)
                );

            const files = [{
                attachment: 'e:/PassQuirk/PassQuirkRPG/documentation/Doc-Oficial/Imagenes - Diseño/Npc - Imagenes/Icono - PassQuirk V1.png',
                name: 'Icono_PassQuirk_V1.png'
            }];

            await interaction.update({ embeds: [embed], components: [row], files: files });

        } else if (id === 'hub_explore') {
            const explorarCmd = client.commands.get('explorar');
            if (explorarCmd) await explorarCmd.execute(interaction, client);
        } else if (id === 'hub_profile') {
            const perfilCmd = client.commands.get('perfil');
            if (perfilCmd) await perfilCmd.execute(interaction, client);
        }
    }
};
