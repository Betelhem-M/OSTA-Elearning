import { useState, useMemo } from 'react'
import { discussionTopics, discussionCategories, initialReplies } from '@mocks/discussionData'
import TopicCard from '@components/discussion/TopicCard'
import ReplyThread from '@components/discussion/ReplyThread'

let nextReplyId = 100

export default function Discussion() {
  const [category, setCategory] = useState('All')
  const [activeTopicId, setActiveTopicId] = useState(discussionTopics[0].id)
  const [repliesByTopic, setRepliesByTopic] = useState(initialReplies)

  const filteredTopics = useMemo(() => {
    if (category === 'All') return discussionTopics
    return discussionTopics.filter((t) => t.category === category)
  }, [category])

  const activeTopic = discussionTopics.find((t) => t.id === activeTopicId)

  function handleAddReply(topicId, text) {
    setRepliesByTopic((prev) => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), { id: nextReplyId++, author: 'You', text }],
    }))
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-8 lg:px-10">
      <h1 className="text-2xl font-extrabold text-ink">Community Discussion</h1>
      <p className="mt-1 text-sm text-slate-500">Ask questions, share ideas, and help fellow learners.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {discussionCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              category === cat ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-primary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          {filteredTopics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isActive={topic.id === activeTopicId}
              onClick={() => setActiveTopicId(topic.id)}
            />
          ))}
        </div>

        {activeTopic && (
          <ReplyThread
            topic={activeTopic}
            replies={repliesByTopic[activeTopic.id] || []}
            onAddReply={handleAddReply}
          />
        )}
      </div>
    </main>
  )
}