const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: true,
    },
    rating: {
      type: "int",
      width: 1,
    },
    comment: {
      type: "text",
      nullable: true,
    },
    reviewType: {
      type: "enum",
      enum: ["event", "host"],
      default: "event",
    },
    createdAt: {
      type: "timestamp",
      default: () => "CURRENT_TIMESTAMP",
    },
    reviewerId: {  // Define the reviewerId column explicitly
      type: "int",
      nullable: false,
    },
    revieweeId: {  // Define the revieweeId column explicitly
      type: "int",
      nullable: true,  // Reviewee may not be required
    },
    eventId: {  // Define the eventId column explicitly
      type: "int",
      nullable: false,
    },
  },
  relations: {
    reviewer: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "reviewerId" },
    },
    reviewee: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "revieweeId" },
      nullable: true,
    },
    event: {
      type: "many-to-one",
      target: "Event",
      joinColumn: { name: "eventId" },
    },
  },
  indices: [
    {
      name: "IDX_REVIEWER_EVENT",
      columns: ["reviewerId", "eventId"],
      unique: true,
    },
  ],
});
