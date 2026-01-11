// 種目マスタデータ
// 寄与度は各部位への負荷割合（合計100%）

export const BODY_PARTS = {
    shoulder: '肩',
    back: '背',
    quads: '四頭',
    hamstring: 'ハム',
    glutes: '尻',
    traps: '僧帽',
    arms: '腕',
    chest: '胸',
    calves: 'ふくらはぎ',
    adductors: '内転筋'
};

export const CATEGORIES = {
    SNATCH: 'スナッチ系',
    CLEAN: 'クリーン系',
    JERK: 'ジャーク系',
    SQUAT: 'スクワット系',
    PULL: 'プル系',
    ACCESSORY: '補助種目',
    MACHINE: 'マシン'
};

export const EXERCISES = [
    // スナッチ系
    {
        id: 'power-snatch',
        name: 'パワースナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 15, back: 20, quads: 20, hamstring: 15, glutes: 15, traps: 10, arms: 5 }
    },
    {
        id: 'muscle-snatch',
        name: 'マッスルスナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 25, back: 15, traps: 20, arms: 25, hamstring: 5, glutes: 10 }
    },
    {
        id: 'hang-snatch',
        name: 'ハングスナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { back: 20, quads: 15, hamstring: 20, glutes: 20, traps: 15, shoulder: 10 }
    },
    {
        id: 'block-snatch',
        name: 'ブロックスナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 10, back: 20, quads: 25, hamstring: 10, glutes: 20, traps: 15 }
    },
    {
        id: 'snatch-pull',
        name: 'スナッチプル',
        category: CATEGORIES.PULL,
        contributions: { back: 25, hamstring: 20, glutes: 20, traps: 25, quads: 10 }
    },
    {
        id: 'snatch-high-pull',
        name: 'スナッチハイプル',
        category: CATEGORIES.PULL,
        contributions: { back: 20, traps: 30, arms: 15, shoulder: 15, hamstring: 10, glutes: 10 }
    },
    {
        id: 'deficit-snatch-pull',
        name: 'デフィシット・スナッチプル',
        category: CATEGORIES.PULL,
        contributions: { back: 25, hamstring: 25, glutes: 20, quads: 20, traps: 10 }
    },
    {
        id: 'halting-snatch-pull',
        name: 'ハルティング・スナッチプル',
        category: CATEGORIES.PULL,
        contributions: { back: 35, glutes: 20, hamstring: 20, quads: 15, traps: 10 }
    },
    {
        id: 'overhead-squat',
        name: 'オーバーヘッドスクワット',
        category: CATEGORIES.SQUAT,
        contributions: { shoulder: 20, back: 20, quads: 30, glutes: 20, hamstring: 10 }
    },
    {
        id: 'snatch-balance',
        name: 'スナッチバランス',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 25, back: 15, quads: 30, glutes: 20, arms: 10 }
    },
    {
        id: 'heaving-snatch-balance',
        name: 'ヘービング・スナッチバランス',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 20, quads: 30, glutes: 20, back: 15, arms: 15 }
    },
    {
        id: 'sots-press',
        name: 'ソッツプレス',
        category: CATEGORIES.ACCESSORY,
        contributions: { shoulder: 35, back: 25, quads: 20, arms: 20 }
    },
    {
        id: 'snatch-grip-push-press',
        name: 'スナッチG・プッシュプレス',
        category: CATEGORIES.ACCESSORY,
        contributions: { shoulder: 30, quads: 25, arms: 20, glutes: 15, traps: 10 }
    },
    {
        id: 'tall-snatch',
        name: 'トールスナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { shoulder: 20, traps: 25, arms: 25, back: 15, glutes: 15 }
    },
    {
        id: 'no-foot-snatch',
        name: 'ノーフット・スナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { back: 20, quads: 20, hamstring: 20, glutes: 20, shoulder: 10, traps: 10 }
    },
    {
        id: 'no-hook-snatch',
        name: 'ノーフック・スナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { back: 20, arms: 30, quads: 15, hamstring: 15, glutes: 10, traps: 10 }
    },
    {
        id: 'pause-snatch',
        name: 'ポーズ・スナッチ',
        category: CATEGORIES.SNATCH,
        contributions: { back: 30, quads: 20, hamstring: 15, glutes: 20, traps: 10, shoulder: 5 }
    },
    {
        id: 'snatch-grip-deadlift',
        name: 'スナッチG・デッドリフト',
        category: CATEGORIES.PULL,
        contributions: { back: 30, hamstring: 25, glutes: 25, quads: 15, traps: 5 }
    },
    {
        id: 'snatch-grip-rdl',
        name: 'スナッチG・RDL',
        category: CATEGORIES.PULL,
        contributions: { hamstring: 45, glutes: 30, back: 25 }
    },
    {
        id: 'panda-pull',
        name: 'パンダプル',
        category: CATEGORIES.PULL,
        contributions: { traps: 25, back: 20, quads: 25, glutes: 15, arms: 15 }
    },
    {
        id: 'overhead-carry',
        name: 'オーバーヘッドキャリー',
        category: CATEGORIES.ACCESSORY,
        contributions: { shoulder: 40, back: 30, traps: 20, arms: 10 }
    },
    // クリーン系
    {
        id: 'power-clean',
        name: 'パワークリーン',
        category: CATEGORIES.CLEAN,
        contributions: { quads: 25, glutes: 20, back: 20, hamstring: 15, traps: 15, arms: 5 }
    },
    {
        id: 'muscle-clean',
        name: 'マッスルクリーン',
        category: CATEGORIES.CLEAN,
        contributions: { arms: 30, traps: 25, back: 20, shoulder: 15, glutes: 10 }
    },
    {
        id: 'hang-clean',
        name: 'ハングクリーン',
        category: CATEGORIES.CLEAN,
        contributions: { hamstring: 25, glutes: 25, back: 20, quads: 15, traps: 15 }
    },
    {
        id: 'block-clean',
        name: 'ブロッククリーン',
        category: CATEGORIES.CLEAN,
        contributions: { quads: 30, glutes: 20, back: 20, traps: 20, hamstring: 10 }
    },
    {
        id: 'clean-pull',
        name: 'クリーンプル',
        category: CATEGORIES.PULL,
        contributions: { back: 25, hamstring: 20, glutes: 20, traps: 25, quads: 10 }
    },
    {
        id: 'clean-high-pull',
        name: 'クリーンハイプル',
        category: CATEGORIES.PULL,
        contributions: { traps: 30, arms: 20, back: 20, shoulder: 10, hamstring: 10, glutes: 10 }
    },
    {
        id: 'deficit-clean-pull',
        name: 'デフィシット・クリーンプル',
        category: CATEGORIES.PULL,
        contributions: { quads: 25, hamstring: 25, back: 20, glutes: 20, traps: 10 }
    },
    {
        id: 'halting-clean-deadlift',
        name: 'ハルティング・C・デッドリフト',
        category: CATEGORIES.PULL,
        contributions: { back: 40, hamstring: 20, glutes: 20, quads: 20 }
    },
    // スクワット系
    {
        id: 'front-squat',
        name: 'フロントスクワット',
        category: CATEGORIES.SQUAT,
        contributions: { quads: 50, glutes: 20, back: 20, hamstring: 10 }
    },
    {
        id: 'pause-front-squat',
        name: 'ポーズ・フロントスクワット',
        category: CATEGORIES.SQUAT,
        contributions: { quads: 45, glutes: 25, back: 25, hamstring: 5 }
    },
    {
        id: 'anderson-squat',
        name: 'アンダーソンスクワット',
        category: CATEGORIES.SQUAT,
        contributions: { quads: 55, glutes: 25, back: 20 }
    },
    {
        id: 'back-squat-high',
        name: 'バックスクワット（ハイバー）',
        category: CATEGORIES.SQUAT,
        contributions: { quads: 40, glutes: 30, back: 15, hamstring: 15 }
    },
    {
        id: 'back-squat-low',
        name: 'バックスクワット（ローバー）',
        category: CATEGORIES.SQUAT,
        contributions: { glutes: 40, hamstring: 25, back: 20, quads: 15 }
    },
    // ジャーク系
    {
        id: 'push-press',
        name: 'プッシュプレス',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 30, quads: 30, arms: 15, glutes: 15, traps: 10 }
    },
    {
        id: 'military-press',
        name: 'ミリタリープレス',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 45, arms: 30, back: 15, chest: 10 }
    },
    {
        id: 'power-jerk',
        name: 'パワージャーク',
        category: CATEGORIES.JERK,
        contributions: { quads: 35, shoulder: 25, glutes: 20, arms: 10, back: 10 }
    },
    {
        id: 'behind-neck-jerk',
        name: 'ビハインドネック・ジャーク',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 30, quads: 30, glutes: 20, arms: 20 }
    },
    {
        id: 'jerk-balance',
        name: 'ジャークバランス',
        category: CATEGORIES.JERK,
        contributions: { quads: 40, glutes: 20, shoulder: 20, arms: 10, back: 10 }
    },
    {
        id: 'tall-jerk',
        name: 'トールジャーク',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 30, arms: 30, glutes: 20, back: 20 }
    },
    {
        id: 'jerk-recovery',
        name: 'ジャークリカバリー',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 35, back: 25, quads: 20, glutes: 20 }
    },
    {
        id: 'drop-jerk',
        name: 'ドロップジャーク',
        category: CATEGORIES.JERK,
        contributions: { shoulder: 30, back: 20, glutes: 25, arms: 25 }
    },
    // コンプレックス
    {
        id: 'clean-fs-jerk',
        name: 'C+FS+J (コンプレックス)',
        category: CATEGORIES.CLEAN,
        isComplex: true,
        complexParts: ['clean', 'front-squat', 'jerk'],
        contributions: { quads: 35, glutes: 20, back: 15, shoulder: 10, hamstring: 10, traps: 5, arms: 5 }
    },
    {
        id: 'clean-deadlift',
        name: 'クリーンデッドリフト',
        category: CATEGORIES.PULL,
        contributions: { back: 30, glutes: 25, hamstring: 25, quads: 20 }
    },
    {
        id: 'overhead-lunge',
        name: 'オーバーヘッドランジ',
        category: CATEGORIES.ACCESSORY,
        contributions: { quads: 35, glutes: 30, shoulder: 20, back: 15 }
    },
    // 補助種目（フリーウェイト）
    {
        id: 'bench-press',
        name: 'ベンチプレス',
        category: CATEGORIES.ACCESSORY,
        contributions: { chest: 60, shoulder: 25, arms: 15 }
    },
    {
        id: 'overhead-press',
        name: 'オーバーヘッドプレス（立位）',
        category: CATEGORIES.ACCESSORY,
        contributions: { shoulder: 45, arms: 25, back: 15, glutes: 10, chest: 5 }
    },
    {
        id: 'bent-over-row',
        name: 'ベントオーバーロー',
        category: CATEGORIES.ACCESSORY,
        contributions: { back: 40, traps: 20, arms: 20, hamstring: 10, glutes: 10 }
    },
    {
        id: 'pull-up',
        name: '懸垂（プルアップ）',
        category: CATEGORIES.ACCESSORY,
        contributions: { back: 50, arms: 30, traps: 20 }
    },
    {
        id: 'romanian-deadlift',
        name: 'ルーマニアンデッドリフト',
        category: CATEGORIES.ACCESSORY,
        contributions: { hamstring: 50, glutes: 35, back: 15 }
    },
    {
        id: 'barbell-shrug',
        name: 'バーベルシュラッグ',
        category: CATEGORIES.ACCESSORY,
        contributions: { traps: 80, arms: 10, back: 10 }
    },
    {
        id: 'dumbbell-side-raise',
        name: 'ダンベル・サイドレイズ',
        category: CATEGORIES.ACCESSORY,
        contributions: { shoulder: 80, traps: 20 }
    },
    {
        id: 'triceps-extension',
        name: 'ライイング・トリセプス・エクステンション',
        category: CATEGORIES.ACCESSORY,
        contributions: { arms: 100 }
    },
    {
        id: 'bicep-curl',
        name: 'バーベル・バイセップカール',
        category: CATEGORIES.ACCESSORY,
        contributions: { arms: 100 }
    },
    {
        id: 'good-morning',
        name: 'グッドモーニング',
        category: CATEGORIES.ACCESSORY,
        contributions: { back: 30, hamstring: 40, glutes: 30 }
    },
    {
        id: 'dips',
        name: 'ディップス',
        category: CATEGORIES.ACCESSORY,
        contributions: { chest: 40, arms: 40, shoulder: 20 }
    },
    // マシン系
    {
        id: 'leg-press',
        name: 'レッグプレス',
        category: CATEGORIES.MACHINE,
        contributions: { quads: 60, glutes: 25, hamstring: 15 }
    },
    {
        id: 'hack-squat',
        name: 'ハックスクワット',
        category: CATEGORIES.MACHINE,
        contributions: { quads: 75, glutes: 20, hamstring: 5 }
    },
    {
        id: 'leg-extension',
        name: 'レッグエクステンション',
        category: CATEGORIES.MACHINE,
        contributions: { quads: 100 }
    },
    {
        id: 'leg-curl',
        name: 'レッグカール',
        category: CATEGORIES.MACHINE,
        contributions: { hamstring: 100 }
    },
    {
        id: 'lat-pulldown',
        name: 'ラットプルダウン',
        category: CATEGORIES.MACHINE,
        contributions: { back: 55, arms: 30, traps: 15 }
    },
    {
        id: 'seated-row',
        name: 'シーテッドロー',
        category: CATEGORIES.MACHINE,
        contributions: { back: 45, traps: 30, arms: 25 }
    },
    {
        id: 'cable-face-pull',
        name: 'ケーブル・フェイスプル',
        category: CATEGORIES.MACHINE,
        contributions: { traps: 40, shoulder: 30, back: 30 }
    },
    {
        id: 'hip-adduction',
        name: 'ヒップアダクション',
        category: CATEGORIES.MACHINE,
        contributions: { adductors: 100 }
    },
    {
        id: 'back-extension',
        name: 'バックエクステンション',
        category: CATEGORIES.MACHINE,
        contributions: { back: 40, glutes: 30, hamstring: 30 }
    },
    {
        id: 'calf-raise',
        name: 'カーフレイズ',
        category: CATEGORIES.MACHINE,
        contributions: { calves: 100 }
    }
];

// 種目IDで検索
export const getExerciseById = (id) => EXERCISES.find(ex => ex.id === id);

// カテゴリでフィルタリング
export const getExercisesByCategory = (category) => EXERCISES.filter(ex => ex.category === category);

// 種目名で検索（部分一致）
export const searchExercises = (query) => {
    const lowerQuery = query.toLowerCase();
    return EXERCISES.filter(ex =>
        ex.name.toLowerCase().includes(lowerQuery) ||
        ex.id.toLowerCase().includes(lowerQuery)
    );
};
