const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllIuran,
  getIuranByCode,
  createIuran,
  updateIuran,
  deleteIuran,
  getMetodeBayarCount,
  getDataRecentTransactions,
  getTotalTransactions,
  getTotalIncome,
  getDataNonTunai,
  getDataTunai,
  getDailyTransactionStats,
  getIuranStatusCounts,
} = require("../controllers/iuranController");

router.get("/", authMiddleware, getAllIuran);

//dashboard 
router.get("/metode-bayar", authMiddleware, getMetodeBayarCount);
router.get("/recent-transactions", authMiddleware, getDataRecentTransactions);
router.get("/total-transactions", authMiddleware, getTotalTransactions);
router.get("/total-income", authMiddleware, getTotalIncome);
router.get("/non-tunai", authMiddleware, getDataNonTunai);
router.get("/tunai", authMiddleware, getDataTunai);
router.get("/daily-transaction-stats", authMiddleware, getDailyTransactionStats);
router.get("/iuran-status-stats", authMiddleware, getIuranStatusCounts);

router.get("/:code", authMiddleware, getIuranByCode);
router.post("/", authMiddleware, createIuran);
router.put("/:code", authMiddleware, updateIuran);
router.delete("/:code", authMiddleware, deleteIuran);

module.exports = router;
