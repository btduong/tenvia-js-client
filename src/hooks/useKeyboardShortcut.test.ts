import { fireEvent, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcut } from "./useKeyboardShortcut";

const mockKeyPressedCallback = vi.fn();

describe('useKeyboardShortcut hook', () => {

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('can trigger callback on 1st Spacebar keydown', async () => {

        const { result } = renderHook(() => useKeyboardShortcut(mockKeyPressedCallback));

        // Cannot use -> await userEvent.keyboard('{Space>5}'); // press without releasing and trigger 5 keydown
        // userEvent expects the DOM already focused on an element to receive the click event.
        // So use FireEvent to dispatch an event to the window directly.
        fireEvent.keyDown(window, { code: 'Space', repeat: false });

        expect(mockKeyPressedCallback).toHaveBeenCalled();
    });

    it('should not trigger callback on repeat Spacebar keydowns', async () => {
        const { result } = renderHook(() => useKeyboardShortcut(mockKeyPressedCallback));

        // The 1st Spacebar down event
        fireEvent.keyDown(window, { code: 'Space', repeat: false });

        for (let index = 0; index < 5; index++) {
            fireEvent.keyDown(window, { code: 'Space', repeat: true });
        }

        expect(mockKeyPressedCallback).toHaveBeenCalledTimes(1);
    });

    it('should not tirgger callback on non Spacebar keydown', async () => {
        const { result } = renderHook(() => useKeyboardShortcut(mockKeyPressedCallback));

        fireEvent.keyDown(window, { code: 'Enter', repeat: false });

        expect(mockKeyPressedCallback).not.toHaveBeenCalled();
    });
});