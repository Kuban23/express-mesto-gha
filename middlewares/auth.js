const jwt = require('jsonwebtoken');
const AuthentificationError = require('../errors/error_Authentification_401');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;
  // убедимся, что он есть и начинается с Bearer
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthentificationError('Необходима авторизация.');
  }
  // если токен есть, берем его
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new AuthentificationError('Необходима авторизация.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};
