/* ============================================================
 * THEY WERE HERE — Voice Note Recorder
 * Allows travellers to record a place-locked voice message
 * with real-time waveform visualizer and playback preview.
 * ============================================================ */

import React, { useState, useRef, useEffect } from 'react';
import {
  Microphone,
  Stop,
  Play,
  Pause,
  Trash,
  Check,
  SpeakerHigh,
} from '@phosphor-icons/react';
import { MAX_VOICE_DURATION_SECONDS } from '@/contracts/types';

interface VoiceNoteRecorderProps {
  onAudioRecorded: (audioDataUrl: string, durationSeconds: number) => void;
  onAudioCleared: () => void;
  initialAudioUrl?: string;
  maxSeconds?: number;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onAudioRecorded,
  onAudioCleared,
  initialAudioUrl,
  maxSeconds = MAX_VOICE_DURATION_SECONDS,
}) => {
  const [state, setState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl || null);
  const [waveformData, setWaveformData] = useState<number[]>([40, 60, 30, 80, 50, 90, 70, 45, 65, 85, 35, 75]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  // Start Voice Recording
  const startRecording = async () => {
    setPermissionError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Audio recording not supported in this browser.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Audio analysis for real-time waveform
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = ctx;
        analyserRef.current = analyser;

        const updateWaveform = () => {
          if (!analyserRef.current) return;
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          // Pick 12 representative frequency levels normalized to 20-100%
          const bars: number[] = [];
          const step = Math.max(1, Math.floor(dataArray.length / 12));
          for (let i = 0; i < 12; i++) {
            const val = dataArray[i * step] || 0;
            bars.push(Math.min(100, Math.max(20, Math.round((val / 255) * 100))));
          }
          setWaveformData(bars);
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      } catch {
        // Fallback simulation
      }

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          setState('recorded');
          onAudioRecorded(base64data, duration);
        };
      };

      recorder.start(100);
      setState('recording');
      setDuration(0);

      timerIntervalRef.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxSeconds) {
            stopRecording();
            return maxSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('[VoiceRecorder] getUserMedia error:', err);
      setPermissionError('Microphone permission required to record voice advice.');
      setState('idle');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Toggle Playback
  const togglePlay = () => {
    if (!audioUrl) return;

    if (state === 'playing') {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setState('recorded');
    } else {
      if (!audioElementRef.current) {
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;
        audio.onended = () => setState('recorded');
      } else {
        audioElementRef.current.src = audioUrl;
      }
      audioElementRef.current.play().catch(() => {});
      setState('playing');
    }
  };

  // Clear / Discard Audio
  const clearAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioUrl(null);
    setDuration(0);
    setState('idle');
    onAudioCleared();
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className="p-3.5 rounded-2xl flex flex-col gap-2.5 transition-all text-left"
      style={{
        background: 'var(--paper)',
        border: '1.5px solid var(--paper-edge)',
        boxShadow: '0 4px 14px rgba(15, 18, 48, 0.05)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SpeakerHigh size={18} weight="bold" color="var(--hanko)" />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xs)',
              color: 'var(--ink-900)',
            }}
          >
            Voice Note (Optional)
          </span>
        </div>

        {audioUrl ? (
          <span
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#5EE2B522', color: '#1B825D' }}
          >
            <Check size={12} weight="bold" /> Recorded ({duration || 6}s)
          </span>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--ink-500)',
            }}
          >
            Max {maxSeconds} seconds
          </span>
        )}
      </div>

      {permissionError && (
        <div className="text-[11px] text-red-600 font-medium">
          {permissionError}
        </div>
      )}

      {/* State: Idle / Ready to Record */}
      {state === 'idle' && !audioUrl && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p
            className="text-xs"
            style={{ color: 'var(--ink-700)', fontFamily: 'var(--font-body)' }}
          >
            Speak your recommendation aloud for the next person arriving here.
          </p>
          <button
            type="button"
            onClick={startRecording}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
            style={{ background: 'var(--hanko)' }}
          >
            <Microphone size={16} weight="fill" />
            <span>Record</span>
          </button>
        </div>
      )}

      {/* State: Recording in progress */}
      {state === 'recording' && (
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span
              className="font-mono text-xs font-bold"
              style={{ color: 'var(--ink-900)' }}
            >
              {formatSecs(duration)} / {formatSecs(maxSeconds)}
            </span>
            {/* Animated Waveform Bars */}
            <div className="flex items-center gap-0.5 h-6 flex-1 px-2">
              {waveformData.map((height, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#E8264C] rounded-full transition-all duration-75"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
            style={{ background: 'var(--ink-900)' }}
          >
            <Stop size={15} weight="fill" />
            <span>Done</span>
          </button>
        </div>
      )}

      {/* State: Recorded or Playing preview */}
      {(state === 'recorded' || state === 'playing' || (state === 'idle' && audioUrl)) && (
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm cursor-pointer active:scale-95"
              style={{ background: 'var(--hanko)' }}
              aria-label={state === 'playing' ? 'Pause voice memo' : 'Play voice memo'}
            >
              {state === 'playing' ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            </button>

            {/* Simulated Voice Waveform */}
            <div className="flex items-center gap-1 h-6 flex-1 px-1">
              {[45, 80, 55, 95, 30, 70, 85, 40, 60, 90, 65, 35, 75, 50].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full transition-all"
                  style={{
                    height: `${h}%`,
                    background: state === 'playing' ? 'var(--hanko)' : 'var(--ink-500)',
                    opacity: state === 'playing' ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[11px] text-[var(--ink-700)]">
              {formatSecs(duration || 6)}
            </span>
          </div>

          <button
            type="button"
            onClick={clearAudio}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete Voice Note"
            aria-label="Delete Voice Note"
          >
            <Trash size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
