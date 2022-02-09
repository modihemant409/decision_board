const express = require("express");
const router = express.Router();
const { UserController } = require("../controller");
const auth = require("../middleware/authMiddleware");

router.post("/purchasePlan", auth, UserController.purchasePlan);
router.get("/allPlans", auth, UserController.getAllPlans);
router.get("/all-purchased-plans", auth, UserController.getAllPurchasedPlans);
router.get(
  "/all-shared-dashboards",
  auth,
  UserController.getAllSharedDashboard
);
router.get(
  "/all-archived-dashboards",
  auth,
  UserController.getArchivedDashboards
);
router.get(
  "/archive-dashboard/:dashboardId",
  auth,
  UserController.saveDashboardToArchive
);
router.delete(
  "/remove-archive/:dashboardId",
  auth,
  UserController.removeFromArchive
);
router.post("/send-message", auth, UserController.sendMessageToAdmin);
router.get("/get-messages", auth, UserController.getAllMessage);
module.exports = router;
