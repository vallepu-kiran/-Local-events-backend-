const express = require("express")
const eventController = require("../controllers/eventController")
const { authenticateToken } = require("../middleware/auth")
const { validateEventCreation, validateId } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.get("/", eventController.getEvents)
router.get("/:id", validateId, eventController.getEventById)

// Protected routes
router.post("/", authenticateToken, validateEventCreation, eventController.createEvent)
router.put("/:id", authenticateToken, validateId, eventController.updateEvent)
router.delete("/:id", authenticateToken, validateId, eventController.deleteEvent)
router.post("/:id/join", authenticateToken, validateId, eventController.joinEvent)
router.delete("/:id/leave", authenticateToken, validateId, eventController.leaveEvent)
router.post("/:id/like", authenticateToken, validateId, eventController.likeEvent)

module.exports = router
