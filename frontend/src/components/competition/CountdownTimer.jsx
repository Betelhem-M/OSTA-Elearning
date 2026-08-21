import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (timeLeft.expired) {
    return <span className="text-xs font-bold text-red-500">Deadline passed</span>
  }

  return (
    <div className="flex gap-2 text-center">
      {[
        ['Days', timeLeft.days],
        ['Hrs', timeLeft.hours],
        ['Min', timeLeft.minutes],
        ['Sec', timeLeft.seconds],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg bg-primary px-2.5 py-1.5 text-white">
          <p className="text-sm font-extrabold leading-none">{String(value).padStart(2, '0')}</p>
          <p className="text-[9px] font-medium text-white/70">{label}</p>
        </div>
      ))}
    </div>
  )
}

function calculateTimeLeft(targetDate) {
  const diffMs = new Date(targetDate).getTime() - Date.now()
  if (diffMs <= 0) return { expired: true }

  const totalSeconds = Math.floor(diffMs / 1000)
  return {
    expired: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}