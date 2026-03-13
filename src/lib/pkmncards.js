const API_BASE = 'http://localhost:8787';

export async function fetchRandomCardsPage({seed, display = 'text'}) {
  const url = `${API_BASE}/api/random-cards?seed=${encodeURIComponent(seed)}&display=${encodeURIComponent(display)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Proxy request failed with status ${response.status}. Start the local server with npm run dev.`);
  }
  return response.json();
}

export function parsePokemonCardsFromHtml(html) {
  if (!html) return {pokemon: [], nonPokemon: []};

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links = Array.from(doc.querySelectorAll('a[href]'));
  const seen = new Set();
  const pokemon = [];
  const nonPokemon = [];

  for (const link of links) {
    const href = link.getAttribute('href') || '';
    const text = cleanText(link.textContent || '');
    if (!text || seen.has(`${href}|${text}`)) continue;

    const img = link.querySelector('img');
    const image = img?.getAttribute('src') || img?.getAttribute('data-src') || '';
    const lowerHref = href.toLowerCase();
    const lowerText = text.toLowerCase();

    const looksPokemon = lowerHref.includes('/pokemon/') || isLikelyPokemonName(text);
    const looksNonPokemon = /(trainer|supporter|stadium|item|energy|tool)/i.test(lowerText) || lowerHref.includes('/trainer/') || lowerHref.includes('/energy/');

    const entry = {
      id: toID(stripCardDecorators(text)),
      name: stripCardDecorators(text),
      cardTitle: text,
      cardUrl: href.startsWith('http') ? href : `https://pkmncards.com${href}`,
      cardImage: image,
      types: [],
      bst: null,
      miniSprite: '',
    };

    seen.add(`${href}|${text}`);

    if (looksPokemon && !looksNonPokemon) pokemon.push(entry);
    else if (looksNonPokemon) nonPokemon.push(entry);
  }

  return {pokemon: dedupeById(pokemon), nonPokemon: dedupeById(nonPokemon)};
}

function cleanText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripCardDecorators(name) {
  return name
    .replace(/\b(ex|gx|vmax|vstar|v-union|break|lv\.x|δ)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toID(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isLikelyPokemonName(text) {
  if (!text) return false;
  if (/\d/.test(text) && text.length < 4) return false;
  return /^[A-Z][A-Za-z0-9.'’\-\s]+$/.test(text);
}

function dedupeById(entries) {
  const map = new Map();
  for (const entry of entries) {
    if (!entry.id) continue;
    if (!map.has(entry.id)) map.set(entry.id, entry);
  }
  return [...map.values()];
}
