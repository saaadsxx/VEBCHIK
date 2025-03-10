const { User } = require('../models');

class UserController {
    async create(req, res) {
        try {
            const { name, email } = req.body;

            if (!name || !email) {
                return res.status(400).json({ 
                    message: 'Необходимо указать имя и email пользователя' 
                });
            }

            // Проверяем, существует ли пользователь с таким email
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ 
                    message: `Пользователь с email ${email} уже существует` 
                });
            }

            const user = await User.create({ name, email });
            return res.status(201).json(user);
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            
            // Проверяем ошибку уникальности от базы данных
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({ 
                    message: 'Пользователь с таким email уже существует' 
                });
            }

            return res.status(500).json({ 
                message: 'Ошибка сервера',
                error: error.message 
            });
        }
    }

    async getAll(req, res) {
        try {
            const users = await User.findAll();
            return res.json(users);
        } catch (error) {
            console.error('Ошибка при получении списка пользователей:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getOne(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({ 
                    message: 'Пользователь не найден' 
                });
            }

            return res.json(user);
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, email } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({ 
                    message: 'Пользователь не найден' 
                });
            }

            await user.update({
                name: name || user.name,
                email: email || user.email
            });

            return res.json(user);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            return res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController(); 