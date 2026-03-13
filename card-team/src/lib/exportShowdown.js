function formatEVs(evs = {}) {
  const mapping = [['hp', 'HP'], ['atk', 'Atk'], ['def', 'Def'], ['spa', 'SpA'], ['spd', 'SpD'], ['spe', 'Spe']];
  return mapping.filter(([key]) => Number(evs[key]) > 0).map(([key, label]) => `${evs[key]} ${label}`).join(' / ');
}

export function exportSet(mon, movesDex = {}) {
  const lines = [];
  const header = `${mon.name}${mon.item ? ` @ ${mon.item}` : ''}`;
  lines.push(header);
  if (mon.ability) lines.push(`Ability: ${mon.ability}`);
  if (mon.shiny) lines.push('Shiny: Yes');
  if (mon.teraType) lines.push(`Tera Type: ${mon.teraType}`);
  const evLine = formatEVs(mon.evs);
  if (evLine) lines.push(`EVs: ${evLine}`);
  if (mon.nature) lines.push(`${mon.nature} Nature`);
  (mon.moves || []).forEach((moveId) => {
    const moveName = movesDex?.[moveId]?.name || moveId;
    lines.push(`- ${moveName}`);
  });
  return lines.join('\n');
}

export function exportTeam(team, movesDex = {}) {
  return team.map((mon) => exportSet(mon, movesDex)).join('\n\n');
}
