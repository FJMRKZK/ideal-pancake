import { useState } from 'react';

function NumpadModal({ initialValue, onConfirm, onClose }) {
    const [display, setDisplay] = useState(initialValue.toString());

    const handleNumber = (num) => {
        if (display === '0') {
            setDisplay(num.toString());
        } else {
            setDisplay(display + num);
        }
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay('0');
        }
    };

    const handleClear = () => {
        setDisplay('0');
    };

    const handleConfirm = () => {
        const value = parseFloat(display) || 0;
        onConfirm(value);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="numpad__display">
                    {display} <span style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)' }}>kg</span>
                </div>

                <div className="numpad">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button
                            key={num}
                            className="numpad__btn"
                            onClick={() => handleNumber(num)}
                        >
                            {num}
                        </button>
                    ))}
                    <button className="numpad__btn" onClick={handleDecimal}>.</button>
                    <button className="numpad__btn" onClick={() => handleNumber(0)}>0</button>
                    <button className="numpad__btn" onClick={handleBackspace}>←</button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-lg)' }}>
                    <button className="btn btn--secondary" style={{ flex: 1 }} onClick={handleClear}>
                        クリア
                    </button>
                    <button className="btn btn--primary" style={{ flex: 1 }} onClick={handleConfirm}>
                        決定
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NumpadModal;
