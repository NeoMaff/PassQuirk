// Variables globales
let currentUser = null;
let currentServer = null;
let servers = [];

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar la interfaz
    initUI();
    
    // Cargar datos del usuario
    loadUserData();
    
    // Cargar servidores del usuario
    loadUserServers();
    
    // Configurar eventos
    setupEventListeners();
});

// Inicializar la interfaz de usuario
function initUI() {
    // Aquí puedes inicializar componentes de la interfaz
    console.log('Inicializando interfaz de usuario...');
}

// Cargar datos del usuario autenticado
async function loadUserData() {
    try {
        // En una implementación real, esto haría una petición a tu API
        // const response = await fetch('/api/user');
        // currentUser = await response.json();
        
        // Datos de ejemplo
        currentUser = {
            id: '1234567890',
            username: 'Admin',
            discriminator: '0001',
            avatar: 'https://cdn.discordapp.com/avatars/1234567890/avatar.png',
            email: 'admin@example.com',
            isAdmin: true
        };
        
        // Actualizar la interfaz con los datos del usuario
        updateUserUI();
        
    } catch (error) {
        console.error('Error al cargar los datos del usuario:', error);
        showAlert('Error al cargar los datos del usuario', 'error');
    }
}

// Cargar servidores del usuario
async function loadUserServers() {
    try {
        // En una implementación real, esto haría una petición a tu API
        // const response = await fetch('/api/user/servers');
        // servers = await response.json();
        
        // Datos de ejemplo
        servers = [
            {
                id: '1',
                name: 'Servidor de Prueba',
                icon: 'https://via.placeholder.com/64',
                hasBot: true,
                memberCount: 1234,
                economy: {
                    totalPC: 5678,
                    totalGems: 234,
                    totalPG: 45
                },
                activity: 89
            },
            {
                id: '2',
                name: 'Otro Servidor',
                icon: 'https://via.placeholder.com/64',
                hasBot: false
            },
            {
                id: '3',
                name: 'Servidor sin Bot',
                icon: 'https://via.placeholder.com/64',
                hasBot: false
            }
        ];
        
        // Seleccionar el primer servidor con bot por defecto
        const serverWithBot = servers.find(s => s.hasBot);
        if (serverWithBot) {
            selectServer(serverWithBot.id);
        }
        
    } catch (error) {
        console.error('Error al cargar los servidores:', error);
        showAlert('Error al cargar los servidores', 'error');
    }
}

// Actualizar la interfaz con los datos del usuario
function updateUserUI() {
    if (!currentUser) return;
    
    // Actualizar avatar y nombre de usuario
    const userAvatar = document.querySelector('#user-menu img');
    const userName = document.querySelector('#user-menu span');
    
    if (userAvatar) userAvatar.src = currentUser.avatar;
    if (userName) userName.textContent = currentUser.username;
    
    // Aquí puedes actualizar más elementos de la interfaz según sea necesario
}

// Seleccionar un servidor
function selectServer(serverId) {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;
    
    currentServer = server;
    
    // Actualizar la interfaz con los datos del servidor
    updateServerUI();
    
    // Cargar estadísticas del servidor
    loadServerStats(serverId);
}

// Actualizar la interfaz con los datos del servidor
function updateServerUI() {
    if (!currentServer) return;
    
    const serverName = document.querySelector('#server-name');
    const memberCount = document.querySelector('#member-count');
    const economyTotal = document.querySelector('#economy-total');
    const activityPercent = document.querySelector('#activity-percent');
    
    if (serverName) serverName.textContent = currentServer.name;
    if (memberCount && currentServer.memberCount) memberCount.textContent = currentServer.memberCount.toLocaleString();
    if (economyTotal && currentServer.economy) economyTotal.textContent = currentServer.economy.totalPC.toLocaleString() + ' PC';
    if (activityPercent && currentServer.activity) activityPercent.textContent = currentServer.activity + '%';
}

// Cargar estadísticas del servidor
async function loadServerStats(serverId) {
    try {
        // En una implementación real, esto haría una petición a tu API
        // const response = await fetch(`/api/servers/${serverId}/stats`);
        // const stats = await response.json();
        
        // Actualizar la interfaz con las estadísticas
        console.log(`Cargando estadísticas para el servidor ${serverId}...`);
        
    } catch (error) {
        console.error('Error al cargar las estadísticas del servidor:', error);
        showAlert('Error al cargar las estadísticas del servidor', 'error');
    }
}

