const { User } = require("../models");

module.exports = async (req, res, next) => {
  const user = await User.findByPk(req.userId);
  if (user.type != "admin") {
    const error = new Error("UnAuthorized access as admin");
    error.statuscode = 401;
    return next(error);
  }
  return next();
};
