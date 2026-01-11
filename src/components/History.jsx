import { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { getExerciseById } from '../data/exercises';
import EditSetModal from './EditSetModal';

function History({ onBack }) {
    const { state, updateHistorySet, deleteHistorySet, deleteSession } = useWorkout();
    const { workoutHistory } = state;

    const [selectedSession, setSelectedSession] = useState(null);
    const [editingSet, setEditingSet] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // 日付でグループ化（新しい順）
    const sessionsByDate = useMemo(() => {
        const sorted = [...workoutHistory].reverse();
        return sorted;
    }, [workoutHistory]);

    const handleDeleteSession = (sessionId) => {
        deleteSession(sessionId);
        setShowDeleteConfirm(null);
        setSelectedSession(null);
    };

    // セッション詳細表示
    if (selectedSession) {
        const session = workoutHistory.find(s => s.id === selectedSession);
        if (!session) {
            setSelectedSession(null);
            return null;
        }

        // 種目ごとにグループ化
        const setsByExercise = {};
        session.sets.forEach(set => {
            if (!setsByExercise[set.exerciseId]) {
                setsByExercise[set.exerciseId] = {
                    exercise: getExerciseById(set.exerciseId),
                    name: set.exerciseName,
                    sets: []
                };
            }
            setsByExercise[set.exerciseId].sets.push(set);
        });

        // 総ボリューム計算
        const totalVolume = session.sets.reduce((sum, set) => {
            return sum + (set.weight * (set.reps || 1));
        }, 0);

        return (
            <>
                <header className="header">
                    <button className="header__back" onClick={() => setSelectedSession(null)}>
                        ← 戻る
                    </button>
                    <h1 className="header__title">
                        {new Date(session.date).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                        })}
                    </h1>
                    <button
                        className="btn btn--ghost"
                        style={{ color: 'var(--color-error)' }}
                        onClick={() => setShowDeleteConfirm(session.id)}
                    >
                        🗑
                    </button>
                </header>

                <main className="main">
                    {/* サマリー */}
                    <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div className="stat-card">
                            <div className="stat-card__value">{session.sets.length}</div>
                            <div className="stat-card__label">セット数</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {(totalVolume / 1000).toFixed(1)}t
                            </div>
                            <div className="stat-card__label">総ボリューム</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {Math.round((session.sets.filter(s => s.isSuccess).length / session.sets.length) * 100)}%
                            </div>
                            <div className="stat-card__label">成功率</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {['😫', '😕', '😐', '🙂', '😊'][session.bodyCondition - 1] || '😐'}
                            </div>
                            <div className="stat-card__label">体感</div>
                        </div>
                    </div>

                    <p style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-sm)',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        タップして編集
                    </p>

                    {/* 種目別 */}
                    {Object.values(setsByExercise).map(({ name, sets }) => (
                        <div key={name} className="card">
                            <div className="card__header">
                                <h3 className="card__title">{name}</h3>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                    {sets.filter(s => s.isSuccess).length}/{sets.length} 成功
                                </span>
                            </div>
                            <ul className="set-list">
                                {sets.map((set, index) => (
                                    <li
                                        key={set.id}
                                        className="set-item"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setEditingSet(set)}
                                    >
                                        <div className="set-item__number">{index + 1}</div>
                                        <div className="set-item__info">
                                            <div className="set-item__weight">
                                                {set.weight} kg
                                                {set.reps && set.reps > 1 && (
                                                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                                                        {' '}× {set.reps}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="set-item__meta">
                                                RPE {set.rpe}
                                                {set.notes && ` • ${set.notes}`}
                                            </div>
                                        </div>
                                        <div className={`set-item__result ${set.isSuccess ? 'set-item__result--success' : 'set-item__result--fail'}`}>
                                            {set.isSuccess ? '○' : '×'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </main>

                {/* 編集モーダル */}
                {editingSet && (
                    <EditSetModal
                        set={editingSet}
                        sessionId={session.id}
                        onSave={updateHistorySet}
                        onDelete={deleteHistorySet}
                        onClose={() => setEditingSet(null)}
                    />
                )}

                {/* セッション削除確認 */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <div className="modal__icon">⚠️</div>
                            <div className="modal__title">セッションを削除しますか？</div>
                            <div className="modal__message">
                                この日のトレーニング記録がすべて削除されます。<br />
                                この操作は取り消せません。
                            </div>
                            <div className="modal__actions">
                                <button className="btn btn--secondary" onClick={() => setShowDeleteConfirm(null)}>
                                    キャンセル
                                </button>
                                <button
                                    className="btn"
                                    style={{ background: 'var(--color-error)', color: 'white' }}
                                    onClick={() => handleDeleteSession(showDeleteConfirm)}
                                >
                                    削除する
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // セッション一覧
    return (
        <>
            <header className="header">
                <button className="header__back" onClick={onBack}>
                    ← 戻る
                </button>
                <h1 className="header__title">履歴</h1>
                <div></div>
            </header>

            <main className="main">
                {sessionsByDate.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">📅</div>
                        <div className="empty-state__text">
                            まだ記録がありません<br />
                            トレーニングを開始して記録を残しましょう
                        </div>
                    </div>
                ) : (
                    <div className="pb-list">
                        {sessionsByDate.map(session => {
                            const successCount = session.sets.filter(s => s.isSuccess).length;
                            const uniqueExercises = [...new Set(session.sets.map(s => s.exerciseName))];
                            const totalVolume = session.sets.reduce((sum, set) =>
                                sum + (set.weight * (set.reps || 1)), 0
                            );

                            return (
                                <div
                                    key={session.id}
                                    className="pb-item"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedSession(session.id)}
                                >
                                    <div>
                                        <div className="pb-item__name">
                                            {new Date(session.date).toLocaleDateString('ja-JP', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {uniqueExercises.slice(0, 3).join(', ')}
                                            {uniqueExercises.length > 3 && ` 他${uniqueExercises.length - 3}種目`}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
                                            {session.sets.length}セット
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {(totalVolume / 1000).toFixed(1)}t
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </>
    );
}

export default History;
