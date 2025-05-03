const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllIuran,
  getIuranByCode,
  createIuran,
  updateIuran,
  deleteIuran,
} = require("../controllers/iuranController");

router.get("/", authMiddleware, getAllIuran);
router.get("/:code", authMiddleware, getIuranByCode);
router.post("/", authMiddleware, createIuran);
router.put("/:code", authMiddleware, updateIuran);
router.delete("/:code", authMiddleware, deleteIuran);

module.exports = router;
