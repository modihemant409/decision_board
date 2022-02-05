const joi = require("joi");
const bcrypt = require("bcryptjs");
const {
  Logo,
  Dashboard,
  Sheet,
  SheetData,
  Chart,
  Tab,
  SheetTab,
  UserPlan,
  SharedDashboard,
  User,
} = require("../models");
const { UploadFile, removeFile } = require("../helper/File");
const helper = require("../helper/functions");
const mailHelper = require("../helper/mailHelper");
const ejs = require("ejs");
const path = require("path");
const ArchiveDashboard = require("../models/archive");
/**
 * Function to create a dashboard for user
 * @param { request} req
 * @param {response} res
 * @param {next} next
 */
exports.createDashboard = async (req, res, next) => {
  const schema = joi.object({
    name: joi.string().required(),
    password: joi.allow(),
    period: joi.required().valid("month", "year", "week"),
  });

  try {
    await schema.validateAsync(req.body);

    const pass = req.body.password
      ? await bcrypt.hash(req.body.password, 12)
      : null;
    console.log(
      "dashboards",
      await Dashboard.findOne({ where: { userId: req.userId }, include: [Tab] })
    );
    const data = await Dashboard.create(
      {
        name: req.body.name,
        password: pass,
        period: req.body.period,
        userId: req.userId,
        tabs: [
          {
            label: "Home",
            logoId: 1,
          },
        ],
      },
      { include: [Tab] }
    );
    delete data.dataValues.password;
    delete data.dataValues.userId;

    res.status(200).json({
      data: data,
      status: true,
      message: "dashboard created successfully",
    });
  } catch (err) {
    err.status = 403;
    next(err);
  }
};

/**
 * add logo to users logo gallery
 * @param {request} req
 * @param {response} res
 * @param {next} next
 * @returns response
 */
exports.addLogo = async (req, res, next) => {
  try {
    const { body, file } = await UploadFile(req, "images");
    const create = [];
    if (!file.length) {
      const error = new Error("File required");
      return next(error);
    } else if (file.length > 1) {
      file.forEach((image) => {
        create.push({
          name: image.originalname,
          path: image.path,
          userId: req.userId,
        });
      });
    } else {
      create.push({
        name: file.originalname,
        path: file.path,
        userId: req.userId,
      });
    }
    const logo = await Logo.bulkCreate(create);
    return res.status(200).json({
      status: true,
      message: "images uploaded successfully",
      data: logo,
    });
  } catch (err) {
    err.status = 403;
    next(err);
  }
};

/**
 * to get all logo gallery of user
 * @param {request} req
 * @param {response} res
 * @param {next} next
 * @returns list of all logo gallery
 */
exports.getLogos = async (req, res, next) => {
  const logos = await Logo.findAll({ where: { userId: req.userId } });

  return res.status(200).json({
    data: logos,
    status: true,
    message: "fetched successfully",
  });
};

/**
 * get all dashboard of user
 * @param {request} req
 * @param {response} res
 * @param {next} next
 * @returns dashboard list
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const data = await Dashboard.findAll({
      where: { UserId: req.userId, "$archiveDashboards.id$": null },
      include: [
        {
          model: ArchiveDashboard,
          where: { userId: req.userId },
          required: false,
        },
        {
          model: Logo,
          foreignKey: "bannerId",
        },
      ],
      attributes: { exclude: ["password", "userId"] },
    });

    return res.status(200).json({
      data: data,
      status: true,
      message: "fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * delete a logo from gallery
 * @param {request} req
 * @param {response} res
 * @param {next} next
 */
exports.deleteLogo = async (req, res, next) => {
  const schema = joi.object({
    logo_id: joi.string().required(),
  });
  try {
    schema.validateAsync(req.body);
    const logo_id = req.body.logo_id.split(",");
    const logos = await Logo.findAll({ where: { id: logo_id } });
    logos.forEach((logo) => {
      removeFile(logo.path);
    });
    await Logo.destroy({ where: { id: logo_id } });
    return res
      .status(200)
      .json({ status: true, message: "removed successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * updated the name of the dashboard
 * @param {request} req
 * @param {response} res
 * @param {next} next
 * @returns void
 */
exports.renameDashboard = async (req, res, next) => {
  const schema = joi.object({
    dashboardId: joi.number().required(),
    newName: joi.string().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const dashboard = await Dashboard.findOne({
      where: { id: req.body.dashboardId, userId: req.userId },
    });
    helper.dataNotFound(dashboard, "UnAuthorized Access", 401);
    dashboard.name = req.body.newName;
    await dashboard.save();

    return res.send({ message: "dashboard updated", status: true });
  } catch (error) {
    next(error);
  }
};

exports.shareDashboard = async (req, res, next) => {
  const schema = joi.object({
    email: joi.required(),
    link: joi.string().required(),
    dashboardId: joi.number().required(),
    toDate: joi.allow(),
    fromDate: joi.allow(),
    note: joi.string().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const dashboard = await Dashboard.findOne({
      where: { id: req.body.dashboardId },
    });
    helper.dataNotFound(dashboard, "Invalid Dashboard", 404);
    let mailData = await ejs.renderFile(
      path.join(__dirname, "../", "views/", "shareDashboard.ejs"),
      {
        link: req.body.link,
        toDate: req.body.toDate || new Date().toDateString(),
        fromDate: req.body.fromDate || new Date().toDateString(),
        note: req.body.note,
        reportName: dashboard.name,
      }
    );
    await mailHelper.sendEmail(
      req.body.email,
      null,
      "Dashboard Invitation",
      mailData
    );
    await SharedDashboard.create({
      dashboardId: dashboard.id,
      email: req.body.email,
    });
    return res.send({ message: "Dashboard Shared Successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.openSharedDashboard = async (req, res, next) => {
  try {
    const userId = req.userId;
    const checkForAdmin = await User.findOne({ where: { id: userId } });
    if (checkForAdmin.type != "admin") {
      const check = await UserPlan.findOne({
        where: { userId: userId, is_active: "1" },
      });
      helper.dataNotFound(
        check,
        "You cannot open thos dashboard as you haven't purchased any plan yet"
      );
    }
    const dashboard = await Dashboard.findOne({
      where: { id: req.params.dashboardId },
      include: [
        {
          model: Sheet,
          include: [{ model: SheetData }],
        },
        {
          model: Tab,
          include: [
            { model: SheetTab, include: [Sheet] },
            { model: Chart },
            { model: Logo, as: "logo", foreignKey: "logoId" },
            { model: Logo, as: "banner", foreignKey: "bannerId" },
          ],
        },
      ],
    });
    return res.send({
      status: true,
      message: "fetched successfully",
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};
