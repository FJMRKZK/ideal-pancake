import { useState } from 'react';

function PasswordScreen({ onUnlock }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // パスワードをlocalStorageから取得（なければデフォルト）
        const savedPassword = localStorage.getItem('weightlifting-app-password') || '1111';

        if (password === savedPassword) {
            sessionStorage.setItem('weightlifting-app-unlocked', 'true');
            onUnlock();
        } else {
            setError(true);
            setPassword('');
            // バイブレーション
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
        }
    };

    const handleNumberClick = (num) => {
        if (password.length < 8) {
            setPassword(prev => prev + num);
            setError(false);
        }
    };

    const handleBackspace = () => {
        setPassword(prev => prev.slice(0, -1));
        setError(false);
    };

    const handleClear = () => {
        setPassword('');
        setError(false);
    };

    return (
        <div className="password-screen">
            <div className="password-container">
                <div className="password-header">
                    <div className="password-icon">🏋️</div>
                    <h1>Weightlifting Log</h1>
                    <p>パスワードを入力してください</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={`password-display ${error ? 'password-display--error' : ''}`}>
                        {password.split('').map((_, i) => (
                            <span key={i} className="password-dot">●</span>
                        ))}
                        {Array(4 - Math.min(password.length, 4)).fill(null).map((_, i) => (
                            <span key={`empty-${i}`} className="password-dot password-dot--empty">○</span>
                        ))}
                    </div>

                    {error && (
                        <div className="password-error">
                            パスワードが正しくありません
                        </div>
                    )}

                    <div className="password-numpad">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                type="button"
                                className="password-numpad__btn"
                                onClick={() => handleNumberClick(num.toString())}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            type="button"
                            className="password-numpad__btn password-numpad__btn--action"
                            onClick={handleClear}
                        >
                            C
                        </button>
                        <button
                            type="button"
                            className="password-numpad__btn"
                            onClick={() => handleNumberClick('0')}
                        >
                            0
                        </button>
                        <button
                            type="button"
                            className="password-numpad__btn password-numpad__btn--action"
                            onClick={handleBackspace}
                        >
                            ←
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary btn--full"
                        disabled={password.length === 0}
                    >
                        ロック解除
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PasswordScreen;
