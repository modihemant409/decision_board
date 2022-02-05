const joi = require("joi");
const {
  Plan,
  User,
  UserPlan,
  Dashboard,
  userDb,
  SharedDashboard,
} = require("../models");
const { sequelize } = require("../models/User");

exports.addPlans = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    validity_days: joi.number().required(),
    price: joi.number().required(),
    dashboard_available: joi.number().required(),
  });
  try {
    schema.validateAsync(req.body);
    const plan = await Plan.create({
      ...req.body,
    });
    return res.send({
      status: true,
      message: "plans created successfully",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.blockPLan = async (req, res, next) => {
  const schema = joi.object({
    planId: joi.number().required(),
    block: joi.required().valid("0", "1"),
  });
  try {
    await schema.validateAsync(req.body);
    const plan = await Plan.findOne({ where: { id: req.body.planId } });
    plan.is_blocked = req.body.block;
    await plan.save();
    return res.send({
      message: `Plan ${
        req.body.block == "0" ? "UnBlocked" : "Blocked"
      } Successfully`,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await Plan.findAll();
    return res.send({
      data: plans,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    // const users = await userDb.findAllUsers();
    // console.log(result);
    const users = await User.findAll({
      include: [
        UserPlan,
        {
          model: SharedDashboard,
          on: {
            $col: sequelize.where(
              sequelize.col("users.email"),
              "=",
              sequelize.col("sharedDashboards.email")
            ),
          },
          include: [Dashboard],
        },
      ],
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.userId },
      include: [Dashboard, UserPlan],
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.changeUserType = async (req, res, next) => {
  const schema = joi.object({
    userId: joi.number().required(),
    type: joi.required().valid("user", "admin"),
  });
  try {
    await schema.validateAsync(req.body);
    const user = await User.findOne({ where: { id: req.body.userId } });
    user.type = req.body.type;
    await user.save();
    return res.send({
      status: true,
      message: `User type has been changed as ${req.body.type} Successfully`,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await User.findAll({
      where: { type: "admin" },
      include: [UserPlan],
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: admins,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSharedUser = async (req, res, next) => {
  try {
    const query = `SELECT u.id, u.name, u.image, u.email, sh.createdAt as shared_on 
                FROM dashboard d JOIN sharedDashboards sh on d. id=sh.dashboardId
                JOIN users u on sh.email=u.email
                WHERE d.id=?`;
    const [result] = await sequelize.query(query, {
      replacements: [req.params.dashboardId],
    });
    return res.send({ message: "fetched", data: result, status: true });
  } catch (error) {
    next(error);
  }
};

exports.BlockUnblockUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    user.is_blocked = user.is_blocked == 1 ? 0 : 1;
    await user.save();
    return res.send({
      status: true,
      message: user.is_blocked == 1 ? "Blocked" : "UnBlocked",
    });
  } catch (error) {
    next(error);
  }
};
