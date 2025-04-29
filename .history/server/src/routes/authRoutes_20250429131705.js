const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const { signin, signup, logout } = require("..authController/controllers/authController");
const upload = require("../middleware/uploadMiddleware");

router.post("/signup", signup, upload.single("user_foto"));
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);

module.exports = router;
