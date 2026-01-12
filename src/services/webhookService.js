// Make.com Webhook サービス
// トレーニングログを外部システムに送信する

/**
 * Make.com Webhook にワークアウトログを送信
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

    // 送信データを構築
    const payload = buildPayload(sessionData);

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
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
 * 送信用ペイロードを構築
 * @param {Object} sessionData - セッションデータ
 * @returns {Object} - 送信用データ
 */
function buildPayload(sessionData) {
    const { session, personalBests, settings } = sessionData;

    // 種目別にセットをグループ化
    const exerciseGroups = {};
    session.sets.forEach(set => {
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

    // 総ボリューム計算
    const totalVolume = session.sets.reduce((sum, set) =>
        sum + (set.weight * (set.reps || 1)), 0
    );

    // 成功率計算
    const successRate = session.sets.length > 0
        ? Math.round((session.sets.filter(s => s.isSuccess).length / session.sets.length) * 100)
        : 0;

    return {
        // メタ情報
        meta: {
            timestamp: new Date().toISOString(),
            sessionId: session.id,
            sessionDate: session.date,
            appVersion: '1.2.0'
        },

        // サマリー
        summary: {
            totalSets: session.sets.length,
            totalVolume: totalVolume,
            volumeKg: totalVolume,
            successRate: successRate,
            bodyCondition: session.bodyCondition,
            exerciseCount: Object.keys(exerciseGroups).length
        },

        // 種目別詳細
        exercises: Object.values(exerciseGroups).map(group => ({
            name: group.exerciseName,
            id: group.exerciseId,
            sets: group.sets,
            totalSets: group.sets.length,
            maxWeight: Math.max(...group.sets.map(s => s.weight)),
            minWeight: Math.min(...group.sets.map(s => s.weight)),
            avgRpe: group.sets.reduce((sum, s) => sum + s.rpe, 0) / group.sets.length,
            pb: personalBests[group.exerciseId]?.weight || null
        })),

        // 全セット（生データ）
        rawSets: session.sets.map(set => ({
            exerciseName: set.exerciseName,
            weight: set.weight,
            reps: set.reps || 1,
            rpe: set.rpe,
            isSuccess: set.isSuccess,
            notes: set.notes || '',
            timestamp: set.timestamp
        })),

        // PB情報（更新があれば）
        personalBests: Object.entries(personalBests).map(([id, pb]) => ({
            exerciseId: id,
            weight: pb.weight,
            reps: pb.reps || 1,
            date: pb.date
        })),

        // ノート（セッション全体）
        notes: session.notes || ''
    };
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
