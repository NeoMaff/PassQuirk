/**
 * Sistema centralizado de manejo de emojis personalizados de Discord
 * Todos los emojis están subidos al servidor de Discord del bot
 */

// Mapeo completo de emojis personalizados
const CUSTOM_EMOJIS = {
    // === DECORATIVOS Y EFECTOS ===
    youtube: '1441601264353021972',
    bloodpoints: '1441601131682725898',
    redrose: '1441601130382626837',
    croissant: '1441601129333915688',
    pinkheart: '1441601128419557436',
    purplebook: '1441601127178305587',
    redpresent: '1441601125932335174',
    sevlev: '1441601125076959232',
    greenrose: '1441601123415752925',
    strawberry: '1441601122241478746',
    cherry: '1441601120169623634',
    drink: '1441601118944886835',
    purple_moon: '1441601117870886994',
    heartsparkles: '1441601121205616841',
    fire: '1441597244372422698',
    firepixel: '1441597246671163423',
    fireblack: '1441597243193823242',

    // === NIVELES (Level Badges) ===
    level1: '1441601885831303308',
    level2: '1441601882211614892',
    level3: '1441601827749264929',
    level4: '1441601884132479048',
    level5: '1441601883415253133',
    level6: '1441601879418212453',
    level7: '1441601887093915658',
    level8: '1441601880613457930',

    // === RIBBONS (Lazos de colores) ===
    redribbon: '1441601772513923072',
    deepblueribbon: '1441601771549688628',
    greenribbon: '1441601702573833526',
    purpleribbon: '1441601692801110674',
    orangeribbon: '1441601676191703977',
    hotpinkribbon: '1441601662054277763',
    purplebats: '1441601706088595477',

    // === ICONOS DE ROL/RANGO ===
    serverpartner: '1441601704805138484',
    ownericon: '1441601703769149471',
    moderatoricon: '1441601702016061440',
    qabetatester: '1441601697511112787',
    developericon: '1441601690028609618',
    adminicon: '1441601686568177795',

    // === PLATAFORMAS SOCIALES ===
    megaphone: '1441601685138856869',
    discord: '1441601288081758412',
    twitch: '1441601266592645180',
    steam: '1441601265132900494'
};

/**
 * Obtiene el formato de emoji para usar en texto de Discord
 * @param {string} name - Nombre del emoji (sin prefijo)
 * @param {boolean} animated - Si el emoji es animado (por defecto true)
 * @returns {string} - String de emoji formateado <a:name:id>
 */
function getEmoji(name, animated = true) {
    const id = CUSTOM_EMOJIS[name.toLowerCase()];
    if (!id) return '❓'; // Emoji de respaldo si no existe

    const prefix = animated ? 'a' : '';
    return `<${prefix}:${name}:${id}>`;
}

/**
 * Obtiene la URL CDN del emoji para usar en iconURL de embeds
 * @param {string} name - Nombre del emoji
 * @returns {string} - URL completa del emoji
 */
function getEmojiURL(name) {
    const id = CUSTOM_EMOJIS[name.toLowerCase()];
    if (!id) return null;
    return `https://cdn.discordapp.com/emojis/${id}.gif`;
}

/**
 * Obtiene el emoji de nivel apropiado según el nivel del jugador
 * @param {number} level - Nivel del jugador
 * @returns {string} - Emoji de nivel formateado
 */
function getLevelEmoji(level) {
    if (level >= 80) return getEmoji('level8');
    if (level >= 60) return getEmoji('level7');
    if (level >= 40) return getEmoji('level6');
    if (level >= 30) return getEmoji('level5');
    if (level >= 20) return getEmoji('level4');
    if (level >= 10) return getEmoji('level3');
    if (level >= 5) return getEmoji('level2');
    return getEmoji('level1');
}

/**
 * Obtiene el emoji de ribbon apropiado según rareza/calidad
 * @param {string} rarity - Rareza del item (common, uncommon, rare, epic, legendary)
 * @returns {string} - Emoji de ribbon formateado
 */
function getRarityRibbon(rarity) {
    const ribbonMap = {
        legendary: 'purpleribbon',
        epic: 'hotpinkribbon',
        rare: 'deepblueribbon',
        uncommon: 'greenribbon',
        common: 'redribbon'
    };
    return getEmoji(ribbonMap[rarity.toLowerCase()] || 'redribbon');
}

module.exports = {
    CUSTOM_EMOJIS,
    getEmoji,
    getEmojiURL,
    getLevelEmoji,
    getRarityRibbon
};