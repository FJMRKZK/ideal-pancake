function PBDialog({ exerciseName, oldPB, newPB, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal__icon">🎉</div>
                <div className="modal__title">PB更新！</div>
                <div className="modal__message">
                    {exerciseName}で自己ベストを更新しました
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 'var(--spacing-lg)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    {oldPB > 0 && (
                        <>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>前回</div>
                                <div style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-secondary)', textDecoration: 'line-through' }}>
                                    {oldPB} kg
                                </div>
                            </div>
                            <div style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--color-accent)' }}>→</div>
                        </>
                    )}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>新記録</div>
                        <div className="modal__highlight" style={{ margin: 0 }}>
                            {newPB} kg
                        </div>
                    </div>
                </div>

                {oldPB > 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: 'var(--color-success)',
                        fontSize: 'var(--font-size-lg)',
                        marginBottom: 'var(--spacing-xl)'
                    }}>
                        +{newPB - oldPB} kg アップ！
                    </div>
                )}

                <div className="modal__actions">
                    <button className="btn btn--secondary" onClick={onCancel}>
                        キャンセル
                    </button>
                    <button className="btn btn--primary" onClick={onConfirm}>
                        PBを更新
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PBDialog;
