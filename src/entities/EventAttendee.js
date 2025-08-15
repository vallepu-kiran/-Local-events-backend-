const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "EventAttendee",
  tableName: "event_attendees",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    status: {
      type: "enum",
      enum: ["pending", "approved", "rejected", "joined"],
      default: "joined",
    },
    joinedAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "userId" },
    },
    event: {
      type: "many-to-one",
      target: "Event",
      joinColumn: { name: "eventId" },
    },
  },
  indices: [
    {
      name: "IDX_USER_EVENT",
      columns: ["userId", "eventId"],
      unique: true,
    },
  ],
});
