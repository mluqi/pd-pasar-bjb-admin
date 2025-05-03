const express = require("express");
const router = express.Router();
const { getAllLevel } = require("../controllers/levelController");

router.get("/", getAllLevel);

module.exports = router;
