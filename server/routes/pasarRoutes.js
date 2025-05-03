const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getAllPasar,
  addPasar,
  editPasar,
  deletePasar
} = require("../controllers/pasarController");
const upload = require("../middleware/fileMiddleware");

router.get("/", authMiddleware, getAllPasar);
router.post("/", authMiddleware, upload.single("pasar_logo"), addPasar);
router.put(
  "/:pasar_code",
  authMiddleware,
  upload.single("pasar_logo"),
  editPasar
);
router.delete("/:pasar_code", authMiddleware, deletePasar);

module.exports = router;
