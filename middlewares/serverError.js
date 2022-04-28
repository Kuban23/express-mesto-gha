module.exports.serverError = (err, req, res) => {
  const { message } = err;
  // console.log(message);
  const statusCode = err.statusCode || 500;
  // проверяем статус, отправляем сообщение в зависимости от статуса
  res.status(statusCode).send({
    message: statusCode === 500
      ? 'Ошибка на сервере'
      : message,
  });
};
