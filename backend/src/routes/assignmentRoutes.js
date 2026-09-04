const express = require('express');
const auth = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const c = require('../controllers/assignmentController');

const router = express.Router();

router.use(auth);

router.post('/', roles('instructor', 'admin'), c.createAssignment);

router.get('/instructor', roles('instructor', 'admin'), c.getInstructorSubmissions);
router.get('/submissions', roles('instructor', 'admin'), c.getInstructorSubmissions);
router.put('/submissions/:id/grade', roles('instructor', 'admin'), c.gradeSubmission);

module.exports = router;