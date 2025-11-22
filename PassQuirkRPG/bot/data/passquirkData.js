// ⚡ DATOS OFICIALES PASSQUIRK RPG - Basado en CioMaff/PassQuirk-RPG
// 🌟 Documentación oficial: https://github.com/CioMaff/PassQuirk-RPG/tree/main/passquirkdoc
// 🔄 Última actualización: Integración completa de sistemas oficiales

// 💸 SISTEMA DE ECONOMÍA OFICIAL
const ECONOMIA_SISTEMA = {
    monedaPrincipal: {
        nombre: '🪙 Monedas PassQuirk',
        simbolo: '🪙',
        descripcion: 'Moneda base para comprar armas, mejoras y consumibles'
    },
    mercadoGachapon: {
        nombre: '🎰 Gachapón Místico',
        descripcion: 'Sistema aleatorio para conseguir armas, quirks y objetos raros',
        costos: {
            comun: 100,
            raro: 250,
            epico: 500,
            legendario: 1000,
            mitico: 2500
        }
    },
    comercioJugadores: {
        habilitado: true,
        comision: 0.05, // 5% de comisión
        impuestos: 0.02 // 2% de impuestos
    }
};

// 📦 SISTEMA DE DROPS Y COFRES OFICIAL
const DROPS_SISTEMA = {
    cofreComun: {
        objetos: ['Poción Vida', 'Poción Energía', 'Bolsa 🪙'],
        probabilidades: { comun: 0.8, raro: 0.2 }
    },
    cofreEpico: {
        objetos: ['Quirks', 'Llaves', 'Pergaminos', 'Tickets'],
        probabilidades: { raro: 0.4, epico: 0.4, legendario: 0.2 }
    },
    jefesMapa: {
        objetos: ['Fragmentos', 'Quirks', 'Cofres especiales'],
        garantizado: 'raro_o_superior'
    },
    enemigosNormales: {
        objetos: ['Bolsas de Monedas', 'Pociones'],
        probabilidades: { comun: 0.7, raro: 0.3 }
    },
    eventoEspecial: {
        objetos: 'cualquier_item_incluido_mitico',
        probabilidades: 'segun_evento'
    }
};

// 🗡️ SISTEMA DE LUCHA OFICIAL
const LUCHA_SISTEMA = {
    ataquesBasicos: {
        disponible: 'todos_los_jugadores',
        tipos: ['Golpe', 'Patada', 'Esquivar']
    },
    usoArmas: {
        efectosUnicos: true,
        compatibilidadClase: true,
        durabilidad: true
    },
    usoQuirks: {
        tiempoRecarga: true,
        nivelesmejora: true,
        sinergias: true
    },
    defensaEscudos: {
        mitigacionDano: true,
        equipamientoInfluye: true
    },
    combos: {
        ataquesBasicos: true,
        armas: true,
        quirks: true,
        efectosAdicionales: true
    }
};

