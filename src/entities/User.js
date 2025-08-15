const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: true, // For OAuth users
    },
    firstName: {
      type: "varchar",
      length: 100,
    },
    lastName: {
      type: "varchar",
      length: 100,
    },
    profilePicture: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    bio: {
      type: "text",
      nullable: true,
    },
    interests: {
      type: "json",
      nullable: true,
    },
    role: {
      type: "enum",
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    isVerified: {
      type: "boolean",
      default: false,
    },
    googleId: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    fcmToken: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
    averageRating: {
      type: "decimal",
      precision: 3,
      scale: 2,
      default: 0,
    },
    totalRatings: {
      type: "int",
      default: 0,
    },
    isActive: {
      type: "boolean",
      default: true,
    },
    lastLoginAt: {
      type: "timestamp",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    updatedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
      onUpdate: "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    createdEvents: {
      type: "one-to-many",
      target: "Event",
      inverseSide: "creator",
    },
    eventAttendees: {
      type: "one-to-many",
      target: "EventAttendee",
      inverseSide: "user",
    },
    sentMessages: {
      type: "one-to-many",
      target: "Message",
      inverseSide: "sender",
    },
    givenReviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "reviewer",
    },
    receivedReviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "reviewee",
    },
    notifications: {
      type: "one-to-many",
      target: "Notification",
      inverseSide: "user",
    },
  },
})
