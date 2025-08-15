const AppDataSource = require("../config/database")
const { sendPushNotification } = require("../services/notificationService")

class EventController {
  async createEvent(req, res) {
    try {
      const {
        title,
        description,
        location,
        latitude,
        longitude,
        startDateTime,
        endDateTime,
        maxAttendees,
        tags,
        isPrivate,
        requiresApproval,
      } = req.body

      const eventRepository = AppDataSource.getRepository("Event")

      const newEvent = eventRepository.create({
        title,
        description,
        location,
        latitude,
        longitude,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
        maxAttendees,
        tags,
        isPrivate: isPrivate || false,
        requiresApproval: requiresApproval || false,
        creator: { id: req.user.id },
      })

      const savedEvent = await eventRepository.save(newEvent)

      // Load the event with creator details
      const eventWithCreator = await eventRepository.findOne({
        where: { id: savedEvent.id },
        relations: ["creator"],
      })

      res.status(201).json({
        success: true,
        message: "Event created successfully",
        data: { event: eventWithCreator },
      })
    } catch (error) {
      console.error("Create event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getEvents(req, res) {
    try {
      // Validate and sanitize query parameters
      const page = Math.max(1, parseInt(req.query.page) || 1)
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10))
      const { tags, location, startDate, endDate, status = "upcoming" } = req.query

      const eventRepository = AppDataSource.getRepository("Event")

      const queryBuilder = eventRepository
        .createQueryBuilder("event")
        .leftJoinAndSelect("event.creator", "creator")
        .leftJoinAndSelect("event.attendees", "attendees")
        .where("event.status = :status", { status })
        .andWhere("event.isPrivate = false")

      // Apply filters
      if (tags) {
        const tagArray = tags.split(",")
        queryBuilder.andWhere("JSON_OVERLAPS(event.tags, :tags)", {
          tags: JSON.stringify(tagArray),
        })
      }

      if (location) {
        queryBuilder.andWhere("event.location LIKE :location", {
          location: `%${location}%`,
        })
      }

      if (startDate) {
        queryBuilder.andWhere("event.startDateTime >= :startDate", {
          startDate: new Date(startDate),
        })
      }

      if (endDate) {
        queryBuilder.andWhere("event.endDateTime <= :endDate", {
          endDate: new Date(endDate),
        })
      }

      // Pagination
      const offset = (page - 1) * limit
      queryBuilder.orderBy("event.startDateTime", "ASC").skip(offset).take(limit)

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

  async getEventById(req, res) {
    try {
      const { id } = req.params
      const eventRepository = AppDataSource.getRepository("Event")

      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
        relations: ["creator", "attendees", "attendees.user", "reviews", "reviews.reviewer"],
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      res.json({
        success: true,
        data: { event },
      })
    } catch (error) {
      console.error("Get event by ID error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async joinEvent(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")
      const attendeeRepository = AppDataSource.getRepository("EventAttendee")

      // Check if event exists
      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
        relations: ["creator", "attendees"],
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      // Check if user is already attending
      const existingAttendee = await attendeeRepository.findOne({
        where: { user: { id: userId }, event: { id: Number.parseInt(id) } },
      })

      if (existingAttendee) {
        return res.status(400).json({
          success: false,
          message: "You are already attending this event",
        })
      }

      // Check if event is full
      if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
        return res.status(400).json({
          success: false,
          message: "Event is full",
        })
      }

      // Create attendee record
      const newAttendee = attendeeRepository.create({
        user: { id: userId },
        event: { id: Number.parseInt(id) },
        status: event.requiresApproval ? "pending" : "joined",
      })

      await attendeeRepository.save(newAttendee)

      // Update event attendee count if approved using atomic increment
      if (!event.requiresApproval) {
        await eventRepository.increment(
          { id: Number.parseInt(id) }, 
          "currentAttendees", 
          1
        )

        // Send notification to event creator
        if (event.creator.fcmToken) {
          await sendPushNotification(event.creator.fcmToken, {
            title: "New Attendee",
            body: `${req.user.firstName} joined your event: ${event.title}`,
            data: { eventId: id, type: "event_join" },
          })
        }
      }

      res.json({
        success: true,
        message: event.requiresApproval ? "Join request sent for approval" : "Successfully joined the event",
      })
    } catch (error) {
      console.error("Join event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async leaveEvent(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")
      const attendeeRepository = AppDataSource.getRepository("EventAttendee")

      // Find attendee record
      const attendee = await attendeeRepository.findOne({
        where: { user: { id: userId }, event: { id: Number.parseInt(id) } },
      })

      if (!attendee) {
        return res.status(400).json({
          success: false,
          message: "You are not attending this event",
        })
      }

      // Remove attendee record
      await attendeeRepository.remove(attendee)

      // Update event attendee count if was approved using atomic decrement
      if (attendee.status === "joined") {
        await eventRepository.decrement(
          { id: Number.parseInt(id) }, 
          "currentAttendees", 
          1
        )
      }

      res.json({
        success: true,
        message: "Successfully left the event",
      })
    } catch (error) {
      console.error("Leave event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async updateEvent(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")

      // Check if event exists and user is the creator
      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
        relations: ["creator"],
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      if (event.creator.id !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only update your own events",
        })
      }

      // Update event
      const updateData = { ...req.body }
      if (updateData.startDateTime) {
        updateData.startDateTime = new Date(updateData.startDateTime)
      }
      if (updateData.endDateTime) {
        updateData.endDateTime = new Date(updateData.endDateTime)
      }

      await eventRepository.update(Number.parseInt(id), updateData)

      const updatedEvent = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
        relations: ["creator", "attendees"],
      })

      res.json({
        success: true,
        message: "Event updated successfully",
        data: { event: updatedEvent },
      })
    } catch (error) {
      console.error("Update event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async deleteEvent(req, res) {
    try {
      const { id } = req.params
      const userId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")

      // Check if event exists and user is the creator or admin
      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
        relations: ["creator"],
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      if (event.creator.id !== userId && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "You can only delete your own events",
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

  async likeEvent(req, res) {
    try {
      const { id } = req.params
      const eventRepository = AppDataSource.getRepository("Event")

      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(id) },
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      await eventRepository.update(Number.parseInt(id), {
        likes: event.likes + 1,
      })

      res.json({
        success: true,
        message: "Event liked successfully",
      })
    } catch (error) {
      console.error("Like event error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }
}

module.exports = new EventController()
