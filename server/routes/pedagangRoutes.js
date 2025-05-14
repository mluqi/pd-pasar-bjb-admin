const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getAllPedagang,
  getAllPedagangWithoutPagination,
  getPedagangById,
  createPedagang,
  updatePedagang,
  deletePedagang,
} = require("../controllers/pedagangController");

router.get("/", authMiddleware, getAllPedagang);
router.get("/all", authMiddleware, getAllPedagangWithoutPagination);
router.get("/:code", authMiddleware, getPedagangById);
router.post("/", authMiddleware, createPedagang);
router.put("/:code", authMiddleware, updatePedagang);
router.delete("/:code", authMiddleware, deletePedagang);

module.exports = router;
