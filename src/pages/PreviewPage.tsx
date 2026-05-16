import { useNavigate } from "react-router-dom";

export const PreviewPage = ({ getNextQuestion, sessionId }: { getNextQuestion: (sessionId: string) => Promise<void>, sessionId: string | null }) => {

    const navigate = useNavigate();
    if (!sessionId) return null;

    /**
     * Fetch the next question. 
     * Want to use await here otherwise previous question will still show before
     * the UI gets updated with the new question.
     */
    const handleNextQuestion = async () => {
        await getNextQuestion(sessionId);
        navigate('/quiz');

    };

    return (
        <div>
            <h1>Preview</h1>
            <button onClick={() => {
                handleNextQuestion();
            }}>Play</button>
        </div>
    );
};