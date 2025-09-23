// Configuración de la aplicación
const CONFIG = {
    // URL de la API (simulada para el frontend)
    API_URL: 'https://api.passquirk.com',
    
    // ID de la aplicación de Discord
    DISCORD_CLIENT_ID: '1374808784039579668',
    
    // URL de redirección después de la autenticación
    REDIRECT_URI: window.location.origin + '/auth/callback',
    
    // Ámbitos de permisos de Discord
    DISCORD_SCOPES: ['identify', 'email', 'guilds']
};

// Estado de la aplicación
const AppState = {
    user: null,
    isAuthenticated: false,
    currentSection: 'dashboard',
    music: {
        isPlaying: false,
        currentTrack: 0,
        volume: 0.7,
        tracks: [
            { 
                title: 'Tema de Exploración', 
                artist: 'PassQuirk OST', 
                src: 'assets/music/exploration.mp3' 
            },
            { 
                title: 'Batalla Épica', 
                artist: 'PassQuirk OST', 
                src: 'assets/music/battle.mp3' 
            },
            { 
                title: 'Ciudad Principal', 
                artist: 'PassQuirk OST', 
                src: 'assets/music/city.mp3' 
            }
        ]
    },
    audioElement: null
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado, iniciando aplicación');
    
    // Primero, ocultar el cargador después de un breve retraso
    setTimeout(() => {
        hideLoader();
        
        // Verificar si hay un token de autenticación en el almacenamiento local
        const token = localStorage.getItem('auth_token');
        
        if (token) {
            // Verificar si el token es válido (simulado)
            verifyToken(token)
                .then(user => {
                    loginSuccess(user);
                })
                .catch(error => {
                    console.error('Error al verificar el token:', error);
                    showAuthPanel();
                });
        } else {
            // Mostrar el panel de autenticación si no hay token
            showAuthPanel();
        }
        
        // Inicializar manejadores de eventos
        initEventListeners();
        
        // Inicializar el reproductor de música
        initMusicPlayer();
    }, 1500); // Esperar 1.5 segundos para simular carga
});

// Inicializar manejadores de eventos
function initEventListeners() {
    // Botón de inicio de sesión con Discord
    const discordLoginBtn = document.getElementById('discord-login');
    if (discordLoginBtn) {
        discordLoginBtn.addEventListener('click', handleDiscordLogin);
    }
    
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            if (section) {
                navigateTo(section);
            }
        });
    });
    
    // Menú de usuario
    const userMenuBtn = document.getElementById('user-menu-btn');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('show');
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', () => {
            userMenu.classList.remove('show');
        });
        
        // Evitar que el menú se cierre al hacer clic en él
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    // Cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Notificaciones
    const notificationBtn = document.getElementById('notification-btn');
    const notificationsPanel = document.getElementById('notifications-panel');
    const closeNotifications = document.getElementById('close-notifications');
    
    if (notificationBtn && notificationsPanel) {
        notificationBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsPanel.classList.toggle('show');
        });
        
        // Cerrar notificaciones al hacer clic fuera
        document.addEventListener('click', () => {
            notificationsPanel.classList.remove('show');
        });
        
        // Evitar que el panel se cierre al hacer clic en él
        notificationsPanel.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', () => {
            notificationsPanel.classList.remove('show');
        });
    }
}

// Manejar el inicio de sesión con Discord
function handleDiscordLogin() {
    // Construir la URL de autorización de Discord
    const authUrl = new URL('https://discord.com/api/oauth2/authorize');
    
    // Parámetros de la solicitud
    const params = {
        client_id: CONFIG.DISCORD_CLIENT_ID,
        redirect_uri: CONFIG.REDIRECT_URI,
        response_type: 'code',
        scope: CONFIG.DISCORD_SCOPES.join(' '),
        prompt: 'none'
    };
    
    // Agregar parámetros a la URL
    Object.keys(params).forEach(key => {
        authUrl.searchParams.append(key, params[key]);
    });
    
    // Redirigir al usuario a la página de autorización de Discord
    window.location.href = authUrl.toString();
}

// Verificar si el token de autenticación es válido (simulado)
async function verifyToken(token) {
    // En una implementación real, esto haría una solicitud a tu backend
    // Para este ejemplo, simulamos una respuesta exitosa después de un retraso
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simular un usuario autenticado
            const user = {
                id: '123456789012345678',
                username: 'UsuarioEjemplo',
                discriminator: '1234',
                avatar: 'a_1234567890abcdef',
                email: 'usuario@ejemplo.com',
                isAdmin: true
            };
            
            // Simular un token válido
            if (token === 'token_valido_simulado') {
                resolve(user);
            } else {
                reject(new Error('Token inválido'));
            }
        }, 500);
    });
}

