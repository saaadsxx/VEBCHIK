require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { testDbConnection, sequelize } = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Тестовый маршрут
app.get('/', (req, res) => {
    res.json({
        message: 'API работает!'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Проверяем подключение к БД
        await testDbConnection();
        
        // Синхронизируем модели с БД
        await sequelize.sync();
        console.log('Модели базы данных синхронизированы');
        
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`Сервер запущен на порту ${PORT}`);
            console.log(`База данных: ${process.env.DB_NAME}`);
            console.log('=================================');
        });
    } catch (error) {
        console.error('❌ Критическая ошибка при запуске сервера:');
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