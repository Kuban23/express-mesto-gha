// GET /users — возвращает всех пользователей
// GET /users/:userId - возвращает пользователя по _id
// POST /users — создаёт пользователя
// PATCH /users/me — обновляет профиль
// PATCH /users/me/avatar — обновляет аватар

const User = require("../models/user");

// Получаем всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send({ data: users }))
    .catch(() => res.status(500).send({ message: "Ошибка файла пользователей" }));
};

// Возвращаем пользователя по _id
module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      // if (!user) {
      //   return res.status(404).send({ message: "Пользователь с указанным _id не найден" });
      // }
      res.status(200).send({ data: user });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Создаем пользователя
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    }))
    // .catch((err) => res.status(500).send({ message: err.message }));
    .catch(() => res.status(500).send({ message: "Ошибка при создании пользователя" }));
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
    .catch(() => res.status(500).send({ message: "Ошибка при изменении профиля" }));
};

// обновляем аватар
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
    .catch(() => res.status(500).send({ message: "Ошибка при изменении аватара" }));
};
