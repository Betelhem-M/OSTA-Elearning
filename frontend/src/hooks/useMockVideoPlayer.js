import { useState, useRef, useEffect, useCallback } from 'react'

export function useMockVideoPlayer(durationSeconds, startSeconds = 0) {
    const [currentSeconds, setCurrentSeconds] = useState(startSeconds)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [showCaptions, setShowCaptions] = useState(false)
    const [speedIndex, setSpeedIndex] = useState(1) // index into SPEEDS
    const intervalRef = useRef(null)

    const SPEEDS = [0.5, 1, 1.25, 1.5, 2]

    useEffect(() => {
        if (!isPlaying) {
            clearInterval(intervalRef.current)
            return
        }
        intervalRef.current = setInterval(() => {
            setCurrentSeconds((prev) => {
                const next = Math.min(durationSeconds, prev + SPEEDS[speedIndex])
                if (next >= durationSeconds) setIsPlaying(false)
                return next
            })
        }, 1000)

        return () => clearInterval(intervalRef.current)
    }, [isPlaying, speedIndex, durationSeconds])

    const togglePlay = useCallback(() => setIsPlaying((v) => !v), [])

    const seekTo = useCallback(
        (seconds) => setCurrentSeconds(Math.min(durationSeconds, Math.max(0, seconds))),
        [durationSeconds],
    )

    const skip = useCallback(
        (deltaSeconds) => setCurrentSeconds((prev) => Math.min(durationSeconds, Math.max(0, prev + deltaSeconds))),
        [durationSeconds],
    )

    const toggleMute = useCallback(() => setIsMuted((v) => !v), [])
    const toggleCaptions = useCallback(() => setShowCaptions((v) => !v), [])
    const cycleSpeed = useCallback(() => setSpeedIndex((i) => (i + 1) % SPEEDS.length), [])

    const progressPct = Math.min(100, (currentSeconds / durationSeconds) * 100)

    return {
        currentSeconds,
        durationSeconds,
        isPlaying,
        isMuted,
        showCaptions,
        speed: SPEEDS[speedIndex],
        progressPct,
        togglePlay,
        seekTo,
        skip,
        toggleMute,
        toggleCaptions,
        cycleSpeed,
    }
}

export function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60)
    const s = Math.floor(totalSeconds % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}