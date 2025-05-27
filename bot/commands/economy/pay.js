const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const User = require('../../models/User');
const { formatNumber } = require('../../utils/helpers');

// Tipos de moneda disponibles
const CURRENCIES = {
    balance: { name: 'Monedas', emoji: '💰', min: 1, max: 1000000 },
    gems: { name: 'Gemas', emoji: '💎', min: 1, max: 1000 },
    pg: { name: 'Puntos de Gremio', emoji: '⚔️', min: 1, max: 5000 }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pagar')
        .setDescription('Transfiere monedas a otro usuario')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('Usuario al que quieres enviar dinero')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('moneda')
                .setDescription('Tipo de moneda a transferir')
                .setRequired(true)
                .addChoices(
                    { name: `💰 Monedas`, value: 'balance' },
                    { name: `💎 Gemas`, value: 'gems' },
                    { name: `⚔️ Puntos de Gremio`, value: 'pg' }
                )
        )
        .addIntegerOption(option =>
            option.setName('cantidad')
                .setDescription('Cantidad a transferir')
                .setRequired(true)
                .setMinValue(1)
        )
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de la transferencia')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const currencyType = interaction.options.getString('moneda');
        const amount = interaction.options.getInteger('cantidad');
        const reason = interaction.options.getString('razon') || 'Sin razón especificada';
        const currency = CURRENCIES[currencyType];
        
        // Validaciones iniciales
        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ No puedes transferir dinero a un bot.',
                ephemeral: true
            });
        }
        
        if (targetUser.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ No puedes transferirte dinero a ti mismo.',
                ephemeral: true
            });
        }
        
        if (amount < currency.min || amount > currency.max) {
            return interaction.reply({
                content: `❌ La cantidad debe estar entre ${formatNumber(currency.min)} y ${formatNumber(currency.max)} ${currency.name.toLowerCase()}.`,
                ephemeral: true
            });
        }
        
        // Iniciar transacción en la base de datos
        const session = await User.startSession();
        session.startTransaction();
        
        try {
            // Obtener o crear el remitente
            let sender = await User.findOne({ userId: interaction.user.id }).session(session);
            if (!sender) {
                sender = new User({
                    userId: interaction.user.id,
                    username: interaction.user.username,
                    balance: 1000,
                    gems: 10,
                    pg: 0,
                    transactions: []
                });
            }
            
            // Verificar si el remitente tiene suficiente saldo
            if (sender[currencyType] < amount) {
                await session.abortTransaction();
                session.endSession();
                
                const needed = amount - sender[currencyType];
                return interaction.reply({
                    content: `❌ No tienes suficiente saldo. Necesitas ${currency.emoji} ${formatNumber(needed)} más.`,
                    ephemeral: true
                });
            }
            
            // Obtener o crear el destinatario
            let receiver = await User.findOne({ userId: targetUser.id }).session(session);
            if (!receiver) {
                receiver = new User({
                    userId: targetUser.id,
                    username: targetUser.username,
                    balance: 1000,
                    gems: 10,
                    pg: 0,
                    transactions: []
                });
            }
            
            // Realizar la transferencia
            sender[currencyType] -= amount;
            receiver[currencyType] += amount;
            
            // Registrar la transacción
            const transaction = {
                type: 'transfer',
                amount: amount,
                currency: currencyType,
                from: interaction.user.id,
                to: targetUser.id,
                reason: reason,
                timestamp: new Date()
            };
            
            sender.transactions.push({
                ...transaction,
                isOutgoing: true
            });
            
            receiver.transactions.push({
                ...transaction,
                isOutgoing: false
            });
            
            // Guardar cambios
            await sender.save({ session });
            await receiver.save({ session });
            await session.commitTransaction();
            session.endSession();
            
            // Crear embed de confirmación
            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Transferencia Exitosa')
                .setDescription(`Has transferido ${currency.emoji} **${formatNumber(amount)} ${currency.name}** a ${targetUser}.`)
                .addFields(
                    { name: 'Destinatario', value: `${targetUser} (${targetUser.username})`, inline: true },
                    { name: 'Moneda', value: `${currency.emoji} ${currency.name}`, inline: true },
                    { name: 'Razón', value: reason, inline: false },
                    { 
                        name: 'Saldo Actual', 
                        value: `**${currency.emoji} ${formatNumber(sender[currencyType])}**`,
                        inline: false 
                    }
                )
                .setFooter({ text: `Transacción completada` })
                .setTimestamp();
            
            // Enviar notificación al destinatario
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('💸 ¡Has recibido una transferencia!')
                    .setDescription(`${interaction.user} te ha enviado ${currency.emoji} **${formatNumber(amount)} ${currency.name}**.`)
                    .addFields(
                        { name: 'Monto', value: `${currency.emoji} ${formatNumber(amount)}`, inline: true },
                        { name: 'Razón', value: reason, inline: true },
                        { name: 'Nuevo Saldo', value: `${currency.emoji} ${formatNumber(receiver[currencyType])}`, inline: false }
                    )
                    .setFooter({ text: `Usa /inventario para ver tu saldo` })
                    .setTimestamp();
                
                await targetUser.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.error('No se pudo enviar DM al destinatario:', dmError);
                // No es crítico, continuar
            }
            
            await interaction.reply({ 
                content: `${targetUser} ha recibido tu transferencia.`,
                embeds: [embed] 
            });
            
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            
            console.error('Error en el comando pagar:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Error')
                .setDescription('Ocurrió un error al procesar la transferencia. Por favor, inténtalo de nuevo más tarde.');
                
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    }
};
