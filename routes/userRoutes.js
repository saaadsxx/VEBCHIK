const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: ID пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Список пользователей успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *                 minimum: 2
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Пользователь с таким email уже существует
 *       500:
 *         description: Ошибка сервера
 */
router.post('/', userController.create);
router.get('/', userController.getAll);
router.get('/:id', userController.getOne);
router.put('/:id', userController.update);

module.exports = router; 