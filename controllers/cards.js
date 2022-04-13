// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору
// PUT /cards/:cardId/likes — поставить лайк карточке
// DELETE /cards/:cardId/likes — убрать лайк с карточки

const Card = require("../models/card");

const ERROR_NOT_FOUND = 404;
const BAD_REQUEST = 400;
const INTERNAL_SERVER_ERR = 500;

// Возвращаем все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      if (!cards) {
        return res.status(ERROR_NOT_FOUND).send({ message: "Карточки не найдены" });
      }
      return res.status(200).send({ data: cards });
    })
    .catch(() => res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" }));
};

// Создаём карточку
module.exports.createCard = (req, res) => {
  console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  Card.create({ name, link })
    .then((card) => res.send({
      name: card.name,
      link: card.link,
    }))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: "Не корректные данные" });
      }
      return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
};

// Удаляем карточку по id
module.exports.removeCard = (req, res) => {
  // Находим карточку и удалим
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_NOT_FOUND).send({ message: "Карточка не найдена" });
      }
      return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
};

// Ставим лайк карточке
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_NOT_FOUND).send({ message: "Не получилось поставить лайк" });
      }
      return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
};

// Удаляем лайк с карточки
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      res.status(200).send({ data: card });
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return res.status(ERROR_NOT_FOUND).send({ message: "Не получилось удалить лайк" });
      }
      return res.status(INTERNAL_SERVER_ERR).send({ message: "Что-то пошло не так" });
    });
};
