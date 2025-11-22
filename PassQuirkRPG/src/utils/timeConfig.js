// ⏰ CONFIGURACIÓN DE TIEMPO - Sistema de gestión temporal

/**
 * Configuraciones de tiempo para diferentes actividades
 */
const TIME_CONFIG = {
    // Cooldowns en milisegundos
    COOLDOWNS: {
        WORK: 3600000, // 1 hora
        DAILY: 86400000, // 24 horas
        COMBAT: 300000, // 5 minutos
        EXPLORATION: 600000, // 10 minutos
        SHOP: 0, // Sin cooldown
        QUEST: 1800000 // 30 minutos
    },
    
    // Formatos de tiempo
    FORMATS: {
        SHORT: 'HH:mm',
        LONG: 'DD/MM/YYYY HH:mm:ss',
        DATE_ONLY: 'DD/MM/YYYY',
        TIME_ONLY: 'HH:mm:ss'
    },
    
    // Zonas horarias
    TIMEZONES: {
        DEFAULT: 'America/Mexico_City',
        UTC: 'UTC',
        MADRID: 'Europe/Madrid',
        BUENOS_AIRES: 'America/Argentina/Buenos_Aires'
    }
};

/**
 * Convierte milisegundos a formato legible
 * @param {number} ms - Milisegundos
 * @returns {string} Tiempo formateado
 */
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Calcula el tiempo restante para un cooldown
 * @param {Date} lastTime - Última vez que se realizó la acción
 * @param {number} cooldown - Cooldown en milisegundos
 * @returns {number} Tiempo restante en milisegundos
 */
function getRemainingCooldown(lastTime, cooldown) {
    if (!lastTime) return 0;
    
    const now = new Date();
    const timePassed = now.getTime() - lastTime.getTime();
    const remaining = cooldown - timePassed;
    
    return remaining > 0 ? remaining : 0;
}

/**
 * Verifica si un cooldown ha expirado
 * @param {Date} lastTime - Última vez que se realizó la acción
 * @param {number} cooldown - Cooldown en milisegundos
 * @returns {boolean} True si el cooldown ha expirado
 */
function isCooldownExpired(lastTime, cooldown) {
    return getRemainingCooldown(lastTime, cooldown) === 0;
}

/**
 * Obtiene la fecha actual en formato ISO
 * @returns {string} Fecha actual
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}

/**
 * Convierte una fecha a timestamp Unix
 * @param {Date} date - Fecha a convertir
 * @returns {number} Timestamp Unix
 */
function toUnixTimestamp(date) {
    return Math.floor(date.getTime() / 1000);
}

/**
 * Convierte un timestamp Unix a Date
 * @param {number} timestamp - Timestamp Unix
 * @returns {Date} Objeto Date
 */
function fromUnixTimestamp(timestamp) {
    return new Date(timestamp * 1000);
}

module.exports = {
    TIME_CONFIG,
    formatTime,
    getRemainingCooldown,
    isCooldownExpired,
    getCurrentTimestamp,
    toUnixTimestamp,
    fromUnixTimestamp
};