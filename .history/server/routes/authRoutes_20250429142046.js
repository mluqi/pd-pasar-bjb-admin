const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming this is the factory function
const router = express.Router();
const { signin, signup, logout } = require("../controllers/authController");
const upload = require("../middleware/fileMiddleware"); // Assuming this correctly exports multer middleware

router.post("/signup", upload.single("user_foto"), signup);

router.post("/signin", signin);

router.post("/logout", authMiddleware, logout);

module.exports = router;
