const express = require("express");
const authMiddleware = require("../middleware/authMiddleware"); // Assuming this is the factory function
const router = express.Router();
const { signin, signup, logout } = require("../controllers/authController");
const upload = require("../middleware/fileMiddleware"); // Assuming this correctly exports multer middleware

// Corrected Order: upload middleware runs first, then the signup controller
// The 'user_foto' string must match the field name in your form-data request
router.post("/signup", upload.single("user_foto"), signup);

router.post("/signin", signin);

router.post("/logout", authMiddleware, logout);

module.exports = router;
