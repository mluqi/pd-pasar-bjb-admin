const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/fileMiddleware");
const {
  getAllUser,
  editUser,
  deleteUser
} = require("../controllers/userController");
const { signup } = require("../controllers/authController");

const router = express.Router();

router.get("/", authMiddleware, getAllUser);
router.post("/", authMiddleware, upload.single("user_foto"), signup);
router.put("/:user_code", authMiddleware, upload.single("user_foto"), editUser);
router.delete("/:user_code", authMiddleware, deleteUser);

module.exports = router;