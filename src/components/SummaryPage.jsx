import { useLocation } from 'react-router-dom';
import HomeButton from './ui/HomeButton';

const SummaryPage = () => {
    const location = useLocation();
    const summary = location.state?.sessionSummary;

    if (!summary) {
        return (<HomeButton/>);
    }

    return (

        <div>
            <h1>Game Over! Your score: {summary.score}</h1>
            <HomeButton/>
        </div>
    );
};

export default SummaryPage;