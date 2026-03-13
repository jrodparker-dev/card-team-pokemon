# Pokémon Card Team Generator

Static Vite + React app that generates a Pokémon team from a single random PkmnCards page.

## Setup

1. Put your battle data `.ts` files into `src/data/`
   - `pokedex.ts`
   - `moves.ts`
   - `items.ts`
   - `abilities.ts`
   - `learnsets.ts`
2. Install dependencies:

```bash
npm install
```

3. Run locally:

```bash
npm run dev
```

4. Build for GitHub Pages:

```bash
npm run build
```

The production build outputs to `docs/`.

## Notes

- This version is fully static. It does **not** use the old Express proxy server.
- The app fetches one random PkmnCards page per generation attempt using browser fetch plus public CORS-fallback endpoints.
- If a public CORS relay is down, generation may temporarily fail until the next attempt or until that relay is back.
