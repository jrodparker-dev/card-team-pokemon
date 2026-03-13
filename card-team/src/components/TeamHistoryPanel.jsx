export default function TeamHistoryPanel({history, onRestore}) {
  return (
    <aside className="panel side-panel">
      <h2>Team History</h2>
      <div className="history-list">
        {history.length === 0 ? <p className="muted">No teams yet.</p> : history.map((entry) => (
          <button key={entry.id} className="history-card" onClick={() => onRestore(entry)}>
            <div className="history-time">{new Date(entry.createdAt).toLocaleString()}</div>
            <div className="history-sprites">
              {entry.team.map((mon, idx) => (
                <img key={`${entry.id}-${idx}`} src={mon.miniSprite || mon.cardImage} alt={mon.name} title={mon.name} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
