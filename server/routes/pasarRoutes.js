const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const {
  getAllPasar,
  getAllPasarWithoutPagination,
  getPasarById,
  addPasar,
  editPasar,
  deletePasar,
  getPublicAllPasar,
} = require("../controllers/pasarController");
const upload = require("../middleware/fileMiddleware");

router.get("/public/all", getPublicAllPasar);

router.get("/", authMiddleware, getAllPasar);
router.get("/all", authMiddleware, getAllPasarWithoutPagination);

router.post(
  "/",
  authMiddleware,
  upload.fields([{ name: "pasar_logo", maxCount: 1 }]),
  addPasar
);

router.get("/:pasar_code", authMiddleware, getPasarById);

router.put(
  "/:pasar_code",
  authMiddleware,
  upload.fields([{ name: "pasar_logo", maxCount: 1 }]),
  editPasar
);

router.delete("/:pasar_code", authMiddleware, deletePasar);

module.exports = router;
