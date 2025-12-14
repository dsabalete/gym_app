# Gym Workout Tracker

A modern web application for tracking gym workouts, built with Nuxt 4, Vue 3, TailwindCSS, and AWS Aurora Serverless.

## Features

- 📊 **Dashboard**: Overview of your workout statistics
- 🏋️ **Workout Logging**: Track exercises, sets, reps, and weight
- 📈 **Progress Tracking**: Monitor your fitness journey over time
- 📱 **Mobile Responsive**: Works great on all devices
- 🔒 **Secure**: Built with AWS security best practices
- 🚀 **Serverless**: Deployed on AWS Lambda for scalability

## Tech Stack

- **Frontend**: Nuxt 4, Vue 3, TailwindCSS
- **Backend**: Nuxt server routes, AWS RDS Data API
- **Database**: AWS Aurora Serverless v2 (MySQL, via RDS Data API)
- **Deployment**: AWS Lambda via Serverless Framework
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+
- AWS Account with Aurora Serverless v2 cluster
- AWS CLI configured with appropriate permissions

### Local Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your AWS credentials and RDS configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Initialize database (first time only):**
   ```bash
   curl -X POST http://localhost:3000/api/database/init
   ```

### Environment Variables

Create a `.env` file with:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# RDS Configuration
RDS_CLUSTER_ARN=arn:aws:rds:us-east-1:123456789012:cluster:your-cluster
RDS_SECRET_ARN=arn:aws:secretsmanager:us-east-1:123456789012:secret:your-secret
RDS_DATABASE_NAME=gym_tracker
```

## Database Schema

The application uses AWS Aurora Serverless with the following schema:

### Tables

- **users**: User accounts
- **workouts**: Workout sessions with date and user reference
- **exercises**: Individual exercises within workouts
- **exercise_sets**: Sets with reps and weight for each exercise

### Key Features

- **Foreign Key Constraints**: Ensures data integrity
- **Cascading Deletes**: Automatically removes related data
- **Indexes**: Optimized for common queries
- **UUID Primary Keys**: Secure and scalable

### Entity Relationship Diagram

```mermaid
erDiagram
USERS ||--o{ WORKOUTS : has
WORKOUTS ||--o{ EXERCISES : contains
EXERCISES ||--o{ EXERCISE_SETS : includes

USERS {
  VARCHAR id PK
  VARCHAR email UNIQUE
  VARCHAR name
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

WORKOUTS {
  VARCHAR id PK
  VARCHAR user_id FK -> USERS.id
  DATE date
  TIMESTAMP created_at
  TIMESTAMP updated_at
}

EXERCISES {
  VARCHAR id PK
  VARCHAR workout_id FK -> WORKOUTS.id
  VARCHAR name
  TIMESTAMP created_at
}

EXERCISE_SETS {
  VARCHAR id PK
  VARCHAR exercise_id FK -> EXERCISES.id
  INT set_number
  INT reps
  DECIMAL(10,2) weight
  TIMESTAMP created_at
}
```

## API Endpoints

### Workouts
- `GET /api/workouts?userId=user123` - Get user's workouts
- `GET /api/workouts/:id?userId=user123` - Get a workout by ID
- `POST /api/workouts` - Create new workout (UUIDs generated in-app)
- `DELETE /api/workouts/:id?userId=user123` - Delete workout
  - Accepts a `workout.id`, `exercise.id`, or `exercise_sets.id`
  - Resolves to the owning workout and deletes cascade-safe (FK constraints)

### Database
- `POST /api/database/init` - Initialize database schema
- `GET /api/health/db` - DB connectivity health check (runs `SELECT 1`)

## Deployment

### AWS Setup

1. **Create Aurora Serverless v2 cluster:**
   - Use PostgreSQL engine
   - Enable Data API
   - Create database credentials in AWS Secrets Manager

2. **Set up IAM permissions:**
   - Create IAM user with RDS Data API access
   - Grant Secrets Manager access for database credentials

3. **Configure GitHub Secrets:**
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `RDS_CLUSTER_ARN`
   - `RDS_SECRET_ARN`
   - `RDS_DATABASE_NAME`

### Deploy

Push to the `main` branch to trigger automatic deployment via GitHub Actions:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### Manual Deployment

```bash
# Install Serverless Framework
npm install -g serverless

# Deploy
serverless deploy --stage prod

# Initialize database
curl -X POST https://your-api-url/api/database/init
```

## Project Structure

```
├── server/                 # Backend API
│   ├── api/               # API routes
│   │   ├── workouts/      # Workout endpoints
│   │   └── database/      # Database initialization
│   └── utils/             # Server utilities
│       └── aws-rds.ts     # AWS RDS Data API client
├── pages/                 # Frontend pages
│   ├── index.vue          # Dashboard
│   └── workouts/          # Workout pages
├── assets/                # Static assets
├── components/            # Reusable Vue components
└── serverless.yml         # AWS deployment configuration
```

## Development

### Adding New Features

1. **Database changes**: Update the schema in `server/api/database/init.post.ts`
2. **API endpoints**: Create new files in `server/api/`
3. **Frontend pages**: Add Vue components in `pages/`
4. **Styling**: Use TailwindCSS classes following the existing design system

### Testing

```bash
# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Queries

The application uses AWS RDS Data API with parameterized queries for security:

```typescript
const result = await client.execute(
  'SELECT * FROM workouts WHERE user_id = :userId',
  [userId]
)
```

### Transactions

- Uses RDS Data API transaction commands instead of raw `BEGIN/COMMIT` SQL:
  - `beginTransaction()`, `commitTransaction()`, `rollbackTransaction()`
- Insert IDs are generated in-app using `crypto.randomUUID()` for MySQL compatibility (no `RETURNING`).

### Development Auth

- For local development, a mock `userId = 'user123'` is used across pages. Replace with real auth in production.

### UI Details

- Custom favicon: hexagonal dumbbell inclined ~30°, registered via `public/favicon.svg` and `nuxt.config.ts`.
## Security

- **SQL Injection Protection**: All queries use parameterized statements
- **Input Validation**: Server-side validation for all inputs
- **CORS**: Configured for secure cross-origin requests
- **AWS IAM**: Least privilege access to AWS resources

## Performance

- **Serverless Architecture**: Auto-scaling with AWS Lambda
- **Database Indexes**: Optimized for common queries
- **CDN Ready**: Static assets can be served via CloudFront
- **Connection Pooling**: AWS RDS Proxy for database connections

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify RDS cluster is running
   - Check AWS credentials and permissions
   - Ensure Data API is enabled

2. **Deployment Failures**
   - Check GitHub Actions logs
   - Verify AWS credentials in GitHub secrets
   - Ensure sufficient AWS service limits

3. **CORS Issues**
   - Check API Gateway CORS configuration
   - Verify client-side API base URL

### Logs

- **Local**: Check browser console and terminal output
- **AWS**: Use CloudWatch Logs for Lambda function logs
- **Database**: Enable Aurora slow query logs if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
