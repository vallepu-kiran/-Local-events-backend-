const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const AppDataSource = require("../config/database")
const emailService = require("../services/emailService")

class AuthController {
  async register(req, res) {
    try {
      const { email, password, firstName, lastName } = req.body

      const userRepository = AppDataSource.getRepository("User")

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        })
      }

      // Hash password
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      // Create new user
      const newUser = userRepository.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
      })

      const savedUser = await userRepository.save(newUser)

      // Generate JWT token
      const token = jwt.sign({ userId: savedUser.id, email: savedUser.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      // Remove password from response
      const { password: _, ...userResponse } = savedUser

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(savedUser)
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userResponse,
          token,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      })
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body

      const userRepository = AppDataSource.getRepository("User")

      // Find user by email
      const user = await userRepository.findOne({
        where: { email, isActive: true },
      })

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        })
      }

      // Update last login
      await userRepository.update(user.id, {
        lastLoginAt: new Date(),
      })

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      // Remove password from response
      const { password: _, ...userResponse } = user

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: userResponse,
          token,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      })
    }
  }

  async googleAuth(req, res) {
    try {
      const { googleId, email, firstName, lastName, profilePicture } = req.body

      const userRepository = AppDataSource.getRepository("User")

      // Check if user exists
      let user = await userRepository.findOne({
        where: [{ email }, { googleId }],
      })

      if (!user) {
        // Create new user
        user = userRepository.create({
          email,
          firstName,
          lastName,
          profilePicture,
          googleId,
          isVerified: true,
        })
        user = await userRepository.save(user)
      } else {
        // Update existing user
        await userRepository.update(user.id, {
          googleId,
          profilePicture,
          lastLoginAt: new Date(),
        })
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      res.json({
        success: true,
        message: "Google authentication successful",
        data: {
          user,
          token,
        },
      })
    } catch (error) {
      console.error("Google auth error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error during Google authentication",
      })
    }
  }

  async getProfile(req, res) {
    try {
      const userRepository = AppDataSource.getRepository("User")
      const user = await userRepository.findOne({
        where: { id: req.user.id },
        relations: ["createdEvents", "eventAttendees"],
      })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Remove password from response
      const { password, ...userResponse } = user

      res.json({
        success: true,
        data: { user: userResponse },
      })
    } catch (error) {
      console.error("Get profile error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, bio, interests } = req.body
      const userRepository = AppDataSource.getRepository("User")

      await userRepository.update(req.user.id, {
        firstName,
        lastName,
        bio,
        interests,
      })

      const updatedUser = await userRepository.findOne({
        where: { id: req.user.id },
      })

      // Remove password from response
      const { password, ...userResponse } = updatedUser

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user: userResponse },
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async updateFCMToken(req, res) {
    try {
      const { fcmToken } = req.body
      const userRepository = AppDataSource.getRepository("User")

      await userRepository.update(req.user.id, { fcmToken })

      res.json({
        success: true,
        message: "FCM token updated successfully",
      })
    } catch (error) {
      console.error("Update FCM token error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

module.exports = new AuthController()
