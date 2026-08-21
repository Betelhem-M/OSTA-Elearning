export const assignment = {
    id: 'data-structures-assignment',
    courseId: 'python-programming-beginners',
    courseTitle: 'Python Programming for Beginners',
    title: 'Data Structures Assignment: Building a Contact Book',
    dueDate: 'March 15, 2025',
    dueTime: '11:59 PM',
    points: 100,
    status: 'not_submitted', // 'not_submitted' | 'submitted' | 'graded'
    instructions: [
        'Build a command-line contact book application using Python dictionaries and lists.',
        'Your program must support adding, searching, updating, and deleting contacts.',
        'Include at least 3 unit tests demonstrating your core functions work correctly.',
    ],
    allowedFileTypes: '.py, .zip, .pdf',
    maxFileSizeMB: 10,
    rubric: [
        { criterion: 'Correctness', points: 40 },
        { criterion: 'Code Quality & Comments', points: 25 },
        { criterion: 'Testing', points: 20 },
        { criterion: 'Documentation', points: 15 },
    ],
}

// Populated only after a (simulated) grade comes back — mirrors the vanilla
// build's pattern of only ever having real content for one deterministic state.
export const gradedFeedback = {
    score: 88,
    maxScore: 100,
    gradedDate: 'March 18, 2025',
    instructorComment:
        'Solid implementation — your search function is efficient and well-tested. Consider adding input validation for edge cases like empty contact names next time.',
    rubricScores: [
        { criterion: 'Correctness', earned: 38, max: 40 },
        { criterion: 'Code Quality & Comments', earned: 22, max: 25 },
        { criterion: 'Testing', earned: 16, max: 20 },
        { criterion: 'Documentation', earned: 12, max: 15 },
    ],
}