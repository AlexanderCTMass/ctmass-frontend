// src/middleware/cors.js

// Список разрешенных источников
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'https://ctmass.com', // замените на ваш домен
    'https://ctmasstest.web.app', // если используете Firebase Hosting
    'https://ctmasstest.firebaseapp.com'
];

export function setCorsHeaders(req, res) {
    const origin = req.headers.origin;

    // В эмуляторе или если origin в списке - разрешаем
    if (process.env.FUNCTIONS_EMULATOR === 'true' ||
        (origin && allowedOrigins.includes(origin)) ||
        (origin && origin.includes('localhost'))) {
        res.set('Access-Control-Allow-Origin', origin);
    } else {
        // Для продакшена без origin
        res.set('Access-Control-Allow-Origin', '*');
    }

    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Access-Control-Max-Age', '3600');
}

export function handleCors(req, res) {
    setCorsHeaders(req, res);

    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return true;
    }
    return false;
}