const express = require("express");
const router = express.Router();
const {
  getAllLapak,
  getAllLapakWithoutPagination,
  getLapakByCode,
  createLapak,
  updateLapak,
  updateLapakStatus,
  deleteLapak,
} = require("../controllers/lapakController");
const { getAllTypeLapak, getTypeLapakByCode, createTypeLapak, updateTypeLapak, deleteTypeLapak } = require("../controllers/lapakTypeController")
const authMiddleware = require("../middleware/authMiddleware");

router.get("/type", authMiddleware, getAllTypeLapak);
router.get("/type/:code", authMiddleware, getTypeLapakByCode);
router.post("/type", authMiddleware, createTypeLapak);
router.put("/type/:code", authMiddleware, updateTypeLapak);
router.delete("/type/:code", authMiddleware, deleteTypeLapak);

router.get("/", authMiddleware, getAllLapak);
router.get("/all", authMiddleware, getAllLapakWithoutPagination)
router.get("/:code", authMiddleware, getLapakByCode);
router.post("/", authMiddleware, createLapak);
router.put("/:code/status", authMiddleware, updateLapakStatus)
router.put("/:code", authMiddleware, updateLapak);
router.delete("/:code", authMiddleware, deleteLapak);

module.exports = router;
