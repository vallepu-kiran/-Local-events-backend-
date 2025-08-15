const express = require("express")
const adminController = require("../controllers/adminController")
const { authenticateToken, authorizeRoles } = require("../middleware/auth")

const router = express.Router()

// All admin routes require authentication and admin role
router.use(authenticateToken)
router.use(authorizeRoles("admin"))

router.get("/dashboard/stats", adminController.getDashboardStats)
router.get("/users", adminController.getUsers)
router.get("/events", adminController.getEvents)
router.put("/users/:userId/status", adminController.updateUserStatus)
router.delete("/events/:eventId", adminController.deleteEvent)
router.get("/reports", adminController.getReports)

module.exports = router
