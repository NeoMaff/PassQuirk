/**
 * Formatea un número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} Número formateado
 */
function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Genera un número entero aleatorio entre min y max (ambos incluidos)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatorio
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Formatea el tiempo en un formato legible
 * @param {number} ms - Tiempo en milisegundos
 * @returns {string} Tiempo formateado
 */
function formatTime(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    const timeParts = [];
    if (days > 0) timeParts.push(`${days}d`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (minutes > 0) timeParts.push(`${minutes}m`);
    if (seconds > 0 || timeParts.length === 0) timeParts.push(`${seconds}s`);

    return timeParts.slice(0, 2).join(' ');
}

/**
 * Calcula el tiempo restante hasta que se pueda realizar una acción nuevamente
 * @param {Date} lastAction - Fecha de la última acción
 * @param {number} cooldown - Tiempo de espera en milisegundos
 * @returns {Object} Objeto con tiempo restante y si está en cooldown
 */
function getCooldown(lastAction, cooldown) {
    const now = new Date();
    const timePassed = now - lastAction;
    const remainingTime = cooldown - timePassed;
    
    return {
        isOnCooldown: remainingTime > 0,
        remainingTime,
        formattedTime: formatTime(remainingTime > 0 ? remainingTime : 0)
    };
}

/**
 * Genera una barra de progreso
 * @param {number} current - Valor actual
 * @param {number} max - Valor máximo
 * @param {number} size - Tamaño de la barra
 * @returns {string} Barra de progreso
 */
function createProgressBar(current, max, size = 10) {
    const percentage = current / max;
    const progress = Math.round(size * percentage);
    const empty = size - progress;
    
    return `[${'█'.repeat(progress)}${'░'.repeat(empty)}] ${Math.round(percentage * 100)}%`;
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} string - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/**
 * Formatea una duración en segundos a formato MM:SS
 * @param {number} seconds - Duración en segundos
 * @returns {string} Duración formateada
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Obtiene un elemento aleatorio de un array
 * @param {Array} array - Array de elementos
 * @returns {*} Elemento aleatorio
 */
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Verifica si un usuario tiene un rol específico
 * @param {GuildMember} member - Miembro del servidor
 * @param {string} roleId - ID del rol a verificar
 * @returns {boolean} Si el usuario tiene el rol
 */
function hasRole(member, roleId) {
    return member.roles.cache.has(roleId);
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @param {GuildMember} member - Miembro del servidor
 * @param {PermissionFlagsBits} permission - Permiso a verificar
 * @returns {boolean} Si el usuario tiene el permiso
 */
function hasPermission(member, permission) {
    return member.permissions.has(permission);
}

module.exports = {
    formatNumber,
    getRandomInt,
    formatTime,
    getCooldown,
    createProgressBar,
    capitalize,
    formatDuration,
    getRandomElement,
    hasRole,
    hasPermission
};
