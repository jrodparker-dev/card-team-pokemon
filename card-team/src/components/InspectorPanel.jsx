export function InspectorPanel({dataSummary, debugInfo}) {
  return (
    <>
      <section className="panel-block">
        <h2>Data Loader</h2>
        <p className="muted">This shell is already wired to look in <code>src/data</code>.</p>
        <div className="kv"><span>Pokédex loaded</span><strong>{String(dataSummary.pokedexLoaded)}</strong></div>
        <div className="kv"><span>Moves loaded</span><strong>{String(dataSummary.movesLoaded)}</strong></div>
        <div className="kv"><span>Items loaded</span><strong>{String(dataSummary.itemsLoaded)}</strong></div>
        <div className="kv"><span>Abilities loaded</span><strong>{String(dataSummary.abilitiesLoaded)}</strong></div>
        <div className="kv"><span>Learnsets loaded</span><strong>{String(dataSummary.learnsetsLoaded)}</strong></div>
        <div style={{marginTop: '10px'}}><strong>Detected files</strong></div>
        <div className="muted">{dataSummary.availableFiles.length ? dataSummary.availableFiles.join(', ') : 'No .ts files detected yet.'}</div>
      </section>

      <section className="panel-block">
        <h2>Debug</h2>
        {!debugInfo ? <p className="muted">No scrape data yet.</p> : null}
        {debugInfo ? (
          <>
            <div className="kv"><span>Source URL</span><strong className="url-preview">Live proxy fetch</strong></div>
            <div className="kv"><span>Pokémon found</span><strong>{debugInfo.pokemonFound}</strong></div>
            <div className="kv"><span>Non-Pokémon found</span><strong>{debugInfo.nonPokemonFound}</strong></div>
          </>
        ) : null}
      </section>
    </>
  );
}
