import { useState } from "react";
import styles from "./LoginPage.module.css";

interface LoginPageProps {
    handleLogin: (username: string) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ handleLogin }) => {
    const [userName, setTypedUsername] = useState<string>("");

    return (
        <div className={styles.loginContainer}>
            <h2>Enter a name to play</h2>
            <input type='text' placeholder='Name' onChange={(e) => setTypedUsername(e.target.value)} />
            <button onClick={() => handleLogin(userName)} disabled={!userName.trim()}>Play</button>
        </div>

    );
}