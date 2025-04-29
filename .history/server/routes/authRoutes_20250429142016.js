const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming this is the factory function
const router = express.Router();
const { signin, signup, logout } = require("../controllers/authController");
const upload = require("../middleware/fileMiddleware"); // Assuming this correctly exports multer middleware

// Corrected Order: upload middleware runs first, then the signup controller
// The 'user_foto' string must match the field name in your form-data request
router.post("/signup", upload.single("user_foto"), signup);

router.post("/signin", signin);

// Corrected Usage: Call the authMiddleware factory function if it is one
// Pass required roles if needed, or empty () for just authentication check
router.post("/logout", authMiddleware, logout); // Assuming authMiddleware is a factory

module.exports = router;
