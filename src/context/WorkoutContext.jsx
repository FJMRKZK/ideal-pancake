import { createContext, useContext, useReducer, useEffect } from 'react';

const WorkoutContext = createContext(null);

// 初期状態
const initialState = {
    // 自己ベスト記録 { exerciseId: { weight: number, date: string, history: [] } }
    personalBests: {},
    // ワークアウトセッション履歴
    workoutHistory: [],
    // 現在のセッション
    currentSession: null,
    // お気に入り種目
    favoriteExercises: [],
    // 最近使用した種目（最大10件）
    recentExercises: [],
    // カスタム種目
    customExercises: [],
    // 設定
    settings: {
        defaultRPE: 7,
        defaultReps: 1,
        weightIncrement: 1,
        restTimerDuration: 120, // 秒
        enableVibration: true,
        enableSound: true,
        enableNotification: true
    }
};

// ローカルストレージから読み込み
const loadFromStorage = () => {
    try {
        const saved = localStorage.getItem('weightlifting-app-data');
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...initialState, ...parsed, settings: { ...initialState.settings, ...parsed.settings } };
        }
    } catch (e) {
        console.error('Failed to load data:', e);
    }
    return initialState;
};

// ローカルストレージに保存
const saveToStorage = (state) => {
    try {
        localStorage.setItem('weightlifting-app-data', JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save data:', e);
    }
};

// アクションタイプ
const ACTIONS = {
    START_SESSION: 'START_SESSION',
    END_SESSION: 'END_SESSION',
    UPDATE_SESSION_DATE: 'UPDATE_SESSION_DATE',
    ADD_SET: 'ADD_SET',
    UPDATE_SET: 'UPDATE_SET',
    DELETE_SET: 'DELETE_SET',
    UPDATE_PB: 'UPDATE_PB',
    UPDATE_SETTINGS: 'UPDATE_SETTINGS',
    LOAD_DATA: 'LOAD_DATA',
    // 履歴操作
    UPDATE_HISTORY_SET: 'UPDATE_HISTORY_SET',
    DELETE_HISTORY_SET: 'DELETE_HISTORY_SET',
    DELETE_SESSION: 'DELETE_SESSION',
    // お気に入り・最近使用
    TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
    ADD_RECENT_EXERCISE: 'ADD_RECENT_EXERCISE',
    // カスタム種目
    ADD_CUSTOM_EXERCISE: 'ADD_CUSTOM_EXERCISE',
    DELETE_CUSTOM_EXERCISE: 'DELETE_CUSTOM_EXERCISE',
    // PB削除
    DELETE_PB: 'DELETE_PB',
    // セッションキャンセル
    CANCEL_SESSION: 'CANCEL_SESSION',
    // インポート
    IMPORT_DATA: 'IMPORT_DATA',
    // セット並び替え
    REORDER_HISTORY_SET: 'REORDER_HISTORY_SET'
};

// リデューサー
function workoutReducer(state, action) {
    let newState;

    switch (action.type) {
        case ACTIONS.LOAD_DATA:
            return action.payload;

        case ACTIONS.START_SESSION:
            newState = {
                ...state,
                currentSession: {
                    id: Date.now().toString(),
                    date: action.payload?.date || new Date().toISOString(),
                    sets: [],
                    bodyCondition: 3,
                    notes: ''
                }
            };
            break;

        case ACTIONS.UPDATE_SESSION_DATE:
            if (!state.currentSession) return state;
            newState = {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    date: action.payload
                }
            };
            break;

        case ACTIONS.END_SESSION:
            if (!state.currentSession) return state;

            // 同じ日付のセッションがあるかチェック
            const currentDateKey = new Date(state.currentSession.date).toISOString().split('T')[0];
            const existingSessionIndex = state.workoutHistory.findIndex(session => {
                const sessionDateKey = new Date(session.date).toISOString().split('T')[0];
                return sessionDateKey === currentDateKey;
            });

            if (existingSessionIndex >= 0) {
                // 同じ日付のセッションが存在 → マージ
                const existingSession = state.workoutHistory[existingSessionIndex];
                const mergedSession = {
                    ...existingSession,
                    // セットを結合
                    sets: [...existingSession.sets, ...state.currentSession.sets],
                    // 体調は平均
                    bodyCondition: Math.round(
                        ((existingSession.bodyCondition || 3) + (state.currentSession.bodyCondition || 3)) / 2
                    ),
                    // メモは結合
                    notes: [existingSession.notes, state.currentSession.notes].filter(Boolean).join('\n')
                };

                const updatedHistory = [...state.workoutHistory];
                updatedHistory[existingSessionIndex] = mergedSession;

                newState = {
                    ...state,
                    workoutHistory: updatedHistory,
                    currentSession: null
                };
            } else {
                // 新規セッションとして追加
                newState = {
                    ...state,
                    workoutHistory: [...state.workoutHistory, state.currentSession],
                    currentSession: null
                };
            }
            break;

        case ACTIONS.ADD_SET:
            if (!state.currentSession) return state;
            newState = {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    sets: [...state.currentSession.sets, {
                        id: Date.now().toString(),
                        ...action.payload,
                        timestamp: new Date().toISOString()
                    }]
                }
            };
            break;

        case ACTIONS.UPDATE_SET:
            if (!state.currentSession) return state;
            newState = {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    sets: state.currentSession.sets.map(set =>
                        set.id === action.payload.id ? { ...set, ...action.payload } : set
                    )
                }
            };
            break;

        case ACTIONS.DELETE_SET:
            if (!state.currentSession) return state;
            newState = {
                ...state,
                currentSession: {
                    ...state.currentSession,
                    sets: state.currentSession.sets.filter(set => set.id !== action.payload)
                }
            };
            break;

        // 履歴内のセット更新
        case ACTIONS.UPDATE_HISTORY_SET:
            newState = {
                ...state,
                workoutHistory: state.workoutHistory.map(session => {
                    if (session.id === action.payload.sessionId) {
                        return {
                            ...session,
                            sets: session.sets.map(set =>
                                set.id === action.payload.setId ? { ...set, ...action.payload.updates } : set
                            )
                        };
                    }
                    return session;
                })
            };
            break;

        // 履歴内のセット削除
        case ACTIONS.DELETE_HISTORY_SET:
            newState = {
                ...state,
                workoutHistory: state.workoutHistory.map(session => {
                    if (session.id === action.payload.sessionId) {
                        return {
                            ...session,
                            sets: session.sets.filter(set => set.id !== action.payload.setId)
                        };
                    }
                    return session;
                }).filter(session => session.sets.length > 0) // 空のセッションは削除
            };
            break;

        // セッション削除
        case ACTIONS.DELETE_SESSION:
            newState = {
                ...state,
                workoutHistory: state.workoutHistory.filter(session => session.id !== action.payload)
            };
            break;

        case ACTIONS.UPDATE_PB:
            const { exerciseId, weight, date, reps } = action.payload;
            const existingPB = state.personalBests[exerciseId] || { history: [] };
            newState = {
                ...state,
                personalBests: {
                    ...state.personalBests,
                    [exerciseId]: {
                        weight,
                        reps: reps || 1,
                        date,
                        history: [...existingPB.history, { weight: existingPB.weight, reps: existingPB.reps, date: existingPB.date }].filter(h => h.weight)
                    }
                }
            };
            break;

        case ACTIONS.DELETE_PB:
            const { [action.payload]: removed, ...remainingPBs } = state.personalBests;
            newState = {
                ...state,
                personalBests: remainingPBs
            };
            break;

        case ACTIONS.CANCEL_SESSION:
            newState = {
                ...state,
                currentSession: null
            };
            break;

        // セット並び替え
        case ACTIONS.REORDER_HISTORY_SET:
            newState = {
                ...state,
                workoutHistory: state.workoutHistory.map(session => {
                    if (session.id === action.payload.sessionId) {
                        const sets = [...session.sets];
                        const { setId, direction } = action.payload;
                        const currentIndex = sets.findIndex(s => s.id === setId);

                        if (currentIndex === -1) return session;

                        const newIndex = direction === 'up'
                            ? Math.max(0, currentIndex - 1)
                            : Math.min(sets.length - 1, currentIndex + 1);

                        if (currentIndex !== newIndex) {
                            const [movedSet] = sets.splice(currentIndex, 1);
                            sets.splice(newIndex, 0, movedSet);
                        }

                        return { ...session, sets };
                    }
                    return session;
                })
            };
            break;

        case ACTIONS.UPDATE_SETTINGS:
            newState = {
                ...state,
                settings: { ...state.settings, ...action.payload }
            };
            break;

        // お気に入りトグル
        case ACTIONS.TOGGLE_FAVORITE:
            const isFav = state.favoriteExercises.includes(action.payload);
            newState = {
                ...state,
                favoriteExercises: isFav
                    ? state.favoriteExercises.filter(id => id !== action.payload)
                    : [...state.favoriteExercises, action.payload]
            };
            break;

        // 最近使用に追加
        case ACTIONS.ADD_RECENT_EXERCISE:
            const filtered = state.recentExercises.filter(id => id !== action.payload);
            newState = {
                ...state,
                recentExercises: [action.payload, ...filtered].slice(0, 10)
            };
            break;

        // カスタム種目追加
        case ACTIONS.ADD_CUSTOM_EXERCISE:
            newState = {
                ...state,
                customExercises: [...state.customExercises, {
                    ...action.payload,
                    id: 'custom-' + Date.now(),
                    isCustom: true
                }]
            };
            break;

        // カスタム種目削除
        case ACTIONS.DELETE_CUSTOM_EXERCISE:
            newState = {
                ...state,
                customExercises: state.customExercises.filter(ex => ex.id !== action.payload)
            };
            break;

        // データインポート
        case ACTIONS.IMPORT_DATA:
            newState = {
                ...initialState,
                ...action.payload,
                settings: { ...initialState.settings, ...action.payload.settings }
            };
            break;

        default:
            return state;
    }

    saveToStorage(newState);
    return newState;
}

