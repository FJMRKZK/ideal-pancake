import { useState } from 'react';
import { getExerciseById } from '../data/exercises';

function EditSetModal({ set, sessionId, onSave, onDelete, onClose }) {
    const [weight, setWeight] = useState(set.weight);
    const [reps, setReps] = useState(set.reps || 1);
    const [rpe, setRpe] = useState(set.rpe);
    const [isSuccess, setIsSuccess] = useState(set.isSuccess);
    const [notes, setNotes] = useState(set.notes || '');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const exercise = getExerciseById(set.exerciseId);

    const handleSave = () => {
        onSave(sessionId, set.id, {
            weight,
            reps,
            rpe,
            isSuccess,
            notes
        });
        onClose();
    };

    const handleDelete = () => {
        onDelete(sessionId, set.id);
        onClose();
    };

    // 重量調整
    const adjustWeight = (delta) => {
        setWeight(Math.max(0, weight + delta));
    };

    if (showDeleteConfirm) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal__icon">⚠️</div>
                    <div className="modal__title">セットを削除しますか？</div>
                    <div className="modal__message">
                        {exercise?.name || set.exerciseName} - {set.weight}kg
                        <br />
                        この操作は取り消せません
                    </div>
                    <div className="modal__actions">
                        <button className="btn btn--secondary" onClick={() => setShowDeleteConfirm(false)}>
                            キャンセル
                        </button>
                        <button
                            className="btn"
                            style={{ background: 'var(--color-error)', color: 'white' }}
                            onClick={handleDelete}
                        >
                            削除
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%' }}>
                <div className="modal__title">セットを編集</div>
                <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)' }}>
                    {exercise?.name || set.exerciseName}
                </div>

                {/* 重量（スワイプ式） */}
                <div className="input-group">
                    <label className="input-group__label">重量 (kg)</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-xs)' }}>
                        <button
                            className="weight-input__btn"
                            onClick={() => adjustWeight(-5)}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            -5
                        </button>
                        <button
                            className="weight-input__btn"
                            onClick={() => adjustWeight(-2.5)}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            -2.5
                        </button>
                        <input
                            type="number"
                            className="input"
                            value={weight}
                            onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                            style={{ width: '80px', textAlign: 'center', fontSize: 'var(--font-size-xl)', fontWeight: '600' }}
                        />
                        <button
                            className="weight-input__btn"
                            onClick={() => adjustWeight(2.5)}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            +2.5
                        </button>
                        <button
                            className="weight-input__btn"
                            onClick={() => adjustWeight(5)}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            +5
                        </button>
                    </div>
                </div>

                {/* レップ数 */}
                <div className="input-group">
                    <label className="input-group__label">レップ数</label>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)' }}>
                        <button
                            className="weight-input__btn"
                            onClick={() => setReps(Math.max(1, reps - 1))}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            -
                        </button>
                        <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
                            {reps}
                        </span>
                        <button
                            className="weight-input__btn"
                            onClick={() => setReps(reps + 1)}
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            +
                        </button>
                        {[1, 2, 3, 5].map(r => (
                            <button
                                key={r}
                                className={`btn ${reps === r ? 'btn--primary' : 'btn--ghost'}`}
                                style={{ padding: '8px 12px', minWidth: '36px', fontSize: 'var(--font-size-sm)' }}
                                onClick={() => setReps(r)}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 成功/失敗（横並び固定） */}
                <div className="input-group">
                    <label className="input-group__label">結果</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                        <button
                            className={`btn ${isSuccess ? 'btn--success' : 'btn--secondary'}`}
                            style={{ minHeight: '44px', fontSize: 'var(--font-size-md)' }}
                            onClick={() => setIsSuccess(true)}
                        >
                            ○ 成功
                        </button>
                        <button
                            className={`btn ${!isSuccess ? 'btn--error' : 'btn--secondary'}`}
                            style={{ minHeight: '44px', fontSize: 'var(--font-size-md)' }}
                            onClick={() => setIsSuccess(false)}
                        >
                            × 失敗
                        </button>
                    </div>
                </div>

                {/* RPE */}
                <div className="input-group">
                    <label className="input-group__label">RPE</label>
                    <div className="rpe-selector" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[6, 7, 8, 9, 10].map(value => (
                            <button
                                key={value}
                                className={`rpe-btn ${rpe === value ? 'active' : ''}`}
                                onClick={() => setRpe(value)}
                                style={{ minWidth: '44px', minHeight: '44px' }}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 備考 */}
                <div className="input-group">
                    <label className="input-group__label">備考</label>
                    <textarea
                        className="textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        style={{ fontSize: 'var(--font-size-md)' }}
                    />
                </div>

                {/* アクションボタン（グリッドで横並び固定） */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 'var(--spacing-sm)',
                    marginTop: 'var(--spacing-lg)'
                }}>
                    <button
                        className="btn"
                        style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        削除
                    </button>
                    <button
                        className="btn btn--secondary"
                        onClick={onClose}
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                        キャンセル
                    </button>
                    <button
                        className="btn btn--primary"
                        onClick={handleSave}
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditSetModal;
