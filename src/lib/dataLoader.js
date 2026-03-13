const modules = import.meta.glob('../data/*.ts', {eager: true});

function getNamedOrDefault(mod) {
  if (!mod) return null;
  if (mod.default) return mod.default;
  const keys = Object.keys(mod).filter((k) => k !== '__esModule');
  if (keys.length === 1) return mod[keys[0]];
  return mod;
}

function toId(text = '') {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function normalizeContainer(raw) {
  if (!raw) return {};
  return raw;
}

function findFile(partial) {
  const entry = Object.entries(modules).find(([path]) => path.toLowerCase().includes(partial));
  return entry ? getNamedOrDefault(entry[1]) : null;
}

function getDexMap(raw, possibilities) {
  if (!raw) return {};
  for (const key of possibilities) {
    if (raw[key]) return raw[key];
  }
  return raw;
}

export function loadBattleData() {
  const pokedexRaw = normalizeContainer(findFile('pokedex'));
  const movesRaw = normalizeContainer(findFile('moves'));
  const itemsRaw = normalizeContainer(findFile('items'));
  const abilitiesRaw = normalizeContainer(findFile('abilities'));
  const learnsetsRaw = normalizeContainer(findFile('learnsets'));

  return {
    pokedex: getDexMap(pokedexRaw, ['BattlePokedex', 'Pokedex']),
    moves: getDexMap(movesRaw, ['BattleMovedex', 'Movedex']),
    items: getDexMap(itemsRaw, ['BattleItems', 'Items']),
    abilities: getDexMap(abilitiesRaw, ['BattleAbilities', 'Abilities']),
    learnsets: getDexMap(learnsetsRaw, ['BattleLearnsets', 'Learnsets']),
    availableFiles: Object.keys(modules).map((p) => p.split('/').pop()),
  };
}

export function toID(text = '') {
  return toId(text);
}

function speciesAliases(rawName) {
  const base = toId(rawName);
  const stripped = base
    .replace(/ex$|gx$|vmax$|vstar$|vm$|v$|break$|star$|delta$|radiant$/g, '')
    .replace(/team[a-z]+/g, '')
    .replace(/alolan/g, 'alola')
    .replace(/galarian/g, 'galar')
    .replace(/hisuian/g, 'hisui')
    .replace(/paldean/g, 'paldea');
  return [...new Set([base, stripped])].filter(Boolean);
}

export function resolveDexKey(dex, rawKey) {
  if (!dex || !rawKey) return null;
  const wanted = toId(rawKey);
  if (!wanted) return null;
  if (dex[wanted]) return wanted;
  const direct = Object.keys(dex).find((key) => toId(key) === wanted || toId(dex[key]?.name || '') === wanted);
  return direct || null;
}

export function getSpeciesEntry(pokedex, rawName) {
  const entries = Object.entries(pokedex || {});
  for (const alias of speciesAliases(rawName)) {
    const resolved = resolveDexKey(pokedex, alias);
    if (resolved) return {...pokedex[resolved], id: resolved};
    const fuzzy = entries.find(([key, entry]) => key === alias || toId(entry.name || '').startsWith(alias) || alias.startsWith(toId(entry.name || '')));
    if (fuzzy) return {...fuzzy[1], id: fuzzy[0]};
  }
  return null;
}

function mergeLearnsets(target, source) {
  if (!source) return;
  const learnset = source.learnset || source;
  for (const key of Object.keys(learnset || {})) target.add(toId(key));
}

export function getLearnset(learnsets, speciesId, pokedex) {
  const out = new Set();
  let current = resolveDexKey(learnsets, speciesId) || toId(speciesId);
  let safety = 0;

  while (current && safety < 20) {
    const entry = learnsets?.[current];
    mergeLearnsets(out, entry);

    const species = pokedex?.[resolveDexKey(pokedex, current) || current];
    const inheritedFromLearnset = entry?.inherit ? species?.prevo : null;
    const inheritedFromSpecies = species?.prevo;
    const next = inheritedFromLearnset || inheritedFromSpecies;
    current = next ? resolveDexKey(learnsets, next) || resolveDexKey(pokedex, next) || toId(next) : null;
    safety += 1;
  }

  return [...out];
}
