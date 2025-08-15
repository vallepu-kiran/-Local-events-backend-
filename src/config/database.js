const { DataSource } = require("typeorm")
require("dotenv").config()

// Import all entities
const User = require("../entities/User")
const Event = require("../entities/Event")
const EventAttendee = require("../entities/EventAttendee")
const Message = require("../entities/Message")
const Review = require("../entities/Review")
const Notification = require("../entities/Notification")

// Parse DATABASE_URL for production (Railway) or use individual env vars for development
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided (Railway/production), parse it
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    return {
      type: "mysql",
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }
  }
  
  // Development configuration using individual env vars
  return {
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }
}

const AppDataSource = new DataSource({
  ...getDatabaseConfig(),
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Event, EventAttendee, Message, Review, Notification],
  migrations: ["src/migrations/*.js"],
  subscribers: ["src/subscribers/*.js"],
})

module.exports = AppDataSource
