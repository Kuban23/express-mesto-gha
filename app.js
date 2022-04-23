const express = require('express');
const mongoose = require('mongoose');
const { celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
// const auth = require('./middlewares/auth');

// Импортируем body-parser

// Подключаем контроллеры
const { login, createUser } = require('./controllers/users');

const app = express();

// Выбирваем методы для работы спакетами
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// Подключаем роуты
const usersRoute = require('./routes/users');
const cardsRoute = require('./routes/cards');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// id пользователя
// app.use((req, res, next) => {
//   req.user = {
//     _id: '62568e512082c7c0e4ba8033', // вставляем сюда _id созданного в postman пользователя
//   };
//   next();
// });

// Подписываемся на маршруты
app.use(usersRoute);
app.use(cardsRoute);

// Маршруты для регистрации и авторизации
// Валидация приходящих на сервер данных
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
}), login);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string()
        .regex(
          /^((http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\\/])*)?/,
        ),
    }),
  }),
  createUser,
);

app.use('/', (req, res) => {
  res.status(404).send({ message: 'Такого адреса по запросу не существует' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
