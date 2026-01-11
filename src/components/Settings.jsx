import { useState, useRef } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { CATEGORIES } from '../data/exercises';

function Settings({ onBack }) {
    const { state, updateSettings, addCustomExercise, deleteCustomExercise, importData, exportData } = useWorkout();
    const { settings, customExercises } = state;

    const [showAddExercise, setShowAddExercise] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [newExercise, setNewExercise] = useState({
        name: '',
        category: CATEGORIES.ACCESSORY,
        contributions: {}
    });
    const [importError, setImportError] = useState(null);
    const fileInputRef = useRef(null);

    // パスワード変更
    const handlePasswordChange = () => {
        const savedPassword = localStorage.getItem('weightlifting-app-password') || '1111';

        if (currentPassword !== savedPassword) {
            setPasswordError('現在のパスワードが正しくありません');
            return;
        }

        if (newPassword.length < 4) {
            setPasswordError('パスワードは4文字以上で入力してください');
            return;
        }

        localStorage.setItem('weightlifting-app-password', newPassword);
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setPasswordError('');
        alert('パスワードを変更しました');
    };

    // 設定の保存
    const handleSettingChange = (key, value) => {
        updateSettings({ [key]: value });
    };

    // エクスポート
    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weightlifting-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // CSVエクスポート
    const handleExportCSV = () => {
        const { workoutHistory } = state;
        const rows = [['日付', '種目', '重量(kg)', 'レップ数', '成功/失敗', 'RPE', '備考']];

        workoutHistory.forEach(session => {
            session.sets.forEach(set => {
                rows.push([
                    new Date(session.date).toLocaleDateString('ja-JP'),
                    set.exerciseName,
                    set.weight,
                    set.reps || 1,
                    set.isSuccess ? '成功' : '失敗',
                    set.rpe,
                    set.notes || ''
                ]);
            });
        });

        const csv = rows.map(row => row.join(',')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weightlifting-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // インポート
    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            if (!data.workoutHistory || !Array.isArray(data.workoutHistory)) {
                throw new Error('無効なデータ形式です');
            }

            if (confirm(`${data.workoutHistory.length}件のセッションをインポートします。現在のデータは上書きされます。よろしいですか？`)) {
                importData(data);
                setImportError(null);
                alert('インポートが完了しました');
            }
        } catch (error) {
            setImportError('ファイルの読み込みに失敗しました: ' + error.message);
        }

        e.target.value = '';
    };

    // カスタム種目追加
    const handleAddExercise = () => {
        if (!newExercise.name.trim()) return;

        addCustomExercise({
            name: newExercise.name.trim(),
            category: newExercise.category,
            contributions: newExercise.contributions
        });

        setNewExercise({
            name: '',
            category: CATEGORIES.ACCESSORY,
            contributions: {}
        });
        setShowAddExercise(false);
    };

    return (
        <>
            <header className="header">
                <button className="header__back" onClick={onBack}>
                    ← 戻る
                </button>
                <h1 className="header__title">設定</h1>
                <div></div>
            </header>

            <main className="main">
                {/* セキュリティ */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">🔒 セキュリティ</h2>
                    </div>
                    <button
                        className="btn btn--secondary btn--full"
                        onClick={() => setShowPasswordChange(true)}
                    >
                        パスワードを変更
                    </button>
                </div>

                {/* タイマー設定 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">⏱ レストタイマー</h2>
                    </div>

                    <div className="input-group">
                        <label className="input-group__label">タイマー時間</label>
                        <select
                            className="select"
                            value={settings.restTimerDuration}
                            onChange={(e) => handleSettingChange('restTimerDuration', parseInt(e.target.value))}
                        >
                            <option value={0}>オフ</option>
                            <option value={60}>1分</option>
                            <option value={90}>1分30秒</option>
                            <option value={120}>2分</option>
                            <option value={150}>2分30秒</option>
                            <option value={180}>3分</option>
                            <option value={240}>4分</option>
                            <option value={300}>5分</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <input
                                type="checkbox"
                                checked={settings.enableVibration}
                                onChange={(e) => handleSettingChange('enableVibration', e.target.checked)}
                            />
                            バイブレーション
                        </label>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <input
                                type="checkbox"
                                checked={settings.enableSound}
                                onChange={(e) => handleSettingChange('enableSound', e.target.checked)}
                            />
                            サウンド
                        </label>
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                            <input
                                type="checkbox"
                                checked={settings.enableNotification}
                                onChange={(e) => handleSettingChange('enableNotification', e.target.checked)}
                            />
                            通知
                        </label>
                    </div>
                </div>

                {/* データ管理 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">💾 データ管理</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <button className="btn btn--secondary btn--full" onClick={handleExport}>
                            📤 JSONでエクスポート
                        </button>
                        <button className="btn btn--secondary btn--full" onClick={handleExportCSV}>
                            📊 CSVでエクスポート
                        </button>
                        <button
                            className="btn btn--secondary btn--full"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            📥 JSONからインポート
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={handleImport}
                        />

                        {importError && (
                            <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>
                                {importError}
                            </div>
                        )}
                    </div>
                </div>

                {/* カスタム種目 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">🏋️ カスタム種目</h2>
                        <button
                            className="btn btn--ghost"
                            onClick={() => setShowAddExercise(true)}
                        >
                            + 追加
                        </button>
                    </div>

                    {customExercises.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__text">
                                カスタム種目はありません
                            </div>
                        </div>
                    ) : (
                        <div className="pb-list">
                            {customExercises.map(exercise => (
                                <div key={exercise.id} className="pb-item">
                                    <div>
                                        <div className="pb-item__name">{exercise.name}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                            {exercise.category}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn--ghost"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => {
                                            if (confirm(`「${exercise.name}」を削除しますか？`)) {
                                                deleteCustomExercise(exercise.id);
                                            }
                                        }}
                                    >
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* アプリ情報 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">ℹ️ アプリ情報</h2>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <p>Weightlifting Log v1.2.0</p>
                        <p style={{ marginTop: 'var(--spacing-sm)' }}>
                            データはブラウザのローカルストレージに保存されています。
                            定期的にバックアップを取ることをおすすめします。
                        </p>
                    </div>
                </div>
            </main>

            {/* パスワード変更モーダル */}
            {showPasswordChange && (
                <div className="modal-overlay" onClick={() => setShowPasswordChange(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__title">パスワードを変更</div>

                        <div className="input-group">
                            <label className="input-group__label">現在のパスワード</label>
                            <input
                                type="password"
                                className="input"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-group__label">新しいパスワード</label>
                            <input
                                type="password"
                                className="input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="4文字以上"
                            />
                        </div>

                        {passwordError && (
                            <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                                {passwordError}
                            </div>
                        )}

                        <div className="modal__actions">
                            <button className="btn btn--secondary" onClick={() => setShowPasswordChange(false)}>
                                キャンセル
                            </button>
                            <button className="btn btn--primary" onClick={handlePasswordChange}>
                                変更
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* カスタム種目追加モーダル */}
            {showAddExercise && (
                <div className="modal-overlay" onClick={() => setShowAddExercise(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal__title">カスタム種目を追加</div>

                        <div className="input-group">
                            <label className="input-group__label">種目名</label>
                            <input
                                type="text"
                                className="input"
                                value={newExercise.name}
                                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                placeholder="例: スプリットジャーク"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-group__label">カテゴリ</label>
                            <select
                                className="select"
                                value={newExercise.category}
                                onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
                            >
                                {Object.values(CATEGORIES).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal__actions" style={{ marginTop: 'var(--spacing-lg)' }}>
                            <button className="btn btn--secondary" onClick={() => setShowAddExercise(false)}>
                                キャンセル
                            </button>
                            <button
                                className="btn btn--primary"
                                onClick={handleAddExercise}
                                disabled={!newExercise.name.trim()}
                            >
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Settings;
