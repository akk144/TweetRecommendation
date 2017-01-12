var userController = require('../controller/user');

module.exports = function (app, passport) {
  app.get('/', userController.search);
}
