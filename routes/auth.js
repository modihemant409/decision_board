const express = require("express");
const router = express.Router();
const { AuthController } = require("../controller");
const auth = require("../middleware/authMiddleware");

router.post("/socialLogin", AuthController.socialLogin);

module.exports = router;
