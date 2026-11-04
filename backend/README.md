# OSTA-Elearning Backend

This directory contains the Node.js and Express API for OSTA-Elearning.

## Development setup

From this directory, install dependencies and start the API:

```bash
npm install
npm run dev
```

The API uses port `5000` by default. Set `PORT` when the hosting provider supplies a port.

## Environment variables

Create a local `.env` file in this directory. Do not commit real credentials.

### Database (current MySQL/MariaDB configuration)

```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-local-db-password
DB_NAME=osta_elearning_platform
```

### Authentication and frontend URLs

```env
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

### Google and GitHub OAuth

Configure these only when the corresponding OAuth login providers are enabled:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:5000/api/auth/github/callback
```

### Gmail SMTP

For email verification and password-reset emails, configure a Gmail App Password (not the normal account password). Enable 2-Step Verification before creating an App Password.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM="OSTA E-Learning <your-gmail@gmail.com>"
```

## Database initialization

The current database setup uses MySQL/MariaDB and the schema files in `src/config`.

The following feature schema adds tables and columns used by email verification, password reset, bookmarks, private student/instructor questions, and event status:

```text
src/config/featureSchema.sql
```

The instructor application workflow schema is:

```text
src/config/instructorApplicationSchema.sql
```

Back up the database before applying schema changes. The current startup scripts also run database initialization and migrations; inspect them before running against any database containing important data.

## Production notes

- Configure secrets and environment variables in the hosting provider; never commit `.env`.
- Set `FRONTEND_URL`, `BACKEND_URL`, OAuth callback URLs, and SMTP settings to their production values.
- The API health endpoint is `GET /`.
- Uploaded files currently use local backend storage. Production hosting must provide persistent file storage or an external object-storage service before relying on uploads.
- The project is planned for PostgreSQL migration; the database setup and SQL schema are still MySQL/MariaDB-specific until that migration is completed.
