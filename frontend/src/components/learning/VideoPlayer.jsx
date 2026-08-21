import { useRef } from "react";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Captions,
  Maximize,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatTime } from "@hooks/useMockVideoPlayer";

export default function VideoPlayer({ player, title }) {
  const containerRef = useRef(null);

  function handleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }

  function handleSeekClick(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    player.seekTo(ratio * player.durationSeconds);
  }

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-t-xl bg-[#080d13] shadow-2xl"
    >
      <div className="relative flex aspect-video items-center justify-center bg-[#111b25]">
        <p className="max-w-md px-6 text-center font-mono text-xs leading-relaxed text-slate-400 opacity-70">
          # This is a simulated lesson preview — no real video file exists in
          this build.
          <br />
          print("{title}")
        </p>

        {!player.isPlaying && (
          <button
            onClick={player.togglePlay}
            aria-label="Play video"
            className="absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-xl transition hover:scale-105"
          >
            <Play size={30} fill="currentColor" />
          </button>
        )}
      </div>

      <div className="bg-[#0F1923] p-4">
        <div
          onClick={handleSeekClick}
          className="mb-3 h-1.5 cursor-pointer rounded-full bg-slate-600"
          role="slider"
          aria-label="Video progress"
          aria-valuenow={Math.round(player.progressPct)}
        >
          <div
            className="relative h-full rounded-full bg-primary"
            style={{ width: `${player.progressPct}%` }}
          >
            <span className="absolute -right-1.5 -top-1 h-3 w-3 rounded-full bg-white" />
          </div>
        </div>

        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => player.skip(-10)}
              aria-label="Rewind 10 seconds"
              className="hover:text-primary"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={player.togglePlay}
              aria-label={player.isPlaying ? "Pause" : "Play"}
              className="hover:text-primary"
            >
              {player.isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
            </button>
            <button
              onClick={() => player.skip(10)}
              aria-label="Forward 10 seconds"
              className="hover:text-primary"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={player.toggleMute}
              aria-label={player.isMuted ? "Unmute" : "Mute"}
              className="hover:text-primary"
            >
              {player.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <span className="text-[11px] text-slate-400">
              {formatTime(player.currentSeconds)} /{" "}
              {formatTime(player.durationSeconds)}
            </span>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <button
              onClick={player.cycleSpeed}
              className="rounded border border-white/10 px-2 py-1 text-[11px]"
            >
              {player.speed === 1 ? "1x" : `${player.speed}x`}
            </button>
            <button
              onClick={player.toggleCaptions}
              aria-pressed={player.showCaptions}
              aria-label="Captions"
              className={`rounded p-1.5 ${player.showCaptions ? "bg-white/15" : ""}`}
            >
              <Captions size={16} />
            </button>
            <button
              onClick={handleFullscreen}
              aria-label="Fullscreen"
              className="hover:text-primary"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
