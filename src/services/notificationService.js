const admin = require("firebase-admin")

class NotificationService {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          clientId: process.env.FIREBASE_CLIENT_ID,
          clientCertUrl: process.env.FIREBASE_CLIENT_CERT_URL,
        }),
      })
    }
  }

  async sendPushNotification(fcmToken, payload) {
    try {
      const message = {
        token: fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            sound: "default",
            priority: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      }

      const response = await admin.messaging().send(message)
      console.log("Push notification sent successfully:", response)
      return response
    } catch (error) {
      console.error("Push notification failed:", error)
      throw error
    }
  }

  async sendMulticastNotification(fcmTokens, payload) {
    try {
      const message = {
        tokens: fcmTokens,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data || {},
        android: {
          notification: {
            sound: "default",
            priority: "high",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      }

      const response = await admin.messaging().sendMulticast(message)
      console.log("Multicast notification sent:", response)
      return response
    } catch (error) {
      console.error("Multicast notification failed:", error)
      throw error
    }
  }

  async saveNotificationToDatabase(userId, notification) {
    try {
      const AppDataSource = require("../config/database")
      const notificationRepository = AppDataSource.getRepository("Notification")

      const newNotification = notificationRepository.create({
        user: { id: userId },
        title: notification.title,
        message: notification.body,
        type: notification.type || "system",
        data: notification.data,
      })

      await notificationRepository.save(newNotification)
    } catch (error) {
      console.error("Save notification to database failed:", error)
    }
  }
}

module.exports = new NotificationService()
