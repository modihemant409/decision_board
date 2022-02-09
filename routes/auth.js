const express = require("express");
const router = express.Router();
const { AuthController } = require("../controller");
const auth = require("../middleware/authMiddleware");

router.post("/socialLogin", AuthController.socialLogin);
router.post('/signup',AuthController.signUp)
router.post('/login',AuthController.login)
router.post('/edit-profile',auth,AuthController.editProfile)



module.exports = router;
