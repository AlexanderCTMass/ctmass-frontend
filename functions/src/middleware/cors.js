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

    // Разрешаем источник, если он в списке или если это localhost (для разработки)
    if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost'))) {
        res.set('Access-Control-Allow-Origin', origin);
    } else {
        // Для продакшена без origin (например, мобильные приложения)
        res.set('Access-Control-Allow-Origin', '*');
    }

    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Credentials', 'true'); // если нужны куки/авторизация
    res.set('Access-Control-Max-Age', '3600'); // кэширование preflight запросов на 1 час
}

export function handleCors(req, res) {
    setCorsHeaders(req, res);

    // Обработка preflight запросов
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return true;
    }
    return false;
}