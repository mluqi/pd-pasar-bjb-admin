const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); 
const router = express.Router();
const { signin, signup, logout } = require("../controllers/authController");
const upload = require("../middleware/fileMiddleware"); 
router.post("/signup", upload.single("user_foto"), signup);

router.post("/signin", signin);

// Corrected Usage: Call the authMiddleware factory function to get the middleware
// Pass required roles if needed, or empty () for just authentication check
router.post("/logout", authMiddleware(), logout);

module.exports = router;
