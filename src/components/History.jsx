import { useState, useMemo } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { getExerciseById } from '../data/exercises';
import EditSetModal from './EditSetModal';

function History({ onBack }) {
    const { state, updateHistorySet, deleteHistorySet, deleteSession } = useWorkout();
    const { workoutHistory, personalBests } = state;

    const [selectedDate, setSelectedDate] = useState(null);
    const [editingSet, setEditingSet] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);

    // 日付でグループ化（同じ日の複数セッションをまとめる）
    const sessionsByDate = useMemo(() => {
        const dateMap = {};

        workoutHistory.forEach(session => {
            const dateKey = new Date(session.date).toISOString().split('T')[0];
            if (!dateMap[dateKey]) {
                dateMap[dateKey] = {
                    date: dateKey,
                    sessions: [],
                    sets: [],
                    totalVolume: 0
                };
            }
            dateMap[dateKey].sessions.push(session);
            dateMap[dateKey].sets.push(...session.sets);
            session.sets.forEach(set => {
                dateMap[dateKey].totalVolume += set.weight * (set.reps || 1);
            });
        });

        return Object.values(dateMap).sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );
    }, [workoutHistory]);

    const handleDeleteSession = (sessionId) => {
        deleteSession(sessionId);
        setShowDeleteConfirm(null);
    };

    // AI記事生成
    const handleGenerateArticle = async (sessions, sets) => {
        setIsGenerating(true);
        setGenerateResult(null);

        try {
            // トレーニングデータをJSON形式で構築
            const avgCondition = Math.round(
                sessions.reduce((sum, s) => sum + (s.bodyCondition || 3), 0) / sessions.length
            );

            // 種目ごとにグループ化
            const exerciseGroups = {};
            sets.forEach(set => {
                if (!exerciseGroups[set.exerciseId]) {
                    exerciseGroups[set.exerciseId] = {
                        exerciseId: set.exerciseId,
                        exerciseName: set.exerciseName,
                        sets: []
                    };
                }
                exerciseGroups[set.exerciseId].sets.push({
                    weight: set.weight,
                    reps: set.reps || 1,
                    rpe: set.rpe,
                    isSuccess: set.isSuccess,
                    notes: set.notes || ''
                });
            });

            // PB更新チェック
            const exercisesWithPB = Object.values(exerciseGroups).map(group => {
                const currentPB = personalBests[group.exerciseId];
                const successfulSets = group.sets.filter(s => s.isSuccess);
                const maxSuccessWeight = successfulSets.length > 0
                    ? Math.max(...successfulSets.map(s => s.weight))
                    : 0;
                const isPBUpdate = currentPB && maxSuccessWeight >= currentPB.weight;

                return {
                    ...group,
                    pb: currentPB?.weight || null,
                    pbReps: currentPB?.reps || 1,
                    isPBUpdate: isPBUpdate,
                    maxWeight: Math.max(...group.sets.map(s => s.weight)),
                    successRate: group.sets.length > 0
                        ? Math.round((successfulSets.length / group.sets.length) * 100)
                        : 0
                };
            });

            // Gemini APIに送るワークアウトデータ
            const workoutData = {
                sessionDate: sessions[0].date,
                bodyCondition: avgCondition,
                totalSets: sets.length,
                totalVolume: sets.reduce((sum, s) => sum + (s.weight * (s.reps || 1)), 0),
                successRate: Math.round((sets.filter(s => s.isSuccess).length / sets.length) * 100),
                exercises: exercisesWithPB,
                notes: sessions.map(s => s.notes).filter(Boolean).join('\n')
            };

            // API呼び出し
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titleIdea: '',
                    memo: JSON.stringify(workoutData, null, 2)
                }),
            });

            const data = await response.json();

            if (data.success) {
                setGenerateResult({
                    type: 'success',
                    ...data
                });
            } else {
                setGenerateResult({
                    type: 'error',
                    error: data.error,
                    details: data.details
                });
            }
        } catch (error) {
            console.error('Generate error:', error);
            setGenerateResult({
                type: 'error',
                error: '記事生成中にエラーが発生しました',
                details: error.message
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // 日付詳細表示
    if (selectedDate) {
        const dateData = sessionsByDate.find(d => d.date === selectedDate);
        if (!dateData) {
            setSelectedDate(null);
            return null;
        }

        const { sessions, sets, totalVolume } = dateData;

        // 種目ごとにグループ化
        const setsByExercise = {};
        sets.forEach(set => {
            if (!setsByExercise[set.exerciseId]) {
                setsByExercise[set.exerciseId] = {
                    exercise: getExerciseById(set.exerciseId),
                    name: set.exerciseName,
                    sets: []
                };
            }
            setsByExercise[set.exerciseId].sets.push(set);
        });

        const avgCondition = Math.round(
            sessions.reduce((sum, s) => sum + (s.bodyCondition || 3), 0) / sessions.length
        );

        return (
            <>
                <header className="header">
                    <button className="header__back" onClick={() => {
                        setSelectedDate(null);
                        setGenerateResult(null);
                    }}>
                        ← 戻る
                    </button>
                    <h1 className="header__title">
                        {new Date(selectedDate).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            weekday: 'short'
                        })}
                    </h1>
                    <div></div>
                </header>

                <main className="main">
                    {/* サマリー */}
                    <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <div className="stat-card">
                            <div className="stat-card__value">{sets.length}</div>
                            <div className="stat-card__label">セット数</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {totalVolume.toLocaleString()} kg
                            </div>
                            <div className="stat-card__label">総ボリューム</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {Math.round((sets.filter(s => s.isSuccess).length / sets.length) * 100)}%
                            </div>
                            <div className="stat-card__label">成功率</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-card__value">
                                {['😫', '😕', '😐', '🙂', '😊'][avgCondition - 1] || '😐'}
                            </div>
                            <div className="stat-card__label">体感</div>
                        </div>
                    </div>

                    {/* AI記事生成ボタン */}
                    <button
                        className={`btn btn--full ${generateResult?.type === 'success' ? 'btn--success' : 'btn--primary'}`}
                        onClick={() => handleGenerateArticle(sessions, sets)}
                        disabled={isGenerating}
                        style={{ marginBottom: 'var(--spacing-lg)' }}
                    >
                        {isGenerating ? '🤖 AIが記事を執筆中...' :
                            generateResult?.type === 'success' ? '✅ 記事作成完了！' :
                                '✨ AI記事を作成'}
                    </button>

                    {/* 生成結果 */}
                    {generateResult?.type === 'success' && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-success-bg)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)'
                        }}>
                            <div style={{ color: 'var(--color-success)', marginBottom: 'var(--spacing-sm)' }}>
                                <strong>{generateResult.message}</strong>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-md)' }}>
                                <div>📝 {generateResult.article?.title}</div>
                                <div>⏱ 処理時間: {generateResult.timing?.total}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <a
                                    href={generateResult.wordpress?.editUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn--secondary"
                                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                                >
                                    📝 編集画面
                                </a>
                                <a
                                    href={generateResult.wordpress?.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn--ghost"
                                    style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}
                                >
                                    👁 プレビュー
                                </a>
                            </div>
                        </div>
                    )}

                    {/* 生成エラー */}
                    {generateResult?.type === 'error' && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'var(--color-error-bg)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)',
                            color: 'var(--color-error)'
                        }}>
                            <strong>❌ {generateResult.error}</strong>
                            {generateResult.details && (
                                <div style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)', opacity: 0.8 }}>
                                    {typeof generateResult.details === 'string'
                                        ? generateResult.details
                                        : JSON.stringify(generateResult.details)}
                                </div>
                            )}
                        </div>
                    )}

                    {sessions.length > 1 && (
                        <div style={{
                            color: 'var(--color-text-muted)',
                            fontSize: 'var(--font-size-sm)',
                            textAlign: 'center',
                            marginBottom: 'var(--spacing-md)',
                            padding: 'var(--spacing-sm)',
                            background: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)'
                        }}>
                            📝 この日は {sessions.length} 回のセッションが記録されています
                        </div>
                    )}

                    <p style={{
                        color: 'var(--color-text-muted)',
                        fontSize: 'var(--font-size-sm)',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        タップして編集
                    </p>

                    {/* 種目別 */}
                    {Object.values(setsByExercise).map(({ name, sets: exerciseSets }) => (
                        <div key={name} className="card">
                            <div className="card__header">
                                <h3 className="card__title">{name}</h3>
                                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                                    {exerciseSets.filter(s => s.isSuccess).length}/{exerciseSets.length} 成功
                                </span>
                            </div>
                            <ul className="set-list">
                                {exerciseSets.map((set, index) => (
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

                    {/* セッション管理 */}
                    {sessions.length > 0 && (
                        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <div className="card__header">
                                <h3 className="card__title">セッション管理</h3>
                            </div>
                            {sessions.map((session, index) => (
                                <div
                                    key={session.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-sm) 0',
                                        borderTop: index > 0 ? '1px solid var(--color-border)' : 'none'
                                    }}
                                >
                                    <span style={{ fontSize: 'var(--font-size-sm)' }}>
                                        セッション {index + 1} ({session.sets.length}セット)
                                    </span>
                                    <button
                                        className="btn btn--ghost"
                                        style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}
                                        onClick={() => setShowDeleteConfirm(session.id)}
                                    >
                                        削除
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* 編集モーダル */}
                {editingSet && (
                    <EditSetModal
                        set={editingSet}
                        sessionId={sessions.find(s => s.sets.some(set => set.id === editingSet.id))?.id}
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
                        {sessionsByDate.map(({ date, sessions, sets, totalVolume }) => {
                            const uniqueExercises = [...new Set(sets.map(s => s.exerciseName))];

                            return (
                                <div
                                    key={date}
                                    className="pb-item"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedDate(date)}
                                >
                                    <div>
                                        <div className="pb-item__name" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                            {new Date(date).toLocaleDateString('ja-JP', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                            {sessions.length > 1 && (
                                                <span style={{
                                                    fontSize: 'var(--font-size-xs)',
                                                    background: 'var(--color-accent-muted)',
                                                    color: 'var(--color-accent)',
                                                    padding: '2px 6px',
                                                    borderRadius: 'var(--radius-full)'
                                                }}>
                                                    {sessions.length}回
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {uniqueExercises.slice(0, 3).join(', ')}
                                            {uniqueExercises.length > 3 && ` 他${uniqueExercises.length - 3}種目`}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>
                                            {sets.length}セット
                                        </div>
                                        <div style={{
                                            fontSize: 'var(--font-size-xs)',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {totalVolume.toLocaleString()} kg
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
