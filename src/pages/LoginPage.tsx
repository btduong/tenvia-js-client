import { useState } from "react";
import styles from "./LoginPage.module.css";

interface LoginPageProps {
    handleLogin: (username: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    const [userName, setTypedUsername] = useState<string>("");

    const onSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        if (userName.trim()) {
            handleLogin(userName);
        }
    };

    return (
        <form className={styles.loginContainer} onSubmit={onSubmit}>
            <h2>Enter a name to play</h2>
            <input type='text' placeholder='Name' value={userName} onChange={(e => setTypedUsername(e.target.value))} />
            <button type="submit" disabled={!userName.trim()}>Play</button>
        </form>

    );
}