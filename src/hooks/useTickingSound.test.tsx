import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTickingSound } from "./useTickingSound";

describe('useTickingSound hook', () => {

    let audioSpy: any;
    let mockPause = vi.fn();
    let mockPlay = vi.fn();

    beforeEach(() => {
        mockPlay = vi.fn().mockResolvedValue(undefined);
        mockPause = vi.fn();

        // Mock the audio functionlities
        window.HTMLMediaElement.prototype.play = mockPlay;
        window.HTMLMediaElement.prototype.pause = mockPause;

        audioSpy = vi.spyOn(window, 'Audio');
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('can create Audio initially', () => {
        const { result } = renderHook(() => useTickingSound(false));

        expect(result.current).not.toBeNull();
        expect(audioSpy).toHaveBeenCalled();

        expect(mockPause).toHaveBeenCalled();
        expect(mockPlay).not.toHaveBeenCalled();

    });

    it('should play Audio when isPlaying is true', () => {

        const { rerender } = renderHook(
            (playing) => useTickingSound(playing),
            { initialProps: false }
        );

        expect(mockPause).toHaveBeenCalled();
        expect(mockPlay).not.toHaveBeenCalled();

        mockPause.mockClear();
        mockPlay.mockClear();

        rerender(true);

        expect(mockPause).not.toHaveBeenCalled();
        expect(mockPlay).toHaveBeenCalled();
    });

    it('should pause when isPlaying changes true -> false', () => {
        const { rerender } = renderHook(
            (playing) => useTickingSound(playing),
            { initialProps: true }
        );

        expect(mockPause).not.toHaveBeenCalled();
        expect(mockPlay).toHaveBeenCalled();

        mockPlay.mockClear();

        rerender(false);

        expect(mockPause).toHaveBeenCalled();
        expect(mockPlay).not.toHaveBeenCalled();
    });

});
