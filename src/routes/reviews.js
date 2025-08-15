const express = require("express")
const reviewController = require("../controllers/reviewController")
const { authenticateToken } = require("../middleware/auth")
const { validateReview, validateId } = require("../middleware/validation")

const router = express.Router()

// All review routes require authentication
router.post("/events/:eventId", authenticateToken, validateReview, reviewController.createReview)
router.get("/events/:eventId", reviewController.getEventReviews)
router.get("/users/:userId", reviewController.getUserReviews)

module.exports = router
