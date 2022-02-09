const express = require("express");
const router = express.Router();
const { AdminController } = require("../controller");
const Auth = require("../middleware/authMiddleware");
const adminAuth = require("../middleware/adminMiddleware");

router.post("/addPlan", Auth, adminAuth, AdminController.addPlans);
router.post("/blockPLan", Auth, adminAuth, AdminController.blockPLan);
router.get("/getAllPlans", Auth, adminAuth, AdminController.getAllPlans);
router.get("/getAllUsers", Auth, adminAuth, AdminController.getAllUsers);
router.get("/getAllAdmins", Auth, adminAuth, AdminController.getAllAdmins);
router.post("/changeUserType", Auth, adminAuth, AdminController.changeUserType);
router.get(
  "/getUserDetails/:userId",
  Auth,
  adminAuth,
  AdminController.getUserDetails
);
router.get(
  "/get-all-shared-user/:dashboardId",
  Auth,
  adminAuth,
  AdminController.getAllSharedUser
);
router.get(
  "/block-unblock-user/:userId",
  Auth,
  adminAuth,
  AdminController.BlockUnblockUser
);
router.delete(
  "/remove-from-shared-dashboard/:userId",
  Auth,
  adminAuth,
  AdminController.removeFromShared
);
router.get("/get-dashboard", Auth, adminAuth, AdminController.getDashboard);
router.post("/send-message", Auth, adminAuth, AdminController.sendMessageToUser);
router.get("/get-all-sender", Auth, adminAuth, AdminController.getAllSender);
router.get("/get-message/:userId", Auth, adminAuth, AdminController.getAllMessage);
module.exports = router;
