// Configuración de husos horarios y formatos
const timeZones = [
    {
        id: 'europe_madrid',
        name: '🇪🇸 Madrid',
        timezone: 'Europe/Madrid',
        emoji: '🇪🇸',
        default: true
    },
    {
        id: 'america_mexico',
        name: '🇲🇽 CDMX',
        timezone: 'America/Mexico_City',
        emoji: '🇲🇽'
    },
    {
        id: 'america_argentina',
        name: '🇦🇷 Buenos Aires',
        timezone: 'America/Argentina/Buenos_Aires',
        emoji: '🇦🇷'
    },
    {
        id: 'asia_tokyo',
        name: '🇯🇵 Tokio',
        timezone: 'Asia/Tokyo',
        emoji: '🇯🇵'
    },
    {
        id: 'america_newyork',
        name: '🇺🇸 Nueva York',
        timezone: 'America/New_York',
        emoji: '🇺🇸'
    }
];

// Función para obtener la configuración de una zona horaria por ID
function getTimeZoneConfig(zoneId) {
    return timeZones.find(zone => zone.id === zoneId) || timeZones[0]; // Devuelve Madrid por defecto
}

// Función para formatear la hora
function formatTime(date, timezone) {
    return date.toLocaleTimeString('es-ES', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).toUpperCase(); // Convertir a mayúsculas
}

// Función para formatear la fecha (solo números: dd/mm/aaaa)
function formatDate(date, timezone) {
    const options = {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    // Formatear la fecha y reemplazar los separadores
    return date.toLocaleDateString('es-ES', options)
        .replace(/\./g, '/')  // Reemplazar puntos por barras
        .replace(/-/g, '/')    // Reemplazar guiones por barras
        .replace(/\s+/g, '');  // Eliminar espacios
}

// Función para obtener el clima (simulada por ahora)
function getWeather() {
    // Esto es un ejemplo, deberías integrar con una API de clima real
    const weatherOptions = ['☀️ Soleado', '⛅ Nublado', '🌧️ Lluvia', '⛈️ Tormenta', '❄️ Nieve'];
    return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
}

module.exports = {
    timeZones,
    getTimeZoneConfig,
    formatTime,
    formatDate,
    getWeather
};
