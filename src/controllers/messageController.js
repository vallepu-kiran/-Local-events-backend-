const AppDataSource = require("../config/database")
const { sendPushNotification } = require("../services/notificationService")

class MessageController {
  async sendMessage(req, res) {
    try {
      const { eventId } = req.params
      const { content, messageType = "text" } = req.body
      const userId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")
      const messageRepository = AppDataSource.getRepository("Message")
      const attendeeRepository = AppDataSource.getRepository("EventAttendee")

      // Check if event exists
      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(eventId) },
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      // Check if user is attending the event
      const isAttending = await attendeeRepository.findOne({
        where: {
          user: { id: userId },
          event: { id: Number.parseInt(eventId) },
          status: "joined",
        },
      })

      if (!isAttending) {
        return res.status(403).json({
          success: false,
          message: "You must be attending the event to send messages",
        })
      }

      // Create message
      const newMessage = messageRepository.create({
        content,
        messageType,
        sender: { id: userId },
        event: { id: Number.parseInt(eventId) },
      })

      const savedMessage = await messageRepository.save(newMessage)

      // Load message with sender details
      const messageWithSender = await messageRepository.findOne({
        where: { id: savedMessage.id },
        relations: ["sender"],
      })

      // Get all attendees for push notifications
      const attendees = await attendeeRepository.find({
        where: { event: { id: Number.parseInt(eventId) }, status: "joined" },
        relations: ["user"],
      })

      // Send push notifications to other attendees
      const notificationPromises = attendees
        .filter((attendee) => attendee.user.id !== userId && attendee.user.fcmToken)
        .map((attendee) =>
          sendPushNotification(attendee.user.fcmToken, {
            title: `New message in ${event.title}`,
            body: `${req.user.firstName}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
            data: { eventId, messageId: savedMessage.id.toString(), type: "new_message" },
          }),
        )

      await Promise.allSettled(notificationPromises)

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: { message: messageWithSender },
      })
    } catch (error) {
      console.error("Send message error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getMessages(req, res) {
    try {
      const { eventId } = req.params
      const { page = 1, limit = 50 } = req.query
      const userId = req.user.id

      const attendeeRepository = AppDataSource.getRepository("EventAttendee")
      const messageRepository = AppDataSource.getRepository("Message")

      // Check if user is attending the event
      const isAttending = await attendeeRepository.findOne({
        where: {
          user: { id: userId },
          event: { id: Number.parseInt(eventId) },
          status: "joined",
        },
      })

      if (!isAttending) {
        return res.status(403).json({
          success: false,
          message: "You must be attending the event to view messages",
        })
      }

      // Get messages with pagination
      const offset = (page - 1) * limit
      const [messages, total] = await messageRepository.findAndCount({
        where: { event: { id: Number.parseInt(eventId) } },
        relations: ["sender"],
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      })

      res.json({
        success: true,
        data: {
          messages: messages.reverse(), // Reverse to show oldest first
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get messages error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async editMessage(req, res) {
    try {
      const { messageId } = req.params
      const { content } = req.body
      const userId = req.user.id

      const messageRepository = AppDataSource.getRepository("Message")

      // Find message
      const message = await messageRepository.findOne({
        where: { id: Number.parseInt(messageId) },
        relations: ["sender"],
      })

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        })
      }

      // Check if user is the sender
      if (message.sender.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only edit your own messages",
        })
      }

      // Update message
      await messageRepository.update(Number.parseInt(messageId), {
        content,
        isEdited: true,
      })

      const updatedMessage = await messageRepository.findOne({
        where: { id: Number.parseInt(messageId) },
        relations: ["sender"],
      })

      res.json({
        success: true,
        message: "Message updated successfully",
        data: { message: updatedMessage },
      })
    } catch (error) {
      console.error("Edit message error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async deleteMessage(req, res) {
    try {
      const { messageId } = req.params
      const userId = req.user.id

      const messageRepository = AppDataSource.getRepository("Message")

      // Find message
      const message = await messageRepository.findOne({
        where: { id: Number.parseInt(messageId) },
        relations: ["sender"],
      })

      if (!message) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        })
      }

      // Check if user is the sender or admin
      if (message.sender.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own messages",
        })
      }

      await messageRepository.remove(message)

      res.json({
        success: true,
        message: "Message deleted successfully",
      })
    } catch (error) {
      console.error("Delete message error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

module.exports = new MessageController()
