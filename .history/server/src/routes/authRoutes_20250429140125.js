const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); 
const router = express.Router();
const { signin, signup, logout } = require("../controllers/authController");
const { fields } = require("../middleware/fileMiddleware");
// const upload = require("../middleware/fileMiddleware"); 

router.post("/signup", signup, fields);

router.post("/signin", signin);

router.post("/logout", authMiddleware, logout);

module.exports = router;
