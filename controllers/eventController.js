const { Event, User } = require('../models');
const fs = require('fs').promises;
const path = require('path');
const { Op } = require('sequelize');

class EventController {
    async getAll(req, res) {
        try {
            const events = await Event.findAll({
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }]
            });
            return res.status(200).json(events);
        } catch (error) {
            console.error('Ошибка при получении списка мероприятий:', error);
            return res.status(500).json({ 
                message: 'Ошибка при получении списка мероприятий',
                error: error.message 
            });
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({ 
                    message: 'Некорректный ID мероприятия' 
                });
            }

            const event = await Event.findByPk(id, {
                include: [{
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }]
            });

            if (!event) {
                return res.status(404).json({ 
                    message: `Мероприятие с ID ${id} не найдено` 
                });
            }

            return res.status(200).json(event);
        } catch (error) {
            console.error('Ошибка при получении мероприятия:', error);
            return res.status(500).json({ 
                message: 'Ошибка при получении мероприятия',
                error: error.message 
            });
        }
    }

    async create(req, res) {
        try {
            const { title, description, date, createdBy } = req.body;

            // Расширенная валидация входных данных
            const errors = [];
            if (!title || title.length < 3) {
                errors.push('Название должно содержать минимум 3 символа');
            }
            if (!date) {
                errors.push('Дата проведения обязательна');
            }
            if (!createdBy) {
                errors.push('ID создателя обязателен');
            }
            if (errors.length > 0) {
                return res.status(400).json({ 
                    message: 'Ошибка валидации',
                    errors 
                });
            }

            // Проверка существования пользователя
            const user = await User.findByPk(createdBy);
            if (!user) {
                return res.status(404).json({ 
                    message: `Пользователь с ID ${createdBy} не найден` 
                });
            }

            const event = await Event.create({
                title,
                description,
                date,
                createdBy
            });

            // Получаем информацию о лимите
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const eventsCount = await Event.count({
                where: {
                    createdBy,
                    createdAt: {
                        [Op.gte]: oneDayAgo
                    }
                }
            });

            const maxEvents = process.env.MAX_EVENTS_PER_DAY || 10;

            return res.status(201).json({
                event,
                limits: {
                    max: maxEvents,
                    current: eventsCount,
                    remaining: maxEvents - eventsCount
                }
            });
        } catch (error) {
            console.error('Ошибка при создании мероприятия:', error);
            return res.status(500).json({ 
                message: 'Ошибка при создании мероприятия',
                error: error.message 
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, date } = req.body;

            if (!id || isNaN(id)) {
                return res.status(400).json({ 
                    message: 'Некорректный ID мероприятия' 
                });
            }

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({ 
                    message: `Мероприятие с ID ${id} не найдено` 
                });
            }

            // Валидация обновляемых данных
            if (title && title.length < 3) {
                return res.status(400).json({ 
                    message: 'Название должно содержать минимум 3 символа' 
                });
            }

            await event.update({
                title: title || event.title,
                description: description || event.description,
                date: date || event.date
            });

            return res.status(200).json(event);
        } catch (error) {
            console.error('Ошибка при обновлении мероприятия:', error);
            return res.status(500).json({ 
                message: 'Ошибка при обновлении мероприятия',
                error: error.message 
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(id)) {
                return res.status(400).json({ 
                    message: 'Некорректный ID мероприятия' 
                });
            }

            const event = await Event.findByPk(id);
            if (!event) {
                return res.status(404).json({ 
                    message: `Мероприятие с ID ${id} не найдено` 
                });
            }

            await event.destroy();
            return res.status(200).json({ 
                message: `Мероприятие с ID ${id} успешно удалено` 
            });
        } catch (error) {
            console.error('Ошибка при удалении мероприятия:', error);
            return res.status(500).json({ 
                message: 'Ошибка при удалении мероприятия',
                error: error.message 
            });
        }
    }

    async uploadImage(req, res) {
        try {
            const { id } = req.params;

            if (!req.file) {
                return res.status(400).json({ 
                    message: 'Изображение не загружено' 
                });
            }

            const event = await Event.findByPk(id);
            if (!event) {
                // Удаляем загруженный файл, если мероприятие не найдено
                await fs.unlink(req.file.path);
                return res.status(404).json({ 
                    message: `Мероприятие с ID ${id} не найдено` 
                });
            }

            // Если у мероприятия уже есть изображение, удаляем его
            if (event.imageUrl) {
                const oldImagePath = path.join(__dirname, '..', event.imageUrl);
                try {
                    await fs.unlink(oldImagePath);
                } catch (error) {
                    console.error('Ошибка при удалении старого изображения:', error);
                }
            }

            // Сохраняем путь к новому изображению
            const imageUrl = `/uploads/${req.file.filename}`;
            await event.update({ imageUrl });

            return res.status(200).json({
                message: 'Изображение успешно загружено',
                imageUrl
            });
        } catch (error) {
            console.error('Ошибка при загрузке изображения:', error);
            // Удаляем загруженный файл в случае ошибки
            if (req.file) {
                await fs.unlink(req.file.path);
            }
            return res.status(500).json({ 
                message: 'Ошибка при загрузке изображения',
                error: error.message 
            });
        }
    }
}

module.exports = new EventController(); 