module.exports = {
    // 🌟 PassQuirks Oficiales (11 PassQuirks Únicos)
    passquirks: {
        1: {
            id: 'fenix',
            name: 'Fénix',
            description: 'Potencia habilidades de regeneración y fuego. Permite renacer de las cenizas con mayor poder.',
            compatibleClasses: ['🧙‍♂️ Mago', '🛡️ Guerrero'],
            rarity: '🟠 Legendario',
            abilities: ['Regeneración Avanzada', 'Llamas Fénix', 'Renacimiento']
        },
        2: {
            id: 'vendaval',
            name: 'Vendaval',
            description: 'Otorga velocidad extrema y control total del viento. Permite movimientos supersónicos.',
            compatibleClasses: ['🏹 Arquero', '🥷 Ninja'],
            rarity: '🟣 Épico',
            abilities: ['Velocidad Extrema', 'Ráfagas de Viento', 'Vuelo Temporal']
        },
        3: {
            id: 'tierra',
            name: 'Tierra',
            description: 'Dominio absoluto sobre la tierra y rocas. Permite crear estructuras y terremotos.',
            compatibleClasses: ['🛡️ Guerrero', '⚔️ Espadachín'],
            rarity: '🔵 Raro',
            abilities: ['Control Terrestre', 'Muros de Piedra', 'Terremoto']
        },
        4: {
            id: 'oscuridad',
            name: 'Oscuridad',
            description: 'Manipulación de sombras y energía oscura. Permite volverse invisible y ataques sigilosos.',
            compatibleClasses: ['🥷 Ninja', '🔮 Hechicero'],
            rarity: '🟣 Épico',
            abilities: ['Invisibilidad', 'Ataques Sombra', 'Teletransporte Oscuro']
        },
        5: {
            id: 'bestia',
            name: 'Bestia',
            description: 'Transformación en criaturas salvajes. Aumenta instintos y habilidades físicas.',
            compatibleClasses: ['🛡️ Guerrero', '🏹 Arquero'],
            rarity: '🔵 Raro',
            abilities: ['Transformación Animal', 'Instintos Salvajes', 'Rugido Intimidante']
        },
        6: {
            id: 'trueno',
            name: 'Trueno',
            description: 'Control sobre rayos y electricidad. Ataques de alta velocidad y parálisis.',
            compatibleClasses: ['🧙‍♂️ Mago', '🏹 Arquero'],
            rarity: '🟠 Legendario',
            abilities: ['Rayo Devastador', 'Velocidad Eléctrica', 'Campo Electromagnético']
        },
        7: {
            id: 'dragon',
            name: 'Dragón',
            description: 'Poder ancestral de dragones. Aliento de fuego y resistencia suprema.',
            compatibleClasses: ['🛡️ Guerrero', '🧙‍♂️ Mago'],
            rarity: '🔴 Mítico',
            abilities: ['Aliento de Dragón', 'Escamas Protectoras', 'Vuelo Dragónico']
        },
        8: {
            id: 'agua',
            name: 'Agua',
            description: 'Maestría sobre el agua en todas sus formas. Curación y ataques fluidos.',
            compatibleClasses: ['🧙‍♂️ Mago', '🔮 Hechicero'],
            rarity: '🔵 Raro',
            abilities: ['Torrente Curativo', 'Tsunami', 'Caminar sobre Agua']
        },
        9: {
            id: 'vacio',
            name: 'Vacío',
            description: 'Manipulación del espacio-tiempo. Teletransporte y ataques dimensionales.',
            compatibleClasses: ['🔮 Hechicero', '🥷 Ninja'],
            rarity: '🔴 Mítico',
            abilities: ['Portal Dimensional', 'Distorsión Espacial', 'Anulación de Ataques']
        },
        10: {
            id: 'caos',
            name: 'Caos',
            description: 'Energía impredecible que puede generar cualquier efecto aleatorio.',
            compatibleClasses: ['🔓 Todas las clases (Universal)'],
            rarity: '🔴 Mítico',
            abilities: ['Efecto Aleatorio', 'Distorsión de Realidad', 'Suerte Extrema']
        },
        11: {
            id: 'luz',
            name: 'Luz',
            description: 'Poder divino de la luz pura. Curación masiva y ataques sagrados.',
            compatibleClasses: ['🔓 Todas las clases (Universal)'],
            rarity: '✨ Celestial',
            abilities: ['Curación Divina', 'Rayo Sagrado', 'Purificación']
        }
    },

    // 🎭 Clases Oficiales (6 Clases Únicas)
    CLASES_OFICIALES: {
        celestial: {
            name: '🌟 Celestial',
            emoji: '🌟',
            description: 'Guerrero divino con poderes celestiales y habilidades de curación.',
            stats: {
                fuerza: 4,
                defensa: 4,
                velocidad: 3,
                magia: 4,
                energia: 5
            },
            compatiblePassQuirks: ['Luz', 'Fénix', 'Dragón', 'Trueno'],
            specialties: ['Poderes Divinos', 'Curación Avanzada', 'Resistencia Mágica']
        },
        fenix: {
            name: '🔥 Fénix',
            emoji: '🔥',
            description: 'Mago especializado en fuego y regeneración con capacidad de renacimiento.',
            stats: {
                fuerza: 2,
                defensa: 3,
                velocidad: 3,
                magia: 5,
                energia: 4
            },
            compatiblePassQuirks: ['Fénix', 'Fuego', 'Luz', 'Caos'],
            specialties: ['Magia de Fuego', 'Regeneración', 'Renacimiento']
        },
        berserker: {
            name: '⚔️ Berserker',
            emoji: '⚔️',
            description: 'Guerrero salvaje que aumenta su poder con la ira y el combate.',
            stats: {
                fuerza: 5,
                defensa: 2,
                velocidad: 4,
                magia: 1,
                energia: 3
            },
            compatiblePassQuirks: ['Bestia', 'Tierra', 'Caos', 'Oscuridad'],
            specialties: ['Furia de Combate', 'Ataques Devastadores', 'Resistencia al Dolor']
        },
        inmortal: {
            name: '💀 Inmortal',
            emoji: '💀',
            description: 'Ser que ha trascendido la muerte con poderes necrománticos.',
            stats: {
                fuerza: 3,
                defensa: 5,
                velocidad: 2,
                magia: 4,
                energia: 4
            },
            compatiblePassQuirks: ['Oscuridad', 'Vacío', 'Caos', 'Luz'],
            specialties: ['Inmortalidad', 'Necromancia', 'Resistencia Suprema']
        },
        demon: {
            name: '👹 Demon',
            emoji: '👹',
            description: 'Entidad demoníaca con poderes oscuros y habilidades de corrupción.',
            stats: {
                fuerza: 4,
                defensa: 3,
                velocidad: 4,
                magia: 4,
                energia: 3
            },
            compatiblePassQuirks: ['Oscuridad', 'Caos', 'Fuego', 'Vacío'],
            specialties: ['Poderes Demoniacos', 'Corrupción', 'Invocación']
        },
        sombra: {
            name: '🌑 Sombra',
            emoji: '🌑',
            description: 'Asesino de las sombras con habilidades de sigilo y velocidad extrema.',
            stats: {
                fuerza: 3,
                defensa: 2,
                velocidad: 5,
                magia: 3,
                energia: 4
            },
            compatiblePassQuirks: ['Oscuridad', 'Vacío', 'Vendaval', 'Caos'],
            specialties: ['Sigilo Absoluto', 'Asesinato', 'Velocidad Sombría']
        }
    },

    // 👹 Enemigos Oficiales por Zonas
    ENEMIGOS_OFICIALES: {
        reino_akai: {
            name: '🌟 Reino de Akai',
            description: 'Reino celestial donde habitan criaturas de luz',
            enemies: {
                guardian_luz: {
                    name: 'Guardián de Luz',
                    emoji: '👼',
                    level: '1-5',
                    hp: 150,
                    attack: 25,
                    defense: 20,
                    rarity: '⚪ Común',
                    drops: ['Fragmento de Luz', 'Poción de Vida'],
                    abilities: ['Rayo Sagrado', 'Curación Menor']
                },
                angel_guerrero: {
                    name: 'Ángel Guerrero',
                    emoji: '⚔️👼',
                    level: '6-10',
                    hp: 300,
                    attack: 45,
                    defense: 35,
                    rarity: '🔵 Raro',
                    drops: ['Espada Celestial', 'Armadura Sagrada'],
                    abilities: ['Golpe Divino', 'Escudo de Luz', 'Vuelo']
                },
                serafin: {
                    name: 'Serafín',
                    emoji: '🔥👼',
                    level: '15+',
                    hp: 800,
                    attack: 120,
                    defense: 80,
                    rarity: '🟠 Legendario',
                    drops: ['Alas de Serafín', 'Llama Eterna'],
                    abilities: ['Juicio Final', 'Llamas Purificadoras', 'Regeneración Divina']
                }
            }
        },
        reino_say: {
            name: '🌊 Reino de Say',
            description: 'Reino acuático con criaturas marinas místicas',
            enemies: {
                elemental_agua: {
                    name: 'Elemental de Agua',
                    emoji: '🌊',
                    level: '3-8',
                    hp: 200,
                    attack: 30,
                    defense: 25,
                    rarity: '⚪ Común',
                    drops: ['Esencia de Agua', 'Perla Marina'],
                    abilities: ['Torrente', 'Curación Acuática']
                },
                kraken_joven: {
                    name: 'Kraken Joven',
                    emoji: '🐙',
                    level: '10-15',
                    hp: 500,
                    attack: 70,
                    defense: 50,
                    rarity: '🟣 Épico',
                    drops: ['Tentáculo de Kraken', 'Tinta Mística'],
                    abilities: ['Abrazo Mortal', 'Tinta Cegadora', 'Regeneración']
                },
                leviatán: {
                    name: 'Leviatán',
                    emoji: '🐋',
                    level: '20+',
                    hp: 1200,
                    attack: 150,
                    defense: 100,
                    rarity: '🔴 Mítico',
                    drops: ['Corazón de Leviatán', 'Escama Ancestral'],
                    abilities: ['Tsunami Devastador', 'Rugido Abismal', 'Control Oceánico']
                }
            }
        },
        isla_rey_demonio: {
            name: '🔥 Isla del Rey Demonio',
            description: 'Territorio infernal lleno de demonios y criaturas oscuras',
            enemies: {
                demonio_menor: {
                    name: 'Demonio Menor',
                    emoji: '👹',
                    level: '5-12',
                    hp: 250,
                    attack: 40,
                    defense: 30,
                    rarity: '🔵 Raro',
                    drops: ['Cuerno Demoníaco', 'Llama Infernal'],
                    abilities: ['Garra Ardiente', 'Rugido Intimidante']
                },
                archdemonio: {
                    name: 'Archdemonio',
                    emoji: '😈',
                    level: '15-25',
                    hp: 700,
                    attack: 100,
                    defense: 70,
                    rarity: '🟠 Legendario',
                    drops: ['Corona Demoníaca', 'Poder Oscuro'],
                    abilities: ['Fuego Infernal', 'Invocación Demoníaca', 'Teletransporte']
                },
                rey_demonio: {
                    name: 'Rey Demonio',
                    emoji: '👑😈',
                    level: '30+',
                    hp: 2000,
                    attack: 250,
                    defense: 150,
                    rarity: '✨ Celestial',
                    drops: ['Trono del Caos', 'Poder Supremo'],
                    abilities: ['Apocalipsis', 'Dominación Mental', 'Regeneración Demoníaca', 'Invocación Masiva']
                }
            }
        }
    },

    // 🌟 Sistema de Rarezas Oficial
    rarities: {
        comun: { name: '⚪ Común', color: '#FFFFFF', chance: 45 },
        raro: { name: '🔵 Raro', color: '#0099FF', chance: 30 },
        epico: { name: '🟣 Épico', color: '#9933FF', chance: 15 },
        legendario: { name: '🟡 Legendario', color: '#FFD700', chance: 7 },
        mitico: { name: '🔴 Mítico', color: '#FF0000', chance: 2.5 },
        celestial: { name: '✨ Celestial', color: '#FFFF99', chance: 0.4 },
        caos: { name: '🔴 Caos', color: '#990000', chance: 0.1 }
    },

    // 🆕 SISTEMAS OFICIALES INTEGRADOS
    ECONOMIA_SISTEMA,
    DROPS_SISTEMA,
    LUCHA_SISTEMA,

    // 🎰 Funciones del Sistema de Gachapón
    calcularCostoGachapon: (rareza) => {
        return ECONOMIA_SISTEMA.mercadoGachapon.costos[rareza] || 100;
    },

    // 📦 Funciones del Sistema de Drops
    calcularDropProbabilidad: (fuente, rareza) => {
        const sistema = DROPS_SISTEMA[fuente];
        if (!sistema) return 0;
        return sistema.probabilidades[rareza] || 0;
    },

    // 💰 Funciones de Economía
    calcularComision: (precio) => {
        return Math.floor(precio * ECONOMIA_SISTEMA.comercioJugadores.comision);
    },

    calcularImpuestos: (precio) => {
        return Math.floor(precio * ECONOMIA_SISTEMA.comercioJugadores.impuestos);
    },

    // 🗡️ Funciones de Combate
    verificarCompatibilidadArma: (arma, clase) => {
        return true; // Placeholder
    },

    calcularDañoCombo: (ataqueBasico, arma, quirk) => {
        let dañoBase = 10;
        if (arma) dañoBase += 15;
        if (quirk) dañoBase += 25;
        return dañoBase;
    }
};