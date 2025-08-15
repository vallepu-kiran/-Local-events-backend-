const AppDataSource = require("../config/database")

async function runMigrations() {
  try {
    console.log("Initializing database connection...")
    await AppDataSource.initialize()

    console.log("Running migrations...")
    await AppDataSource.synchronize()

    console.log("Migrations completed successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

runMigrations()
