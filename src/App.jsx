import {useMemo, useState} from 'react';
import TeamGrid from './components/TeamGrid.jsx';
import UnpickedDrawer from './components/UnpickedDrawer.jsx';
import TeamHistoryPanel from './components/TeamHistoryPanel.jsx';
import TeamBuilderModal from './components/TeamBuilderModal.jsx';
import {loadBattleData} from './lib/dataLoader.js';
import {generateTeam} from './lib/teamGenerator.js';
import {hackSet} from './lib/hackBuilder.js';
import {fetchRandomCards} from './lib/cardSource.js';
import {exportTeam} from './lib/exportShowdown.js';
import {loadHistory, saveHistory} from './lib/storage.js';

const battleData = loadBattleData();

function defaultEditable(mon) {
  return {
    ...mon,
    item: '',
    ability: mon.abilities?.[0] || '',
    level: 100,
    shiny: false,
    teraType: '',
    nature: '',
    evs: {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0},
    ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
    moves: ['', '', '', ''],
  };
}

export default function App() {
  const [team, setTeam] = useState([]);
  const [unpicked, setUnpicked] = useState([]);
  const [history, setHistory] = useState(loadHistory());
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [status, setStatus] = useState('Ready. Drop your .ts data files into src/data and click Generate.');
  const [lastSeed, setLastSeed] = useState(null);

  const exportText = useMemo(() => exportTeam(team, battleData.moves), [team]);

  async function handleGenerate() {
    setLoading(true);
    setStatus('Fetching random PkmnCards page...');
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const json = await fetchRandomCards(seed);
      const result = generateTeam(json.cards || [], battleData);
      const editable = result.team.map(defaultEditable);
      setTeam(editable);
      setUnpicked(result.unpicked);
      setLastSeed(json.seed);
      setStatus(`Generated from seed ${json.seed}. Found ${result.allCandidates.length} matched Pokémon candidates.`);
      const entry = {id: `${Date.now()}`, createdAt: Date.now(), seed: json.seed, team: editable};
      setHistory(saveHistory(entry));
    } catch (error) {
      setStatus(`Generate failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function updateMon(index, patch) {
    setTeam((prev) => prev.map((mon, i) => i === index ? {...mon, ...patch} : mon));
  }

  function handleHack(index) {
    const mon = team[index];
    if (!mon) return;

    if (mon.hackState?.active) {
      updateMon(index, {
        ...mon.hackState.original,
        hackState: {active: false, original: null},
      });
      return;
    }

    const hacked = hackSet(mon, battleData);
    updateMon(index, {
      ...hacked,
      hackState: {
        active: true,
        original: {
          moves: mon.moves,
          item: mon.item,
          ability: mon.ability,
          level: mon.level,
          shiny: mon.shiny,
          teraType: mon.teraType,
          nature: mon.nature,
          evs: mon.evs,
          ivs: mon.ivs,
        },
      },
      hackOverrides: {
        moves: hacked.moves,
        abilities: hacked.ability ? [hacked.ability] : [],
      },
    });
  }

  function copyExport() {
    navigator.clipboard.writeText(exportText);
    setStatus('Copied team export to clipboard.');
  }

  return (
    <div className="app-shell">
      <TeamHistoryPanel history={history} onRestore={(entry) => { setTeam(entry.team); setStatus(`Restored team from seed ${entry.seed}.`); }} />
      <main className="main-content">
        <header className="hero panel">
          <div>
            <h1>Pokémon Card Team Generator</h1>
            <p>Generate a 6-Pokémon team from one random PkmnCards page, then edit the team in a simplified Showdown-style teambuilder.</p>
            <p className="muted">Detected data files: {battleData.availableFiles.length ? battleData.availableFiles.join(', ') : 'none yet'}</p>
            <p className="muted">Last seed: {lastSeed ?? 'none'}</p>
          </div>
          <div className="hero-actions">
            <button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate Team'}</button>
            <button onClick={copyExport} disabled={!team.length}>Copy PS Export</button>
          </div>
        </header>

        <section className="panel status-panel">
          <strong>Status:</strong> {status}
        </section>

        {team.length ? <TeamGrid team={team} onOpen={setModalIndex} /> : <section className="panel empty-state">No team yet. Click Generate Team.</section>}

        <section className="panel export-panel">
          <h2>Showdown Export</h2>
          <textarea value={exportText} readOnly rows={16} />
        </section>
      </main>

      <UnpickedDrawer open={drawerOpen} onToggle={() => setDrawerOpen((v) => !v)} unpicked={unpicked} />

      {modalIndex !== null && team[modalIndex] && (
        <TeamBuilderModal
          mon={team[modalIndex]}
          battleData={battleData}
          onClose={() => setModalIndex(null)}
          onChange={(patch) => updateMon(modalIndex, patch)}
          onHack={() => handleHack(modalIndex)}
        />
      )}
    </div>
  );
}
