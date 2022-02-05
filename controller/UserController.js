const joi = require("joi");
const { dataNotFound } = require("../helper/functions");
const {
  UserPlan,
  Plan,
  SharedDashboard,
  User,
  Dashboard,
  Archive,
} = require("../models");

exports.purchasePlan = async (req, res, next) => {
  const schema = joi.object({
    planId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const check = await UserPlan.findOne({
      where: { userId: req.userId, is_active: "1" },
    });
    dataNotFound(!check, "You Already have a plan", 409);
    const plan = await Plan.findOne({ where: { id: req.body.planId } });
    dataNotFound(plan, "Invalid plan", 404);
    const userPlan = await UserPlan.create({
      planId: plan.id,
      valid_till: new Date().setDate(new Date().getDate() + plan.validity_days),
      is_active: "1",
      userId: req.userId,
    });
    plan.total_sales = plan.total_sales + 1;
    await plan.save();
    return res.send({
      status: true,
      message: "plan purchased successfully",
      data: userPlan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPlans = async (req, res, next) => {
  try {
    const plan = await Plan.findAll({ where: { is_blocked: "0" } });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPurchasedPlans = async (req, res, next) => {
  try {
    const plans = await UserPlan.findAll({
      where: { userId: req.userId },
      include: [Plan],
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllSharedDashboard = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);
    const dashboard = await SharedDashboard.findAll({
      where: { email: user.email },
      include: [Dashboard],
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

exports.saveDashboardToArchive = async (req, res, next) => {
  try {
    const das = await Dashboard.findOne({
      where: { id: req.params.dashboardId },
    });
    dataNotFound(das, "Invalid Dashboard", 404);
    await Archive.create({ userId: req.userId, dashboardId: das.id });
    return res.send({
      message: "inserted successfully",
      data: das,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromArchive = async (req, res, next) => {
  try {
    await Archive.destroy({
      where: { dashboardId: req.params.dashboardId, userId: req.userId },
    });
    return res.send({ message: "Success", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getArchivedDashboards = async (req, res, next) => {
  try {
    const archived = await Archive.findAll({
      where: { userId: req.userId },
      include: [Dashboard],
    });
    return res.send({
      message: "fetched successfully",
      data: archived,
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
