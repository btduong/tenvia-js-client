import clockTickingSfx from '../assets/clock-ticking.mp3';

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
     */
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(err => console.error('Audio playback failed', err));
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, [isPlaying]);
};