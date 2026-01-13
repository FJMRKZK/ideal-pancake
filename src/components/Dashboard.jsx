import { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { EXERCISES, getExerciseById } from '../data/exercises';

function Dashboard({ onStartWorkout }) {
    const { state, startSession, cancelSession, deletePB, updatePB } = useWorkout();
    const { personalBests, workoutHistory, currentSession, customExercises } = state;

    const [showPBManage, setShowPBManage] = useState(false);
    const [pbToDelete, setPbToDelete] = useState(null);
    const [showAddPB, setShowAddPB] = useState(false);
    const [newPBExercise, setNewPBExercise] = useState('');
    const [newPBWeight, setNewPBWeight] = useState(60);
    const [newPBReps, setNewPBReps] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    const allExercises = [...EXERCISES, ...customExercises];

    // PBが登録されている種目
    const pbEntries = Object.entries(personalBests)
        .filter(([_, pb]) => pb.weight > 0)
        .map(([exerciseId, pb]) => ({
            exerciseId,
            exercise: getExerciseById(exerciseId) || customExercises.find(e => e.id === exerciseId),
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

    // 検索結果
    const filteredExercises = useMemo(() => {
        if (!searchQuery) return allExercises.slice(0, 20);
        const lowerQuery = searchQuery.toLowerCase();
        return allExercises.filter(ex =>
            ex.name.toLowerCase().includes(lowerQuery) ||
            ex.id.toLowerCase().includes(lowerQuery)
        ).slice(0, 20);
    }, [allExercises, searchQuery]);

    const handleStart = () => {
        startSession();
        onStartWorkout();
    };

    const handleCancelSession = () => {
        if (confirm('記録中のセッションを取り消しますか？\nセット記録は失われます。')) {
            cancelSession();
        }
    };

    const handleDeletePB = (exerciseId) => {
        deletePB(exerciseId);
        setPbToDelete(null);
    };

    const handleAddPB = () => {
        if (!newPBExercise || newPBWeight <= 0) {
            alert('種目と重量を入力してください');
            return;
        }
        updatePB(newPBExercise, newPBWeight, newPBReps);
        setShowAddPB(false);
        setNewPBExercise('');
        setNewPBWeight(60);
        setNewPBReps(1);
        setSearchQuery('');
    };

    const selectedExercise = allExercises.find(e => e.id === newPBExercise);

    // ホーム画面コンテンツ
    const renderHomeContent = () => (
        <>
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
                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            className="btn btn--ghost"
                            style={{ fontSize: 'var(--font-size-sm)' }}
                            onClick={() => setShowAddPB(true)}
                        >
                            + 追加
                        </button>
                        <button
                            className="btn btn--ghost"
                            style={{ fontSize: 'var(--font-size-sm)' }}
                            onClick={() => setShowPBManage(!showPBManage)}
                        >
                            {showPBManage ? '完了' : '管理'}
                        </button>
                    </div>
                </div>

                {pbEntries.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state__icon">🎯</div>
                        <div className="empty-state__text">
                            まだPBが登録されていません<br />
                            「+ 追加」からPBを登録できます
                        </div>
                    </div>
                ) : (
                    <div className="pb-list">
                        {pbEntries.slice(0, showPBManage ? undefined : 10).map(({ exerciseId, exercise, weight, reps, date }) => (
                            <div key={exerciseId} className="pb-item">
                                <div>
                                    <div className="pb-item__name">{exercise.name}</div>
                                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                        {new Date(date).toLocaleDateString('ja-JP')}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="pb-item__weight">
                                        {weight} kg
                                        {reps && reps > 1 && (
                                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                                                {' '}×{reps}
                                            </span>
                                        )}
                                    </div>
                                    {showPBManage && (
                                        <button
                                            className="btn btn--ghost"
                                            style={{ color: 'var(--color-error)', padding: 'var(--spacing-xs)' }}
                                            onClick={() => setPbToDelete({ exerciseId, name: exercise.name, weight })}
                                        >
                                            🗑
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {!showPBManage && pbEntries.length > 10 && (
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
        </>
    );

    return (
        <>
            <header className="header">
                <h1 className="header__title">Weightlifting Log</h1>
            </header>

            <main className="main">
                {/* 継続中のセッション通知 */}
                {currentSession && (
                    <div className="card" style={{ textAlign: 'center', background: 'var(--color-warning-bg)', marginBottom: 'var(--spacing-lg)' }}>
                        <p style={{ color: 'var(--color-warning)', marginBottom: 'var(--spacing-md)' }}>
                            ⚠️ 記録中のセッションがあります
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                            <button className="btn btn--primary" onClick={onStartWorkout}>
                                記録を続ける
                            </button>
                            <button
                                className="btn btn--secondary"
                                style={{ color: 'var(--color-error)' }}
                                onClick={handleCancelSession}
                            >
                                取り消し
                            </button>
                        </div>
                    </div>
                )}

                {renderHomeContent()}
            </main>

            {/* PB追加モーダル */}
            {showAddPB && (
                <div className="modal-overlay" onClick={() => setShowAddPB(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal__title">PBを追加</div>

                        <div className="input-group" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <label className="input-group__label">種目</label>
                            {selectedExercise ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <span style={{ flex: 1, padding: 'var(--spacing-sm)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                                        {selectedExercise.name}
                                    </span>
                                    <button
                                        className="btn btn--ghost"
                                        onClick={() => { setNewPBExercise(''); setSearchQuery(''); }}
                                    >
                                        変更
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        className="input"
                                        placeholder="種目を検索..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <ul style={{
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            background: 'var(--color-bg-secondary)',
                                            borderRadius: 'var(--radius-md)',
                                            marginTop: 'var(--spacing-xs)'
                                        }}>
                                            {filteredExercises.map(ex => (
                                                <li
                                                    key={ex.id}
                                                    style={{
                                                        padding: 'var(--spacing-sm)',
                                                        cursor: 'pointer',
                                                        borderBottom: '1px solid var(--color-border)'
                                                    }}
                                                    onClick={() => {
                                                        setNewPBExercise(ex.id);
                                                        setSearchQuery('');
                                                    }}
                                                >
                                                    {ex.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="input-group__label">重量 (kg)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setNewPBWeight(Math.max(0, newPBWeight - 2.5))}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    className="input"
                                    style={{ textAlign: 'center', width: '100px' }}
                                    value={newPBWeight}
                                    onChange={(e) => setNewPBWeight(parseFloat(e.target.value) || 0)}
                                />
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setNewPBWeight(newPBWeight + 2.5)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-group__label">レップ数</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setNewPBReps(Math.max(1, newPBReps - 1))}
                                >
                                    -
                                </button>
                                <span style={{ minWidth: '40px', textAlign: 'center', fontSize: 'var(--font-size-xl)' }}>
                                    {newPBReps}
                                </span>
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setNewPBReps(newPBReps + 1)}
                                >
                                    +
                                </button>
                                {[1, 2, 3, 5].map(r => (
                                    <button
                                        key={r}
                                        className={`btn ${newPBReps === r ? 'btn--primary' : 'btn--secondary'}`}
                                        style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', minWidth: '36px' }}
                                        onClick={() => setNewPBReps(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="modal__actions" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn btn--secondary" onClick={() => setShowAddPB(false)}>
                                キャンセル
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleAddPB}
                                disabled={!newPBExercise}
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PB削除確認モーダル */}
            {pbToDelete && (
                <div className="modal-overlay" onClick={() => setPbToDelete(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__icon">⚠️</div>
                        <div className="modal__title">PBを削除しますか？</div>
                        <div className="modal__message">
                            {pbToDelete.name}<br />
                            {pbToDelete.weight} kg
                        </div>
                        <div className="modal__actions">
                            <button className="btn btn--secondary" onClick={() => setPbToDelete(null)}>
                                キャンセル
                            </button>
                            <button
                                className="btn"
                                style={{ background: 'var(--color-error)', color: 'white' }}
                                onClick={() => handleDeletePB(pbToDelete.exerciseId)}
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Dashboard;
