const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Импортируем body-parser
const bodyParser = require("body-parser");

// Выбирваем методы для работы спакетами
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

// Подключаем роуты
const usersRoute = require("./routes/users");

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo
mongoose.connect("mongodb://localhost:27017/mestodb", {
  useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  useUnifiedTopology: true,
});

// Подписываемся на маршруты
app.use(usersRoute);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
