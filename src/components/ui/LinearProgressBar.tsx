import timelineStyle from './LinearProgressBar.module.css';
/**
 * A linear timeline component represents a progress bar.
 * @param percentage - 100% = full bar, 0% = empty bar
 * @returns a horizontal div
 */
export const TimeLine = ({ percentage }: { percentage: number }) => {
  return (
    <div className={timelineStyle.timelineContainer}>
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          background: percentage < 20 ? 'red' : 'gold', // Changes color when low
          transition: 'width 0.1s linear',
        }}
      />
    </div>
  );
};