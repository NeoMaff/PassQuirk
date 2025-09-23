// ⏰ COMANDO CAMBIAR ZONA - Administración de zonas horarias
const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { timeZones, getTimeZoneConfig } = require('../../utils/timeConfig');
const { QuickDB } = require('quick.db');

const db = new QuickDB();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cambiar-zona')
        .setDescription('Cambia la zona horaria de los canales de tiempo')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const config = await db.get(`timeConfig_${interaction.guild.id}`);
        
        if (!config) {
            return interaction.reply({
                content: '❌ Primero debes configurar los canales de tiempo con `/configurar-tiempo`',
                ephemeral: true
            });
        }

        // Crear menú desplegable de zonas horarias
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_timezone')
            .setPlaceholder('Selecciona una zona horaria')
            .addOptions(
                timeZones.map(zone => ({
                    label: zone.name,
                    description: `Zona horaria: ${zone.timezone}`,
                    value: zone.timezone,
                    emoji: zone.emoji,
                    default: zone.timezone === (config.timezone || 'Europe/Madrid')
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('🌍 Cambiar Zona Horaria')
            .setDescription('Selecciona la zona horaria que deseas configurar para los canales de tiempo.')
            .setFooter({ text: 'Esta configuración afectará a todos los canales de tiempo del servidor.' });

        await interaction.reply({ 
            embeds: [embed], 
            components: [row],
            ephemeral: true 
        });
    },

    // Esta función se llama cuando se selecciona una opción en el menú
    async handleTimezoneSelect(interaction) {
        const timezone = interaction.values[0];
        const zoneConfig = timeZones.find(z => z.timezone === timezone) || timeZones[0];
        
        try {
            // Actualizar la configuración en la base de datos
            await db.set(`timeConfig_${interaction.guild.id}.timezone`, timezone);
            
            // Actualizar los canales inmediatamente
            const client = interaction.client;
            await updateTimeChannels(client, interaction.guild.id);
            
            // Enviar confirmación
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Zona horaria actualizada')
                .setDescription(`Se ha cambiado la zona horaria a **${zoneConfig.name} (${timezone})**`)
                .addFields(
                    { name: 'Hora actual', value: new Date().toLocaleTimeString('es-ES', { timeZone: timezone }) },
                    { name: 'Fecha actual', value: new Date().toLocaleDateString('es-ES', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }
                )
                .setFooter({ text: 'Los canales se actualizarán automáticamente cada minuto.' });

            await interaction.update({ embeds: [embed], components: [] });
            
        } catch (error) {
            console.error('Error al actualizar la zona horaria:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Error al actualizar la zona horaria')
                .setDescription('No se pudo actualizar la zona horaria. Por favor, inténtalo de nuevo.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};

// Función auxiliar para actualizar los canales (la misma que en configurar-tiempo.js)
async function updateTimeChannels(client, guildId) {
    try {
        const config = await client.db.get(`timeConfig_${guildId}`);
        if (!config) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const timeChannel = guild.channels.cache.get(config.timeChannelId);
        const dateChannel = guild.channels.cache.get(config.dateChannelId);

        if (!timeChannel || !dateChannel) return;

        const now = new Date();
        const timezone = config.timezone || 'Europe/Madrid';
        
        // Actualizar nombre del canal de hora
        const timeText = formatTime(now, timezone);
        if (timeChannel.name !== `🕒│hora-${timeText}`) {
            await timeChannel.setName(`🕒│hora-${timeText}`).catch(console.error);
        }

        // Actualizar nombre del canal de fecha (solo si cambia el día)
        const dateText = formatDate(now, timezone);
        const formattedDate = dateText.charAt(0).toUpperCase() + dateText.slice(1);
        if (dateChannel.name !== `📅│${formattedDate}`) {
            await dateChannel.setName(`📅│${formattedDate}`).catch(console.error);
        }

    } catch (error) {
        console.error('Error al actualizar canales de tiempo:', error);
    }
}
