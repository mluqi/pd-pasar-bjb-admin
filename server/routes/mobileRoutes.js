const express = require("express");
const router = express.Router();
const {
  generateQris,
} = require("../controllers/mobileController");

router.get("/", (req, res) => {
  res.status(200).send("Mobile API is running");
});

router.post("/generate-qris", generateQris);

module.exports = router;
