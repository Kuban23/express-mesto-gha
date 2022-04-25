const express = require('express');
const mongoose = require('mongoose');
const { errors, celebrate, Joi } = require('celebrate');
const bodyParser = require('body-parser');
const auth = require('./middlewares/auth');

const ERROR_NOT_FOUND = require('./errors/error_not_found_404');

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
app.use('/', usersRoute);
app.use('/', cardsRoute);

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

// app.use('/', (req, res) => {
//   res.status(ERROR_NOT_FOUND).send({ message: 'Такого адреса по запросу не существует' });
// });

app.use('*', auth, (req, res, next) => {
  next(new ERROR_NOT_FOUND('Запрашиваемая страница не найдена'));
});

// Создал обработчик ошибок для celebrate
app.use(errors());

// Обработка всех ошибок централизованно
app.use((err, req, res, next) => {
  const { message } = err;
  const statusCode = err.statusCode || 500;
  // проверяем статус, отправляем сообщение в зависимости от статуса
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'Ошибка на сервере'
      : message,
  });
  next();
});

// Защита авторизацией всех роутов
app.use(auth);

// ошибка роутеризации
app.use((req, res, next) => {
  const notFound = new Error('Такого ресурса нет');
  notFound.statusCode = 404;
  next(notFound);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
