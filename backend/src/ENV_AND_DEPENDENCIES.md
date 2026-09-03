# OSTA backend feature setup

## Required package for Gmail SMTP

From the backend project root:

```bash
npm install nodemailer
```

## Environment variables

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-google-app-password
SMTP_FROM="OSTA E-Learning <your-gmail@gmail.com>"
```

Never use the normal Gmail account password. Use a Google App Password with 2-Step Verification enabled.

## Database

Run `src/config/featureSchema.sql` against the existing OSTA database before using:

- email verification
- forgot/reset password
- bookmarks
- private student/instructor questions
- event status support

Back up the database before applying schema changes.
