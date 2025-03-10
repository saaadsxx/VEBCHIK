const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Создаем директорию для логов, если её нет
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Создаем потоки для записи логов
const accessLogStream = fs.createWriteStream(
    path.join(logDir, 'access.log'),
    { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
    path.join(logDir, 'error.log'),
    { flags: 'a' }
);

// Форматирование времени
const getFormattedDate = () => {
    return new Date().toISOString();
};

// Кастомный формат для консоли
morgan.token('custom', (req) => {
    return `[${req.method}] ${req.url}`;
});

// Добавляем токен для тела запроса
morgan.token('body', (req) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        return JSON.stringify(req.body);
    }
    return '';
});

// Добавляем токен для IP
morgan.token('remote-addr', (req) => {
    return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
});

// Создаем форматы логов
const consoleFormat = (tokens, req, res) => {
    const status = tokens.status(req, res);
    const statusColor = status >= 500 ? '\x1b[31m' : // красный
                       status >= 400 ? '\x1b[33m' : // желтый
                       status >= 300 ? '\x1b[36m' : // голубой
                       '\x1b[32m'; // зеленый

    return [
        '\x1b[36m', // голубой для метода и URL
        `[${getFormattedDate()}]`,
        tokens.custom(req, res),
        '\x1b[0m', // сброс цвета
        statusColor,
        status,
        '\x1b[0m',
        tokens['response-time'](req, res), 'ms',
        tokens['remote-addr'](req, res),
        tokens.body(req, res)
    ].join(' ');
};

const fileFormat = (tokens, req, res) => {
    return [
        `[${getFormattedDate()}]`,
        `[${tokens.method(req, res)}]`,
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms',
        'IP:', tokens['remote-addr'](req, res),
        'Body:', tokens.body(req, res)
    ].join(' ');
};

// Создаем логгеры
const consoleLogger = morgan(consoleFormat);
const fileLogger = morgan(fileFormat, { stream: accessLogStream });
const errorLogger = morgan(fileFormat, {
    skip: (req, res) => res.statusCode < 400,
    stream: errorLogStream
});

// Комбинированный middleware
const logger = (req, res, next) => {
    consoleLogger(req, res, (err) => {
        if (err) return next(err);
        fileLogger(req, res, (err) => {
            if (err) return next(err);
            errorLogger(req, res, next);
        });
    });
};

module.exports = logger; 