// Manejar el inicio de sesión exitoso
function loginSuccess(userData) {
    // Actualizar el estado de la aplicación
    AppState.user = userData;
    AppState.isAuthenticated = true;
    
    // Actualizar la interfaz de usuario
    updateUserUI(userData);
    
    // Ocultar el panel de autenticación
    const authPanel = document.getElementById('auth-panel');
    if (authPanel) {
        authPanel.style.opacity = '0';
        setTimeout(() => {
            authPanel.style.display = 'none';
        }, 300);
    }
    
    // Mostrar el panel principal
    const mainPanel = document.getElementById('main-panel');
    const header = document.getElementById('header');
    
    if (mainPanel) mainPanel.classList.remove('hidden');
    if (header) header.classList.remove('hidden');
    
    // Navegar a la sección por defecto
    navigateTo('dashboard');
}

// Actualizar la interfaz de usuario con los datos del usuario
function updateUserUI(userData) {
    // Actualizar avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar) {
        userAvatar.src = userData.avatar 
            ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
    }
    
    // Actualizar nombre de usuario
    const username = document.getElementById('username');
    if (username) {
        username.textContent = userData.username || 'Usuario';
    }
    
    // Actualizar etiqueta de usuario (discriminator)
    const userTag = document.getElementById('user-tag');
    if (userTag) {
        userTag.textContent = `#${userData.discriminator || '0000'}`;
    }
    
    // Mostrar/ocultar elementos de administración
    const adminNav = document.getElementById('admin-nav');
    if (adminNav) {
        adminNav.style.display = userData.isAdmin ? 'flex' : 'none';
    }
}

// Mostrar el panel de autenticación
function showAuthPanel() {
    console.log('Mostrando panel de autenticación');
    const authPanel = document.getElementById('auth-panel');
    const mainPanel = document.getElementById('main-panel');
    const header = document.getElementById('header');
    
    // Ocultar elementos de la aplicación
    if (mainPanel) mainPanel.classList.add('hidden');
    if (header) header.classList.add('hidden');
    
    // Mostrar panel de autenticación
    if (authPanel) {
        authPanel.style.display = 'flex';
        authPanel.style.opacity = '1';
    } else {
        console.error('Error: No se encontró el elemento auth-panel');
    }
}

// Manejar el cierre de sesión
function handleLogout() {
    // Eliminar token de autenticación
    localStorage.removeItem('auth_token');
    
    // Restablecer estado
    AppState.user = null;
    AppState.isAuthenticated = false;
    
    // Detener la música si está reproduciéndose
    if (AppState.audioElement) {
        AppState.audioElement.pause();
        AppState.audioElement = null;
    }
    
    // Mostrar panel de autenticación
    showAuthPanel();
    
    // Actualizar la interfaz de usuario
    updateUserUI({ username: 'Invitado', discriminator: '0000' });
    
    // Navegar a la página de inicio
    navigateTo('dashboard');
}

// Navegar a una sección de la aplicación
function navigateTo(sectionId) {
    // Actualizar la clase activa en la navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Actualizar el estado actual
    AppState.currentSection = sectionId;
    
    // Cargar el contenido de la sección
    loadSectionContent(sectionId);
}

