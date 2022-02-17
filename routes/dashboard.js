const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");
const { DashboardController } = require("../controller");

router.post("/addLogo", auth, DashboardController.addLogo);
router.delete("/deleteLogo", auth, DashboardController.deleteLogo);
router.delete("/remove-dashboard/:dashboardId", auth, DashboardController.removeDashboard);
router.get("/getLogo", auth, DashboardController.getLogos);
router.post(
  "/createDashboard",
  adminAuth,
  auth,
  DashboardController.createDashboard
);
router.get("/getDashboard", auth, DashboardController.getDashboard);
router.post("/renameDashboard", auth, DashboardController.renameDashboard);
router.post("/shareDashboard", auth, DashboardController.shareDashboard);
router.get(
  "/openSharedDashboard/:dashboardId",
  auth,
  DashboardController.openSharedDashboard
);
module.exports = router;
