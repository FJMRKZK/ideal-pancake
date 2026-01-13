import { useState, useMemo, useEffect } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { EXERCISES, CATEGORIES, getExerciseById, searchExercises } from '../data/exercises';
import WeightInput from './WeightInput';
import NumpadModal from './NumpadModal';
import PBDialog from './PBDialog';
import SetList from './SetList';
import RestTimer, { requestNotificationPermission } from './RestTimer';

function WorkoutRecorder({ onEnd, onBack }) {
    const {
        state,
        addSet,
        updatePB,
        updateSessionDate,
        toggleFavorite,
        addRecentExercise
    } = useWorkout();

    // 入力状態
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [weight, setWeight] = useState(60);
    const [reps, setReps] = useState(1);
    const [rpe, setRpe] = useState(7);
    const [bodyCondition, setBodyCondition] = useState(3);
    const [notes, setNotes] = useState('');

    // セッション日付を安全に初期化
    const getInitialDate = () => {
        try {
            if (state.currentSession?.date) {
                return new Date(state.currentSession.date).toISOString().split('T')[0];
            }
        } catch (e) {
            console.warn('Date initialization error:', e);
        }
        return new Date().toISOString().split('T')[0];
    };
    const [sessionDate, setSessionDate] = useState(getInitialDate);

    // UI状態
    const [searchQuery, setSearchQuery] = useState('');
    const [showExerciseList, setShowExerciseList] = useState(false);
    const [showNumpad, setShowNumpad] = useState(false);
    const [pbDialogData, setPbDialogData] = useState(null);
    const [showTimer, setShowTimer] = useState(false);
    const [showQuickSelect, setShowQuickSelect] = useState(true);

    // 通知許可をリクエスト
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    // 日付変更時にセッション更新
    useEffect(() => {
        if (sessionDate) {
            const newDate = new Date(sessionDate);
            newDate.setHours(12, 0, 0, 0);
            updateSessionDate(newDate.toISOString());
        }
    }, [sessionDate]);

    // 全種目（カスタム含む）
    const allExercises = useMemo(() => {
        return [...EXERCISES, ...state.customExercises];
    }, [state.customExercises]);

    // 現在のセッションのセット
    const currentSets = state.currentSession?.sets || [];

    // 選択中の種目のセット（今日）
    const exerciseSets = useMemo(() => {
        if (!selectedExercise) return [];
        return currentSets.filter(set => set.exerciseId === selectedExercise.id);
    }, [currentSets, selectedExercise]);

    // お気に入り種目
    const favoriteExercises = useMemo(() => {
        return allExercises.filter(ex => state.favoriteExercises.includes(ex.id));
    }, [allExercises, state.favoriteExercises]);

    // 最近使用した種目
    const recentExercises = useMemo(() => {
        return state.recentExercises
            .map(id => allExercises.find(ex => ex.id === id))
            .filter(Boolean);
    }, [allExercises, state.recentExercises]);

    // 検索結果
    const filteredExercises = useMemo(() => {
        if (!searchQuery) {
            return allExercises;
        }
        const lowerQuery = searchQuery.toLowerCase();
        return allExercises.filter(ex =>
            ex.name.toLowerCase().includes(lowerQuery) ||
            ex.id.toLowerCase().includes(lowerQuery)
        );
    }, [allExercises, searchQuery]);

    // 現在のPB
    const currentPB = selectedExercise
        ? state.personalBests[selectedExercise.id]?.weight || 0
        : 0;

    // 重量プリセット
    const weightPresets = [40, 60, 80, 100, 120, 140];

    // 前セットをコピー
    const copyLastSet = () => {
        if (exerciseSets.length > 0) {
            const lastSet = exerciseSets[exerciseSets.length - 1];
            setWeight(lastSet.weight);
            setReps(lastSet.reps || 1);
            setRpe(lastSet.rpe);
        }
    };

    // セット記録（成功/失敗） - タイマー自動起動を削除
    const recordSet = (isSuccess) => {
        if (!selectedExercise) return;
        if (!state.currentSession) {
            console.error('No active session');
            return;
        }

        // バイブレーション
        if ('vibrate' in navigator && state.settings.enableVibration) {
            navigator.vibrate(isSuccess ? [100] : [50, 50, 50]);
        }

        const setData = {
            exerciseId: selectedExercise.id,
            exerciseName: selectedExercise.name,
            weight,
            reps,
            rpe,
            isSuccess,
            notes: notes.trim()
        };

        try {
            addSet(setData);
            addRecentExercise(selectedExercise.id);

            // PB更新チェック（成功時、PBがなければ何repでもOK、PBがあれば超えた場合）
            if (isSuccess) {
                const existingPB = state.personalBests[selectedExercise.id];
                const shouldOfferPB = !existingPB || weight > existingPB.weight;

                if (shouldOfferPB) {
                    setPbDialogData({
                        exerciseName: selectedExercise.name,
                        exerciseId: selectedExercise.id,
                        oldPB: existingPB?.weight || 0,
                        newPB: weight,
                        reps: reps
                    });
                }
            }
        } catch (error) {
            console.error('Error recording set:', error);
        }

        // メモをクリア
        setNotes('');
    };

    // PB更新確定
    const confirmPBUpdate = () => {
        if (pbDialogData) {
            updatePB(pbDialogData.exerciseId, pbDialogData.newPB, pbDialogData.reps);
            setPbDialogData(null);
        }
    };

    // 種目選択
    const selectExercise = (exercise) => {
        setSelectedExercise(exercise);
        setSearchQuery('');
        setShowExerciseList(false);
        setShowQuickSelect(false);

        // その種目のPBがあれば、初期値を80%くらいに
        const pb = state.personalBests[exercise.id]?.weight;
        if (pb) {
            setWeight(Math.round(pb * 0.8));
        }
    };

    // 保存して終了
    const handleSaveSession = () => {
        if (currentSets.length === 0) {
            if (confirm('セットを記録せずに終了しますか？')) {
                onBack();
            }
            return;
        }
        onEnd();
    };

    return (
        <>
            <header className="header">
                <button className="header__back" onClick={handleSaveSession}>
                    ← 終了
                </button>
                <h1 className="header__title">トレーニング記録</h1>
                {/* タイマーボタン - 常に表示 */}
                <button
                    className="btn btn--ghost"
                    style={{ fontSize: 'var(--font-size-xl)', padding: 'var(--spacing-xs)' }}
                    onClick={() => setShowTimer(true)}
                >
                    ⏱
                </button>
            </header>

            <main className="main">
                {/* 日付選択 */}
                <div className="input-group">
                    <label className="input-group__label">トレーニング日</label>
                    <input
                        type="date"
                        className="input"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                    />
                </div>

                {/* 種目選択 */}
                <div className="input-group exercise-search">
                    <label className="input-group__label">種目</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="種目を検索..."
                        value={selectedExercise ? selectedExercise.name : searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSelectedExercise(null);
                            setShowExerciseList(true);
                            setShowQuickSelect(false);
                        }}
                        onFocus={() => {
                            if (!selectedExercise) {
                                setShowExerciseList(true);
                            }
                        }}
                    />

                    {/* 選択中の種目のお気に入りトグル */}
                    {selectedExercise && (
                        <button
                            className="btn btn--ghost"
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '32px',
                                fontSize: 'var(--font-size-xl)'
                            }}
                            onClick={() => toggleFavorite(selectedExercise.id)}
                        >
                            {state.favoriteExercises.includes(selectedExercise.id) ? '★' : '☆'}
                        </button>
                    )}

                    {showExerciseList && (
                        <ul className="exercise-search__list">
                            {filteredExercises.slice(0, 20).map(exercise => (
                                <li
                                    key={exercise.id}
                                    className="exercise-search__item"
                                    onClick={() => selectExercise(exercise)}
                                >
                                    <div className="exercise-search__item-name">
                                        {state.favoriteExercises.includes(exercise.id) && '★ '}
                                        {exercise.name}
                                    </div>
                                    <div className="exercise-search__item-category">
                                        {exercise.category}
                                        {exercise.isCustom && ' (カスタム)'}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* クイック種目選択 */}
                {showQuickSelect && !selectedExercise && (
                    <>
                        {favoriteExercises.length > 0 && (
                            <div className="card">
                                <div className="card__header">
                                    <h3 className="card__title">★ お気に入り</h3>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    {favoriteExercises.map(ex => (
                                        <button
                                            key={ex.id}
                                            className="btn btn--secondary"
                                            style={{ fontSize: 'var(--font-size-sm)' }}
                                            onClick={() => selectExercise(ex)}
                                        >
                                            {ex.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recentExercises.length > 0 && (
                            <div className="card">
                                <div className="card__header">
                                    <h3 className="card__title">🕐 最近使用</h3>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    {recentExercises.slice(0, 6).map(ex => (
                                        <button
                                            key={ex.id}
                                            className="btn btn--secondary"
                                            style={{ fontSize: 'var(--font-size-sm)' }}
                                            onClick={() => selectExercise(ex)}
                                        >
                                            {ex.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {selectedExercise && (
                    <>
                        {/* 前セットコピー */}
                        {exerciseSets.length > 0 && (
                            <button className="copy-btn" onClick={copyLastSet}>
                                📋 前セットをコピー
                            </button>
                        )}

                        {/* 重量プリセット */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 'var(--spacing-xs)',
                            justifyContent: 'center',
                            marginBottom: 'var(--spacing-md)'
                        }}>
                            {weightPresets.map(preset => (
                                <button
                                    key={preset}
                                    className={`btn ${weight === preset ? 'btn--primary' : 'btn--secondary'}`}
                                    style={{
                                        padding: 'var(--spacing-sm) var(--spacing-md)',
                                        fontSize: 'var(--font-size-sm)',
                                        minWidth: '50px'
                                    }}
                                    onClick={() => setWeight(preset)}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        {/* 重量入力 */}
                        <div className="card">
                            <WeightInput
                                value={weight}
                                onChange={setWeight}
                                pb={currentPB}
                                onNumpadOpen={() => setShowNumpad(true)}
                            />
                        </div>

                        {/* レップ数 */}
                        <div className="input-group">
                            <label className="input-group__label">レップ数</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setReps(Math.max(1, reps - 1))}
                                >
                                    -
                                </button>
                                <span style={{
                                    fontSize: 'var(--font-size-2xl)',
                                    fontWeight: '700',
                                    minWidth: '60px',
                                    textAlign: 'center'
                                }}>
                                    {reps}
                                </span>
                                <button
                                    className="weight-input__btn"
                                    onClick={() => setReps(reps + 1)}
                                >
                                    +
                                </button>
                                {/* クイックレップボタン */}
                                {[1, 2, 3, 5].map(r => (
                                    <button
                                        key={r}
                                        className={`btn ${reps === r ? 'btn--primary' : 'btn--secondary'}`}
                                        style={{ padding: 'var(--spacing-sm)', minWidth: '40px' }}
                                        onClick={() => setReps(r)}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 成功/失敗ボタン */}
                        <div className="result-buttons">
                            <button
                                className="btn btn--success"
                                onClick={() => recordSet(true)}
                            >
                                ○
                            </button>
                            <button
                                className="btn btn--error"
                                onClick={() => recordSet(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* RPE */}
                        <div className="input-group">
                            <label className="input-group__label">RPE（主観的強度）</label>
                            <div className="rpe-selector">
                                {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(value => (
                                    <button
                                        key={value}
                                        className={`rpe-btn ${rpe === value ? 'active' : ''}`}
                                        onClick={() => setRpe(value)}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 体感 */}
                        <div className="input-group">
                            <label className="input-group__label">今日の体感</label>
                            <div className="condition-rating">
                                {['😫', '😕', '😐', '🙂', '😊'].map((emoji, index) => (
                                    <button
                                        key={index}
                                        className={`condition-btn ${bodyCondition === index + 1 ? 'active' : ''}`}
                                        onClick={() => setBodyCondition(index + 1)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* メモ */}
                        <div className="input-group">
                            <label className="input-group__label">備考</label>
                            <textarea
                                className="textarea"
                                placeholder="気づいたことなど..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={2}
                            />
                        </div>

                        {/* 今日のセット一覧 */}
                        {exerciseSets.length > 0 && (
                            <div className="card">
                                <div className="card__header">
                                    <h3 className="card__title">今日のセット</h3>
                                </div>
                                <SetList sets={exerciseSets} showReps={true} />
                            </div>
                        )}
                    </>
                )}

                {!selectedExercise && !showQuickSelect && (
                    <div className="empty-state">
                        <div className="empty-state__icon">🏋️</div>
                        <div className="empty-state__text">
                            種目を選択してトレーニングを記録しましょう
                        </div>
                    </div>
                )}

                {/* 保存ボタン */}
                {currentSets.length > 0 && (
                    <button
                        className="btn btn--primary btn--full btn--lg"
                        onClick={handleSaveSession}
                        style={{ marginTop: 'var(--spacing-xl)' }}
                    >
                        💾 トレーニングを保存 ({currentSets.length}セット)
                    </button>
                )}
            </main>

            {/* テンキーモーダル */}
            {showNumpad && (
                <NumpadModal
                    initialValue={weight}
                    onConfirm={(value) => {
                        setWeight(value);
                        setShowNumpad(false);
                    }}
                    onClose={() => setShowNumpad(false)}
                />
            )}

            {/* PB更新ダイアログ */}
            {pbDialogData && (
                <PBDialog
                    exerciseName={pbDialogData.exerciseName}
                    oldPB={pbDialogData.oldPB}
                    newPB={pbDialogData.newPB}
                    reps={pbDialogData.reps}
                    onConfirm={confirmPBUpdate}
                    onCancel={() => setPbDialogData(null)}
                />
            )}

            {/* レストタイマー */}
            {showTimer && (
                <RestTimer
                    duration={state.settings.restTimerDuration}
                    onComplete={() => setShowTimer(false)}
                    onClose={() => setShowTimer(false)}
                />
            )}
        </>
    );
}

export default WorkoutRecorder;
