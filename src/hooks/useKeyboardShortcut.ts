import { useCallback, useEffect, useRef } from "react"
import type { AnswerResponse } from "../types"

export const useKeyboardShortcut = (callback: () => void) => {

    // Cache the callback
    const callbackRef = useRef(callback);
    
    // As there are no dependencies so this effect is triggered on evvery caller's render.
    // This create a new callback func and it gets cached again in .current
    useEffect(() => {
        callbackRef.current = callback;
    });

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {

            if (event.code === 'Space') {
                event.preventDefault(); // Dont want to scroll the page while submitting the selected answer
                callbackRef.current(); // Execute the callback
            }
        }
        // Listener to the window
        window.addEventListener('keyup', handleKeyDown);

        // Clean up
        return () => {
            window.removeEventListener('keyup', handleKeyDown);
        };

    }, []); // No dependency so this effect is run everytime caller is rendered
}