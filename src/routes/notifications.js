const express = require("express")
const router = express.Router()
const { authenticateToken } = require("../middleware/auth")
const AppDataSource = require("../config/database")

// GET /api/notifications - Get user's notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const notificationRepository = AppDataSource.getRepository("Notification")

    const [notifications, total] = await notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
      relations: ["user"]
    })

    const totalPages = Math.ceil(total / limit)
    const unreadCount = await notificationRepository.count({
      where: { user: { id: userId }, isRead: false }
    })

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        unreadCount
      }
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications"
    })
  }
})

// GET /api/notifications/unread-count - Get count of unread notifications
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const notificationRepository = AppDataSource.getRepository("Notification")

    const unreadCount = await notificationRepository.count({
      where: { user: { id: userId }, isRead: false }
    })

    res.json({
      success: true,
      data: { unreadCount }
    })
  } catch (error) {
    console.error("Get unread count error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get unread count"
    })
  }
})

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id)
    const userId = req.user.id

    const notificationRepository = AppDataSource.getRepository("Notification")

    const notification = await notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    notification.isRead = true
    await notificationRepository.save(notification)

    res.json({
      success: true,
      message: "Notification marked as read",
      data: notification
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read"
    })
  }
})

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const notificationRepository = AppDataSource.getRepository("Notification")

    await notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true }
    )

    res.json({
      success: true,
      message: "All notifications marked as read"
    })
  } catch (error) {
    console.error("Mark all notifications as read error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read"
    })
  }
})

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id)
    const userId = req.user.id

    const notificationRepository = AppDataSource.getRepository("Notification")

    const notification = await notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } }
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      })
    }

    await notificationRepository.remove(notification)

    res.json({
      success: true,
      message: "Notification deleted"
    })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete notification"
    })
  }
})

// POST /api/notifications - Create a new notification (internal use)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { userId, title, message, type = "system", data = null } = req.body

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title, and message are required"
      })
    }

    const notificationRepository = AppDataSource.getRepository("Notification")
    const userRepository = AppDataSource.getRepository("User")

    const user = await userRepository.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const notification = notificationRepository.create({
      user: { id: userId },
      title,
      message,
      type,
      data
    })

    await notificationRepository.save(notification)

    res.status(201).json({
      success: true,
      message: "Notification created",
      data: notification
    })
  } catch (error) {
    console.error("Create notification error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create notification"
    })
  }
})

module.exports = router