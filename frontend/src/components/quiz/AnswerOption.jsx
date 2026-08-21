export default function AnswerOption({ option, isSelected, onSelect }) {
  return (
    <button
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
        isSelected ? 'border-primary bg-primary-light' : 'border-slate-200 bg-white hover:border-primary hover:bg-primary-light/40'
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          isSelected ? 'border-primary bg-primary' : 'border-slate-300'
        }`}
      >
        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold ${
          isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {option.id}
      </span>
      <span className="text-sm font-semibold text-slate-700">{option.text}</span>
    </button>
  )
}