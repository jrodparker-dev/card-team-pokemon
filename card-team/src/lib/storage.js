const TEAM_HISTORY_KEY = 'pkmn-card-team-history-v1';

export function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TEAM_HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry) {
  const history = loadHistory();
  const next = [entry, ...history].slice(0, 10);
  localStorage.setItem(TEAM_HISTORY_KEY, JSON.stringify(next));
  return next;
}
