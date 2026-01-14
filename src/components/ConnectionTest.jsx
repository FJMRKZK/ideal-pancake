import { useState } from 'react';

/**
 * WordPress接続テスト＆AI記事生成コンポーネント
 * 検証完了後に削除してください
 */
function ConnectionTest() {
    // 接続テスト用
    const [connectionResult, setConnectionResult] = useState(null);
    const [connectionLoading, setConnectionLoading] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // 記事生成用
    const [titleIdea, setTitleIdea] = useState('');
    const [memo, setMemo] = useState('');
    const [generating, setGenerating] = useState(false);
    const [generateResult, setGenerateResult] = useState(null);
    const [generateError, setGenerateError] = useState(null);

    // WordPress接続テスト
    const testConnection = async () => {
        setConnectionLoading(true);
        setConnectionError(null);
        setConnectionResult(null);

        try {
            const response = await fetch('/api/test-connection');
            const data = await response.json();

            if (data.success) {
                setConnectionResult(data);
            } else {
                setConnectionError(data);
            }
        } catch (err) {
            setConnectionError({
                error: 'リクエスト失敗',
                details: err.message
            });
        } finally {
            setConnectionLoading(false);
        }
    };

    // AI記事生成
    const generateArticle = async () => {
        if (!memo.trim()) {
            alert('メモを入力してください');
            return;
        }

        setGenerating(true);
        setGenerateResult(null);
        setGenerateError(null);

        try {
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titleIdea: titleIdea.trim(),
                    memo: memo.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                setGenerateResult(data);
                // 成功したらフォームをクリア
                setTitleIdea('');
                setMemo('');
            } else {
                setGenerateError(data);
            }
        } catch (err) {
            setGenerateError({
                error: 'リクエスト失敗',
                details: err.message
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{
            margin: '20px',
            padding: '20px',
            background: '#1a1a25',
            borderRadius: '12px',
            border: '2px dashed #ff6b6b',
        }}>
            <h3 style={{ color: '#ff6b6b', margin: '0 0 20px 0' }}>
                🧪 開発用テストパネル
            </h3>

            {/* =============================================== */}
            {/* WordPress接続テスト */}
            {/* =============================================== */}
            <div style={{ marginBottom: '30px' }}>
                <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>1. WordPress接続テスト</h4>

                <button
                    onClick={testConnection}
                    disabled={connectionLoading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        background: connectionLoading ? '#666' : '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: connectionLoading ? 'wait' : 'pointer',
                    }}
                >
                    {connectionLoading ? '接続中...' : '🔌 WordPress接続テスト'}
                </button>

                {connectionResult && (
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#10b98120',
                        borderRadius: '8px',
                        color: '#10b981',
                        fontSize: '14px'
                    }}>
                        ✅ 接続成功: {connectionResult.user?.name}
                    </div>
                )}

                {connectionError && (
                    <div style={{
                        marginTop: '10px',
                        padding: '10px',
                        background: '#ef444420',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '14px'
                    }}>
                        ❌ {connectionError.error}
                    </div>
                )}
            </div>

            {/* =============================================== */}
            {/* AI記事生成 */}
            {/* =============================================== */}
            <div>
                <h4 style={{ color: '#888', margin: '0 0 10px 0' }}>2. AI記事生成 (Gemini Flash)</h4>

                <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>
                        タイトル案（任意）
                    </label>
                    <input
                        type="text"
                        value={titleIdea}
                        onChange={(e) => setTitleIdea(e.target.value)}
                        placeholder="例: 筋トレ初心者向けガイド"
                        disabled={generating}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            background: '#12121a',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', color: '#aaa', fontSize: '12px', marginBottom: '4px' }}>
                        メモ（必須）
                    </label>
                    <textarea
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="記事の元になるメモを入力...&#10;例: 今日はスクワット140kgでPB更新！フォームのポイントは..."
                        disabled={generating}
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '10px',
                            fontSize: '14px',
                            background: '#12121a',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            color: 'white',
                            resize: 'vertical',
                        }}
                    />
                </div>

                <button
                    onClick={generateArticle}
                    disabled={generating || !memo.trim()}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        background: generating ? '#666' : (memo.trim() ? '#10b981' : '#444'),
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: generating ? 'wait' : (memo.trim() ? 'pointer' : 'not-allowed'),
                        width: '100%',
                    }}
                >
                    {generating ? '🤖 AIが執筆中...' : '✨ AI記事作成 (Gemini Flash)'}
                </button>

                {/* 生成成功 */}
                {generateResult && (
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#10b98120',
                        borderRadius: '8px',
                        color: '#10b981'
                    }}>
                        <strong>✅ {generateResult.message}</strong>

                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#ccc' }}>
                            <div><strong>タイトル:</strong> {generateResult.article?.title}</div>
                            <div><strong>抜粋:</strong> {generateResult.article?.excerpt}</div>
                            <div><strong>タグ:</strong> {generateResult.article?.tags?.join(', ')}</div>
                            <div><strong>処理時間:</strong> {generateResult.timing?.total}</div>
                        </div>

                        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                            <a
                                href={generateResult.wordpress?.editUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '8px 16px',
                                    background: '#6366f1',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                }}
                            >
                                📝 編集画面を開く
                            </a>
                            <a
                                href={generateResult.wordpress?.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: '8px 16px',
                                    background: '#333',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                }}
                            >
                                👁 プレビュー
                            </a>
                        </div>
                    </div>
                )}

                {/* 生成エラー */}
                {generateError && (
                    <div style={{
                        marginTop: '15px',
                        padding: '15px',
                        background: '#ef444420',
                        borderRadius: '8px',
                        color: '#ef4444'
                    }}>
                        <strong>❌ エラー: {generateError.error}</strong>
                        {generateError.details && (
                            <pre style={{
                                marginTop: '10px',
                                fontSize: '12px',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                                color: '#f87171'
                            }}>
                                {typeof generateError.details === 'string'
                                    ? generateError.details
                                    : JSON.stringify(generateError.details, null, 2)}
                            </pre>
                        )}
                    </div>
                )}
            </div>

            <p style={{
                marginTop: '20px',
                fontSize: '11px',
                color: '#666'
            }}>
                ※ このコンポーネントは検証用です。テスト完了後に削除してください。
            </p>
        </div>
    );
}

export default ConnectionTest;
