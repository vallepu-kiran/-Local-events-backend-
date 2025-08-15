require("dotenv").config()
const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const { createServer } = require("http")
const { Server } = require("socket.io")

const AppDataSource = require("./config/database")

// Import routes
const authRoutes = require("./routes/auth")
const eventRoutes = require("./routes/events")
const messageRoutes = require("./routes/messages")
const reviewRoutes = require("./routes/reviews")
const adminRoutes = require("./routes/admin")

const app = express()
const server = createServer(app)

// Socket.IO setup
const allowedOrigins = process.env.FRONTEND_URL.split(',').map(url => url.trim())
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
})

// Middleware
app.use(helmet())
app.use(compression())
app.use(morgan("combined"))

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
})
app.use("/api/", limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files
app.use("/uploads", express.static("uploads"))

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admin", adminRoutes)

// Socket.IO connection handling
io.on("connection", (socket) => {

  // Join event room for real-time messaging
  socket.on("join_event", (eventId) => {
    socket.join(`event_${eventId}`)
  })

  // Leave event room
  socket.on("leave_event", (eventId) => {
    socket.leave(`event_${eventId}`)
  })

  // Handle new message
  socket.on("new_message", (data) => {
    socket.to(`event_${data.eventId}`).emit("message_received", data)
  })

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(`event_${data.eventId}`).emit("user_typing", {
      userId: data.userId,
      userName: data.userName,
    })
  })

  socket.on("stop_typing", (data) => {
    socket.to(`event_${data.eventId}`).emit("user_stop_typing", {
      userId: data.userId,
    })
  })

  socket.on("disconnect", () => {
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
    })
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Database connection and server startup
const PORT = process.env.PORT || 5000

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully")

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`Health check: http://localhost:${PORT}/health`)
      console.log(`External access: http://0.0.0.0:${PORT}/health`)
    })
  })
  .catch((error) => {
    console.error("Database connection failed:", error)
    process.exit(1)
  })

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully")
  server.close(() => {
    console.log("Process terminated")
  })
})

module.exports = { app, server, io }
