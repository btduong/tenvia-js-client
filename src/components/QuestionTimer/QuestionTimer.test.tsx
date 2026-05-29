import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import QuestionTimer from './QuestionTimer';

let mockOnComplete = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('QuestionTimer', () => {
  it('should calls onComplete if initialized with duration 0', () => {
    render(<QuestionTimer duration={0} isPause={false} onComplete={mockOnComplete} />);

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should ticks down and calls onComplete when the duration expires', () => {
    // Set duration to 0.2
    render(<QuestionTimer duration={0.2} isPause={false} onComplete={mockOnComplete} />);

    expect(mockOnComplete).not.toHaveBeenCalled();

    // the 1st tick down, timeLeft: 0.2 - 0.1 = .1
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(mockOnComplete).not.toHaveBeenCalled();

    // the 2nd tick down, timeleft: .1 - .1 = 0
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // onCompete is triggered
    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should not tick down when paused', () => {
    render(<QuestionTimer duration={0.2} isPause={true} onComplete={mockOnComplete} />);

    vi.advanceTimersByTime(200);

    expect(mockOnComplete).not.toHaveBeenCalled();
  });

  it('should not call onComplete multiple times if parent re-renders', () => {
    const mockSecondOnComplete = vi.fn();

    const { rerender } = render(
      <QuestionTimer duration={0.1} isPause={false} onComplete={mockOnComplete} />
    );

    // Trigger a tick down to 0.
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Re-render
    rerender(<QuestionTimer duration={0.1} isPause={false} onComplete={mockSecondOnComplete} />);

    expect(mockOnComplete).toHaveBeenCalled();
    expect(mockSecondOnComplete).not.toHaveBeenCalled();
  });
});
