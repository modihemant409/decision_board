const joi = require("joi");
const {
  Logo,
  Dashboard,
  Sheet,
  SheetData,
  Chart,
  SheetTab,
  Tab,
  ChartLayout,
} = require("../models");
const { UploadFile, removeFile } = require("../helper/File");
const helper = require("../helper/functions");

exports.addSheet = async (req, res, next) => {
  const schema = joi.object({
    spreadsheetId: joi.string().required(),
    sheet_name: joi.string().required(),
    rows: joi.number().required(),
    columns: joi.number().required(),
    dashboardId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const create = {};
    for (const key in req.body) {
      create[key] = req.body[key];
    }
    create["userId"] = req.userId;

    const sheet = await Sheet.create(create);
    return res.send({
      data: sheet,
      message: "sheet created successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * add data of a particular sheet
 * @param {request} req
 * @param {response} res
 * @param {next} next
 * @returns sheet data added in db
 */
exports.addSheetData = async (req, res, next) => {
  const schema = joi.object({
    sheet_data: joi.required(),
    sheet_column: joi.required(),
    sheetId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const sheet = await Sheet.findByPk(req.body.sheetId);
    helper.dataNotFound(sheet, "Invalid sheet", 404);
    const sheet_data = await SheetData.create({
      sheet_column: req.body.sheet_column,
      sheet_data: req.body.sheet_data,
      sheetId: sheet.id,
    });
    return res.send({
      message: "sheet data added",
      status: true,
      data: sheet_data,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSheetData = async (req, res, next) => {
  const schema = joi.object({
    sheetId: joi.number().required(),
    sheet_data: joi.required(),
    sheet_column: joi.required(),
  });
  try {
    await schema.validateAsync(req.body);
    const update = {};
    for (const key in req.body) {
      if (key == "sheetId") continue;
      update[key] = req.body[key];
    }
    const result = await SheetData.update(update, {
      where: { sheetId: req.body.sheetId },
    });
    helper.dataNotFound(result[0], "Unable to Update chart", 409);
    return res.send({ message: "sheet Data updated", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getSheet = async (req, res, next) => {
  const schema = joi.object({
    dashboardId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.params);
    const sheet = await Sheet.findAll({
      where: { dashboardId: req.params.dashboardId },
      include: [SheetData],
    });
    return res.send({
      data: sheet,
      message: "fetched successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};

exports.addTab = async (req, res, next) => {
  const schema = joi.object({
    title: joi.string().required(),
    logoId: joi.number().required(),
    dashboardId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const tab = await Tab.create({
      dashboardId: req.body.dashboardId,
      label: req.body.title,
      logoId: req.body.logoId,
    });
    return res.send({
      message: "Tab created successfully",
      status: true,
      data: tab,
    });
  } catch (error) {
    next(error);
  }
};

exports.addSheetInTab = async (req, res, next) => {
  const schema = joi.object({
    sheetId: joi.string().required(),
    tabId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const sheets = req.body.sheetId.split(",");
    const create = [];
    sheets.forEach((sheet_id) => {
      create.push({ sheetId: sheet_id, tabId: req.body.tabId });
    });
    const sheetTab = await SheetTab.bulkCreate(create);
    return res.send({ message: "sheets added successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.removeSheetFromTab = async (req, res, next) => {
  const schema = joi.object({
    sheetId: joi.number().required(),
    tabId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const sheetTab = await SheetTab.destroy({
      where: { sheetId: req.body.sheetId, tabId: req.body.tabId },
    });
    return res.send({ message: "sheet removed successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getAllTabs = async (req, res, next) => {
  try {
    const tabs = await Tab.findAll({
      where: { dashboardId: req.params.dashboardId },
      include: [
        { model: Logo, as: "logo", foreignKey: "logoId" },
        { model: Logo, as: "banner", foreignKey: "bannerId" },
        { model: SheetTab, include: [{ model: Sheet, include: [SheetData] }] },
      ],
    });
    return res.send({
      message: "fetched successfully",
      data: tabs,
      status: true,
    });
  } catch (error) {}
};

exports.addTabInfo = async (req, res, next) => {
  const schema = joi.object({
    bannerId: joi.number().required(),
    name: joi.string().required(),
    tabId: joi.number().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const tab = await Tab.findOne({ where: { id: req.body.tabId } });

    helper.dataNotFound(tab, "Invalid Tab", 404);
    tab.name = req.body.name;
    tab.bannerId = req.body.bannerId;
    await tab.save();
    await tab.reload();
    return res.send({ message: "success", status: true, data: tab });
  } catch (error) {
    next(error);
  }
};

exports.addChart = async (req, res, next) => {
  const schema = joi.object({
    tabId: joi.number().required(),
    chart_data: joi.required(),
  });
  try {
    await schema.validateAsync(req.body);
    const { tabId, chart_data } = req.body;
    const chartCount = await Chart.count({ where: { tabId: tabId } });
    const chart = await Chart.create({
      tabId,
      chart_data: chart_data,
      index: chartCount + 1,
    });
    return res.send({ message: "chart added", status: true, data: chart });
  } catch (error) {
    next(error);
  }
};

exports.updateChart = async (req, res, next) => {
  const schema = joi.object({
    chart_id: joi.number().required(),
    chart_data: joi.required(),
  });
  try {
    await schema.validateAsync(req.body);
    const { chart_id, chart_data } = req.body;
    const chart = await Chart.update(
      {
        chart_data,
      },
      { where: { id: chart_id } }
    );
    helper.dataNotFound(chart[0], "Unable to Update chart", 409);
    return res.send({ message: "chart updated", status: true });
  } catch (error) {
    next(error);
  }
};

exports.getCharts = async (req, res, next) => {
  try {
    const charts = await Chart.findAll({
      where: { tabId: req.params.tabId },
    });
    return res.send({
      message: "fetched successfully",
      status: true,
      data: charts,
    });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  const schema = joi.object({
    chartId: joi.number().required(),
    comment: joi.string().required(),
  });
  try {
    await schema.validateAsync(req.body);
    const result = await Chart.update(
      { comment: req.body.comment },
      { where: { id: req.body.chartId } }
    );
    helper.dataNotFound(result[0], "Unable to add comment", 409);
    return res.send({ message: "Comment Added", status: true });
  } catch (error) {
    next(error);
  }
};

exports.deleteChart = async (req, res, next) => {
  try {
    const chart = await Chart.findOne({ where: { id: req.params.chartId } });
    helper.dataNotFound(chart, "invalid chart", 404);
    await chart.destroy();
    return res.send({ message: "success", status: true });
  } catch (error) {
    next(error);
  }
};

exports.setChartIndex = async (req, res, next) => {
  try {
    const chartIndex = req.body.indexing;
    for (const key in chartIndex) {
      await Chart.update({ index: chartIndex[key] }, { where: { id: key } });
    }
    return res.send({ message: "Index changed successfully", status: true });
  } catch (error) {
    next(error);
  }
};

exports.addTabLayout = async (req, res, next) => {
  try {
    const { tabId, layout } = req.body;
    const chart_layout = await ChartLayout.findOne({ where: { tabId } });
    let newLayout;
    if (chart_layout) {
      newLayout = await ChartLayout.update(
        { layout_data: layout },
        { where: { tabId } }
      );
    } else {
      newLayout = await ChartLayout.create({
        layout_data: chart_layout,
        tabId,
      });
    }
    return res.send({ message: "layout updated", status: true });
  } catch (error) {
    next(error);
  }
};
