export default function TeamGrid({team, onOpen}) {
  return (
    <div className="team-grid">
      {team.map((mon, index) => (
        <button key={`${mon.speciesId}-${index}`} className="team-card" onClick={() => onOpen(index)}>
          <img src={mon.cardImage} alt={mon.name} className="team-card-image" />
          <div className="team-card-footer">
            <strong>{mon.name}</strong>
            <span>{(mon.types || []).join(' / ')} · BST {mon.bst}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
