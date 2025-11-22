// 🗄️ CONEXIÓN DE BASE DE DATOS - Configuración centralizada
const { Sequelize } = require('sequelize');
const path = require('path');

// Configurar SQLite como base de datos local
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', '..', 'bot', 'passquirk.db'), // Usar la misma DB que el bot
    logging: false, // Desactivar logs SQL
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
    }
});

// Función para conectar y sincronizar la base de datos
const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos SQLite desde src/');
        
        // Sincronizar modelos (crear tablas si no existen)
        await sequelize.sync({ alter: true });
        console.log('✅ Base de datos sincronizada desde src/');
        
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos desde src/:', error);
        return false;
    }
};

// Función para cerrar la conexión
const closeDatabase = async () => {
    try {
        await sequelize.close();
        console.log('✅ Conexión a la base de datos cerrada desde src/');
    } catch (error) {
        console.error('❌ Error al cerrar la base de datos desde src/:', error);
    }
};

module.exports = sequelize;
module.exports.connectDatabase = connectDatabase;
module.exports.closeDatabase = closeDatabase;