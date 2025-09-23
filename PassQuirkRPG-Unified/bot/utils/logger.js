const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Crear la carpeta de logs si no existe
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Formato personalizado para los logs
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
);

// Configuración del logger
const logger = createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'passquirk-bot' },
    transports: [
        // Archivo de errores
        new transports.File({ 
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Archivo de información general
        new transports.File({ 
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Si no estamos en producción, mostramos los logs en consola
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.combine(
            format.colorize(),
            format.printf(
                info => `${info.timestamp} [${info.level}]: ${info.message}`
            )
        )
    }));
}

module.exports = logger;
