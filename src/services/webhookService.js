// Make.com Webhook サービス
// トレーニングログを整形済みテキストとして外部システムに送信する

/**
 * Make.com Webhook にワークアウトログを送信（text/plain形式）
 * @param {Object} sessionData - セッションデータ
 * @param {Object} options - オプション
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function sendWorkoutLogToMake(sessionData, options = {}) {
    // Webhook URLを取得（環境変数 > localStorage > オプション）
    const webhookUrl =
        import.meta.env.VITE_MAKE_WEBHOOK_URL ||
        localStorage.getItem('make-webhook-url') ||
        options.webhookUrl;

    if (!webhookUrl) {
        console.warn('Webhook URL is not configured');
        return { success: false, error: 'Webhook URLが設定されていません' };
    }

    // 整形済みテキストを構築
    const formattedText = formatWorkoutData(sessionData);

    // 検証用ログ出力
    console.log('=== Webhook送信データ (text/plain) ===');
    console.log(formattedText);
    console.log('=====================================');

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            body: formattedText,
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        console.log('Webhook sent successfully:', response.status);
        return { success: true };

    } catch (error) {
        console.error('Webhook send failed:', error);
        return {
            success: false,
            error: error.message || 'Webhook送信に失敗しました'
        };
    }
}

/**
 * ワークアウトデータを「キー: 値」形式のテキストに整形
 * @param {Object} sessionData - セッションデータ
 * @returns {string} - 整形済みテキスト
 */
function formatWorkoutData(sessionData) {
    const { session, personalBests } = sessionData;
    const lines = [];

    // === 基本情報 ===
    lines.push('=== トレーニング記録 ===');
    lines.push(`トレーニング日: ${formatDate(session.date)}`);
    lines.push(`体感: ${getConditionLabel(session.bodyCondition)}`);
    lines.push(`総セット数: ${session.sets.length}`);

    // 総ボリューム計算
    const totalVolume = session.sets.reduce((sum, set) =>
        sum + (set.weight * (set.reps || 1)), 0
    );
    lines.push(`総ボリューム: ${totalVolume.toLocaleString()} kg`);

    // 成功率計算
    const successCount = session.sets.filter(s => s.isSuccess).length;
    const successRate = session.sets.length > 0
        ? Math.round((successCount / session.sets.length) * 100)
        : 0;
    lines.push(`成功率: ${successRate}% (${successCount}/${session.sets.length})`);

    lines.push('');

    // === 種目別詳細 ===
    lines.push('=== 種目別詳細 ===');

    // 種目ごとにグループ化
    const exerciseGroups = {};
    session.sets.forEach(set => {
        if (!exerciseGroups[set.exerciseId]) {
            exerciseGroups[set.exerciseId] = {
                exerciseId: set.exerciseId,
                exerciseName: set.exerciseName,
                sets: []
            };
        }
        exerciseGroups[set.exerciseId].sets.push(set);
    });

    // 各種目をループ
    Object.values(exerciseGroups).forEach(group => {
        const currentPB = personalBests[group.exerciseId];
        const successfulSets = group.sets.filter(s => s.isSuccess);
        const maxSuccessWeight = successfulSets.length > 0
            ? Math.max(...successfulSets.map(s => s.weight))
            : 0;

        // PB更新判定
        const isPBUpdate = currentPB && maxSuccessWeight >= currentPB.weight;
        const pbLabel = isPBUpdate ? ' [PB!]' : '';

        lines.push('');
        lines.push(`【${group.exerciseName}】${pbLabel}`);

        // 各セットを出力
        group.sets.forEach((set, index) => {
            const result = set.isSuccess ? '○' : '×';
            const repsText = (set.reps && set.reps > 1) ? `×${set.reps}` : '';
            const noteText = set.notes ? ` (${set.notes})` : '';
            lines.push(`  セット${index + 1}: ${set.weight}kg${repsText} RPE${set.rpe} ${result}${noteText}`);
        });

        // PB情報
        if (currentPB) {
            const pbRepsText = currentPB.reps > 1 ? `×${currentPB.reps}` : '';
            lines.push(`  現在のPB: ${currentPB.weight}kg${pbRepsText}`);
        }
    });

    lines.push('');

    // === PB更新情報 ===
    const pbUpdates = Object.values(exerciseGroups).filter(group => {
        const currentPB = personalBests[group.exerciseId];
        const successfulSets = group.sets.filter(s => s.isSuccess);
        const maxSuccessWeight = successfulSets.length > 0
            ? Math.max(...successfulSets.map(s => s.weight))
            : 0;
        return currentPB && maxSuccessWeight >= currentPB.weight;
    });

    if (pbUpdates.length > 0) {
        lines.push('=== PB更新 ===');
        pbUpdates.forEach(group => {
            const pb = personalBests[group.exerciseId];
            const repsText = pb.reps > 1 ? `×${pb.reps}` : '';
            lines.push(`${group.exerciseName}: ${pb.weight}kg${repsText} [PB!]`);
        });
        lines.push('');
    }

    // === 備考 ===
    if (session.notes) {
        lines.push('=== 備考 ===');
        lines.push(session.notes);
        lines.push('');
    }

    // タイムスタンプ
    lines.push(`送信日時: ${new Date().toLocaleString('ja-JP')}`);

    return lines.join('\n');
}

/**
 * 日付をフォーマット
 * @param {string} dateString - ISO日付文字列
 * @returns {string}
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
}

/**
 * 体感ラベルを取得
 * @param {number} condition - 体感値 (1-5)
 * @returns {string}
 */
function getConditionLabel(condition) {
    const labels = {
        1: '😫 最悪',
        2: '😕 悪い',
        3: '😐 普通',
        4: '🙂 良い',
        5: '😊 最高'
    };
    return labels[condition] || '😐 普通';
}

/**
 * Webhook URLの検証
 * @param {string} url - 検証するURL
 * @returns {boolean}
 */
export function isValidWebhookUrl(url) {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
}

/**
 * Webhook URLを保存
 * @param {string} url - 保存するURL
 */
export function saveWebhookUrl(url) {
    if (url) {
        localStorage.setItem('make-webhook-url', url);
    } else {
        localStorage.removeItem('make-webhook-url');
    }
}

/**
 * Webhook URLを取得
 * @returns {string|null}
 */
export function getWebhookUrl() {
    return import.meta.env.VITE_MAKE_WEBHOOK_URL ||
        localStorage.getItem('make-webhook-url') ||
        null;
}
