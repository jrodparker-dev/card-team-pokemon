# Pokémon Card Team Generator

A React + Vite app that fetches one random PkmnCards results page, filters Pokémon cards, matches them to your local battle data, drafts a 6-Pokémon team, and lets you edit/export the team in a simplified Pokémon Showdown format.

## Setup

1. Put your data files in `src/data/`
2. Run:

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Static hosting (GitHub Pages-friendly)

This project is now fully client-side and does **not** require a local proxy server.

```bash
npm run build
```

The Vite build outputs directly to `docs/`, so you can serve the app statically from that folder.

## Expected data files

The loader looks for `.ts` files whose names include:
- `pokedex`
- `moves`
- `items`
- `abilities`
- `learnsets`

Supported export shapes include either named PS-style exports like `BattlePokedex` or default exports.

## Notes

- Random page fetching runs in-browser and attempts direct CORS first, then public CORS mirrors as fallback.
- Species normalization is heuristic; very unusual TCG card naming may need extra mappings.
- Hack now toggles between **Hack** and **Undo Hack**, and hack-selected moves/ability are injected as selectable options for that Pokémon.
