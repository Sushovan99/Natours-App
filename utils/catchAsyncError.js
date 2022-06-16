// Since, all the handlers are async functions it returns a promise se we can use .catch() method
module.exports = (fn) => (req, res, next) =>
  fn(req, res, next).catch((err) => next(err));
