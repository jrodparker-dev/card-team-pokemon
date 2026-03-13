import express from 'express';
import cors from 'cors';
import * as cheerio from 'cheerio';

const app = express();
const PORT = 8787;
const BASE = 'https://pkmncards.com/';

app.use(cors());

function abs(url) {
  if (!url) return '';
  try {
    return new URL(url, BASE).toString();
  } catch {
    return url;
  }
}

function cleanText(s = '') {
  return s.replace(/\s+/g, ' ').trim();
}

function inferCategory(text) {
  const t = text.toLowerCase();
  if (t.includes('trainer ›') || t.includes('trainer >') || t.includes('(item)') || t.includes('(supporter)') || t.includes('(stadium)') || t.includes('tool')) return 'Trainer';
  if (t.includes('energy ›') || t.includes('energy >')) return 'Energy';
  if (t.includes('pokémon') || t.includes('pokemon')) return 'Pokemon';
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

function parseCardsFromHtml(html) {
  const $ = cheerio.load(html);
  const cards = [];
  const seen = new Set();

  const candidates = [
    'article',
    '.type-pkmn_card',
    '.entry',
    '.card',
    '.post',
    'main .post',
    'main article',
  ];

  let blocks = [];
  for (const sel of candidates) {
    const found = $(sel).toArray();
    if (found.length >= 10) {
      blocks = found;
      break;
    }
  }
  if (!blocks.length) {
    $('a[href*="/card/"]').each((_, el) => {
      const parent = $(el).closest('article, .entry, .post, li, div');
      if (parent.length) blocks.push(parent.get(0));
    });
  }

  blocks.forEach((el) => {
    const node = $(el);
    const linkEl = node.find('a[href*="/card/"]').first();
    const href = linkEl.attr('href');
    if (!href) return;
    const link = abs(href);
    if (seen.has(link)) return;
    seen.add(link);

    const text = cleanText(node.text());
    const title = cleanText(node.find('h1,h2,h3,.entry-title,.post-title').first().text() || linkEl.attr('title') || linkEl.text());
    const image = abs(node.find('img').first().attr('src') || node.find('img').first().attr('data-src'));
    const category = inferCategory(text);
    const name = inferDisplayName(title, text);
    const isPokemon = category === 'Pokemon';

    cards.push({
      id: link.split('/').filter(Boolean).pop() || `${cards.length}`,
      name,
      title,
      category,
      isPokemon,
      image,
      link,
      text,
    });
  });

  return cards;
}

app.get('/api/random-page', async (req, res) => {
  const seed = Number(req.query.seed || Math.floor(Math.random() * 1000000));
  const display = String(req.query.display || 'full');
  const url = `${BASE}?s&sort=random&seed=${seed}&ord=auto&display=${display}`;

  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0',
      },
    });
    const html = await response.text();
    const cards = parseCardsFromHtml(html);
    res.json({seed, display, url, cards});
  } catch (error) {
    res.status(500).json({error: error.message || 'Failed to fetch PkmnCards'});
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
