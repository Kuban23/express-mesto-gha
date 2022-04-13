// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору

const Card = require("../models/card");

// Возвращаем все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      // if (!cards) {
      //   return res.status(404).send({ message: "Карточки не найдены" });
      // }
      res.status(200).send({ data: cards });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
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
    .catch(() => res.status(500).send({ message: "Ошибка при создании карточки" }));
};

// Удаляем карточку по id
module.exports.removeCard = (req, res) => {
  // Находим карточку и удалим
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send({ data: card }))
    .catch(() => res.status(500).send({ message: "Ошибка при удалении карточки" }));
};
