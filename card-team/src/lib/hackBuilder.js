const GOOD_ITEMS = [
  'Leftovers', 'Heavy-Duty Boots', 'Life Orb', 'Choice Band', 'Choice Specs', 'Choice Scarf',
  'Focus Sash', 'Assault Vest', 'Sitrus Berry', 'Lum Berry', 'Expert Belt', 'Rocky Helmet',
  'Booster Energy', 'Black Sludge', 'Air Balloon', 'Eviolite', 'Weakness Policy', 'Clear Amulet',
  'Covert Cloak', 'Loaded Dice', 'White Herb', 'Throat Spray', 'Mirror Herb', 'Muscle Band', 'Wise Glasses'
];

const FAST_NATURES = {physical: 'Jolly', special: 'Timid'};
const STRONG_NATURES = {physical: 'Adamant', special: 'Modest'};
const TERA_TYPES = ['Normal','Fire','Water','Electric','Grass','Ice','Fighting','Poison','Ground','Flying','Psychic','Bug','Rock','Ghost','Dragon','Dark','Steel','Fairy'];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)] || '';
}

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function categoryFor(mon) {
  const atk = mon.baseStats?.atk || 0;
  const spa = mon.baseStats?.spa || 0;
  if (atk === spa) return Math.random() < 0.5 ? 'physical' : 'special';
  return atk > spa ? 'physical' : 'special';
}

function scoreMove(move, mode, stabTypes) {
  if (!move || move.category === 'Status') return -999;
  let score = Math.random() * 20;
  if (stabTypes.includes(move.type)) score += 35;
  if ((mode === 'physical' && move.category === 'Physical') || (mode === 'special' && move.category === 'Special')) score += 30;
  else score -= 18;
  score += Number(move.basePower || 0);
  score += (move.accuracy === true ? 100 : Number(move.accuracy) || 0) / 8;
  if (move.multihit) score += 8;
  if (move.priority) score += 3;
  return score;
}

function pickMoves(mon, movesDex, mode, stabTypes) {
  const allMoves = Object.entries(movesDex || {})
    .map(([id, move]) => ({id, move, score: scoreMove(move, mode, stabTypes)}))
    .filter(({move, score}) => move && move.name && score > -200);

  const matching = allMoves.filter(({move}) => move.category === (mode === 'physical' ? 'Physical' : 'Special'));
  const stabMatching = matching.filter(({move}) => stabTypes.includes(move.type));
  const pool = shuffle(matching.length ? matching : allMoves).sort((a, b) => b.score - a.score + (Math.random() * 12 - 6));

  const chosen = [];
  const mustHaveStab = rand(stabMatching.length ? stabMatching : pool);
  if (mustHaveStab?.id) chosen.push(mustHaveStab.id);

  for (const entry of pool) {
    if (chosen.length >= 4) break;
    if (!chosen.includes(entry.id)) chosen.push(entry.id);
  }

  while (chosen.length < 4 && allMoves.length) {
    const fallback = rand(allMoves);
    if (fallback?.id && !chosen.includes(fallback.id)) chosen.push(fallback.id);
  }

  return shuffle(chosen).slice(0, 4);
}

export function hackSet(mon, battleData) {
  const mode = categoryFor(mon);
  const stabTypes = mon.types || [];
  const movesDex = battleData.moves || {};
  const allAbilities = Object.values(battleData.abilities || {}).map((a) => a?.name).filter(Boolean);
  const itemPool = GOOD_ITEMS.filter((name) => !battleData.items || Object.values(battleData.items).some((it) => it.name === name));
  const speed = mon.baseStats?.spe || 0;
  const hp = mon.baseStats?.hp || 0;

  return {
    moves: pickMoves(mon, movesDex, mode, stabTypes),
    item: rand(itemPool.length ? itemPool : GOOD_ITEMS),
    ability: rand(allAbilities.length ? allAbilities : (mon.abilities || [])),
    level: 100,
    shiny: Math.random() < 0.5,
    teraType: rand(shuffle(TERA_TYPES)),
    nature: speed >= 85 ? FAST_NATURES[mode] : STRONG_NATURES[mode],
    evs: speed >= 85
      ? {hp: 0, atk: mode === 'physical' ? 252 : 0, def: 0, spa: mode === 'special' ? 252 : 0, spd: 4, spe: 252}
      : {hp: 252, atk: mode === 'physical' ? 252 : 0, def: 0, spa: mode === 'special' ? 252 : 0, spd: 4, spe: hp >= 90 ? 0 : 252},
    ivs: {hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31},
  };
}
