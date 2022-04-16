// GET /users — возвращает всех пользователей
// GET /users/:userId - возвращает пользователя по _id
// POST /users — создаёт пользователя
// PATCH /users/me — обновляет профиль
// PATCH /users/me/avatar — обновляет аватар

const User = require("../models/user");

const ERROR_NOT_FOUND = 404;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERR = 500;

// Получаем всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Нет таких пользователей" });
      } else res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
  // .catch(() => res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" }));
};

// Возвращаем пользователя по _id
module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(ERROR_NOT_FOUND).send({ message: "Пользователь с указанным _id не найден" });
      } else res.status(200).send({ data: user });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Нет пользователя с таким id" });
      }
      return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
  // .catch((err) => {
  //   if (err.name === "CastError") {
  //     return res.status(BAD_REQUEST).send({ message: "Нет пользователя с таким id" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Создаем пользователя  findByIdAndUpdate
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else {
        res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
      }
    });
  // .catch((err) => {
  //   if (err.name === "ValidationError") {
  //     return res.status(BAD_REQUEST).send({ message: "переданы некорректные данные" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Обновляем профиль пользователя
module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  // ищем пользователя по id
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true },
  )
    .then((newUserInfo) => {
      res.status(200).send({ data: newUserInfo });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else {
        res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
      }
    });
  // .catch((err) => {
  //   if (err.name === "ValidationError") {
  //     return res.status(BAD_REQUEST).send({ message: "переданы некорректные данные" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Обновляем аватар
module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  // ищем пользователя по id
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true },
  )
    .then((newUserAvatar) => {
      res.status(200).send({ data: newUserAvatar });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else if (err.name === "ValidationError") {
        res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      } else {
        res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
      }
    });
  // .catch((err) => {
  //   if (err.name === "ValidationError") {
  //     return res.status(BAD_REQUEST).send({ message: "переданы некорректные данные" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};
