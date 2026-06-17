import clockTickingSfx from '@/assets/clock-ticking.mp3';

import { useRef, useEffect } from 'react';

/**
 * A custom hook to manage the playback lifecycle of a ticking clock sound effect.
 *
 * @param isPlaying - Boolean flag indicating whether the ticking sound should be playing.
 */
export const useTickingSound = (isPlaying: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Initialise the Audio once.
   */
  useEffect(() => {
    const audio = new Audio(clockTickingSfx);
    audio.loop = true;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /**
   * Handle Audio state changes.
   * This ignores the AbortError that gets printed to the console:
   * Audio playback failed DOMException: The fetching process for the media resource was aborted by the user agent at the user's request.
   * This is because the audio.play() returns a promise which get resolved once the audio starts playing.
   * This error is when the 'isPlaying' turns to false due to component gets re-render before the Promise resolves.
   */
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Audio playback failed', err);
      });
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);
};
