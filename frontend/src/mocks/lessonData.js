export const currentLesson = {
    id: 'variables-and-data-types',
    courseId: 'python-programming-beginners',
    courseTitle: 'Python Programming for Beginners',
    title: 'Variables and Data Types',
    quizId: 'python-basics',
    durationSeconds: 25 * 60, // 25:00
    startSeconds: 8 * 60 + 45, // 08:45, matches the original mock's starting point
}

export const chapters = [
    {
        id: 1,
        title: 'Getting Started with Python',
        lessons: [
            { id: 1, title: 'Welcome & Course Setup', duration: '8 min', status: 'done' },
            { id: 2, title: 'Installing Python', duration: '12 min', status: 'done' },
            { id: 3, title: 'Variables and Data Types', duration: '15 min', status: 'playing' },
        ],
    },
    { id: 2, title: 'Control Flow & Functions', lessons: null },
    { id: 3, title: 'Data Structures', lessons: null },
    { id: 4, title: 'Object-Oriented Programming', lessons: null },
    { id: 5, title: 'Real-World Projects', lessons: null },
]

export const transcript = [
    { id: 1, timeSeconds: 8 * 60 + 30, text: "Let's talk about how Python stores information using variables." },
    { id: 2, timeSeconds: 8 * 60 + 42, text: 'A variable is just a name that points to a value in memory.' },
    { id: 3, timeSeconds: 8 * 60 + 55, text: "Python doesn't require you to declare a type — it infers it automatically." },
    { id: 4, timeSeconds: 9 * 60 + 8, text: 'Let\'s look at the four core types: int, float, str, and bool.' },
    { id: 5, timeSeconds: 9 * 60 + 22, text: 'You can always check a variable\'s type using the built-in type() function.' },
]