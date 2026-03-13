# Pokémon Card Team Generator

A React + Vite app with a local proxy that fetches a single random PkmnCards results page, filters Pokémon cards, matches them to your local battle data, drafts a 6-Pokémon team, and lets you edit/export the team in a simplified Pokémon Showdown format.

## Setup

1. Put your data files in `src/data/`
2. Run:

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Proxy: `http://localhost:8787`

## Expected data files

The loader looks for `.ts` files whose names include:
- `pokedex`
- `moves`
- `items`
- `abilities`
- `learnsets`

Supported export shapes include either named PS-style exports like `BattlePokedex` or default exports.

## Notes

- The proxy preserves the behavior of scraping one random page per Generate click.
- The parser targets `display=full` for better text extraction.
- Species normalization is heuristic; very unusual TCG card naming may need extra mappings.
- The Hack button uses learnset-aware scoring and a curated competitive item list.
