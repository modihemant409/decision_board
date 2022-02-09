const joi = require("joi");
const { UploadFile } = require("../helper/File");
const {
  Plan,
  User,
  UserPlan,
  Dashboard,
  userDb,
  SharedDashboard,
  ChatMessage,
  Logo
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

exports.removeFromShared = async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.params.userId } });
    await SharedDashboard.destroy({ where: { email: user.email } });
    return res.send({
      status: true,
      message: "removed from shared",
    });
  } catch (error) {
    next(error);
  }
};

exports.getDashboard = async (req, res, next) => {
  try {
    const query = `select COUNT(u.id)as active_users, COUNT(ap.id)  as total_users from users u LEFT JOIN UserPlans ap on u.id=ap.userId AND ap.is_active=1;`;
    const query2 = `select SUM(tp.price) as total_sales FROM UserPlans up LEFT JOIN plans tp on up.planId=tp.id;`;
    const query3 = `SELECT COUNT(p.id) as total_availbale_plans FROM plans p  WHERE p.is_blocked='0';`;
    const query4 = `SELECT COUNT(bp.id) as total_blocked_plans FROM plans bp WHERE bp.is_blocked='1' ;`;
    const query5 = `SELECT COUNT(d.id) as all_dashboards FROM dashboard d;`;
    const user_dashboards = Dashboard.findAll({
      include: [{ model: User, attributes: { exclude: ["password"] } },{
          model: Logo,
          foreignKey: "bannerId",
        }],
    });
    const all_active_plans = Plan.findAll({ where: { is_blocked: "0" } });
    const all_blocked_plans = Plan.findAll({ where: { is_blocked: "1" } });
    const all_blocked_users = User.findAll({ where: { is_blocked: "1" } });
    const all_users_with_active_plans = User.findAll({
      include: [{ model: UserPlan, is_active: "1" }],
      where: { is_blocked: "0" },
      attributes: { exclude: ["password"] },
    });
    const [
      [result1],
      [result2],
      [result3],
      [result4],
      [result5],
      userDashboards,
      allActivePLans,
      allBlockedPlans,
      allBlockedUsers,
      allUsersWithActivePlans,
    ] = await Promise.all([
      sequelize.query(query),
      sequelize.query(query2),
      sequelize.query(query3),
      sequelize.query(query4),
      sequelize.query(query5),
      user_dashboards,
      all_active_plans,
      all_blocked_plans,
      all_blocked_users,
      all_users_with_active_plans,
    ]);
    const dashboard = {
      count: {
        ...result1[0],
        ...result2[0],
        ...result3[0],
        ...result4[0],
        ...result5[0],
      },
      userDashboards,
      allActivePLans,
      allBlockedPlans,
      allBlockedUsers,
      allUsersWithActivePlans,
    };
    return res.send({ message: "fetched", data: dashboard, status: true });
  } catch (error) {
    next(error);
  }
};

exports.sendMessageToUser = async (req, res, next) => {
  try {
    const { body, file } = await UploadFile(req, "chatMessage");
    const create = {};
    for (const key in body) {
      create[key] = body[key];
    }
    if (body.type != "text") {
      create["message"] = body.type != "text" ? file.path : body.message;
    }
    create["from"] = "admin";
    create["userId"] = body.userId;
    const chat = await ChatMessage.create(create);
    return res.send({
      status: true,
      message: "Message sent successfully",
      data: chat,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSender = async (req, res, next) => {
  try {
    const message = await ChatMessage.findAll({
      group: ["userId"],
      include: [{ model: User, attributes: { exclude: ["password"] } }],
    });
    return res.send({
      status: true,
      message: "fetched successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllMessage = async (req, res, next) => {
  try {
    const message = await ChatMessage.findAll({
      where: { userId: req.params.userId },
      order: [["createdAt", "asc"]],
    });
    return res.send({
      status: true,
      message: "fetched successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};
