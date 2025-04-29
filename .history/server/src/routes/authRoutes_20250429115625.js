const express = require("express");
const authMiddleware = require("./middlewares/authMiddleware");
const router = express.Router();
const { signin, signup, logout } = require("./controllers/authController");
const upload = require("./middlewares/uploadMiddleware");


router.post("/signup", signup);
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);

module.exports = router;
