const AppDataSource = require("../config/database")

class ReviewController {
  async createReview(req, res) {
    try {
      const { eventId } = req.params
      const { rating, comment, reviewType = "event", revieweeId } = req.body
      const reviewerId = req.user.id

      const eventRepository = AppDataSource.getRepository("Event")
      const reviewRepository = AppDataSource.getRepository("Review")
      const attendeeRepository = AppDataSource.getRepository("EventAttendee")
      const userRepository = AppDataSource.getRepository("User")

      // Check if event exists and is completed
      const event = await eventRepository.findOne({
        where: { id: Number.parseInt(eventId) },
        relations: ["creator"],
      })

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        })
      }

      if (event.status !== "completed") {
        return res.status(400).json({
          success: false,
          message: "You can only review completed events",
        })
      }

      // Check if user attended the event
      const attendance = await attendeeRepository.findOne({
        where: {
          user: { id: reviewerId },
          event: { id: Number.parseInt(eventId) },
          status: "joined",
        },
      })

      if (!attendance) {
        return res.status(403).json({
          success: false,
          message: "You must have attended the event to leave a review",
        })
      }

      // Check if review already exists
      const existingReview = await reviewRepository.findOne({
        where: {
          reviewer: { id: reviewerId },
          event: { id: Number.parseInt(eventId) },
        },
      })

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this event",
        })
      }

      // Create review
      const reviewData = {
        rating,
        comment,
        reviewType,
        reviewer: { id: reviewerId },
        event: { id: Number.parseInt(eventId) },
      }

      if (reviewType === "host" && revieweeId) {
        reviewData.reviewee = { id: revieweeId }
      }

      const newReview = reviewRepository.create(reviewData)
      const savedReview = await reviewRepository.save(newReview)

      // Update event rating
      await this.updateEventRating(Number.parseInt(eventId))

      // Update host rating if it's a host review
      if (reviewType === "host" && revieweeId) {
        await this.updateHostRating(revieweeId)
      }

      // Load review with relations
      const reviewWithRelations = await reviewRepository.findOne({
        where: { id: savedReview.id },
        relations: ["reviewer", "reviewee", "event"],
      })

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: { review: reviewWithRelations },
      })
    } catch (error) {
      console.error("Create review error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getEventReviews(req, res) {
    try {
      const { eventId } = req.params
      const { page = 1, limit = 10 } = req.query

      const reviewRepository = AppDataSource.getRepository("Review")

      const offset = (page - 1) * limit
      const [reviews, total] = await reviewRepository.findAndCount({
        where: { event: { id: Number.parseInt(eventId) } },
        relations: ["reviewer", "reviewee"],
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      })

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get event reviews error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async getUserReviews(req, res) {
    try {
      const { userId } = req.params
      const { page = 1, limit = 10, type = "received" } = req.query

      const reviewRepository = AppDataSource.getRepository("Review")

      const offset = (page - 1) * limit
      const whereCondition =
        type === "received"
          ? { reviewee: { id: Number.parseInt(userId) } }
          : { reviewer: { id: Number.parseInt(userId) } }

      const [reviews, total] = await reviewRepository.findAndCount({
        where: whereCondition,
        relations: ["reviewer", "reviewee", "event"],
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
      })

      res.json({
        success: true,
        data: {
          reviews,
          pagination: {
            page: Number.parseInt(page),
            limit: Number.parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      })
    } catch (error) {
      console.error("Get user reviews error:", error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
      })
    }
  }

  async updateEventRating(eventId) {
    try {
      const reviewRepository = AppDataSource.getRepository("Review")
      const eventRepository = AppDataSource.getRepository("Event")

      const reviews = await reviewRepository.find({
        where: { event: { id: eventId }, reviewType: "event" },
      })

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length

        await eventRepository.update(eventId, {
          averageRating: Number.parseFloat(averageRating.toFixed(2)),
          totalRatings: reviews.length,
        })
      }
    } catch (error) {
      console.error("Update event rating error:", error)
    }
  }

  async updateHostRating(userId) {
    try {
      const reviewRepository = AppDataSource.getRepository("Review")
      const userRepository = AppDataSource.getRepository("User")

      const reviews = await reviewRepository.find({
        where: { reviewee: { id: userId }, reviewType: "host" },
      })

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviews.length

        await userRepository.update(userId, {
          averageRating: Number.parseFloat(averageRating.toFixed(2)),
          totalRatings: reviews.length,
        })
      }
    } catch (error) {
      console.error("Update host rating error:", error)
    }
  }
}

module.exports = new ReviewController()
