import { useEffect, useRef } from 'react';

/**
 * A custom hook that listens for a specific keyboard shortcut and executes a callback.
 *
 * @param callback - The function to execute when the shortcut is triggered.
 */
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
        // Dont want to scroll the page while submitting the selected answer
        // The browser's default behaviour is keydown
        event.preventDefault();

        if (!event.repeat) {
          // Prevent spamming by holding down the space key
          callbackRef.current(); // Execute the callback
        }
      }
    };
    // Listener to the window
    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // No dependency so this effect is run everytime caller is rendered
};
