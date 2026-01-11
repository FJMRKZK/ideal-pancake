import { useWorkout } from '../context/WorkoutContext';
import { EXERCISES, getExerciseById } from '../data/exercises';

function Dashboard({ onStartWorkout }) {
    const { state, startSession } = useWorkout();
    const { personalBests, workoutHistory, currentSession } = state;

    // PBが登録されている種目
    const pbEntries = Object.entries(personalBests)
        .filter(([_, pb]) => pb.weight > 0)
        .map(([exerciseId, pb]) => ({
            exercise: getExerciseById(exerciseId),
            ...pb
        }))
        .filter(entry => entry.exercise);

    // 今週のセッション数
    const thisWeekSessions = workoutHistory.filter(session => {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return sessionDate >= weekAgo;
    }).length;

    // 今週の総セット数
    const thisWeekSets = workoutHistory
        .filter(session => {
            const sessionDate = new Date(session.date);
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return sessionDate >= weekAgo;
        })
        .reduce((total, session) => total + session.sets.length, 0);

    const handleStart = () => {
        startSession();
        onStartWorkout();
    };

    // 継続中のセッションがある場合
    if (currentSession) {
        return (
            <>
                <header className="header">
                    <h1 className="header__title">Weightlifting Log</h1>
                </header>
                <main className="main">
                    <div className="card" style={{ textAlign: 'center', background: 'var(--color-warning-bg)' }}>
                        <p style={{ color: 'var(--color-warning)', marginBottom: 'var(--spacing-md)' }}>
                            ⚠️ 記録中のセッションがあります
                        </p>
                        <button className="btn btn--primary" onClick={onStartWorkout}>
                            記録を続ける
                        </button>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <header className="header">
                <h1 className="header__title">Weightlifting Log</h1>
            </header>

            <main className="main">
                {/* Stats Grid */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-card__value">{thisWeekSessions}</div>
                        <div className="stat-card__label">今週のセッション</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{thisWeekSets}</div>
                        <div className="stat-card__label">今週のセット数</div>
                    </div>
                </div>

                {/* Start Button */}
                <button
                    className="btn btn--primary btn--full btn--lg"
                    onClick={handleStart}
                    style={{ marginBottom: 'var(--spacing-xl)' }}
                >
                    🏋️ トレーニング開始
                </button>

                {/* PB List */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">自己ベスト（PB）</h2>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                            {pbEntries.length} 種目
                        </span>
                    </div>

                    {pbEntries.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🎯</div>
                            <div className="empty-state__text">
                                まだPBが登録されていません<br />
                                トレーニングを記録するとPBが自動で保存されます
                            </div>
                        </div>
                    ) : (
                        <div className="pb-list">
                            {pbEntries.slice(0, 10).map(({ exercise, weight, date }) => (
                                <div key={exercise.id} className="pb-item">
                                    <div>
                                        <div className="pb-item__name">{exercise.name}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {new Date(date).toLocaleDateString('ja-JP')}
                                        </div>
                                    </div>
                                    <div className="pb-item__weight">{weight} kg</div>
                                </div>
                            ))}
                            {pbEntries.length > 10 && (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-sm)', color: 'var(--color-text-muted)' }}>
                                    他 {pbEntries.length - 10} 種目
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Sessions */}
                {workoutHistory.length > 0 && (
                    <div className="card">
                        <div className="card__header">
                            <h2 className="card__title">最近のセッション</h2>
                        </div>
                        <div className="pb-list">
                            {workoutHistory.slice(-3).reverse().map(session => (
                                <div key={session.id} className="pb-item">
                                    <div>
                                        <div className="pb-item__name">
                                            {new Date(session.date).toLocaleDateString('ja-JP', {
                                                weekday: 'short',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {session.sets.length} セット
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--font-size-xl)',
                                        opacity: 0.7
                                    }}>
                                        {['😫', '😕', '😐', '🙂', '😊'][session.bodyCondition - 1] || '😐'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

export default Dashboard;
