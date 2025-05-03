const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllPedagang,
  getPedagangById,
  createPedagang,
  updatePedagang,
  deletePedagang,
} = require("../controllers/pedagangController");

router.get("/", authMiddleware, getAllPedagang);
router.get("/:code", authMiddleware, getPedagangById);
router.post("/", authMiddleware, createPedagang);
router.put("/:code", authMiddleware, updatePedagang);
router.delete("/:code", authMiddleware, deletePedagang);

module.exports = router;
