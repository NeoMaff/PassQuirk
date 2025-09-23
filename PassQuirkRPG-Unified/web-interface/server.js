const http = require('http');
const fs = require('fs');
const path = require('path');

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

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // Manejo de la ruta raíz o solicitudes sin archivo específico
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index-simple.html';
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
                        res.writeHead(200, { 'Content-Type': 'text/html' });
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
    console.log(`Servidor PassQuirk RPG iniciado en http://localhost:${PORT}`);
});
