const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Мероприятий',
            version: '1.0.0',
            description: 'API для управления мероприятиями и пользователями'
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Локальный сервер'
            }
        ]
    },
    apis: ['./routes/*.js'] // Путь к файлам с маршрутами
};

const specs = swaggerJsdoc(options);
module.exports = specs; 