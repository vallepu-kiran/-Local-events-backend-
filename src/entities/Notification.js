const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Notification",
  tableName: "notifications",
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
    message: {
      type: "text",
    },
    type: {
      type: "enum",
      enum: ["event_join", "new_message", "event_update", "review", "system"],
      default: "system",
    },
    isRead: {
      type: "boolean",
      default: false,
    },
    data: {
      type: "json",
      nullable: true,
    },
    createdAt: {
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
  },
})
