const joi = require("joi");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const jwt = require("jsonwebtoken");
const config = require("config");
const { User, userDb, UserPlan } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_ID);

exports.socialLogin = async (req, res, next) => {
  try {
    const schema = joi.object({
      token: joi.required(),
      device_token: joi.allow(),
      access_token: joi.allow(),
    });
    await schema.validateAsync(req.body);
    const { token, device_token, access_token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_ID,
    });
    const { name, email, picture } = ticket.getPayload();
    // console.log(await userDb.findUserByMail(email));
    let user = await User.findOne({
      where: { email: email },
    });
    if (!user) {
      user = await User.create({
        name,
        email,
        image: picture,
        access_token: access_token,
        device_token: device_token ? device_token : null,
      });
    }
    let token1;
    token1 = jwt.sign(
      { email: user.email, userId: user.id },
      config.get("JWT_key")
    );
    // console.log("token1", token1);
    user = await User.findOne({
      where: { id: user.id },
      include: [
        {
          model: UserPlan,
          where: { is_active: "1" },
          limit: 1,
          required: false,
        },
      ],
    });
    if (user.is_blocked == 1) {
      const error = new Error(
        "Your account has been blocked. Please contact support for more details."
      );
      error.statuscode = 209;
      return next(error);
    }
    user.token = token1;
    await user.save();
    await user.reload();
    delete user.dataValues.password;
    // console.log("user token", user.token);
    delete user.dataValues.memberCategoryId;
    delete user.dataValues.updatedAt;
    delete user.dataValues.createdAt;
    delete user.dataValues.is_blocked;
    delete user.dataValues.device_token;
    delete user.dataValues.device_type;
    delete user.dataValues.email_verified;

    res.status(201);
    return res.json({
      data: user,
      status: true,
      message: "logged in successfully",
    });
  } catch (error) {
    next(error);
  }
};
