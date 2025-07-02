// Script de prueba para identificar el módulo problemático
console.log('Iniciando prueba de módulos...');

try {
    console.log('1. Probando Discord.js...');
    const { Client, GatewayIntentBits } = require('discord.js');
    console.log('✅ Discord.js cargado correctamente');
    
    console.log('2. Probando base de datos...');
    const { connectDatabase } = require('./config/database');
    console.log('✅ Configuración de base de datos cargada');
    
    console.log('3. Probando modelo User...');
    const User = require('./models/User');
    console.log('✅ Modelo User cargado');
    
    console.log('4. Probando PassQuirkGameManager...');
    const PassQuirkGameManager = require('./core/passquirk-game-manager');
    console.log('✅ PassQuirkGameManager cargado');
    
    // console.log('5. Probando DialogueManager...');
    // const DialogueManager = require('./core/dialogue-manager');
    // console.log('✅ DialogueManager cargado');
    
    console.log('🎉 Todos los módulos principales se cargaron correctamente');
    
} catch (error) {
    console.error('❌ Error al cargar módulo:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}