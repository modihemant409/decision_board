const joi = require("joi");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const jwt = require("jsonwebtoken");
const config = require("config");
const { User, userDb, UserPlan } = require("../models");
const { OAuth2Client } = require("google-auth-library");
const { removeFile } = require("../helper/File");
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

exports.signUp = async (req, res, next) => {
  let { name, email, password, type } = req.body;
  try {
    const schema = joi.object({
      name: joi.string().min(3).required(),
      email: joi.string().required(),
      password: joi.string().min(6).required(),
    }).options({ allowUnknown: true })

    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).send(error.details[0])
    }
    password = await bcrypt.hash(password, 12)

    const Email = await User.findOne({ where: { email: email } })
    if (Email) {
      const error = new Error('Email already exist')
      error.statuscode = 409
      throw error
    } 
    const user = await User.create({
      name: name,
      email: email,
      password: password, 
    });
    res.json({
      msg: "New User Created",
      status: true,
      user:user
    })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const schema = joi.object({
      email: joi.string().required().email(),
      password: joi.string().min(6).required()
    })
    const { error } = schema.validate(req.body)

    if (error) {
      return res.status(400).send(error.details[0])
    }

    const user = await User.findOne({ where: { email: email} })
    if (!user) {
      const error = new Error('Email not Found')
      error.statuscode = 404
      throw error
    }

    const doMatch = await bcrypt.compare(password, user.password)
    if (!doMatch) {
      const error = new Error('Incorrect Password')
      error.statuscode = 422
      res.json({
        msg: "Incorrect password"
      })
      throw error
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email:email
      },
      config.get("JWT_key")
      )

    res.status(200).json({
      msg: "USER LOGGED IN SUCCESSFULLY",
      token: token,
      status: true,
    })
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.editProfile = async (req, res, next) => {
  const { body, file } = await UploadFile(req, "images");
  const { name, email, image } =  body
  try {
  const schema = joi.object({
      name: joi.string().min(3).required(),
      email:joi.email().required()
  }).options({ allowUnknown: true })

  const { error } = schema.validate(body)
  if (error) {
      return res.status(400).send(error.details[0])
  }
  
  const data = await User.findOne({ where: { id: req.userId } })
  if (file) {
    image = file.path;
    removeFile(user.image)
  }
      // if (image !== data.image) {
      //     // clearImage(data.image)
      // }
      const user = await data.update({ name, image, email })
      res.status(200).json({ status: true, message: "User updated Successfully  ", data:user });
  }
  catch (err) {
      if (!err.statusCode) {
          err.statusCode = 500
      }
      next(err)
  }
}