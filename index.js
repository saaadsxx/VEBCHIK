require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testDbConnection, sequelize } = require('./config/db');
const { User, Event } = require('./models');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const logger = require('./middleware/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Маршруты
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);

// Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Обработка ошибок multer
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                message: 'Файл слишком большой. Максимальный размер 2MB' 
            });
        }
        return res.status(400).json({ message: err.message });
    }
    next(err);
});

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'API работает!'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Проверяем подключение к БД и синхронизируем модели
        await testDbConnection();
        
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`Сервер запущен на порту ${PORT}`);
            console.log(`База данных: ${process.env.DB_NAME}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('Критическая ошибка при запуске сервера:');
        console.error(error.message);
        process.exit(1);
    }
};

// Обработка необработанных ошибок
process.on('unhandledRejection', (error) => {
    console.error('Необработанная ошибка:', error.message);
    process.exit(1);
});

startServer(); 