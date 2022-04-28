// GET /cards — возвращает все карточки
// POST /cards — создаёт карточку
// DELETE /cards/:cardId — удаляет карточку по идентификатору
// PUT /cards/:cardId/likes — поставить лайк карточке
// DELETE /cards/:cardId/likes — убрать лайк с карточки

const Card = require('../models/card');

const ERROR_NOT_FOUND = require('../errors/error_not_found_404');

const BAD_REQUEST = require('../errors/error_bad_request_400');

// const INTERNAL_SERVER_ERR = require('../errors/error_inretnal_server_500');

const DeleteSomeoneError = require('../errors/errore_delete_someone_403');

// Возвращаем все карточки
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
  // .catch(() => res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' }));
};

// Создаём карточку
module.exports.createCard = (req, res, next) => {
  // console.log(req.user._id); // _id станет доступен
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.send({
      data: card,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BAD_REQUEST('Некорректные данные карточки'));
      } else {
        next(err);
      }
    });
  // .catch((err) => {
  //   if (err.name === 'ValidationError') {
  //     res.status(BAD_REQUEST).send({ message: 'Не корректные данные' });
  //     return;
  //   }
  //   res.status(INTERNAL_SERVER_ERR).send({ message: 'Что-то пошло не так' });
  // });
};

// Удаляем карточку по id
module.exports.removeCard = (req, res, next) => {
  // Находим карточку и удалим
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new ERROR_NOT_FOUND('Карточка не найдена');
      }
      // Проверяем может ли пользователь удалить карточку
      // card.owner._id имеет формат object, а user._id -string
      // Приводим к строке
      if (req.user._id !== card.owner.toString()) {
        // Выдаем ошибку, что пользователь не может удалить чужую карточку
        throw new DeleteSomeoneError('Вы не можете удалить чужую карточку');
      }
      return card.remove()
        .then(() => res.status(200).send({ data: card, message: 'Карточка успешно удалена' }));
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        next(new ERROR_NOT_FOUND('Карточка не найдена'));
      } else if (err.name === 'CastError') {
        next(new BAD_REQUEST('Некорректный id карточки'));
      } else {
        next(err);
      }
    });
};

// Ставим лайк карточке
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => new ERROR_NOT_FOUND('Карточка не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BAD_REQUEST('Некорректный id карточки'));
      } else {
        next(err);
      }
    });
};

// Удаляем лайк с карточки
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => new ERROR_NOT_FOUND('Карточка не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BAD_REQUEST('Некорректный id карточки'));
      } else {
        next(err);
      }
    });
};
