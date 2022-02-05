const jwt = require("jsonwebtoken");
const config = require("config");
const { User } = require("../models");
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    return next(error);
  }

  let decodedToken;
  let token;
  try {
    token = authHeader.split(" ")[1];
    decodedToken = jwt.verify(token, config.get("JWT_key"));
  } catch (err) {
    const error = new Error("Please Login.");
    error.statusCode = 401;
    return next(error);
  }
  if (!decodedToken) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    return next(error);
  }
  if (!decodedToken.userId) {
    const error = new Error("not Authorized");
    error.statusCode = 401;
    return next(error);
  }
  User.findOne({ where: { id: decodedToken.userId } })
    .then((user) => {
      if (!user) {
        const error = new Error("Please Login.");
        error.statusCode = 401;
        return next(error);
      }
      req.userId = decodedToken.userId;
      next();
    })
    .catch((error) => {
      return next(error);
    });
};
