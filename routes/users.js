// Маршруты
// GET /users — возвращает всех пользователей
// GET /users/:userId - возвращает пользователя по _id
// POST /users — создаёт пользователя
// PATCH /users/me — обновляет профиль
// PATCH /users/me/avatar — обновляет аватар
// GET /users/me — возвращает информацию о текущем пользователе

const router = require('express').Router();
const {
  getUsers, getUserById, updateUser, updateAvatar, getCurrentUser,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/:userId', getUserById);
// router.post('/users', createUser);
router.patch('/users/me', updateUser);
router.patch('/users/me/avatar', updateAvatar);
router.get('/users/me', getCurrentUser);

module.exports = router;
