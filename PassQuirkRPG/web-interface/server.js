const http = require('http');
const fs = require('fs');
const path = require('path');
const playerDB = require('../bot/data/player-database');

const PORT = 8080;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm',
    '.webp': 'image/webp'
};

function getContentType(filePath) {
    const ext = path.extname(filePath);
    return MIME_TYPES[ext] || 'application/octet-stream';
}

const server = http.createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // API Endpoints
    if (req.url.startsWith('/api/') || req.url.startsWith('/auth/')) {
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for development

        // Auth Callback (Mock implementation)
        if (req.url.startsWith('/auth/discord/callback')) {
            // In a real app, we would exchange the code for a token here using Client Secret
            // For now, we'll just redirect to the dashboard with a mock "logged in" state
            res.writeHead(302, {
                'Location': '/?loggedin=true'
            });
            res.end();
            return;
        }

        // Get Current User (Mock)
        if (req.url === '/api/auth/me') {
            res.setHeader('Content-Type', 'application/json');
            // Mock user data
            const mockUser = {
                id: '123456789',
                username: 'TestUser',
                discriminator: '0000',
                avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
            };
            res.writeHead(200);
            res.end(JSON.stringify(mockUser));
            return;
        }

        if (req.url.startsWith('/api/player/')) {
            res.setHeader('Content-Type', 'application/json');
            const userId = req.url.split('/').pop();
            if (req.method === 'GET') {
                try {
                    const player = await playerDB.getPlayer(userId);
                    if (player) {
                        res.writeHead(200);
                        res.end(JSON.stringify(player));
                    } else {
                        res.writeHead(404);
                        res.end(JSON.stringify({ error: 'Player not found' }));
                    }
                } catch (error) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            }
            return;
        }

        if (req.url === '/api/stats') {
            res.setHeader('Content-Type', 'application/json');
            // Mock stats for now, or read from a stats file if exists
            const stats = {
                online: true,
                players: 100, // Placeholder
                uptime: process.uptime()
            };
            res.writeHead(200);
            res.end(JSON.stringify(stats));
            return;
        }

        res.writeHead(404);
        res.end(JSON.stringify({ error: 'API Endpoint not found' }));
        return;
    }

    // Manejo de la ruta raíz o solicitudes sin archivo específico
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html'; // Default to index.html, not index-simple
    }

    // Obtener la ruta completa al archivo
    const fullPath = path.resolve(__dirname, filePath);

    // Verificar si el archivo existe
    fs.access(fullPath, fs.constants.F_OK, (err) => {
        if (err) {
            // Si el archivo no existe, verificar si es una ruta de SPA
            // y servir index.html
            if (req.url.startsWith('/auth/') || req.url.includes('?code=')) {
                const indexPath = path.resolve(__dirname, 'index.html');
                fs.readFile(indexPath, (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error interno del servidor');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
                return;
            }

            // Archivo no encontrado
            res.writeHead(404);
            res.end('Archivo no encontrado');
            return;
        }

        // Si es un directorio, buscar index.html
        fs.stat(fullPath, (err, stats) => {
            if (err) {
                res.writeHead(500);
                res.end('Error interno del servidor');
                return;
            }

            if (stats.isDirectory()) {
                const indexPath = path.join(fullPath, 'index.html');
                fs.access(indexPath, fs.constants.F_OK, (err) => {
                    if (err) {
                        res.writeHead(404);
                        res.end('Directorio sin index.html');
                        return;
                    }

                    fs.readFile(indexPath, (err, content) => {
                        if (err) {
                            res.writeHead(500);
                            res.end('Error interno del servidor');
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': getContentType(indexPath) });
                        res.end(content, 'utf-8');
                    });
                });
                return;
            }

            // Leer y servir el archivo
            fs.readFile(fullPath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error interno del servidor');
                    return;
                }

                const contentType = getContentType(fullPath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            });
        });
    });
});

server.listen(PORT, () => {
    console.log(`Servidor web iniciado en http://localhost:${PORT}`);
});
