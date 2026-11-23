---
name: sync-tokens
description: Export Manjula Figma variables and text styles to tokens/figma-tokens.json and regenerate tailwind/tokens.css. Use after any token change in Figma or when a section needs a value tokens.css does not have.
---

# Sync tokens from Figma

1. Read `docs/TOKENS.md` for the pipeline.
2. File key `8gfPAorI7wIn97xtkDogiX`. Read all variable collections (Color, Radius, Typography, Layout with Desktop, Tablet and Mobile modes) and all local text styles through the Figma MCP (`use_figma`, read only).
3. Write `tokens/figma-tokens.json` in the existing shape. Set `source` to the Manjula file key and today's date.
4. Manjula has primitives outside the Tailwind defaults (for example `text-xs-lg` 13px, `spacing-13`, `spacing-18`) and extra text styles (`label/caps-lg`, `label/caps-base`, `label/xl`, `link/inline`, `serif/display`, `serif/lg`). If `scripts/build-tokens.js` cannot express them, extend the script, do not hand-edit `tokens.css`.
5. Fonts: Nimbus Sans (body, heading) and Sabon (serif styles) are self-hosted from `assets/`, listed under `fontFiles` in the token file. Keep that key when rewriting the file; the script generates `snippets/fonts.liquid` from it, including the ascent and descent overrides that `tailwind/text-trim.css` depends on. Text styles in Sabon must set `--trim-top: 0.324em; --trim-bottom: 0.374em;`.
6. `npm run tokens`, then `npm run dev` and check the homepage atom showcase.
7. Commit as `Tokens: sync from Figma`.