// Configurar manejadores de eventos
function setupEventListeners() {
    // Menú de usuario
    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenu && userDropdown) {
        userMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', function() {
            userDropdown.classList.add('hidden');
        });
    }
    
    // Botón de logout
    const logoutBtn = document.querySelector('a[href="#logout"]');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Navegación por pestañas
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase activa de todos los enlaces
            navLinks.forEach(l => l.classList.remove('bg-gray-700', 'text-white'));
            
            // Agregar clase activa al enlace clickeado
            this.classList.add('bg-gray-700', 'text-white');
            
            // Aquí puedes cargar el contenido de la sección seleccionada
            const section = this.getAttribute('href').substring(1);
            loadSection(section);
        });
    });
}

// Cargar el contenido de una sección
async function loadSection(section) {
    console.log(`Cargando sección: ${section}`);
    
    // Aquí puedes cargar el contenido dinámico de cada sección
    // Por ejemplo, hacer una petición a la API para obtener los datos necesarios
    // y luego actualizar el DOM con el contenido correspondiente
    
    // Ejemplo básico de actualización del título de la página
    const pageTitle = document.querySelector('h2');
    if (pageTitle) {
        const sectionTitles = {
            'economy': 'Configuración de Economía',
            'shops': 'Tiendas',
            'commands': 'Ejecutar Comandos',
            'permissions': 'Gestión de Permisos',
            'settings': 'Ajustes del Bot',
            'game-mode': 'Configuración del Modo de Juego'
        };
        
        pageTitle.textContent = sectionTitles[section] || 'Panel de Control';
    }
}

// Manejar cierre de sesión
function handleLogout() {
    // En una implementación real, aquí harías una petición para cerrar la sesión
    console.log('Cerrando sesión...');
    
    // Redirigir al inicio de sesión
    window.location.href = 'index.html';
}

// Mostrar una alerta
function showAlert(message, type = 'info') {
    // Crear el elemento de alerta si no existe
    let alertContainer = document.getElementById('alert-container');
    
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alert-container';
        alertContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(alertContainer);
    }
    
    // Crear la alerta
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} flex items-center p-4 rounded-lg shadow-lg`;
    
    // Icono según el tipo de alerta
    let icon = '';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            alert.className += ' bg-green-100 text-green-800';
            break;
        case 'error':
            icon = 'exclamation-circle';
            alert.className += ' bg-red-100 text-red-800';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            alert.className += ' bg-yellow-100 text-yellow-800';
            break;
        default:
            icon = 'info-circle';
            alert.className += ' bg-blue-100 text-blue-800';
    }
    
    alert.innerHTML = `
        <i class="fas fa-${icon} mr-3"></i>
        <span>${message}</span>
        <button class="ml-auto text-gray-500 hover:text-gray-700" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar la alerta al contenedor
    alertContainer.appendChild(alert);
    
    // Eliminar la alerta después de 5 segundos
    setTimeout(() => {
        alert.classList.add('opacity-0', 'transition-opacity', 'duration-500');
        setTimeout(() => alert.remove(), 500);
    }, 5000);
}

// Ejecutar un comando en el servidor
async function executeCommand(command, args = {}) {
    try {
        if (!currentServer) {
            throw new Error('No se ha seleccionado ningún servidor');
        }
        
        // En una implementación real, esto enviaría el comando al servidor
        // const response = await fetch(`/api/servers/${currentServer.id}/commands`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         command,
        //         args
        //     })
        // });
        // 
        // if (!response.ok) {
        //     throw new Error('Error al ejecutar el comando');
        // }
        // 
        // return await response.json();
        
        // Simulación de respuesta
        console.log(`Ejecutando comando: ${command}`, args);
        return { success: true, message: 'Comando ejecutado correctamente' };
        
    } catch (error) {
        console.error('Error al ejecutar el comando:', error);
        showAlert(`Error al ejecutar el comando: ${error.message}`, 'error');
        throw error;
    }
}

// Exportar funciones para uso global
window.PassQuirkDashboard = {
    showAlert,
    executeCommand,
    loadSection,
    selectServer
};

// Inicializar tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('.has-tooltip');
    
    tooltipElements.forEach(element => {
        const tooltip = element.querySelector('.tooltip');
        
        if (tooltip) {
            element.addEventListener('mouseenter', () => {
                // Posicionar el tooltip
                const rect = element.getBoundingClientRect();
                tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                tooltip.style.left = `${rect.left + window.scrollX}px`;
            });
        }
    });
}

// Inicializar tooltips cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initTooltips);
