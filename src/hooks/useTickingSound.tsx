import clockTickingSfx from '../assets/clock-ticking.mp3';

import { useRef, useEffect } from 'react';

export const useTickingSound = (isPlaying: boolean) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {

        if (!audioRef.current) {
            audioRef.current = new Audio(clockTickingSfx);
            audioRef.current.loop = true; // play it in a loop
        }

        if (isPlaying) {
            audioRef.current.play().catch(err => console.error('Audio playback failed', err));
        } else {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }


        // Clear up if component unmounts
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, [isPlaying]);
};