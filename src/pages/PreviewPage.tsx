import { useNavigate } from "react-router-dom";
import { type GameSession, type PeekResponseDTO } from "../types";
import { useEffect, useState } from "react";
import { serviceApi } from "../api/serviceApi";
import styles from "./PreviewPage.module.css";
import { playClickSound } from "../utils/sounds";

export const PreviewPage = ({ getNextQuestion, sessionData, triggerGlobalError }: { getNextQuestion: (sessionId: string) => Promise<void>, sessionData: GameSession, triggerGlobalError: (message: string) => void }) => {

    const navigate = useNavigate();
    const [peekData, setPeekData] = useState<PeekResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {

        const sessionId = sessionData.id;
        if (!sessionId) return;

        const fetchPeekData = async () => {
            setIsLoading(true);
            const { data, error } = await serviceApi.peekAtNextQuestion(sessionId);
            if (data) {
                setPeekData(data);
            } else {
                triggerGlobalError(error.message);
            }
            setIsLoading(false)
        };

        fetchPeekData();

    }, [sessionData?.id]);

    if (!sessionData.id) return;

    /**
     * Fetch the next question. 
     * Want to use await here otherwise previous question will still show before
     * the UI gets updated with the new question.
     */
    const handleNextQuestion = async () => {
        if (sessionData?.id) {
            await getNextQuestion(sessionData.id);
            navigate('/quiz');
        } else {
            navigate('/');
        }

    };

    return (
        <div>
            <h2>Preview</h2>
            {peekData && (<div>Question number: {peekData?.questionIndex + 1}</div>)}
            <div>Question time limit: {peekData?.timeLimit}s</div>

            <div className={styles.previewBox}>

                {peekData && (
                    <>
                        <h3>Sneak Peek:</h3>
                        <p><em>"{peekData.questionText}"</em></p>

                        <ul className={styles.peekList}>
                            {peekData.trait && <li><strong>Category:</strong> {peekData.trait}</li>}
                            {peekData.potentialReward && <li className={styles.rewardText}><strong>Reward:</strong> {peekData.potentialReward}</li>}
                            {peekData.potentialPenalty && <li className={styles.penaltyText}><strong>Penalty:</strong> {peekData.potentialPenalty}</li>}
                        </ul>
                    </>
                )}
            </div>

            <button
                className={styles.playButton}
                disabled={isLoading}
                onClick={() => {
                    playClickSound()
                    handleNextQuestion();
                }}>Play</button>
        </div>
    );
};