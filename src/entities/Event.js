const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Event",
  tableName: "events",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    title: {
      type: "varchar",
      length: 255,
    },
    description: {
      type: "text",
    },
    location: {
      type: "varchar",
      length: 500,
    },
    latitude: {
      type: "decimal",
      precision: 10,
      scale: 8,
      nullable: true,
    },
    longitude: {
      type: "decimal",
      precision: 11,
      scale: 8,
      nullable: true,
    },
    startDateTime: {
      type: "timestamp",
    },
    endDateTime: {
      type: "timestamp",
    },
    maxAttendees: {
      type: "int",
      nullable: true,
    },
    currentAttendees: {
      type: "int",
      default: 0,
    },
    tags: {
      type: "json",
      nullable: true,
    },
    images: {
      type: "json",
      nullable: true,
    },
    status: {
      type: "enum",
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPrivate: {
      type: "boolean",
      default: false,
    },
    requiresApproval: {
      type: "boolean",
      default: false,
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
    likes: {
      type: "int",
      default: 0,
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
    creator: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "creatorId" },
    },
    attendees: {
      type: "one-to-many",
      target: "EventAttendee",
      inverseSide: "event",
    },
    messages: {
      type: "one-to-many",
      target: "Message",
      inverseSide: "event",
    },
    reviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "event",
    },
  },
})
