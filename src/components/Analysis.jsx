import { useMemo, useState } from 'react';
import { useWorkout } from '../context/WorkoutContext';
import { getExerciseById, BODY_PARTS, EXERCISES } from '../data/exercises';

function Analysis({ onBack }) {
    const { state, estimateOneRM } = useWorkout();
    const { workoutHistory, personalBests, customExercises } = state;

    const [selectedExercise, setSelectedExercise] = useState(null);
    const [timeRange, setTimeRange] = useState(30); // 日数

    const allExercises = [...EXERCISES, ...customExercises];

    // 全セットを取得
    const allSets = useMemo(() => {
        return workoutHistory.flatMap(session => session.sets);
    }, [workoutHistory]);

    // 期間内のセッション
    const filteredSessions = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - timeRange);
        return workoutHistory.filter(session => new Date(session.date) >= cutoff);
    }, [workoutHistory, timeRange]);

    const filteredSets = useMemo(() => {
        return filteredSessions.flatMap(session => session.sets);
    }, [filteredSessions]);

    // 強度別成功率を計算
    const successRateByIntensity = useMemo(() => {
        const ranges = [
            { label: '< 75%', min: 0, max: 75 },
            { label: '75-85%', min: 75, max: 85 },
            { label: '85-95%', min: 85, max: 95 },
            { label: '> 95%', min: 95, max: Infinity }
        ];

        return ranges.map(range => {
            const setsInRange = allSets.filter(set => {
                const pb = personalBests[set.exerciseId]?.weight;
                if (!pb) return false;
                const percent = (set.weight / pb) * 100;
                return percent >= range.min && percent < range.max;
            });

            const successCount = setsInRange.filter(set => set.isSuccess).length;
            const totalCount = setsInRange.length;
            const rate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : null;

            return {
                ...range,
                successCount,
                totalCount,
                rate
            };
        });
    }, [allSets, personalBests]);

    // 部位別負荷（ボリューム × 寄与度）
    const bodyPartLoad = useMemo(() => {
        const loads = {};
        Object.keys(BODY_PARTS).forEach(part => {
            loads[part] = 0;
        });

        filteredSets.forEach(set => {
            const exercise = getExerciseById(set.exerciseId) ||
                customExercises.find(e => e.id === set.exerciseId);
            if (exercise && exercise.contributions) {
                const volume = set.weight * (set.reps || 1);
                Object.entries(exercise.contributions).forEach(([part, percent]) => {
                    loads[part] = (loads[part] || 0) + (volume * percent / 100);
                });
            }
        });

        // 最大値で正規化
        const maxLoad = Math.max(...Object.values(loads), 1);
        const normalized = {};
        Object.entries(loads).forEach(([part, load]) => {
            normalized[part] = {
                raw: Math.round(load),
                percent: Math.round((load / maxLoad) * 100)
            };
        });

        return normalized;
    }, [filteredSets, customExercises]);

    // 週間/月間レポート
    const weeklyReport = useMemo(() => {
        const weeks = [];
        for (let i = 0; i < 4; i++) {
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - (i * 7));
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekStart.getDate() - 6);

            const weekSessions = workoutHistory.filter(session => {
                const date = new Date(session.date);
                return date >= weekStart && date <= weekEnd;
            });

            const weekSets = weekSessions.flatMap(s => s.sets);
            const volume = weekSets.reduce((sum, set) =>
                sum + (set.weight * (set.reps || 1)), 0
            );
            const successRate = weekSets.length > 0
                ? Math.round((weekSets.filter(s => s.isSuccess).length / weekSets.length) * 100)
                : 0;

            weeks.push({
                label: i === 0 ? '今週' : `${i}週前`,
                sessions: weekSessions.length,
                sets: weekSets.length,
                volume: Math.round(volume / 1000), // トン
                successRate
            });
        }
        return weeks;
    }, [workoutHistory]);

    // PB履歴（選択種目）
    const pbHistory = useMemo(() => {
        if (!selectedExercise) return [];
        const pb = personalBests[selectedExercise];
        if (!pb) return [];

        const history = [...(pb.history || []), { weight: pb.weight, date: pb.date }]
            .filter(h => h.weight)
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        return history;
    }, [selectedExercise, personalBests]);

    // 疲労度アラート
    const fatigueAlerts = useMemo(() => {
        const alerts = [];
        const threshold = 70; // 70%以上で警告

        Object.entries(bodyPartLoad).forEach(([part, data]) => {
            if (data.percent >= threshold) {
                alerts.push({
                    part,
                    label: BODY_PARTS[part],
                    percent: data.percent
                });
            }
        });

        return alerts.sort((a, b) => b.percent - a.percent);
    }, [bodyPartLoad]);

    // 総セッション数
    const totalSessions = workoutHistory.length;
    const totalSets = allSets.length;
    const overallSuccessRate = allSets.length > 0
        ? Math.round((allSets.filter(s => s.isSuccess).length / allSets.length) * 100)
        : 0;

    // 推定1RM計算（選択種目）
    const estimated1RM = useMemo(() => {
        if (!selectedExercise) return null;

        const exerciseSets = allSets.filter(
            s => s.exerciseId === selectedExercise && s.isSuccess
        );

        if (exerciseSets.length === 0) return null;

        // 各セットの推定1RMを計算し、最大値を返す
        const estimates = exerciseSets.map(set =>
            estimateOneRM(set.weight, set.reps || 1)
        );

        return Math.max(...estimates);
    }, [selectedExercise, allSets, estimateOneRM]);

    return (
        <>
            <header className="header">
                <button className="header__back" onClick={onBack}>
                    ← 戻る
                </button>
                <h1 className="header__title">分析</h1>
                <div></div>
            </header>

            <main className="main">
                {/* 概要 */}
                <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <div className="stat-card">
                        <div className="stat-card__value">{totalSessions}</div>
                        <div className="stat-card__label">総セッション</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{totalSets}</div>
                        <div className="stat-card__label">総セット数</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{overallSuccessRate}%</div>
                        <div className="stat-card__label">成功率</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__value">{Object.keys(personalBests).length}</div>
                        <div className="stat-card__label">PB登録種目</div>
                    </div>
                </div>

                {/* 疲労度アラート */}
                {fatigueAlerts.length > 0 && (
                    <div className="card" style={{
                        background: 'var(--color-warning-bg)',
                        borderColor: 'var(--color-warning)'
                    }}>
                        <div className="card__header">
                            <h2 className="card__title" style={{ color: 'var(--color-warning)' }}>
                                ⚠️ 疲労度アラート
                            </h2>
                        </div>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                            以下の部位に負荷が集中しています（{timeRange}日間）
                        </p>
                        <div style={{ marginTop: 'var(--spacing-sm)' }}>
                            {fatigueAlerts.map(alert => (
                                <div key={alert.part} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    padding: 'var(--spacing-xs) 0'
                                }}>
                                    <span>{alert.label}</span>
                                    <span style={{ color: 'var(--color-warning)', fontWeight: '600' }}>
                                        {alert.percent}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 週間レポート */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">📊 週間レポート</h2>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
                            <thead>
                                <tr style={{ color: 'var(--color-text-secondary)' }}>
                                    <th style={{ textAlign: 'left', padding: 'var(--spacing-sm)' }}>期間</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>セッション</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>セット</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>ボリューム</th>
                                    <th style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>成功率</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeklyReport.map((week, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: 'var(--spacing-sm)' }}>{week.label}</td>
                                        <td style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>{week.sessions}</td>
                                        <td style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>{week.sets}</td>
                                        <td style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>{week.volume}t</td>
                                        <td style={{ textAlign: 'center', padding: 'var(--spacing-sm)' }}>{week.successRate}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 強度別成功率 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">🎯 強度別成功率</h2>
                    </div>

                    {allSets.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__text">データがありません</div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            {successRateByIntensity.map(item => (
                                <div key={item.label}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: 'var(--spacing-xs)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}>
                                        <span>{item.label}</span>
                                        <span>
                                            {item.rate !== null ? `${item.rate}% (${item.successCount}/${item.totalCount})` : '-'}
                                        </span>
                                    </div>
                                    <div style={{
                                        height: '8px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-full)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${item.rate || 0}%`,
                                            height: '100%',
                                            background: item.rate !== null
                                                ? item.rate >= 80
                                                    ? 'var(--color-success)'
                                                    : item.rate >= 50
                                                        ? 'var(--color-warning)'
                                                        : 'var(--color-error)'
                                                : 'var(--color-bg-tertiary)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 種目別分析 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">📈 種目別分析</h2>
                    </div>

                    <div className="input-group">
                        <select
                            className="select"
                            value={selectedExercise || ''}
                            onChange={(e) => setSelectedExercise(e.target.value || null)}
                        >
                            <option value="">種目を選択...</option>
                            {Object.keys(personalBests).map(id => {
                                const ex = allExercises.find(e => e.id === id);
                                return ex ? (
                                    <option key={id} value={id}>{ex.name}</option>
                                ) : null;
                            })}
                        </select>
                    </div>

                    {selectedExercise && (
                        <>
                            <div className="stats-grid" style={{ marginTop: 'var(--spacing-md)' }}>
                                <div className="stat-card">
                                    <div className="stat-card__value">{personalBests[selectedExercise]?.weight || 0}</div>
                                    <div className="stat-card__label">現在PB (kg)</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-card__value">{estimated1RM || '-'}</div>
                                    <div className="stat-card__label">推定1RM (kg)</div>
                                </div>
                            </div>

                            {/* PB履歴グラフ（シンプル版） */}
                            {pbHistory.length > 1 && (
                                <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                    <h4 style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-sm)' }}>
                                        PB推移
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px' }}>
                                        {pbHistory.map((record, i) => {
                                            const maxWeight = Math.max(...pbHistory.map(r => r.weight));
                                            const height = (record.weight / maxWeight) * 100;
                                            return (
                                                <div
                                                    key={i}
                                                    style={{
                                                        flex: 1,
                                                        height: `${height}%`,
                                                        background: 'var(--color-accent)',
                                                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                                        minWidth: '20px'
                                                    }}
                                                    title={`${record.weight}kg - ${new Date(record.date).toLocaleDateString('ja-JP')}`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--color-text-muted)',
                                        marginTop: 'var(--spacing-xs)'
                                    }}>
                                        <span>{new Date(pbHistory[0].date).toLocaleDateString('ja-JP', { month: 'short' })}</span>
                                        <span>現在</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 部位別負荷 */}
                <div className="card">
                    <div className="card__header">
                        <h2 className="card__title">🔥 部位別負荷</h2>
                        <select
                            className="select"
                            style={{ width: 'auto', padding: 'var(--spacing-xs) var(--spacing-sm)' }}
                            value={timeRange}
                            onChange={(e) => setTimeRange(parseInt(e.target.value))}
                        >
                            <option value={7}>7日間</option>
                            <option value={30}>30日間</option>
                            <option value={90}>90日間</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-sm)' }}>
                        {Object.entries(BODY_PARTS).map(([key, label]) => (
                            <div
                                key={key}
                                style={{
                                    padding: 'var(--spacing-sm)',
                                    background: `rgba(99, 102, 241, ${bodyPartLoad[key]?.percent / 100 * 0.5 || 0})`,
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>{label}</div>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                    {bodyPartLoad[key]?.percent || 0}% ({((bodyPartLoad[key]?.raw || 0) / 1000).toFixed(1)}t)
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}

export default Analysis;
