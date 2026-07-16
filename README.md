# Aya Learn - Quran Memorization Platform

A full-stack web application for managing Quran memorization (Hifz) with student-teacher sessions, progress tracking, scoring, and class management.

## Features

### Roles
- **Admin** - Manage users, approve teachers, oversee classes and reports
- **Teacher** - Create classes, manage sessions, score students, track progress
- **Student** - Book sessions, track memorization progress, view scores

### Core Features
- **Session Booking and Management** - Students book sessions with teachers; teachers accept/reject, add meet links, and mark sessions complete
- **Session Scoring** - When completing a session, teachers score the student on Tajweed, Memorization, and Fluency via a popup form
- **Juz Progress Tracker** - 30 Juz grid with clickable tiles cycling through not_started, in_progress, memorized
- **Student Scores** - Score history with tajweed, memorization, fluency, and overall percentage
- **Class Management** - Teachers create classes and enroll students
- **Portion Assignments** - Teachers assign memorization portions to students
- **Teacher Marketplace** - Students browse teachers by specialization, price, and availability
- **Reviews and Ratings** - Students leave 1-5 star reviews on completed sessions
- **Notifications** - Real-time in-app notifications for session requests, acceptances, completions, etc.
- **Availability Slots** - Teachers set weekly availability for sessions
- **Google OAuth** - Sign in with Google
- **Multi-language** - English and Arabic (RTL) support
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 5 |
| Database | SQLite (better-sqlite3) |
| Auth | JWT, Passport.js, Google OAuth |
| Frontend | Vanilla HTML, CSS, JavaScript |
| i18n | Custom i18n system |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/eyad147/Aya-learn.git
cd Aya-learn
npm install
cp .env.example .env
npm start
```

Visit `http://localhost:3000`

### Environment Variables

| Variable | Description |
|----------|------------|
| PORT | Server port (default: 3000) |
| JWT_SECRET | Secret key for JWT tokens |
| DB_PATH | SQLite database file path |
| GOOGLE_CLIENT_ID | Google OAuth client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth client secret |

## Project Structure

```
aya-learn/
  server.js                 - Express entry point
  seed.js                   - Database seed script
  index.html                - Landing page
  login.html                - Login page
  signup.html               - Registration page
  sessions.html             - Session management page
  teachers.html             - Browse teachers page
  admin-dashboard.html      - Admin dashboard
  teacher-dashboard.html    - Teacher dashboard
  student-dashboard.html    - Student dashboard
  .env                      - Environment variables
  .gitignore
  package.json
  css/
    styles.css              - Global styles
  js/
    app.js                  - Main application logic
    i18n.js                 - Internationalization
    notifications.js        - Notification polling
  server/
    db.js                   - Database initialization and schema
    middleware/
      auth.js               - JWT auth middleware
    routes/
      auth.js               - Authentication routes
      auth-google.js        - Google OAuth routes
      users.js              - User management routes
      classes.js            - Class management routes
      scores.js             - Scoring routes
      progress.js           - Juz progress and portion routes
      teachers.js           - Teacher profile routes
      sessions.js           - Session booking routes
      notifications.js      - Notification routes
      availability.js       - Teacher availability routes
```

## Database Schema

The application uses SQLite with the following tables:

- **users** - User accounts (admin, teacher, student)
- **classes** - Classes created by teachers
- **class_students** - Student enrollment in classes
- **scores** - Student assessment scores linked to sessions
- **sessions** - Session bookings with lifecycle tracking
- **juz_progress** - 30 Juz memorization progress per student
- **portions** - Assigned memorization portions
- **teacher_profiles** - Teacher public profiles with pricing
- **teacher_availability** - Weekly availability slots
- **reviews** - Student reviews on completed sessions
- **notifications** - In-app notification records

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `GET /api/auth/pending-teachers` - List pending teachers (admin)
- `PUT /api/auth/approve/:id` - Approve teacher (admin)
- `PUT /api/auth/reject/:id` - Reject teacher (admin)

### Users
- `GET /api/users` - List users (with role filter)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Sessions
- `GET /api/sessions` - List sessions (role-based)
- `POST /api/sessions` - Create session (student)
- `PUT /api/sessions/:id/accept` - Accept session (teacher)
- `PUT /api/sessions/:id/reject` - Reject session (teacher)
- `PUT /api/sessions/:id/link` - Add meet link (teacher)
- `PUT /api/sessions/:id/complete` - Complete session with optional score (teacher)
- `POST /api/sessions/:id/cancel` - Cancel session
- `POST /api/sessions/:id/review` - Leave review (student)

### Scores
- `GET /api/scores` - List scores (role-based)
- `GET /api/scores/stats/:studentId` - Student score stats
- `POST /api/scores` - Create score
- `DELETE /api/scores/:id` - Delete score

### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class with students
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/enroll` - Enroll student

### Teachers
- `GET /api/teachers` - List teachers (with filters)
- `GET /api/teachers/:id` - Get teacher profile
- `GET /api/teachers/profile/me` - Get own profile
- `PUT /api/teachers/profile` - Update own profile

### Progress
- `GET /api/progress/:studentId` - Get Juz progress
- `PUT /api/progress/:studentId/:juz` - Update Juz status
- `GET /api/progress/portions` - List portions
- `POST /api/progress/portions` - Create portion
- `PUT /api/progress/portions/:id` - Update portion
- `DELETE /api/progress/portions/:id` - Delete portion
- `GET /api/progress/stats/overview` - Dashboard stats

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Availability
- `GET /api/availability/:teacherId` - Get teacher availability
- `GET /api/availability/my` - Get own availability
- `POST /api/availability` - Add availability slot
- `DELETE /api/availability/:id` - Delete slot

## License

ISC
