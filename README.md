# Local Events App Backend

A comprehensive Express.js backend API for a local events mobile application built with TypeORM and MySQL.

## Features

- **User Management**: Registration, authentication, profiles, and role-based access
- **Event Management**: Create, update, delete, and discover local events
- **Real-time Messaging**: Socket.IO powered chat for event attendees
- **Reviews & Ratings**: Rate events and hosts after completion
- **Push Notifications**: Firebase Cloud Messaging integration
- **Admin Dashboard**: Administrative controls and analytics
- **File Uploads**: Support for profile pictures and event images
- **Email Notifications**: Welcome emails and event reminders

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with TypeORM
- **Authentication**: JWT tokens, Google OAuth
- **Real-time**: Socket.IO
- **Notifications**: Firebase Admin SDK
- **Email**: Nodemailer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd local-events-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables with your configuration

4. **Database Setup**
   \`\`\`bash
   # Run migrations
   npm run migrate
   
   # Seed the database with sample data
   npm run seed
   \`\`\`

5. **Start the server**
   \`\`\`bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

## API Endpoints

   ### Authentication
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/login` - User login
   - `POST /api/auth/google` - Google OAuth authentication
   - `GET /api/auth/profile` - Get user profile
   - `PUT /api/auth/profile` - Update user profile
   - `PUT /api/auth/fcm-token` - Update FCM token

   ### Events
   - `GET /api/events` - Get events with filtering
   - `GET /api/events/:id` - Get event by ID
   - `POST /api/events` - Create new event
   - `PUT /api/events/:id` - Update event
   - `DELETE /api/events/:id` - Delete event
   - `POST /api/events/:id/join` - Join event
   - `DELETE /api/events/:id/leave` - Leave event
   - `POST /api/events/:id/like` - Like event

   ### Messages
   - `POST /api/messages/events/:eventId` - Send message
   - `GET /api/messages/events/:eventId` - Get event messages
   - `PUT /api/messages/:messageId` - Edit message
   - `DELETE /api/messages/:messageId` - Delete message

   ### Reviews
   - `POST /api/reviews/events/:eventId` - Create review
   - `GET /api/reviews/events/:eventId` - Get event reviews
   - `GET /api/reviews/users/:userId` - Get user reviews

   ### Admin
   - `GET /api/admin/dashboard/stats` - Dashboard statistics
   - `GET /api/admin/users` - Get users with filtering
   - `GET /api/admin/events` - Get events with filtering
   - `PUT /api/admin/users/:userId/status` - Update user status
   - `DELETE /api/admin/events/:eventId` - Delete event

## Database Schema

### Users
- User authentication and profile information
- Role-based access control (user, moderator, admin)
- Rating system for hosts
- FCM token storage for push notifications

### Events
- Event details with location coordinates
- Status tracking (upcoming, ongoing, completed, cancelled)
- Attendee management with approval system
- Tag-based categorization

### Event Attendees
- Many-to-many relationship between users and events
- Status tracking (pending, approved, rejected, joined)

### Messages
- Real-time chat messages for event attendees
- Support for text and image messages
- Edit and delete functionality

### Reviews
- Event and host rating system
- Comment support
- Average rating calculations

### Notifications
- Push notification history
- Multiple notification types
- Read/unread status tracking

## Real-time Features

The application uses Socket.IO for real-time functionality:

- **Live Chat**: Real-time messaging in event rooms
- **Typing Indicators**: Show when users are typing
- **Event Updates**: Live updates for event changes
- **Notifications**: Real-time notification delivery

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured for frontend domain
- **Helmet Security**: Security headers and protection

## Push Notifications

Firebase Cloud Messaging integration for:
- New event attendees
- Chat messages
- Event updates and reminders
- System notifications

## Email Service

Automated email notifications for:
- Welcome emails for new users
- Event reminders
- Important updates

## Development

### Scripts
- `npm run dev` - Start development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data
- `npm start` - Start production server

### Project Structure
\`\`\`
src/
├── config/          # Database and configuration
├── controllers/     # Route controllers
├── entities/        # TypeORM entities
├── middleware/      # Custom middleware
├── routes/          # API routes
├── services/        # Business logic services
├── scripts/         # Database scripts
└── server.js        # Main server file
\`\`\`

## Environment Variables

Required environment variables:
- Database configuration (MySQL)
- JWT secret and expiration
- Google OAuth credentials
- Firebase service account
- Email service configuration
- Server and CORS settings

## Admin Access

Default admin credentials after seeding:
- Email: `admin@localevents.com`
- Password: `admin123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
