const express = require('express');
const c = require('../controllers/authController');
const oauth = require('../controllers/oauthController');
const router = express.Router();
const rateLimit = require('../middleware/rateLimit');
const instructorUpload = require('../middleware/instructorRegistrationUploadMiddleware');

const authBurst = rateLimit({ windowMs: 15 * 60 * 1000, max: 8 });
const recoveryLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.post('/register', authBurst, instructorUpload.single('cv'), c.register);
router.post('/login', authBurst, c.login);
router.post('/verify-email', recoveryLimit, c.verifyEmail);
router.post('/resend-verification', recoveryLimit, c.resendVerification);
router.post('/forgot-password', recoveryLimit, c.forgotPassword || c.requestReset);
router.post('/forgot-password/verify', recoveryLimit, c.verifyResetCode);
router.post('/forgot-password/reset', recoveryLimit, c.resetPassword);

// OAuth starts and callbacks. Client secrets stay on the Railway backend.
router.get('/google', oauth.startGoogle);
router.get('/google/callback', oauth.googleCallback);
router.get('/github', oauth.startGithub);
router.get('/github/callback', oauth.githubCallback);

module.exports = router;
