const AppDataSource = require("../config/database")

class AdminController {
  async getDashboardStats(req, res) {
    try {
      const userRepository = AppDataSource.getRepository("User")
      const eventRepository = AppDataSource.getRepository("Event")
      const messageRepository = AppDataSource.getRepository("Message")
      const reviewRepository = AppDataSource.getRepository("Review")

      const [totalUsers, totalEvents, totalMessages, totalReviews, activeUsers, upcomingEvents, completedEvents] =
        await Promise.all([
          userRepository.count(),
          eventRepository.count(),
          messageRepository.count(),
          reviewRepository.count(),
          userRepository.count({ where: { isActive: true } }),
          eventRepository.count({ where: { status: "upcoming" } }),
          eventRepository.count({ where: { status: "completed" } }),
        ])

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            totalEvents,
            totalMessages,
            totalReviews,
            activeUsers,
            upcomingEvents,
            completedEvents,
          },
        },
      })
    } catch (error) {
      console.error("Get dashboard stats error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, role, isActive } = req.query
      const userRepository = AppDataSource.getRepository("User")

      const queryBuilder = userRepository.createQueryBuilder("user")

      // Apply filters
      if (search) {
        queryBuilder.andWhere(
          "(user.firstName LIKE :search OR user.lastName LIKE :search OR user.email LIKE :search)",
          { search: `%${search}%` },
        )
      }

      if (role) {
        queryBuilder.andWhere("user.role = :role", { role })
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere("user.isActive = :isActive", {
          isActive: isActive === "true",
        })
      }

      // Pagination
      const offset = (page - 1) * limit
      queryBuilder.orderBy("user.createdAt", "DESC").skip(offset).take(limit)

      const [users, total] = await queryBuilder.getManyAndCount()

      // Remove passwords from response
      const sanitizedUsers = users.map((user) => {
        const { password, ...userWithoutPassword } = user
        return userWithoutPassword
      })

      res.json({
        success: true,
        data: {
          users: sanitizedUsers,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get users error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getEvents(req, res) {
    try {
      const { page = 1, limit = 20, search, status } = req.query
      const eventRepository = AppDataSource.getRepository("Event")

      const queryBuilder = eventRepository.createQueryBuilder("event").leftJoinAndSelect("event.creator", "creator")

      // Apply filters
      if (search) {
        queryBuilder.andWhere(
          "(event.title LIKE :search OR event.description LIKE :search OR event.location LIKE :search)",
          { search: `%${search}%` },
        )
      }

      if (status) {
        queryBuilder.andWhere("event.status = :status", { status })
      }

      // Pagination
      const offset = (page - 1) * limit
      queryBuilder.orderBy("event.createdAt", "DESC").skip(offset).take(limit)

      const [events, total] = await queryBuilder.getManyAndCount()

      res.json({
        success: true,
        data: {
          events,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get events error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async updateUserStatus(req, res) {
    try {
      const { userId } = req.params
      const { isActive, role } = req.body

      const userRepository = AppDataSource.getRepository("User")

      const updateData = {}
      if (isActive !== undefined) updateData.isActive = isActive
      if (role) updateData.role = role

      await userRepository.update(Number.parseInt(userId), updateData)

      const updatedUser = await userRepository.findOne({
        where: { id: Number.parseInt(userId) },
      })

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Remove password from response
      const { password, ...userResponse } = updatedUser

      res.json({
        success: true,
        message: "User status updated successfully",
        data: { user: userResponse },
      })
    } catch (error) {
      console.error("Update user status error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async deleteEvent(req, res) {
    try {
      const { eventId } = req.params
      const eventRepository = AppDataSource.getRepository("Event")

      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(eventId) },
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      await eventRepository.remove(event)

      res.json({
        success: true,
        message: "Event deleted successfully",
      })
    } catch (error) {
      console.error("Delete event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getReports(req, res) {
    try {
      const { page = 1, limit = 20, type } = req.query

      // This would typically fetch reported content from a reports table
      // For now, returning a placeholder response
      res.json({
        success: true,
        data: {
          reports: [],
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total: 0,
            pages: 0,
          },
        },
      })
    } catch (error) {
      console.error("Get reports error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

module.exports = new AdminController()
