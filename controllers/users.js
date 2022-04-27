// GET /users — возвращает всех пользователей
// GET /users/:userId - возвращает пользователя по _id
// POST /users — создаёт пользователя
// PATCH /users/me — обновляет профиль
// PATCH /users/me/avatar — обновляет аватар

const bcrypt = require('bcryptjs'); // импортируем bcrypt
const jwt = require('jsonwebtoken'); // импортируем модуль jsonwebtoken
const User = require('../models/user');

// const { NODE_ENV, JWT_SECRET } = process.env;
const ERROR_NOT_FOUND = require('../errors/error_not_found_404');

const BAD_REQUEST = require('../errors/error_bad_request_400');

const INTERNAL_SERVER_ERR = require('../errors/error_inretnal_server_500');

const AuthentificationError = require('../errors/error_Authentification_401');

const ConflictError = require('../errors/error_ConflictError_409');

// Получаем всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' }));
};

// Возвращаем пользователя по _id
module.exports.getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail(() => new ERROR_NOT_FOUND('Пользователь с указанным id не существует'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BAD_REQUEST('Некорректный id пользователя'));
      } else {
        next(err);
      }
    });
  // User.findById(req.params.userId)
  //   .then((user) => {
  //     if (!user) {
  //       return res.status(ERROR_NOT_FOUND).send
  // ({ message: 'Пользователь с указанным _id не найден' });
  //     }
  //     return res.send({ data: user });
  //   })
  //   .catch((err) => {
  //     if (err.name === 'CastError') {
  //       res.status(BAD_REQUEST).send({ message: 'Переданный id некорректный' });
  //       return;
  //     }
  //     res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
  //   });
};

// Создаем пользователя  findByIdAndUpdate
module.exports.createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;
  if (!email || !password) {
    next(new BAD_REQUEST('Не передан email или пароль'));
  }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash, // записываем хеш в базу
    }))
    .then((user) => {
      res.status(200).send({
        user: {
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        },
      });
    })
    // .then((hash) => User.create({
    //   name: req.body.name,
    //   about: req.body.about,
    //   avatar: req.body.avatar,
    //   email: req.body.email,
    //   password: hash, // записываем хеш в базу
    // }))
    // .then((hash) => User.create({
    //   name,
    //   about,
    //   avatar,
    //   email,
    //   password: hash,
    // }))
    // .then((user) => res.res.status(200).send({
    //   data: user,
    // }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BAD_REQUEST('Некорректные данные пользователя'));
      }
      if (err.code === 11000) {
        next(new ConflictError('Пользователь с таким email зарегистрирован'));
      } else {
        next(err);
      }
    });
  // .catch((err) => {
  //   if (err.name === 'ValidationError') {
  //     res.status(BAD_REQUEST).send({ message: 'переданы некорректные данные' });
  //     return;
  //   }
  //   if (err.name === 'MongoError' && err.code === 11000) {
  //     throw new ConflictError('Пользователь с указанным email уже существует');
  //   }
  //   res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
  // });
};

// Обновляем профиль пользователя
module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  // ищем пользователя по id
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newUserInfo) => {
      res.send({ data: newUserInfo });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'переданы некорректные данные' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'передан некорректный id' });
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
};

// Обновляем аватар
module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  // ищем пользователя по id
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((newUserAvatar) => {
      res.send({ data: newUserAvatar });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'переданы некорректные данные' });
        return;
      }
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'передан некорректный id' });
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
};

// Создали контроллер login который проверяет логин и пароль
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      // const token = jwt.sign({ _id: user._id },
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      console.log(token);
      return res.status(200).send({ token }); // возвращаем токен в теле ответа
    })
    .catch(() => {
      // res.status(401).send({ message: err.message });
      next(new AuthentificationError('Неправильный адрес почты или пароль'));
    });
};

// Создали контроллер для получения пользователя
module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        next(new ERROR_NOT_FOUND('Пользователь с указанным _id не найден'));
      }
      res.status(200).send({ data: user });
    })
    .catch((err) => next(err));
};
