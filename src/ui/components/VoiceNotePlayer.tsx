/* ============================================================
 * THEY WERE HERE — Voice Note Player Component
 * Tactile audio memo player with animated speech waveform bars
 * and playback progress for unlocked notes.
 * ============================================================ */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SpeakerHigh } from '@phosphor-icons/react';
import { createSyntheticVoiceMemoUrl } from '@/audio/voiceNoteAudio';

interface VoiceNotePlayerProps {
  audioUrl?: string;
  durationSeconds?: number;
  compact?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  audioUrl,
  durationSeconds = 6,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const effectiveAudioUrl = useRef<string>(audioUrl || '');

  useEffect(() => {
    // If no real audio URL was provided, generate synthetic voice audio memo
    if (!effectiveAudioUrl.current) {
      effectiveAudioUrl.current = createSyntheticVoiceMemoUrl(durationSeconds);
    }

    const audio = new Audio(effectiveAudioUrl.current);
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, durationSeconds]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    return `0:${s < 10 ? '0' : ''}${s}`;
  };

  const waveformHeights = [35, 75, 45, 90, 60, 100, 70, 40, 85, 50, 80, 65, 30, 55];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`rounded-xl flex items-center gap-2.5 transition-all select-none ${
        compact ? 'p-2' : 'p-3'
      }`}
      style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--paper-edge)',
        boxShadow: '0 2px 8px rgba(15, 18, 48, 0.04)',
      }}
    >
      <button
        type="button"
        onClick={togglePlay}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
        style={{ background: 'var(--hanko)' }}
        aria-label={isPlaying ? 'Pause voice message' : 'Play voice message'}
      >
        {isPlaying ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
      </button>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span
            className="flex items-center gap-1 font-bold"
            style={{ color: 'var(--ink-900)', fontFamily: 'var(--font-display)' }}
          >
            <SpeakerHigh size={12} weight="bold" color="var(--hanko)" />
            Voice Memo
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-500)' }}>
            {isPlaying ? formatTime(currentTime) : `${durationSeconds}s`}
          </span>
        </div>

        {/* Tactile Waveform Bars */}
        <div className="flex items-center gap-1 h-4">
          {waveformHeights.map((h, i) => {
            const progress = (i / waveformHeights.length) * durationSeconds;
            const isPassed = currentTime >= progress;
            return (
              <div
                key={i}
                className="w-1 rounded-full transition-all duration-150"
                style={{
                  height: `${h}%`,
                  background: isPlaying && isPassed ? 'var(--hanko)' : 'var(--ink-300)',
                  opacity: isPlaying && !isPassed ? 0.4 : 0.85,
                  transform: isPlaying ? `scaleY(${0.8 + Math.random() * 0.4})` : 'scaleY(1)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
