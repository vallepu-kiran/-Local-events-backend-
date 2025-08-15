const { body, param, query, validationResult } = require("express-validator")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User validation rules
const validateUserRegistration = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("firstName").trim().isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),
  body("lastName").trim().isLength({ min: 2, max: 50 }).withMessage("Last name must be between 2 and 50 characters"),
  handleValidationErrors,
]

const validateUserLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

// Event validation rules
const validateEventCreation = [
  body("title").trim().isLength({ min: 3, max: 255 }).withMessage("Title must be between 3 and 255 characters"),
  body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
  body("location").trim().isLength({ min: 5, max: 500 }).withMessage("Location must be between 5 and 500 characters"),
  body("startDateTime").isISO8601().withMessage("Please provide a valid start date and time"),
  body("endDateTime")
    .isISO8601()
    .withMessage("Please provide a valid end date and time")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDateTime)) {
        throw new Error("End date must be after start date")
      }
      return true
    }),
  body("maxAttendees")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Max attendees must be between 1 and 10000"),
  handleValidationErrors,
]

// Review validation rules
const validateReview = [
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment must not exceed 1000 characters"),
  handleValidationErrors,
]

// Message validation rules
const validateMessage = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message content must be between 1 and 2000 characters"),
  handleValidationErrors,
]

// Parameter validation
const validateId = [param("id").isInt({ min: 1 }).withMessage("Invalid ID parameter"), handleValidationErrors]

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateEventCreation,
  validateReview,
  validateMessage,
  validateId,
  handleValidationErrors,
}
