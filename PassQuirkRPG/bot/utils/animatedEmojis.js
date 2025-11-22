/**
 * animatedEmojis.js
 * Contiene los emojis animados utilizados en PassQuirk RPG
 * Ahora utiliza el sistema centralizado de emojiManager
 * Mantiene compatibilidad con código existente
 */

const { getEmoji, getAllEmojis } = require('./emojiManager');

// Mapeo de compatibilidad para código existente
const animatedEmojis = {
    // Estrellas y Efectos
    get starPurple() { return getEmoji('star_purple'); },
    get starBlue() { return getEmoji('star_blue'); },
    get starRed() { return getEmoji('star_red'); },
    get starYellow() { return getEmoji('star_yellow'); },
    get starGreen() { return getEmoji('green_sparkles'); },
    get starGold() { return getEmoji('star_gold'); },
    get sparkleStars() { return getEmoji('sparkle_stars'); },
    
    // Coronas y Rangos
    get crownGreen() { return getEmoji('crown_green'); },
    get crownGold() { return getEmoji('crown_gold'); },
    get crownRed() { return getEmoji('crown_red'); },
    
    // Elementos y Efectos
    get greenFire() { return getEmoji('green_fire'); },
    get purplePortal() { return getEmoji('purple_portal'); },
    get spacePurple() { return getEmoji('space_purple'); },
    
    // Celebración y Recompensas
    get tada() { return getEmoji('tada'); },
    
    // Combate y Armas
    get swordGold() { return getEmoji('sword_gold'); },
    get katanaFire() { return getEmoji('katana_fire'); },
    get magicWand() { return getEmoji('magic_wand'); },
    get bow() { return getEmoji('bow'); },
    get dagger() { return getEmoji('dagger'); },
    get shield() { return getEmoji('shield'); },
    
    // Métodos de utilidad
    getEmoji: getEmoji,
    getAllEmojis: getAllEmojis
};

module.exports = animatedEmojis;