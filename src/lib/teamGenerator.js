import {getLearnset, getSpeciesEntry, resolveDexKey, toID} from './dataLoader.js';

function sumStats(baseStats = {}) {
  return Object.values(baseStats).reduce((sum, val) => sum + Number(val || 0), 0);
}

function getFinalEvolutionId(pokedex, speciesId) {
  const firstKey = resolveDexKey(pokedex, speciesId) || speciesId;
  const visited = new Set();
  let current = firstKey;
  let best = firstKey;
  let safety = 0;

  while (current && !visited.has(current) && safety < 20) {
    visited.add(current);
    best = current;
    const species = pokedex?.[current];
    const evos = Array.isArray(species?.evos) ? species.evos : [];
    if (!evos.length) break;

    const resolvedEvos = evos
      .map((evo) => resolveDexKey(pokedex, evo) || toID(evo))
      .filter((evo) => pokedex?.[evo]);
    if (!resolvedEvos.length) break;

    current = resolvedEvos
      .slice()
      .sort((a, b) => sumStats(pokedex[b]?.baseStats || {}) - sumStats(pokedex[a]?.baseStats || {}))[0];
    safety += 1;
  }

  return best;
}

function scoreCandidate(candidate, currentTeam) {
  let score = Math.random() * 10;
  const bst = candidate.bst || 0;
  if (bst > 600) score += 25;
  else if (bst > 500) score += 18;
  else if (bst > 475) score += 10;
  else score -= 10;

  const teamTypes = currentTeam.flatMap((p) => p.types || []);
  for (const type of candidate.types || []) {
    const count = teamTypes.filter((t) => t === type).length;
    score -= count * 9;
  }
  if ((candidate.types || []).length && currentTeam.some((p) => p.types?.[0] === candidate.types[0])) score -= 8;
  if (candidate.isFinalEvolution) score += 6;
  return score;
}

function chooseSix(candidates) {
  const pool = [...candidates];
  const selected = [];
  while (pool.length && selected.length < 6) {
    pool.sort((a, b) => scoreCandidate(b, selected) - scoreCandidate(a, selected));
    selected.push(pool.shift());
  }
  return selected;
}

export function buildCandidates(rawCards, battleData) {
  const {pokedex, learnsets} = battleData;
  const pokemonCards = rawCards.filter((card) => card.isPokemon);
  const seenSpecies = new Set();
  const candidates = [];
  const excluded = [];

  for (const card of pokemonCards) {
    const species = getSpeciesEntry(pokedex, card.name || card.title);
    if (!species) {
      excluded.push({...card, reason: 'No pokedex match'});
      continue;
    }
    const speciesId = resolveDexKey(pokedex, species.id || species.name) || species.id || toID(species.name);
    const finalEvolutionId = getFinalEvolutionId(pokedex, speciesId);
    const finalEvolution = pokedex[finalEvolutionId] || species;
    const learnset = getLearnset(learnsets, finalEvolutionId || speciesId, pokedex);
    const baseStats = finalEvolution.baseStats || species.baseStats || {};
    const dedupeId = finalEvolutionId || speciesId;

    if (seenSpecies.has(dedupeId)) {
      excluded.push({...card, reason: 'Duplicate species on page'});
      continue;
    }
    seenSpecies.add(dedupeId);

    candidates.push({
      cardId: card.id,
      cardName: card.name,
      cardImage: card.image,
      cardLink: card.link,
      sourceText: card.text,
      speciesId: dedupeId,
      baseSpeciesId: speciesId,
      name: finalEvolution.name || species.name || card.name,
      displayName: finalEvolution.name || species.name || card.name,
      types: finalEvolution.types || species.types || [],
      baseStats,
      bst: sumStats(baseStats),
      abilities: Object.values(finalEvolution.abilities || species.abilities || {}).filter(Boolean),
      learnset,
      isFinalEvolution: !finalEvolution.evos?.length,
      miniSprite: `https://play.pokemonshowdown.com/sprites/gen5/${(finalEvolution.name || species.name || '').toLowerCase().replace(/[^a-z0-9-]/g, '')}.png`,
    });
  }

  return {candidates, excluded};
}

export function generateTeam(rawCards, battleData) {
  const {candidates, excluded} = buildCandidates(rawCards, battleData);
  const team = chooseSix(candidates);
  const unpicked = candidates.filter((c) => !team.some((t) => t.speciesId === c.speciesId));
  return {team, unpicked, excluded, allCandidates: candidates};
}
