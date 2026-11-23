# Blanc

Shopify starter theme, paired one to one with the Blanc Figma file (Slashcheckout team). Design leads: components and sections are designed in Figma first; this codebase mirrors them. Tailwind v4, Liquid, theme blocks, vanilla web components on `BaseComponent`.

## This project: Manjula

Manjula Essentials (Ayurvedic hair, body and face oils, CAD). This repo is a client copy of Blanc.

- Figma: `8gfPAorI7wIn97xtkDogiX` (MANJULA - Working). Work only on the Templates FEEDBACK page `2701:25870`: it is the source of truth for section order and holds the feedback annotations (To do, Question, Done). Templates FINAL `2526:25846` and the older Templates page `246:13631` are no longer used. Sections FINAL `2699:25605` holds the used section sets; Sections (unused) `209:2` holds the rest.
- Plan and status per section: `docs/BUILD-PLAN.md`. Read it before starting any task and tick rows off when done.
- Deadline: live before Black Friday (27 Nov 2026), code freeze 23 Nov.
- Offer logic the theme shows: welcome discount for new customers, a free mini when 2 different oils are bought (one-time or subscription), 15% off subscriptions. The Essentials Set is a full bundle.
- Reviews: Judge.me (`reviews__judgeme.js`).
- Fonts: Nimbus Sans (body, heading) and Sabon (serif styles), licensed, not Google Fonts.
- Skills: `build-section` for any section work, `sync-tokens` for token changes.
- Never publish or push to the live theme. Work on a development or unpublished theme.

## Folder map

| Folder | Holds | Figma counterpart |
|---|---|---|
| `tailwind/tokens.css` | Generated design tokens, text utilities, section shell, grid | Variables and text styles |
| `snippets/` | Atoms and molecules, one file per Figma component | Components Atoms, Components Molecules |
| `blocks/` | Theme blocks: Cell and content blocks, thin wrappers over snippets | Section grid blocks |
| `sections/` | Shopify sections, one file per Figma section | Sections page |
| `templates/` | JSON templates: section order and settings | Templates page |
| `assets/` | JS web components, icons | Foundations icons |
| `docs/` | The contract and conventions | Read me page |

## Rules that never change

1. **One name, one file.** A Figma component, its snippet, its Code Connect mapping and its pattern card share a name. `Product card` is `snippets/product-card.liquid`. Never create a second version of something that exists.
2. **Tokens only.** No raw colours, sizes, radii or spacing in markup or CSS. Everything comes from `tokens.css`. If a value is missing, add the token in Figma first, then export.
3. **Utilities live in the snippet.** Tailwind utilities go in the snippet or block that renders the element. No `@apply`, no BEM component CSS files. Only text styles, the section shell, the grid and resets live in CSS.
4. **Variants are parameters, states are native.** `Style=Secondary, Size=lg` is `{% render 'button', style: 'secondary', size: 'lg' %}`. Hover, Focus, Disabled and Loading are `:hover`, `:focus-visible`, `[disabled]`, `[aria-busy]`, never parameters. Exception: a section's Layout is never a parameter. Each section layout is its own section (`image-with-text-gallery`, `featured-collection-tiles`, `ugc-slider`, ...), never one section with a layout select (Hendrik, 15 Nov). A section's markup lives inline in the section file, never in a same-named snippet that the section only renders (Hendrik, 19 Nov). Snippets are for atoms and molecules that more than one place renders.
5. **Compose, don't restyle.** Molecules and sections render atoms; they never style them. A price looks the same everywhere because only `price.liquid` styles a price.
6. **Mobile fills.** No fixed widths on mobile. Fixed widths exist only for icons, logos and carousel cards.
7. **Keep behaviour.** Existing web components (cart, facets, search, reviews, wishlist, variant selects) keep their tag names, data attributes and events. Restyle the markup, do not rewrite the logic.
8. **JavaScript hooks are data attributes, never classes.** Scripts find elements with `[data-*]` selectors (`this.$('[data-page-edge]')`), never `.some-class`. Classes are for styling only and change freely; data attributes are the contract between markup and script. Name them for the job (`data-carousel-track`, `data-replace`).

## Where to read next

- `docs/FIGMA-TO-CODE.md`: how a Figma layer becomes code. Read before any task that starts from a Figma link.
- `docs/TOKENS.md`: token pipeline and breakpoints (to be written at milestone 3).
- `docs/COMPONENTS.md`: snippet conventions and parameter tables (milestone 4).
- `docs/SECTIONS.md`: section shell, blocks, Section grid, presets, templates (milestone 5).
- `docs/DECISIONS.md`: settled choices and why. Check before reopening one.
- `BASE-COMPONENT.md`: the web component base class.

## Working here

- Tailwind builds with `npm run dev` (watches `assets/tailwind.input.css` into `assets/tailwind.output.css`).
- Theme check config is in `.theme-check.yml`; run it before committing.
- Section schema setting ids match Figma property names in snake_case: `Show vendor` is `show_vendor`.
- Locale strings go in `locales/`, never hardcoded (the free shipping bar still has Dutch copy hardcoded; fix when touched).
- Commit messages describe the Figma change they mirror when there is one: `Button: match Figma radius token change`.

Starting a client project from this starter: `docs/CLIENT-START.md`.
