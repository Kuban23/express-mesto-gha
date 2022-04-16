// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору
// PUT /cards/:cardId/likes — поставить лайк карточке
// DELETE /cards/:cardId/likes — убрать лайк с карточки

const Card = require('../models/card');

const ERROR_NOT_FOUND = 404;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERR = 500;

// Возвращаем все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    // .then((cards) => {
    //   if (!cards) {
    //     res.status(ERROR_NOT_FOUND).send({ message: "Карточки не найдены" });
    //   } else res.status(200).send({ data: cards });
    // })
    // .catch((err) => {
    //   if (err.name === "CastError") {
    //     res.status(BAD_REQUEST).send({ message: "Переданы некорректные данные" });
    //   } else {
    //     res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    //   }
    // });
    .catch(() => res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' }));
};

// Создаём карточку
module.exports.createCard = (req, res) => {
  // console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({
      name: card.name,
      link: card.link,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).send({ message: 'Не корректные данные' });
        return;
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
  // .catch((err) => {
  //   if (err.name === "CastError") {
  //     res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
  //   } else if (err.name === "ValidationError") {
  //     res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
  //   } else {
  //     res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  //   }
  // });
  // .catch((err) => {
  //   if (err.name === "ValidationError") {
  //     return res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Удаляем карточку по id
module.exports.removeCard = (req, res) => {
  // Находим карточку и удалим
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) { // Добавил проверку
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с таким id не найдена' });
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Карточка не найдена' });
        return;
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
  // .catch((err) => {
  //   if (err.name === "CastError") {
  //     return res.status(ERROR_NOT_FOUND).send({ message: "Карточка не найдена" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Ставим лайк карточке
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) { // Добавил проверку
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с таким id не найдена' });
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Не получилось поставить лайк' });
        return;
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
  // .catch((err) => {
  //   if (err.name === "CastError") {
  //     return res.status(ERROR_NOT_FOUND).send({ message: "Не получилось поставить лайк" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};

// Удаляем лайк с карточки
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        res.status(ERROR_NOT_FOUND).send({ message: 'Карточка с таким id не найдена' });
      }
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(BAD_REQUEST).send({ message: 'Не получилось удалить лайк' });
        return;
      }
      res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
    });
  // .catch((err) => {
  //   if (err.name === "CastError") {
  //     return res.status(BAD_REQUEST).send({ message: "Не получилось удалить лайк" });
  //   }
  //   return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
  // });
};
