const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const { signin, signup, logout, getProfile, editProfile } = require("../controllers/authController");
const upload = require("../middleware/fileMiddleware"); 

router.post("/signup", authMiddleware, upload.single("user_foto"), signup);
router.post("/signin", signin);
router.post("/logout", authMiddleware, logout);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, upload.single("user_foto"), editProfile);

module.exports = router;
