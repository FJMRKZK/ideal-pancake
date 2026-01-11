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
                            削除する
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div className="modal__title">セットを編集</div>
                <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    {exercise?.name || set.exerciseName}
                </div>

                {/* 重量 */}
                <div className="input-group">
                    <label className="input-group__label">重量 (kg)</label>
                    <input
                        type="number"
                        className="input"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        step="0.5"
                    />
                </div>

                {/* レップ数 */}
                <div className="input-group">
                    <label className="input-group__label">レップ数</label>
                    <input
                        type="number"
                        className="input"
                        value={reps}
                        onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                        min="1"
                    />
                </div>

                {/* 成功/失敗 */}
                <div className="input-group">
                    <label className="input-group__label">結果</label>
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                        <button
                            className={`btn ${isSuccess ? 'btn--success' : 'btn--secondary'}`}
                            style={{ flex: 1, minHeight: '50px' }}
                            onClick={() => setIsSuccess(true)}
                        >
                            ○ 成功
                        </button>
                        <button
                            className={`btn ${!isSuccess ? 'btn--error' : 'btn--secondary'}`}
                            style={{ flex: 1, minHeight: '50px' }}
                            onClick={() => setIsSuccess(false)}
                        >
                            × 失敗
                        </button>
                    </div>
                </div>

                {/* RPE */}
                <div className="input-group">
                    <label className="input-group__label">RPE</label>
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

                {/* 備考 */}
                <div className="input-group">
                    <label className="input-group__label">備考</label>
                    <textarea
                        className="textarea"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                    />
                </div>

                <div className="modal__actions" style={{ marginTop: 'var(--spacing-lg)' }}>
                    <button
                        className="btn"
                        style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        削除
                    </button>
                    <button className="btn btn--secondary" onClick={onClose}>
                        キャンセル
                    </button>
                    <button className="btn btn--primary" onClick={handleSave}>
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EditSetModal;
