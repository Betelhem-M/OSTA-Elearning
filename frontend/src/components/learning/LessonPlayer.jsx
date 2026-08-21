import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Bookmark, Share2, ChevronRight } from 'lucide-react'
import { useMockVideoPlayer, formatTime } from '@hooks/useMockVideoPlayer'
import VideoPlayer from '@components/learning/VideoPlayer'
import ChapterAccordion from '@components/learning/ChapterAccordion'
import NotesPanel from '@components/learning/NotesPanel'
import { currentLesson, chapters, transcript } from '@mocks/lessonData'
import { copyToClipboard } from '@utils/sharing'

const TABS = ['Overview', 'Notes', 'Transcript', 'Discussion', 'Resources']

export default function LessonPlayer() {
  const { lessonId } = useParams()
  const player = useMockVideoPlayer(currentLesson.durationSeconds, currentLesson.startSeconds)

  const [activeTab, setActiveTab] = useState('Notes')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copyStatus, setCopyStatus] = useState('idle')
  const [activeLessonId, setActiveLessonId] = useState(3) // "Variables and Data Types"

  async function handleShare() {
    const success = await copyToClipboard(window.location.href)
    setCopyStatus(success ? 'copied' : 'error')
    setTimeout(() => setCopyStatus('idle'), 1800)
  }

  function handleTranscriptClick(entry) {
    player.seekTo(entry.timeSeconds)
  }

  function handleNextLesson() {
    alert('Complete the previous lesson to unlock this one — there are no further lessons published in this build.')
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-8">
      <nav className="mb-4 flex items-center gap-2 text-xs text-slate-500">
        <Link to={`/courses/${currentLesson.courseId}`} className="hover:text-primary">
          {currentLesson.courseTitle}
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-ink">{currentLesson.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[280px_1.6fr_320px]">
        {/* Left: curriculum */}
        <aside className="order-2 lg:order-1">
          <ChapterAccordion
            chapters={chapters}
            activeLessonId={activeLessonId}
            onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
          />
        </aside>

        {/* Center: player + tabs */}
        <div className="order-1 space-y-4 lg:order-2">
          <VideoPlayer player={player} title={currentLesson.title} />

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
            <div>
              <h1 className="text-lg font-bold text-ink">{currentLesson.title}</h1>
              <p className="text-xs text-slate-400">{Math.round(player.progressPct)}% watched</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookmarked((v) => !v)}
                aria-pressed={isBookmarked}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
                  isBookmarked ? 'border-primary bg-primary text-white' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} /> Bookmark
              </button>
              <button
                onClick={handleShare}
                className="relative rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                aria-label="Share lesson"
              >
                <Share2 size={14} />
                {copyStatus === 'copied' && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] font-bold text-white">
                    Link copied!
                  </span>
                )}
              </button>
              <Link
                to={`/quiz/${currentLesson.quizId}`}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover"
              >
                Take Quiz
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-white">
            <nav className="flex gap-5 overflow-x-auto border-b border-slate-200 px-5" aria-label="Lesson information tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 py-3 text-xs font-semibold ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            {activeTab === 'Notes' ? (
              <NotesPanel currentSeconds={player.currentSeconds} />
            ) : (
              <p className="p-8 text-center text-sm text-slate-400">
                {activeTab} content isn't included in this build.
              </p>
            )}
          </div>

          <button
            onClick={handleNextLesson}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary-hover"
          >
            Next: Control Flow & Functions <ChevronRight size={16} />
          </button>
        </div>

        {/* Right: transcript sidebar */}
        <aside className="order-3 rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Transcript</h3>
          </div>
          <div className="max-h-[420px] space-y-1 overflow-y-auto p-2">
            {transcript.map((entry) => {
              const isActive = Math.abs(player.currentSeconds - entry.timeSeconds) < 8
              return (
                <button
                  key={entry.id}
                  onClick={() => handleTranscriptClick(entry)}
                  className={`block w-full rounded-lg p-2 text-left text-xs ${
                    isActive ? 'bg-primary-light text-primary' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono text-[10px] text-slate-400">[{formatTime(entry.timeSeconds)}]</span>{' '}
                  {entry.text}
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}