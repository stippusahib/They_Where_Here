/* ============================================================
 * THEY WERE HERE — Voice Note Audio Synthesizer & Helper
 * Generates audio fallback waves and audio helpers for
 * offline traveller voice memos.
 * ============================================================ */

/**
 * Creates a synthetic audio wave WAV base64 string for demo voice notes
 * so they play immediately even without external audio files.
 */
export function createSyntheticVoiceMemoUrl(durationSeconds = 6): string {
  if (typeof window === 'undefined') return '';

  try {
    const sampleRate = 22050;
    const numSamples = sampleRate * durationSeconds;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // Write WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM format
    view.setUint16(20, 1, true); // Linear quantization
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate melodious traveller field recorder voice tone
    // Simulating warm resonant speech harmonics (fundamentals at 180Hz, 240Hz, 360Hz)
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Cadenced voice-like bursts
      const cadence = Math.sin(t * 3.5) * 0.5 + 0.5;
      const speech1 = Math.sin(2 * Math.PI * 220 * t) * 0.4;
      const speech2 = Math.sin(2 * Math.PI * 330 * t) * 0.25;
      const speech3 = Math.sin(2 * Math.PI * 440 * t) * 0.15;
      const breathing = (Math.random() - 0.5) * 0.05;

      const envelope = Math.sin((Math.PI * t) / durationSeconds);
      const sample = (speech1 + speech2 + speech3 + breathing) * cadence * envelope * 0.4;

      const intSample = Math.max(-1, Math.min(1, sample)) * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('[VoiceAudio] Synthetic voice generation failed:', err);
    return '';
  }
}
