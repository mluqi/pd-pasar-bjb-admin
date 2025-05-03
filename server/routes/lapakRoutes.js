const express = require("express");
const router = express.Router();
const {
  getAllLapak,
  getLapakByCode,
  createLapak,
  updateLapak,
  deleteLapak,
} = require("../controllers/lapakController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAllLapak);
router.get("/:code", authMiddleware, getLapakByCode);
router.post("/", authMiddleware, createLapak);
router.put("/:code", authMiddleware, updateLapak);
router.delete("/:code", authMiddleware, deleteLapak);

module.exports = router;
