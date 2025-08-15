const express = require("express")
const authController = require("../controllers/authController")
const { authenticateToken } = require("../middleware/auth")
const { validateUserRegistration, validateUserLogin } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.post("/register", validateUserRegistration, authController.register)
router.post("/login", validateUserLogin, authController.login)
router.post("/google", authController.googleAuth)

// Protected routes
router.get("/profile", authenticateToken, authController.getProfile)
router.put("/profile", authenticateToken, authController.updateProfile)
router.put("/fcm-token", authenticateToken, authController.updateFCMToken)

module.exports = router
