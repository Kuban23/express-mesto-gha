const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const AuthentificationError = require('../errors/error_Authentification_401');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: (url, helpers) => {
        const regex = /^((http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\\/])*)?/g;
        if (!regex.test(url)) {
          return helpers.error('Invalid URL');
        }
        return url;
      },
    },
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, 'Invalid email'],
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// В случае аутентификации хеш пароля нужен. Чтобы это реализовать,
// нужно добавить вызов метода select, передав ему строку +password
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthentificationError('Неправильные почта или пароль'));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthentificationError('Неправильные почта или пароль'));
          }
          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