export function WorkoutProvider({ children }) {
    const [state, dispatch] = useReducer(workoutReducer, initialState);

    // 初回読み込み
    useEffect(() => {
        const savedData = loadFromStorage();
        dispatch({ type: ACTIONS.LOAD_DATA, payload: savedData });
    }, []);

    // アクションヘルパー
    const actions = {
        startSession: (date) => dispatch({ type: ACTIONS.START_SESSION, payload: { date } }),
        endSession: () => dispatch({ type: ACTIONS.END_SESSION }),
        updateSessionDate: (date) => dispatch({ type: ACTIONS.UPDATE_SESSION_DATE, payload: date }),
        addSet: (setData) => dispatch({ type: ACTIONS.ADD_SET, payload: setData }),
        updateSet: (setData) => dispatch({ type: ACTIONS.UPDATE_SET, payload: setData }),
        deleteSet: (setId) => dispatch({ type: ACTIONS.DELETE_SET, payload: setId }),

        // 履歴操作
        updateHistorySet: (sessionId, setId, updates) => dispatch({
            type: ACTIONS.UPDATE_HISTORY_SET,
            payload: { sessionId, setId, updates }
        }),
        deleteHistorySet: (sessionId, setId) => dispatch({
            type: ACTIONS.DELETE_HISTORY_SET,
            payload: { sessionId, setId }
        }),
        deleteSession: (sessionId) => dispatch({ type: ACTIONS.DELETE_SESSION, payload: sessionId }),

        updatePB: (exerciseId, weight, reps = 1) => dispatch({
            type: ACTIONS.UPDATE_PB,
            payload: { exerciseId, weight, reps, date: new Date().toISOString() }
        }),
        deletePB: (exerciseId) => dispatch({ type: ACTIONS.DELETE_PB, payload: exerciseId }),
        updateSettings: (settings) => dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings }),

        // お気に入り・最近使用
        toggleFavorite: (exerciseId) => dispatch({ type: ACTIONS.TOGGLE_FAVORITE, payload: exerciseId }),
        addRecentExercise: (exerciseId) => dispatch({ type: ACTIONS.ADD_RECENT_EXERCISE, payload: exerciseId }),

        // カスタム種目
        addCustomExercise: (exercise) => dispatch({ type: ACTIONS.ADD_CUSTOM_EXERCISE, payload: exercise }),
        deleteCustomExercise: (exerciseId) => dispatch({ type: ACTIONS.DELETE_CUSTOM_EXERCISE, payload: exerciseId }),

        // セッション
        cancelSession: () => dispatch({ type: ACTIONS.CANCEL_SESSION }),

        // セット並び替え
        reorderHistorySet: (sessionId, setId, direction) => dispatch({
            type: ACTIONS.REORDER_HISTORY_SET,
            payload: { sessionId, setId, direction }
        }),

        // インポート
        importData: (data) => dispatch({ type: ACTIONS.IMPORT_DATA, payload: data }),

        // エクスポート
        exportData: () => {
            const data = {
                personalBests: state.personalBests,
                workoutHistory: state.workoutHistory,
                favoriteExercises: state.favoriteExercises,
                customExercises: state.customExercises,
                settings: state.settings,
                exportDate: new Date().toISOString()
            };
            return data;
        },

        // PB超え判定
        checkPBExceeded: (exerciseId, weight, isSuccess) => {
            if (!isSuccess) return false;
            const currentPB = state.personalBests[exerciseId]?.weight || 0;
            return weight > currentPB;
        },

        // %MAX計算
        getPercentOfMax: (exerciseId, weight) => {
            const pb = state.personalBests[exerciseId]?.weight;
            if (!pb || pb === 0) return null;
            return Math.round((weight / pb) * 100);
        },

        // 1RM推定（Epley式）
        estimateOneRM: (weight, reps) => {
            if (reps === 1) return weight;
            return Math.round(weight * (1 + reps / 30));
        }
    };

    return (
        <WorkoutContext.Provider value={{ state, ...actions }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
}
