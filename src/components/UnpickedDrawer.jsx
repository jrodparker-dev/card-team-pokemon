export default function UnpickedDrawer({open, onToggle, unpicked}) {
  return (
    <aside className={`panel drawer ${open ? 'open' : ''}`}>
      <button className="drawer-toggle" onClick={onToggle}>{open ? 'Hide Unpicked Pokémon' : 'Unpicked Pokémon'}</button>
      {open && (
        <div className="drawer-content">
          <h2>Unpicked Pokémon</h2>
          <div className="candidate-list">
            {unpicked.map((mon) => (
              <div className="candidate-row" key={mon.speciesId}>
                <img src={mon.cardImage} alt={mon.name} />
                <div>
                  <div className="candidate-name">{mon.name}</div>
                  <div className="candidate-meta">{(mon.types || []).join(' / ')} · BST {mon.bst}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
