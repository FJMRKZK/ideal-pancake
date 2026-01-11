import { useState, useRef, useEffect } from 'react';

function WeightInput({ value, onChange, pb, onNumpadOpen }) {
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const startValueRef = useRef(value);
    const containerRef = useRef(null);

    // %MAX計算
    const percentOfMax = pb > 0 ? Math.round((value / pb) * 100) : null;

    // タッチ開始
    const handleTouchStart = (e) => {
        setIsDragging(true);
        startXRef.current = e.touches[0].clientX;
        startValueRef.current = value;
    };

    // マウス開始
    const handleMouseDown = (e) => {
        setIsDragging(true);
        startXRef.current = e.clientX;
        startValueRef.current = value;
        e.preventDefault();
    };

    // 移動
    const handleMove = (clientX) => {
        if (!isDragging) return;

        const diff = clientX - startXRef.current;
        // 20pxで1kg
        const kgChange = Math.round(diff / 20);
        const newValue = Math.max(0, startValueRef.current + kgChange);

        if (newValue !== value) {
            onChange(newValue);
        }
    };

    // タッチ移動
    const handleTouchMove = (e) => {
        handleMove(e.touches[0].clientX);
    };

    // マウス移動
    const handleMouseMove = (e) => {
        handleMove(e.clientX);
    };

    // 終了
    const handleEnd = () => {
        setIsDragging(false);
    };

    // グローバルイベント
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleTouchMove);
            document.addEventListener('touchend', handleEnd);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleEnd);
                document.removeEventListener('touchmove', handleTouchMove);
                document.removeEventListener('touchend', handleEnd);
            };
        }
    }, [isDragging, value]);

    const increment = (amount) => {
        onChange(Math.max(0, value + amount));
    };

    return (
        <div className="weight-input" ref={containerRef}>
            <div className="weight-input__display">
                <span
                    className="weight-input__value"
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onClick={(e) => {
                        // ドラッグでない場合のみテンキー表示
                        if (!isDragging && Math.abs(e.clientX - startXRef.current) < 5) {
                            onNumpadOpen();
                        }
                    }}
                    style={{
                        cursor: isDragging ? 'grabbing' : 'grab',
                        userSelect: 'none',
                        touchAction: 'none'
                    }}
                >
                    {value}
                </span>
                <span className="weight-input__unit">kg</span>
            </div>

            {percentOfMax !== null && (
                <div className="weight-input__percent">
                    {percentOfMax}% of PB ({pb}kg)
                </div>
            )}

            <div className="weight-input__controls">
                <button
                    className="weight-input__btn"
                    onClick={() => increment(-5)}
                >
                    -5
                </button>
                <button
                    className="weight-input__btn"
                    onClick={() => increment(-1)}
                >
                    -1
                </button>
                <button
                    className="weight-input__btn"
                    onClick={() => increment(1)}
                >
                    +1
                </button>
                <button
                    className="weight-input__btn"
                    onClick={() => increment(5)}
                >
                    +5
                </button>
            </div>

            <div className="swipe-hint">
                ← スワイプで調整 →
            </div>
        </div>
    );
}

export default WeightInput;
