import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Captions,
  Maximize,
} from "lucide-react";

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function VideoPlayer({
  videoUrl,
  title,
  durationMinutes = 0,
  initialPosition = 0,
  onStateChange,
  onComplete,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(
    Number(initialPosition) || 0
  );
  const [durationSeconds, setDurationSeconds] = useState(
    Number(durationMinutes || 0) * 60
  );
  const [speed, setSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);

  const progressPct =
    durationSeconds > 0
      ? Math.min(100, (currentSeconds / durationSeconds) * 100)
      : 0;

  function emitState(overrides = {}) {
    if (!onStateChange) return;

    onStateChange({
      currentSeconds,
      durationSeconds,
      isPlaying,
      isMuted,
      playbackRate: speed,
      ...overrides,
    });
  }

  useEffect(() => {
    emitState();
  }, [
    currentSeconds,
    durationSeconds,
    isPlaying,
    isMuted,
    speed,
  ]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const position = Number(initialPosition) || 0;

    const applyInitialPosition = () => {
      if (
        position > 0 &&
        Number.isFinite(video.duration) &&
        position < video.duration
      ) {
        video.currentTime = position;
      }
    };

    if (video.readyState >= 1) {
      applyInitialPosition();
    } else {
      video.addEventListener(
        "loadedmetadata",
        applyInitialPosition,
        { once: true }
      );
    }

    return () => {
      video.removeEventListener(
        "loadedmetadata",
        applyInitialPosition
      );
    };
  }, [initialPosition, videoUrl]);

  function handleLoadedMetadata() {
    const video = videoRef.current;

    if (!video) return;

    const actualDuration =
      Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : Number(durationMinutes || 0) * 60;

    setDurationSeconds(actualDuration);

    const position = Number(initialPosition) || 0;

    if (
      position > 0 &&
      position < actualDuration
    ) {
      video.currentTime = position;
      setCurrentSeconds(position);
    } else {
      setCurrentSeconds(video.currentTime || 0);
    }
  }

  function handleTimeUpdate() {
    const video = videoRef.current;

    if (!video) return;

    setCurrentSeconds(video.currentTime || 0);

    if (
      Number.isFinite(video.duration) &&
      video.duration > 0
    ) {
      setDurationSeconds(video.duration);
    }
  }

  function handlePlay() {
    setIsPlaying(true);
  }

  function handlePause() {
    setIsPlaying(false);
  }

  function handleEnded() {
    setIsPlaying(false);

    const video = videoRef.current;

    if (video && Number.isFinite(video.duration)) {
      setCurrentSeconds(video.duration);
    }

    if (onComplete) {
      onComplete();
    }
  }

  async function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error("Video playback error:", error);
    }
  }

  function skip(seconds) {
    const video = videoRef.current;

    if (!video) return;

    const nextTime = Math.min(
      Math.max(
        0,
        video.currentTime + Number(seconds || 0)
      ),
      Number.isFinite(video.duration)
        ? video.duration
        : durationSeconds
    );

    video.currentTime = nextTime;
    setCurrentSeconds(nextTime);
  }

  function toggleMute() {
    const video = videoRef.current;

    if (!video) return;

    const nextMuted = !video.muted;

    video.muted = nextMuted;
    setIsMuted(nextMuted);
  }

  function cycleSpeed() {
    const speeds = [1, 1.25, 1.5, 1.75, 2];

    const currentIndex = speeds.indexOf(speed);

    const nextSpeed =
      speeds[(currentIndex + 1) % speeds.length];

    const video = videoRef.current;

    if (video) {
      video.playbackRate = nextSpeed;
    }

    setSpeed(nextSpeed);
  }

  function handleSeekClick(event) {
    const video = videoRef.current;

    if (!video) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const ratio = Math.min(
      1,
      Math.max(
        0,
        (event.clientX - rect.left) / rect.width
      )
    );

    const targetDuration =
      Number.isFinite(video.duration) && video.duration > 0
        ? video.duration
        : durationSeconds;

    const targetTime =
      ratio * targetDuration;

    video.currentTime = targetTime;
    setCurrentSeconds(targetTime);
  }

  function handleFullscreen() {
    const container = containerRef.current;

    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  function handleVideoError(event) {
    console.error(
      "Video failed to load:",
      event.currentTarget.error
    );
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-t-xl bg-[#080d13] shadow-2xl"
    >
      {/* VIDEO */}
      <div className="relative flex aspect-video items-center justify-center bg-black">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-contain"
            preload="metadata"
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            onEnded={handleEnded}
            onError={handleVideoError}
            onClick={togglePlay}
          />
        ) : (
          <div className="px-6 text-center text-sm text-slate-400">
            No video is available for this lesson.
          </div>
        )}

        {!isPlaying && videoUrl && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-xl transition hover:scale-105"
          >
            <Play
              size={30}
              fill="currentColor"
            />
          </button>
        )}
      </div>

      {/* CONTROLS */}
      <div className="bg-[#0F1923] p-4">
        {/* PROGRESS */}
        <div
          onClick={handleSeekClick}
          className="mb-3 h-1.5 cursor-pointer rounded-full bg-slate-600"
          role="slider"
          aria-label="Video progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPct)}
        >
          <div
            className="relative h-full rounded-full bg-primary"
            style={{
              width: `${progressPct}%`,
            }}
          >
            <span className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full bg-white" />
          </div>
        </div>

        {/* CONTROL ROW */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* REWIND */}
            <button
              type="button"
              onClick={() => skip(-10)}
              aria-label="Rewind 10 seconds"
              className="hover:text-primary"
            >
              <Rewind size={18} />
            </button>

            {/* PLAY / PAUSE */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={
                isPlaying ? "Pause" : "Play"
              }
              className="hover:text-primary"
            >
              {isPlaying ? (
                <Pause
                  size={18}
                  fill="currentColor"
                />
              ) : (
                <Play
                  size={18}
                  fill="currentColor"
                />
              )}
            </button>

            {/* FORWARD */}
            <button
              type="button"
              onClick={() => skip(10)}
              aria-label="Forward 10 seconds"
              className="hover:text-primary"
            >
              <FastForward size={18} />
            </button>

            {/* MUTE */}
            <button
              type="button"
              onClick={toggleMute}
              aria-label={
                isMuted
                  ? "Unmute"
                  : "Mute"
              }
              className="hover:text-primary"
            >
              {isMuted ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            {/* TIME */}
            <span className="text-[11px] text-slate-400">
              {formatTime(currentSeconds)} /{" "}
              {formatTime(durationSeconds)}
            </span>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {/* SPEED */}
            <button
              type="button"
              onClick={cycleSpeed}
              className="rounded border border-white/10 px-2 py-1 text-[11px]"
            >
              {speed}x
            </button>

            {/* CAPTIONS */}
            <button
              type="button"
              onClick={() =>
                setShowCaptions(
                  (value) => !value
                )
              }
              aria-pressed={showCaptions}
              aria-label="Captions"
              className={`rounded p-1.5 ${
                showCaptions
                  ? "bg-white/15"
                  : ""
              }`}
            >
              <Captions size={16} />
            </button>

            {/* FULLSCREEN */}
            <button
              type="button"
              onClick={handleFullscreen}
              aria-label="Fullscreen"
              className="hover:text-primary"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="bg-[#0F1923] px-4 pb-4 text-xs text-slate-400">
        {title}
      </div>
    </div>
  );
}