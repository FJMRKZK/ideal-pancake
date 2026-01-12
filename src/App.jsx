import { useState, useEffect } from 'react';
import { useWorkout } from './context/WorkoutContext';
import Dashboard from './components/Dashboard';
import WorkoutRecorder from './components/WorkoutRecorder';
import Analysis from './components/Analysis';
import History from './components/History';
import Settings from './components/Settings';
import PasswordScreen from './components/PasswordScreen';
import RestTimer, { requestNotificationPermission } from './components/RestTimer';

const VIEWS = {
    DASHBOARD: 'dashboard',
    RECORD: 'record',
    ANALYSIS: 'analysis',
    HISTORY: 'history',
    SETTINGS: 'settings'
};

function App() {
    const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const { state, endSession } = useWorkout();

    // セッションストレージで認証状態を確認
    useEffect(() => {
        const unlocked = sessionStorage.getItem('weightlifting-app-unlocked') === 'true';
        setIsUnlocked(unlocked);
    }, []);

    // 通知許可をリクエスト
    useEffect(() => {
        if (isUnlocked) {
            requestNotificationPermission();
        }
    }, [isUnlocked]);

    const handleUnlock = () => {
        setIsUnlocked(true);
    };

    const handleStartWorkout = () => {
        setCurrentView(VIEWS.RECORD);
    };

    const handleEndWorkout = () => {
        endSession();
        setCurrentView(VIEWS.DASHBOARD);
    };

    const handleBack = () => {
        setCurrentView(VIEWS.DASHBOARD);
    };

    // パスワード画面
    if (!isUnlocked) {
        return <PasswordScreen onUnlock={handleUnlock} />;
    }

    const renderView = () => {
        switch (currentView) {
            case VIEWS.RECORD:
                return <WorkoutRecorder onEnd={handleEndWorkout} onBack={handleBack} />;
            case VIEWS.ANALYSIS:
                return <Analysis onBack={handleBack} />;
            case VIEWS.HISTORY:
                return <History onBack={handleBack} />;
            case VIEWS.SETTINGS:
                return <Settings onBack={handleBack} />;
            case VIEWS.DASHBOARD:
            default:
                return <Dashboard onStartWorkout={handleStartWorkout} />;
        }
    };

    return (
        <div className="app">
            {renderView()}

            {/* フローティングタイマーボタン - すべての画面で表示 */}
            <button
                className="floating-timer-btn"
                onClick={() => setShowTimer(true)}
                title="レストタイマー"
            >
                ⏱
            </button>

            {/* Bottom Navigation - 記録中以外に表示 */}
            {currentView !== VIEWS.RECORD && (
                <nav className="nav">
                    <button
                        className={`nav__item ${currentView === VIEWS.DASHBOARD ? 'active' : ''}`}
                        onClick={() => setCurrentView(VIEWS.DASHBOARD)}
                    >
                        <span className="nav__icon">🏠</span>
                        ホーム
                    </button>
                    <button
                        className={`nav__item ${currentView === VIEWS.HISTORY ? 'active' : ''}`}
                        onClick={() => setCurrentView(VIEWS.HISTORY)}
                    >
                        <span className="nav__icon">📅</span>
                        履歴
                    </button>
                    <button
                        className={`nav__item ${currentView === VIEWS.ANALYSIS ? 'active' : ''}`}
                        onClick={() => setCurrentView(VIEWS.ANALYSIS)}
                    >
                        <span className="nav__icon">📊</span>
                        分析
                    </button>
                    <button
                        className={`nav__item ${currentView === VIEWS.SETTINGS ? 'active' : ''}`}
                        onClick={() => setCurrentView(VIEWS.SETTINGS)}
                    >
                        <span className="nav__icon">⚙️</span>
                        設定
                    </button>
                </nav>
            )}

            {/* グローバルレストタイマー */}
            {showTimer && (
                <RestTimer
                    duration={state.settings.restTimerDuration}
                    onComplete={() => setShowTimer(false)}
                    onClose={() => setShowTimer(false)}
                />
            )}
        </div>
    );
}

export default App;
