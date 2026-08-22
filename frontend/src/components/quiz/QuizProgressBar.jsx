export default function QuizProgressBar({ answeredCount, totalQuestions, flaggedCount, canSubmit, onSubmit }) {
  const pct = Math.round((answeredCount / totalQuestions) * 100)

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] xl:flex-row xl:items-center">
      <div className="min-w-[175px]">
        <p className="text-xs font-bold text-slate-700">Quiz Progress: {pct}%</p>
        <div className="mt-2 h-2 rounded-full bg-primary-light">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex flex-1 justify-center gap-2">
        {Array.from({ length: totalQuestions }).map((_, i) => (
          <span
            key={i}
            className={`h-2.5 w-2.5 rounded-full ${i < answeredCount ? 'bg-primary' : 'bg-slate-200'}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-4 whitespace-nowrap text-xs font-semibold text-slate-500">
        <span>Questions Answered: {answeredCount}/{totalQuestions}</span>
        <span>Flagged: {flaggedCount}</span>
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        title={canSubmit ? '' : 'Answer all questions to submit'}
        className={`rounded-lg px-4 py-2.5 text-xs font-bold text-white transition ${
          canSubmit ? 'bg-primary hover:bg-primary-hover' : 'cursor-not-allowed bg-slate-300'
        }`}
      >
        Submit Quiz
      </button>
    </section>
  )
}