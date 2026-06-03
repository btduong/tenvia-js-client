import timelineStyle from './CircularProgressBar.module.css';

/**
 * A circular timeline component represents a circular progress bar with text at center.
 * @param percentage - 100% = full circle, 0% = empty circle
 * @param timeLeft - the time left before the timeline reaches 0
 * @returns a circular timer with remaining time text at center
 */
export const CircularTimeLine = ({ percentage, timeLeft }: { percentage: number, timeLeft: number }) => {
  const radius = 30; // circle radius
  const strokeWidth = 5; // the border around the circle
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeOffset = (percentage / 100) * circumference; // animate the outer radius to show progress
  const color = percentage < 20 ? 'red' : 'gold'; // color of the outer radius

  return (
    <div className={timelineStyle.circularTimelineContainer}>
      <svg height={radius * 2} width={radius * 2}>
        {/* background */}
        <circle
          stroke='#333'
          fill='transparent'
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* foreground */}
        <circle
          stroke={color}
          fill='transparent'
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: strokeOffset, transition: 'stroke-dashoffset 0.1s linear' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`} // Rotate so progress starts at 12 o'clock
        />
      </svg>

      {/* Remaining seconds displayed in the center */}
      <div className={timelineStyle.timeText}>{Math.ceil(timeLeft)}</div>
    </div>
  );
};