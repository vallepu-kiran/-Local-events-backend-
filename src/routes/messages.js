const express = require("express")
const messageController = require("../controllers/messageController")
const { authenticateToken } = require("../middleware/auth")
const { validateMessage, validateId } = require("../middleware/validation")

const router = express.Router()

// All message routes require authentication
router.post("/events/:eventId", authenticateToken, validateMessage, messageController.sendMessage)
router.get("/events/:eventId", authenticateToken, messageController.getMessages)
router.put("/:messageId", authenticateToken, validateMessage, messageController.editMessage)
router.delete("/:messageId", authenticateToken, validateId, messageController.deleteMessage)

module.exports = router
