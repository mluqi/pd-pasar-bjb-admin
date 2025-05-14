const express = require("express");
const router = express.Router();
const { getMenusByLevel } = require("../controllers/menuController");
const AuthMiddleware = require("../middleware/authMiddleware");

router.get("/:levelCode", AuthMiddleware, getMenusByLevel);

module.exports = router;
