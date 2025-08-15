const bcrypt = require("bcryptjs")
const AppDataSource = require("../config/database")

async function seedDatabase() {
  try {
    console.log("Initializing database connection...")
    await AppDataSource.initialize()

    const userRepository = AppDataSource.getRepository("User")
    const eventRepository = AppDataSource.getRepository("Event")

    // Create admin user
    const adminPassword = await bcrypt.hash("admin123", 12)
    const adminUser = userRepository.create({
      email: "admin@localevents.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      isVerified: true,
    })
    const savedAdmin = await userRepository.save(adminUser)
    console.log("Admin user created")

    // Create sample users
    const users = []
    for (let i = 1; i <= 5; i++) {
      const password = await bcrypt.hash("password123", 12)
      const user = userRepository.create({
        email: `user${i}@example.com`,
        password,
        firstName: `User${i}`,
        lastName: "Test",
        bio: `This is user ${i}'s bio`,
        interests: ["technology", "sports", "music"],
        isVerified: true,
      })
      const savedUser = await userRepository.save(user)
      users.push(savedUser)
    }
    console.log("Sample users created")

    // Create sample events
    const events = [
      {
        title: "Tech Meetup 2024",
        description: "Join us for an exciting tech meetup where we discuss the latest trends in technology.",
        location: "Tech Hub, Downtown",
        latitude: 40.7128,
        longitude: -74.006,
        startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        maxAttendees: 50,
        tags: ["technology", "networking", "meetup"],
        creator: users[0],
      },
      {
        title: "Community Sports Day",
        description: "A fun day of sports activities for the whole community.",
        location: "Central Park",
        latitude: 40.7829,
        longitude: -73.9654,
        startDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDateTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours later
        maxAttendees: 100,
        tags: ["sports", "community", "outdoor"],
        creator: users[1],
      },
      {
        title: "Music Concert",
        description: "Live music performance by local artists.",
        location: "Music Hall",
        latitude: 40.7505,
        longitude: -73.9934,
        startDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        maxAttendees: 200,
        tags: ["music", "concert", "entertainment"],
        creator: users[2],
      },
    ]

    for (const eventData of events) {
      const event = eventRepository.create(eventData)
      await eventRepository.save(event)
    }
    console.log("Sample events created")

    console.log("Database seeded successfully!")
    console.log("Admin credentials: admin@localevents.com / admin123")
    process.exit(0)
  } catch (error) {
    console.error("Seeding failed:", error)
    process.exit(1)
  }
}

seedDatabase()
