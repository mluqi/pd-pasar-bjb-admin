const express = require("express");
const authMiddleware = require("./");
const router = express.Router();
const { signin, signup, logout } = require("./controllers/authController");
const upload = require("./middlewares/uploadMiddleware");

router.post("/signup", signup, upload.single("user_foto"));
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);

module.exports = router;
