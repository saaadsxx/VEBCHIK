const { Event } = require('../models');
const { Op } = require('sequelize');

const checkEventLimit = async (req, res, next) => {
    try {
        const { createdBy } = req.body;
        
        // Проверяем только при создании нового мероприятия
        if (!createdBy) {
            return next();
        }

        // Получаем дату 24 часа назад
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Считаем количество мероприятий пользователя за последние 24 часа
        const eventsCount = await Event.count({
            where: {
                createdBy,
                createdAt: {
                    [Op.gte]: oneDayAgo
                }
            }
        });

        const maxEvents = process.env.MAX_EVENTS_PER_DAY || 10;

        if (eventsCount >= maxEvents) {
            return res.status(429).json({
                message: `Превышен лимит создания мероприятий (${maxEvents} в сутки). Попробуйте позже.`,
                limit: maxEvents,
                current: eventsCount,
                nextReset: new Date(Date.now() + 24 * 60 * 60 * 1000)
            });
        }

        next();
    } catch (error) {
        console.error('Ошибка при проверке лимита мероприятий:', error);
        next(error);
    }
};

module.exports = checkEventLimit; 