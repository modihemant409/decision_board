const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { SheetController } = require("../controller");

router.post("/addSheet", auth, SheetController.addSheet);
router.post("/addSheetData", auth, SheetController.addSheetData);
router.put("/updateSheetData", auth, SheetController.updateSheetData);
router.get("/getSheets/:dashboardId", auth, SheetController.getSheet);
router.post("/addTab", auth, SheetController.addTab);
router.post("/addSheetInTab", auth, SheetController.addSheetInTab);
router.delete("/removeSheetFromTab", auth, SheetController.removeSheetFromTab);
router.post("/addDashboardInfo", auth, SheetController.addDashboardInfo);
router.get("/getAllTabs/:dashboardId", auth, SheetController.getAllTabs);
router.get("/getCharts/:tabId", auth, SheetController.getCharts);
router.post("/addChart", auth, SheetController.addChart);
router.put("/updateChart", auth, SheetController.updateChart);
router.post("/addComment", auth, SheetController.addComment);
router.post("/add-layout", auth, SheetController.addTabLayout);
router.post("/set-chart-indexing", auth, SheetController.setChartIndex);
router.delete("/delete-chart/:chartId", auth, SheetController.deleteChart);
router.get("/get-chart-layout/:tabId", auth, SheetController.getChartLayout);

module.exports = router;