// Cargar el contenido de una sección
async function loadSectionContent(sectionId) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;
    
    // Mostrar indicador de carga
    contentArea.innerHTML = `
        <div class="flex items-center justify-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
    `;
    
    try {
        // Aquí cargarías el contenido de la sección desde el servidor
        // Por ahora, usaremos contenido estático de ejemplo
        let content = '';
        
        switch (sectionId) {
            case 'dashboard':
                content = `
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-6">Panel de Control</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div class="bg-bg-card p-6 rounded-lg shadow">
                                <h3 class="text-lg font-semibold mb-2">Bienvenido, ${AppState.user?.username || 'Aventurero'}!</h3>
                                <p class="text-text-secondary">Explora el mundo de PassQuirk y vive emocionantes aventuras.</p>
                            </div>
                            <!-- Más widgets del dashboard -->
                        </div>
                    </div>
                `;
                break;
                
            case 'character':
                content = `
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-6">Tu Personaje</h2>
                        <div class="bg-bg-card p-6 rounded-lg shadow">
                            <p>Información del personaje aquí...</p>
                        </div>
                    </div>
                `;
                break;
                
            // Más secciones...
                
            default:
                content = `
                    <div class="p-6">
                        <h2 class="text-2xl font-bold mb-6">${sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}</h2>
                        <div class="bg-bg-card p-6 rounded-lg shadow">
                            <p>Contenido de la sección ${sectionId}.</p>
                        </div>
                    </div>
                `;
        }
        
        // Actualizar el contenido
        contentArea.innerHTML = content;
        
    } catch (error) {
        console.error(`Error al cargar la sección ${sectionId}:`, error);
        
        contentArea.innerHTML = `
            <div class="p-6">
                <div class="bg-red-900/20 border border-red-700 text-red-200 p-4 rounded">
                    <h3 class="font-bold">Error al cargar el contenido</h3>
                    <p>${error.message || 'Intenta recargar la página'}</p>
                </div>
            </div>
        `;
    }
}

// Inicializar el reproductor de música
function initMusicPlayer() {
    if (!AppState.audioElement) {
        AppState.audioElement = new Audio();
        
        // Configurar eventos del reproductor
        AppState.audioElement.addEventListener('ended', playNextTrack);
        
        // Configurar volumen inicial
        AppState.audioElement.volume = AppState.music.volume;
        
        // Actualizar controles de volumen
        const volumeControl = document.getElementById('volume');
        if (volumeControl) {
            volumeControl.value = AppState.music.volume * 100;
            volumeControl.addEventListener('input', (e) => {
                const volume = e.target.value / 100;
                AppState.audioElement.volume = volume;
                AppState.music.volume = volume;
            });
        }
        
        // Configurar botones de control
        const playPauseBtn = document.getElementById('play-pause');
        const prevTrackBtn = document.getElementById('prev-track');
        const nextTrackBtn = document.getElementById('next-track');
        
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlayPause);
        }
        
        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', playPreviousTrack);
        }
        
        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', playNextTrack);
        }
        
        // Cargar la primera canción
        loadTrack(AppState.music.currentTrack);
    }
}

// Cargar una pista de audio
function loadTrack(trackIndex) {
    const track = AppState.music.tracks[trackIndex];
    if (!track) return;
    
    // Actualizar información de la pista
    const musicTitle = document.querySelector('.music-title');
    const musicArtist = document.querySelector('.music-artist');
    
    if (musicTitle) musicTitle.textContent = track.title;
    if (musicArtist) musicArtist.textContent = track.artist;
    
    // Cargar la pista
    if (AppState.audioElement) {
        AppState.audioElement.src = track.src;
        
        // Reproducir automáticamente si estaba reproduciéndose
        if (AppState.music.isPlaying) {
            AppState.audioElement.play().catch(e => {
                console.error('Error al reproducir la pista:', e);
            });
        }
    }
}

// Reproducir o pausar la reproducción
function togglePlayPause() {
    if (!AppState.audioElement) return;
    
    if (AppState.audioElement.paused) {
        AppState.audioElement.play().catch(e => {
            console.error('Error al reproducir:', e);
        });
        AppState.music.isPlaying = true;
        
        // Actualizar botón
        const playPauseBtn = document.getElementById('play-pause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    } else {
        AppState.audioElement.pause();
        AppState.music.isPlaying = false;
        
        // Actualizar botón
        const playPauseBtn = document.getElementById('play-pause');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
}

// Reproducir la pista anterior
function playPreviousTrack() {
    AppState.music.currentTrack = (AppState.music.currentTrack - 1 + AppState.music.tracks.length) % AppState.music.tracks.length;
    loadTrack(AppState.music.currentTrack);
    
    // Si estaba reproduciéndose, continuar la reproducción
    if (AppState.music.isPlaying) {
        AppState.audioElement.play().catch(e => {
            console.error('Error al reproducir la pista anterior:', e);
        });
    }
}

// Reproducir la siguiente pista
function playNextTrack() {
    AppState.music.currentTrack = (AppState.music.currentTrack + 1) % AppState.music.tracks.length;
    loadTrack(AppState.music.currentTrack);
    
    // Si estaba reproduciéndose, continuar la reproducción
    if (AppState.music.isPlaying) {
        AppState.audioElement.play().catch(e => {
            console.error('Error al reproducir la siguiente pista:', e);
        });
    }
}

// Mostrar el cargador
function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

// Ocultar el cargador
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}
