const BASE_URL = 'https://pkmncards.com/';

function abs(url) {
  if (!url) return '';
  try {
    return new URL(url, BASE_URL).toString();
  } catch {
    return url;
  }
}

function cleanText(text = '') {
  return text.replace(/\s+/g, ' ').trim();
}

function inferCategory(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes('trainer ›') || normalized.includes('trainer >') || normalized.includes('(item)') || normalized.includes('(supporter)') || normalized.includes('(stadium)') || normalized.includes('tool')) return 'Trainer';
  if (normalized.includes('energy ›') || normalized.includes('energy >')) return 'Energy';
  if (normalized.includes('pokémon') || normalized.includes('pokemon')) return 'Pokemon';
  return 'Unknown';
}

function inferDisplayName(title = '', text = '') {
  const fromTitle = cleanText(title)
    .replace(/\s*[·•].*$/, '')
    .replace(/\s+-\s+.*$/, '')
    .trim();
  if (fromTitle) return fromTitle;

  const match = text.match(/^(.{1,80}?)\s+(Pokémon|Pokemon|Trainer|Energy)\s+[›>]/im);
  return match ? cleanText(match[1]) : '';
}

function selectCardBlocks(doc) {
  const selectors = [
    'article',
    '.type-pkmn_card',
    '.entry',
    '.card',
    '.post',
    'main .post',
    'main article',
  ];

  for (const selector of selectors) {
    const found = Array.from(doc.querySelectorAll(selector));
    if (found.length >= 10) return found;
  }

  const fallback = [];
  doc.querySelectorAll('a[href*="/card/"]').forEach((anchor) => {
    const parent = anchor.closest('article, .entry, .post, li, div');
    if (parent) fallback.push(parent);
  });
  return fallback;
}

function parseCardsFromHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const seen = new Set();
  const cards = [];

  for (const node of selectCardBlocks(doc)) {
    const linkEl = node.querySelector('a[href*="/card/"]');
    const href = linkEl?.getAttribute('href');
    if (!href) continue;

    const link = abs(href);
    if (seen.has(link)) continue;
    seen.add(link);

    const text = cleanText(node.textContent || '');
    const title = cleanText(
      node.querySelector('h1,h2,h3,.entry-title,.post-title')?.textContent
      || linkEl?.getAttribute('title')
      || linkEl?.textContent
      || ''
    );
    const imageEl = node.querySelector('img');
    const image = abs(imageEl?.getAttribute('src') || imageEl?.getAttribute('data-src'));
    const category = inferCategory(text);

    cards.push({
      id: link.split('/').filter(Boolean).pop() || `${cards.length}`,
      name: inferDisplayName(title, text),
      title,
      category,
      isPokemon: category === 'Pokemon',
      image,
      link,
      text,
    });
  }

  return cards;
}

async function fetchHtml(url) {
  const attempts = [
    {label: 'direct', url},
    {label: 'allorigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`},
    {label: 'cors.isomorphic-git', url: `https://cors.isomorphic-git.org/${url}`},
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const response = await fetch(attempt.url, {headers: {'x-requested-with': 'pokemon-card-team-generator'}});
      if (!response.ok) throw new Error(`${attempt.label} failed (${response.status})`);
      const html = await response.text();
      if (!html || html.length < 1000) throw new Error(`${attempt.label} returned unexpected content`);
      return html;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Could not fetch PkmnCards page.');
}

export async function fetchRandomCards(seed = Math.floor(Math.random() * 1000000)) {
  const display = 'full';
  const url = `${BASE_URL}?s&sort=random&seed=${seed}&ord=auto&display=${display}`;
  const html = await fetchHtml(url);
  const cards = parseCardsFromHtml(html);
  return {seed, display, url, cards};
}
