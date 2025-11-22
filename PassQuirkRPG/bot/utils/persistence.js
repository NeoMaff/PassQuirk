const fs = require('fs');
const path = require('path');

const STORAGE_PATH = path.join(__dirname, '../data/tutorial_temp_storage.json');

// Asegurar que el directorio existe
const dir = path.dirname(STORAGE_PATH);
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}

function saveTutorialState(dataMap) {
    try {
        // Convertir Map a Array para JSON
        const data = Array.from(dataMap.entries());
        fs.writeFileSync(STORAGE_PATH, JSON.stringify(data, null, 2));
        // console.log('💾 Estado del tutorial guardado.');
    } catch (error) {
        console.error('❌ Error guardando estado del tutorial:', error);
    }
}

function loadTutorialState() {
    try {
        if (!fs.existsSync(STORAGE_PATH)) {
            return new Map();
        }
        const data = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
        return new Map(data);
    } catch (error) {
        console.error('❌ Error cargando estado del tutorial:', error);
        return new Map();
    }
}

module.exports = {
    saveTutorialState,
    loadTutorialState
};
