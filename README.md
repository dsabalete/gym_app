# Gym Workout Tracker

A modern web application for tracking gym workouts, built with Nuxt 4, Vue 3, TailwindCSS, and Firebase Firestore.

## Features

- 📊 **Dashboard**: Overview of your workout statistics
- 🏋️ **Workout Logging**: Track exercises, sets, reps, and weight
- 📈 **Progress Tracking**: Monitor your fitness journey over time
- 📱 **Mobile Responsive**: Works great on all devices
- 🔒 **Secure**: Server-side validation and scoped data access
- 🚀 **Backend**: Firebase Firestore for scalable, managed storage

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TailwindCSS
- **Backend**: Nuxt server routes with Firebase Admin SDK
- **Database**: Firebase Firestore (document database with subcollections)
- **Deployment**: Node server (Nuxt Nitro)
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase project with a service account (Admin SDK)

### Local Development

1. **Clone and install dependencies:**

   ```bash
   bun install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your Firebase project/service account configuration
   ```

3. **Start development server:**

   ```bash
   bun run dev
   ```

4. **Seed sample data (optional):**

   ```bash
   curl -X POST http://localhost:3000/api/database/seed \
     -H 'Content-Type: application/json' \
     -d '{"userId":"user123","email":"user123@example.com","name":"Test User","date":"2025-01-01"}'
   ```

   > **Note**: To see seeded data while logged in, replace `user123` with your Firebase Authentication UID.

### Environment Variables

Create a `.env` file with:

```env
# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Firebase Client SDK (Client-side)
NUXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NUXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Public API base (optional)
NUXT_PUBLIC_API_BASE=/api
```

## Data Model

The application uses Firebase Firestore with hierarchical subcollections:

### Structure

```
users/{userId}
  id, email, name, createdAt?, updatedAt
  workouts/{workoutId}
    id, userId, date, createdAt, updatedAt
    exercises/{exerciseId}
      id, name, order, createdAt
      sets/{setId}
        id, setNumber, reps, weight, createdAt
```

### Key Features

- **Ownership Checks**: All mutations verify the workout owner via parent document
- **Nested Writes**: Transactions used for multi-document consistency
- **CollectionGroup Queries**: Resolve exercise/set IDs to parent workout
- **UUID Primary Keys**: IDs generated in-app via `crypto.randomUUID()`

## API Endpoints

### Workouts

- `GET /api/workouts?userId=user123` - Get user's workouts
- `GET /api/workouts/:id?userId=user123` - Get a workout by ID
- `POST /api/workouts` - Create new workout (UUIDs generated in-app)
- `DELETE /api/workouts/:id?userId=user123` - Delete workout
  - Accepts a `workout.id`, `exercise.id`, or `set.id`
  - Resolves to the owning workout via collectionGroup queries and batch-deletes nested docs

### Database

- `POST /api/database/seed` - Insert sample user/workout/exercises/sets
- `GET /api/health/db` - DB connectivity health check (writes/reads a health doc)

## Deployment

### Firebase Setup

1. **Create a Firebase project**
2. **Create a service account (Admin SDK)** and download JSON or note:
   - `project_id`, `client_email`, `private_key`
3. **Populate `.env`** with the values (ensure `FIREBASE_PRIVATE_KEY` line breaks are escaped as `\\n`)

### Deploy

Push to the `main` branch to trigger automatic deployment via GitHub Actions:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Manual Deployment

```bash
# Build for production
bun run build

# Preview production build locally
bun run preview
```

## Project Structure

```
├── server/                 # Backend API
│   ├── api/               # API routes
│   │   ├── workouts/      # Workout endpoints
│   │   └── database/      # Seed and health endpoints
│   └── utils/             # Server utilities
│       └── firestore.ts   # Firebase Admin Firestore client
├── pages/                 # Frontend pages
│   ├── index.vue          # Dashboard
│   └── workouts/          # Workout pages
├── assets/                # Static assets
├── components/            # Reusable Vue components
└── nuxt.config.ts         # Nuxt configuration (includes Firebase runtime config)
```

## Development

### Adding New Features

1. **Data model changes**: Update Firestore document structure in handlers
2. **API endpoints**: Create new files in `server/api/`
3. **Frontend pages**: Add Vue components in `pages/`
4. **Styling**: Use TailwindCSS classes following the existing design system

### Testing

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Database Operations

The application uses Firebase Firestore via Admin SDK:

```typescript
const db = getDb();
const workouts = await db.collection("users").doc(userId).collection("workouts").orderBy("date", "desc").get();
```

### Transactions

- Uses Firestore `runTransaction` for multi-document consistency
- IDs are generated in-app using `crypto.randomUUID()`

### Authentication

- The application uses Firebase Authentication (Google Sign-In).
- Ensure you have enabled the **Google** sign-in provider in your Firebase Console.
- Users are automatically created in the Firestore `users` collection upon first login.

### UI Details

- Custom favicon: hexagonal dumbbell inclined ~30°, registered via `public/favicon.svg` and `nuxt.config.ts`.

## Security

- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured for secure cross-origin requests
- **Service Account**: Use a dedicated service account with limited permissions

## Performance

- **Server Rendering**: Nuxt Nitro node server
- **Firestore Indexes**: Composite indexes may be required for advanced queries
- **Pagination**: Offset supported; prefer cursor-based (`startAfter`) for large lists

## Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**

   - Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`
   - Ensure private key has escaped newlines (`\\n`)
   - Check service account permissions

2. **Deployment Failures**

   - Check GitHub Actions logs
   - Verify environment variables are configured for the deployment target

3. **CORS Issues**
   - Check API Gateway CORS configuration
   - Verify client-side API base URL

### Logs

- **Local**: Check browser console and terminal output
- **Server**: Check Node server logs
- **Database**: Use Firebase console for Firestore diagnostics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
