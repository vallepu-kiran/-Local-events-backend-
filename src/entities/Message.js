const { EntitySchema } = require("typeorm")

module.exports = new EntitySchema({
  name: "Message",
  tableName: "messages",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    content: {
      type: "text",
    },
    messageType: {
      type: "enum",
      enum: ["text", "image", "system"],
      default: "text",
    },
    isEdited: {
      type: "boolean",
      default: false,
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
    sender: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "senderId" },
    },
    event: {
      type: "many-to-one",
      target: "Event",
      joinColumn: { name: "eventId" },
    },
  },
})
