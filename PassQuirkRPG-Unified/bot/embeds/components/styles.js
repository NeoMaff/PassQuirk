// Estilos predefinidos para los diálogos y componentes
export const DIALOGUE_STYLES = {
    colors: {
        primary: '#6B4EFF',
        success: '#4CAF50',
        warning: '#FF9800',
        danger: '#F44336',
        info: '#2196F3',
        default: '#36393F',
        dark: '#1E1E2D',
        light: '#F8F9FA'
    },
    images: {
        npc: {
            wiseMan: 'https://i.imgur.com/example1.png',
            merchant: 'https://i.imgur.com/example2.png',
            warrior: 'https://i.imgur.com/example3.png'
        },
        backgrounds: {
            forest: 'https://i.imgur.com/example-bg1.png',
            village: 'https://i.imgur.com/example-bg2.png',
            dungeon: 'https://i.imgur.com/example-bg3.png'
        }
    },
    buttonStyles: {
        primary: { style: 'Primary', emoji: '✨' },
        secondary: { style: 'Secondary', emoji: '🔘' },
        success: { style: 'Success', emoji: '✅' },
        danger: { style: 'Danger', emoji: '⚠️' },
        link: { style: 'Link', emoji: '🔗' }
    }
};

// Mapeo de estilos de botones de Discord.js
export const BUTTON_STYLES = {
    Primary: 1,
    Secondary: 2,
    Success: 3,
    Danger: 4,
    Link: 5
};

// Clases CSS para los componentes (para referencia en documentación)
export const COMPONENT_CLASSES = {
    button: {
        base: 'px-4 py-2 rounded-lg font-medium transition-colors',
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        link: 'text-blue-500 hover:underline bg-transparent'
    },
    card: 'bg-gray-800 rounded-lg p-6 shadow-lg',
    dialog: 'max-w-2xl mx-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl',
    input: 'w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
};
