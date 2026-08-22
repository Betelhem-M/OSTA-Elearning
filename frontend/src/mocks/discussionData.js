export const discussionTopics = [
  {
    id: 1,
    title: 'How do I debug a Python IndexError?',
    author: 'Hana Bekele',
    category: 'Python',
    replies: 4,
    createdAgo: '2 hours ago',
    body: "I keep getting an IndexError when looping through a list. What's the usual cause?",
  },
  {
    id: 2,
    title: 'Best resources for learning data structures?',
    author: 'Dawit Alemu',
    category: 'General',
    replies: 7,
    createdAgo: '5 hours ago',
    body: 'Looking for beginner-friendly resources on stacks, queues, and trees.',
  },
  {
    id: 3,
    title: 'Anyone else struggling with the Data Structures assignment?',
    author: 'Mulugeta Girma',
    category: 'Assignments',
    replies: 12,
    createdAgo: '1 day ago',
    body: 'The contact book assignment is tricky — happy to pair up and compare notes.',
  },
]

export const discussionCategories = ['All', 'Python', 'General', 'Assignments']

export const initialReplies = {
  1: [
    { id: 1, author: 'Dawit Alemu', text: "It usually means you're accessing an index that doesn't exist — check your loop bounds." },
    { id: 2, author: 'Prof. Tigist Haile', text: 'Also double-check off-by-one errors when using range(len(list)).' },
  ],
  2: [{ id: 1, author: 'Aster Kebede', text: 'The "Data Structures & Algorithms" course on this platform covers all the basics well.' }],
  3: [],
}