Put your battle data files here.
Expected filenames contain these keywords:
- pokedex.ts
- moves.ts
- items.ts
- abilities.ts
- learnsets.ts

The app uses Vite's import.meta.glob to eagerly read .ts modules from this folder.
It supports common Pokémon Showdown-style exports like:
- export const BattlePokedex = {...}
- export const BattleMovedex = {...}
- export const BattleItems = {...}
- export const BattleAbilities = {...}
- export const BattleLearnsets = {...}
- export default {...}
