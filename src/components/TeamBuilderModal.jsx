import {useMemo} from 'react';

const NATURES = ['Hardy','Lonely','Adamant','Naughty','Brave','Bold','Docile','Impish','Lax','Relaxed','Modest','Mild','Bashful','Rash','Quiet','Calm','Gentle','Careful','Quirky','Sassy','Timid','Hasty','Jolly','Naive','Serious'];
const TYPES = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];
const STATS = [['hp','HP'],['atk','Atk'],['def','Def'],['spa','SpA'],['spd','SpD'],['spe','Spe']];

export default function TeamBuilderModal({mon, battleData, onClose, onChange, onHack}) {
  const moveOptions = useMemo(() => {
    const preferredIds = mon.learnset?.length ? mon.learnset : Object.keys(battleData.moves || {});
    const overrideIds = mon.hackOverrides?.moves || [];
    return [...new Set([...preferredIds, ...overrideIds])]
      .map((id) => ({id, label: battleData.moves?.[id]?.name || id}))
      .filter((move) => move.label)
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [mon.learnset, mon.hackOverrides, battleData.moves]);
  const itemOptions = useMemo(() => Object.entries(battleData.items || {}).map(([id, item]) => ({id, label: item.name || id})).sort((a, b) => a.label.localeCompare(b.label)), [battleData.items]);
  const abilityOptions = useMemo(() => {
    const base = mon.abilities?.length ? mon.abilities : Object.values(battleData.abilities || {}).map((ability) => ability?.name).filter(Boolean);
    const overrides = mon.hackOverrides?.abilities || [];
    return [...new Set([...base, ...overrides])].sort((a, b) => a.localeCompare(b));
  }, [mon.abilities, mon.hackOverrides, battleData.abilities]);

  const updateMove = (idx, value) => {
    const next = [...(mon.moves || [])];
    next[idx] = value;
    onChange({moves: next});
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{mon.name}</h2>
            <div className="muted">{(mon.types || []).join(' / ')} · BST {mon.bst}</div>
          </div>
          <div className="header-actions">
            <button onClick={onHack}>{mon.hackState?.active ? 'Undo Hack' : 'Hack'}</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="modal-grid">
          <section className="editor-section">
            <h3>Moves</h3>
            {[0,1,2,3].map((idx) => (
              <select key={idx} value={mon.moves?.[idx] || ''} onChange={(e) => updateMove(idx, e.target.value)}>
                <option value="">Select move {idx + 1}</option>
                {moveOptions.map((move) => <option key={move.id} value={move.id}>{move.label}</option>)}
              </select>
            ))}
          </section>
          <section className="editor-section">
            <h3>Item & Ability</h3>
            <select value={mon.item || ''} onChange={(e) => onChange({item: e.target.value})}>
              <option value="">No item</option>
              {itemOptions.map((item) => <option key={item.id} value={item.label}>{item.label}</option>)}
            </select>
            <select value={mon.ability || ''} onChange={(e) => onChange({ability: e.target.value})}>
              <option value="">Select ability</option>
              {abilityOptions.map((ability) => <option key={ability} value={ability}>{ability}</option>)}
            </select>
          </section>
          <section className="editor-section">
            <h3>Details</h3>
            <label>Level <input type="number" min="1" max="100" value={mon.level || 100} onChange={(e) => onChange({level: Number(e.target.value)})} /></label>
            <label className="checkbox"><input type="checkbox" checked={!!mon.shiny} onChange={(e) => onChange({shiny: e.target.checked})} /> Shiny</label>
            <select value={mon.teraType || ''} onChange={(e) => onChange({teraType: e.target.value})}>
              <option value="">Tera Type</option>
              {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </section>
          <section className="editor-section">
            <h3>Stats</h3>
            <select value={mon.nature || ''} onChange={(e) => onChange({nature: e.target.value})}>
              <option value="">Nature</option>
              {NATURES.map((nature) => <option key={nature} value={nature}>{nature}</option>)}
            </select>
            <div className="stat-grid">
              {STATS.map(([key, label]) => (
                <div key={key} className="stat-row">
                  <span>{label}</span>
                  <input type="number" min="0" max="252" value={mon.evs?.[key] ?? 0} onChange={(e) => onChange({evs: {...mon.evs, [key]: Number(e.target.value)}})} />
                  <input type="number" min="0" max="31" value={mon.ivs?.[key] ?? 31} onChange={(e) => onChange({ivs: {...mon.ivs, [key]: Number(e.target.value)}})} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
