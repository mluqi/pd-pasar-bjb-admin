const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/fileMiddleware");
const {
  getAllInvoices,
  getInvoiceById,
  getInvoiceStatusByCode,
  updateStatusInvoice,
  sendConfirmationPayment,
  rejectConfirmation,
  searchPedagangForConfirmation,
} = require("../controllers/invoicesController");

router.get("/status/:code", getInvoiceStatusByCode);
router.get("/search", searchPedagangForConfirmation);
router.get("/", authMiddleware, getAllInvoices);
router.get("/:id", authMiddleware, getInvoiceById);
router.put("/:id", authMiddleware, updateStatusInvoice);
router.post(
  "/confirmation-payment",
  upload.fields([{ name: "bukti_foto", maxCount: 1 }]),
  sendConfirmationPayment
);

router.put("/:id/reject", authMiddleware, rejectConfirmation);

module.exports = router;
