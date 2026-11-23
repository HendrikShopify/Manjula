---
name: build-section
description: Build or restyle one Shopify section from its Manjula Figma component, following the Blanc contract. Use for any task that starts from a section name in docs/BUILD-PLAN.md or a Figma node link.
---

# Build a section from Figma

1. **Find it.** Look up the section in `docs/BUILD-PLAN.md` (Figma component, variant, code file, status). Figma file key `8gfPAorI7wIn97xtkDogiX`. Find nodes by component name on the Sections page (`209:2`), not by old node ids.
2. **Read the contract.** `CLAUDE.md` and `docs/FIGMA-TO-CODE.md`. Check `docs/DECISIONS.md` before reopening any choice.
3. **Read Figma.** For both the Desktop and Mobile variant: `get_design_context` and `get_screenshot`. Mobile gives base classes, Desktop gives `lg:` classes. The MCP output is a reference, never paste it.
4. **Reuse first.** List the snippets the design is made of and check `docs/COMPONENTS.md`. Render existing snippets (button, media, price, accordion-item, rating, product-card, video). Never restyle a snippet from a section. If an atom looks different in Manjula, fix the snippet once.
5. **Status decides the work.**
   - Restyle: change classes only, keep tag names, data attributes and JS events.
   - Extend: add the new variant as a parameter or select setting, keep existing ones working.
   - New: `sections/<kebab-name>.liquid`, schema with Figma booleans as checkboxes (snake_case ids), layout variants as selects, padding via the section shell, copy in locales or settings, never hardcoded.
6. **Tokens only.** Every colour, size, gap and text style from `tailwind/tokens.css`. A missing value means the token export is behind: stop and run the `sync-tokens` skill, do not invent a raw value.
7. **Template.** Add the section to the right `templates/*.json` in Figma frame order.
8. **Check.** `shopify theme check`, render at 390, 768 and 1440 and compare with the Figma screenshots, keyboard pass for anything interactive.
9. **Record.** Add the section to `docs/COMPONENTS.md`, log real decisions in `docs/DECISIONS.md`, tick the row in `docs/BUILD-PLAN.md`. Commit as `<Section>: build from Figma` or `<Section>: match Figma <change>`.
