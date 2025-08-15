const { DataSource } = require("typeorm")
require("dotenv").config()

// Import all entities
const User = require("../entities/User")
const Event = require("../entities/Event")
const EventAttendee = require("../entities/EventAttendee")
const Message = require("../entities/Message")
const Review = require("../entities/Review")
const Notification = require("../entities/Notification")

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Event, EventAttendee, Message, Review, Notification],
  migrations: ["src/migrations/*.js"],
  subscribers: ["src/subscribers/*.js"],
})

module.exports = AppDataSource
