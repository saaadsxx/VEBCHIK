const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false, // Отключаем логи SQL-запросов
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Успешное подключение к базе данных');
        
        // Синхронизация моделей
        await sequelize.sync({ 
            alter: true,
            logging: console.log
        });
        console.log('Структура базы данных обновлена');
    } catch (error) {
        console.error('Ошибка работы с базой данных:');
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    testDbConnection
}; 