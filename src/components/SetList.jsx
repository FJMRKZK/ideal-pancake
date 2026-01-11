function SetList({ sets, showReps = false, onEdit }) {
    return (
        <ul className="set-list">
            {sets.map((set, index) => (
                <li
                    key={set.id}
                    className="set-item"
                    onClick={() => onEdit && onEdit(set)}
                    style={{ cursor: onEdit ? 'pointer' : 'default' }}
                >
                    <div className="set-item__number">{index + 1}</div>
                    <div className="set-item__info">
                        <div className="set-item__weight">
                            {set.weight} kg
                            {(showReps || set.reps > 1) && set.reps && (
                                <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                                    {' '}× {set.reps}
                                </span>
                            )}
                        </div>
                        <div className="set-item__meta">
                            RPE {set.rpe}
                            {set.notes && ` • ${set.notes}`}
                        </div>
                    </div>
                    <div className={`set-item__result ${set.isSuccess ? 'set-item__result--success' : 'set-item__result--fail'}`}>
                        {set.isSuccess ? '○' : '×'}
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default SetList;
