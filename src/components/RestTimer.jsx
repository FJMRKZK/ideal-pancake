import { useState, useEffect, useRef } from 'react';

function RestTimer({ duration, onComplete, onClose }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(true);
    const [isFlashing, setIsFlashing] = useState(false);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleTimerComplete();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleTimerComplete = async () => {
        setIsFlashing(true);

        // バイブレーション
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200, 100, 200]);
        }

        // サウンド
        try {
            // 簡易的なビープ音を Web Audio API で生成
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;

            oscillator.start();
            setTimeout(() => oscillator.stop(), 500);
        } catch (e) {
            console.log('Audio not available');
        }

        // ブラウザ通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('レスト終了！', {
                body: '次のセットの準備をしましょう 💪',
                icon: '🏋️'
            });
        }

        setTimeout(() => {
            setIsFlashing(false);
            onComplete();
        }, 2000);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePause = () => {
        setIsRunning(!isRunning);
    };

    const addTime = (seconds) => {
        setTimeLeft(prev => Math.max(0, prev + seconds));
    };

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className={`timer-overlay ${isFlashing ? 'timer-overlay--flash' : ''}`}>
            <div className="timer-modal">
                <div className="timer-modal__header">
                    <h2>レストタイマー</h2>
                    <button className="timer-modal__close" onClick={onClose}>×</button>
                </div>

                <div className="timer-display">
                    <svg className="timer-display__ring" viewBox="0 0 100 100">
                        <circle
                            className="timer-display__ring-bg"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                        />
                        <circle
                            className="timer-display__ring-progress"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="none"
                            strokeWidth="8"
                            strokeDasharray={`${progress * 2.83} 283`}
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="timer-display__time">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="timer-controls">
                    <button className="timer-btn" onClick={() => addTime(-30)}>
                        -30s
                    </button>
                    <button className="timer-btn timer-btn--primary" onClick={togglePause}>
                        {isRunning ? '⏸ 一時停止' : '▶ 再開'}
                    </button>
                    <button className="timer-btn" onClick={() => addTime(30)}>
                        +30s
                    </button>
                </div>

                <button className="btn btn--secondary btn--full" onClick={onClose} style={{ marginTop: 'var(--spacing-lg)' }}>
                    スキップ
                </button>
            </div>
        </div>
    );
}

// 通知許可をリクエスト
export const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
};

export default RestTimer;
