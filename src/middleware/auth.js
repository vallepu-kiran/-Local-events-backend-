const jwt = require("jsonwebtoken")
const AppDataSource = require("../config/database")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const userRepository = AppDataSource.getRepository("User")
    const user = await userRepository.findOne({
      where: { id: decoded.userId, isActive: true },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found",
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      })
    }

    next()
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
}
