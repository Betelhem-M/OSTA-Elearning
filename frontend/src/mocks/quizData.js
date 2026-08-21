export const quiz = {
    id: 'python-basics',
    title: 'Python Basics',
    courseId: 'python-programming-beginners',
    totalQuestions: 10,
    timeLimitMinutes: 15,
    passPercent: 70,
}

// Only Question 4 ever had real content in the source design.
export const question4 = {
    number: 4,
    difficulty: 'Medium',
    points: 10,
    prompt: 'What will be the output of the following Python code?',
    code: `x = 10
y = 3
print(x // y)
print(x % y)`,
    options: [
        { id: 'A', text: '3 and 1' },
        { id: 'B', text: '3 and 10' },
        { id: 'C', text: '3 and 2' },
        { id: 'D', text: '4 and 1' },
    ],
}

export const reviewSummary = [
    { question: 'Q1', prompt: 'x = 5; print(type(x))', result: 'correct', detail: 'Your answer: <class int> ✓ Correct' },
    { question: 'Q2', prompt: 'List vs Tuple', result: 'correct', detail: 'Correct' },
    { question: 'Q3', prompt: 'String slicing', result: 'incorrect', detail: 'Your answer: Option B · Correct answer: Option C' },
]