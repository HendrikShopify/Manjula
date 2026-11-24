# Manjula build plan

Shopify theme for Manjula Essentials, built on the Blanc starter. Figma leads, code mirrors it (see `CLAUDE.md`).

- Figma: `8gfPAorI7wIn97xtkDogiX` (MANJULA - Working). Source page is **Templates FINAL** `2526:25846` (newer than Templates `246:13631`), Sections page `209:2`.
- Goal: live before Black Friday, Friday 27 November 2026. Code freeze Monday 23 November, so the last days are QA on a fresh preview theme.
- Desktop designs are final. Mobile V1 is with the client; mobile feedback lands in code as restyles, not rebuilds.

Status key: **Restyle** = section or snippet exists in Blanc, match it to the Manjula Figma. **Extend** = exists, needs a new variant or preset. **New** = build from scratch, composed from existing snippets.

## Phase 0. Foundations (4 to 5 Nov)

Nothing else starts until this is done, because every section reads these tokens.

| Task | Notes |
|---|---|
| Token export from the Manjula file | Done 4 Nov: 32 colours on the Manjula greys, radius 0, gutter 12, icon stroke 1, 34 text styles incl. serif. |
| Extend `scripts/build-tokens.js` | Done 4 Nov: custom palette, `--font-serif`, per-font trim, `label-column`. |
| Fonts | Done 3 Nov: Nimbus Sans Regular and Sabon Regular self-hosted as Latin-subset WOFF in `assets/`, declared under `fontFiles` in `tokens/figma-tokens.json`. Add more weights or italics the same way. |
| Logo | Done 4 Nov: wordmark and symbol exported from Figma (Logo, `141:3414`) with `currentColor`, inlined in `header__logo` (120 wide on mobile, 160 from lg). The footer's full-width wordmark comes with the footer restyle. |
| Store connection | Dev store or the client store with a development theme, `shopify theme dev -e development`. |
| Content model | Decide metafields and metaobjects for per-product content (table at the bottom) before building the product sections. |

## Phase 1. Global (5 to 7 Nov)

| Figma | Variant used | Code | Status |
|---|---|---|---|
| Header | Logo center, Tone Default and Inverse (over the home hero), State Menu open | `sections/header.liquid` | Built 15 Nov: logo center, Tone Inverse on home, page-load intro. Dropdown panel (Type=Image) built 15 Nov: under its nav item, other items dim, no backdrop. 18 Nov: markup inline in the section, logo-left layout removed, dropdown opens instantly, nav and utility items dim on hover |
| Mobile menu | `2384:258` | `snippets/mobile-menu.liquid` | Done (Hendrik, 19 Nov) |
| Footer | Standard | `sections/footer.liquid` | Built 15 Nov (markup inline since 18 Nov, hover dim and reveal added): image band + newsletter card, wordmark, bracketed columns, accordions on mobile; bottom bar removed 19 Nov |
| Cart drawer | Filled, Empty, plus the offer states "1 oil, one-time" and "2 oils, mixed" | `snippets/cart-drawer.liquid`, `line-item`, `cart-summary` | Built 19 Nov: all states. The theme adds the free mini; it needs the minis published to the Online Store. Subscription parts show once products have selling plans |
| Quick view | Type=Details | `snippets/quick-view.liquid`, `sections/quick-view-details.liquid` | Built 19 Nov: opens from View details on a bundle item. Product cards no longer open a quick view; the product-form quick view (`quick-view-product`) is removed |

## Phase 2. Product templates (7 to 13 Nov)

Highest revenue impact, so it goes first. The Bundle template reuses almost all of it.

`templates/product.json` in Figma frame order:

| # | Figma instance | Component {variant} | Code | Status |
|---|---|---|---|---|
| 1 | Product main | Main product {Thumbnails right / Carousel mobile} | `main-product`, `media-gallery` | Done (15 Nov), plus Bundle form type |
| 2 | Results timeline | Results timeline | `results-timeline` | Done (15 Nov) |
| 3 | Use guide | Use guide | `use-guide` | Done (15 Nov) |
| 4 | Trial results | Trial results | `trial-results` | Done (15 Nov) |
| 5 | Ingredient explorer | Ingredient explorer, plus Ingredient modal | `ingredient-explorer`, `ingredient-modal` | Done (21 Nov), reads product ingredients |
| 6 | Formula comparison | Comparison composition (Body), Comparison texture (Face), Comparison price (Hair) | `comparison-texture` (Face), `comparison-composition` (Body), `comparison-price` (Hair) | Done (15 Nov): three Figma layouts, three sections. Body oil feedback done (24 Nov): thin 1px icons, columns on one subgrid, photos set |
| 7 | Reviews | Reviews | `sections/reviews.liquid` (Judge.me) | Done (15 Nov) |
| 8 | Founder note | Image with text {Founder note} | `image-with-text-founder-note` | Done (15 Nov) |
| 9 | FAQ | FAQ {Image} | `faq-image` | Done (15 Nov) |
| 10 | Products | Featured collection tiles | `featured-collection-tiles` | Extend: `tiles` layout (code has carousel and grid) |

`templates/product.bundle.json`: Product main, Experience (UGC), Use guide, Ingredient explorer, Reviews, FAQ {Image}, Products {Tiles}. Only UGC is extra and it already exists (`ugc-carousel`).

Update 15 Nov (Templates FINAL): one template per product instead. Built: `product.face.json`, `product.hair.json`, `product.body.json`, `product.discovery.json`, `product.essentials.json` (Essentials set), `product.gua-sha.json` (renamed 22 Nov, see below), each in its Figma frame order. Templates FINAL has no Products {Tiles} or UGC on the product pages. Not yet assigned to the products in the store (store data, needs an OK). Discovery set feedback done (24 Nov): solo shots and centred dots in the bundle items, a product switch in the review filters; second round: darker item thumbs (Surface alt) and item benefits read from the product; its Use guide still needs steps in the admin. Essentials set feedback done (24 Nov): Reviews section without development and form settings, recommend share worked out from the reviews.

## Phase 3. Home (13 to 16 Nov)

| # | Figma instance | Component {variant} | Code | Status |
|---|---|---|---|---|
| 1 | Hero | Hero full-bleed, State Intro for the page-load animation | `hero-full-bleed` | Built 15 Nov: Full-bleed, marquee, Inverse button, page-load intro with the Inverse header |
| 2 | Products | Featured collection tiles | `featured-collection-tiles` | Built 15 Nov (own section) |
| 3 | Formulas | Image with text {Gallery} | `image-with-text-gallery` | Built 15 Nov (Gallery) |
| 4 | Press | Press | `press` | Built 15 Nov |
| 5 | Founder | Image with text {Centered} | `image-with-text-centered` | Built 15 Nov (Centered) |
| 6 | Experience | UGC {Slider} | `ugc-slider` | Built 15 Nov (own section); videos from `ugc_video` metaobjects 19 Nov |
| 7 | Offer | Bundle offer | `bundle-offer` | Built 15 Nov; matched to Templates FINAL 19 Nov |

Image with text is one section per layout, no layout select (Hendrik, 15 Nov): `image-with-text-gallery`, `image-with-text-centered`, and later `image-with-text-founder-note`, `image-with-text-column`. One file, not five.

## Phase 4. Content pages (16 to 20 Nov)

**Subscription** (`templates/page.subscription.json`)

| Figma instance | Component {variant} | Code | Status |
|---|---|---|---|
| Hero | Video statement (photo) | `video-statement` | Done (15 Nov), reuses the About hero with a photo |
| Horizontal scroll | Horizontal scroll | `horizontal-scroll` | Done (15 Nov), pinned sideways scroll on desktop |
| Testimonial | Testimonial quote | `testimonial-quote` | Done (15 Nov), own section |
| Products | Featured collection tiles | `featured-collection-tiles` | Done |
| Founder note | Image with text {Founder note} | `image-with-text-founder-note` | Done |
| FAQ | FAQ {Offset} | `faq-offset` | Done (15 Nov), own section |

`templates/page.subscription.json` is built. No Subscription page exists in the store yet (creating it is store data, needs an OK).

**About us** (`templates/page.about.json`)

| Figma instance | Component {variant} | Code | Status |
|---|---|---|---|
| Option B: overlay | Video statement | `video-statement` | Done (15 Nov). Templates FINAL replaced Story with this hero |
| Origin story | Origin story | `origin-story` | Done (15 Nov), own section |
| Timeline | Timeline | `timeline` | Done (15 Nov) |
| Heritage | Heritage | `heritage` | Done (15 Nov), own section |
| Press grid | Press grid | `press-grid` | Done (15 Nov); reads press_item metaobjects (20 Nov) |
| Products | Featured collection tiles | `featured-collection-tiles` | Done |

`templates/page.about.json` is built. No About page exists in the store yet (creating it is store data, needs an OK).

**Science / ingredients** (`templates/page.science.json`)

| Figma instance | Component {variant} | Code | Status |
|---|---|---|---|
| Page intro | Page intro | `page-intro` | Done (21 Nov) |
| Concerns | Concerns | `concerns` | Done (21 Nov), blocks per concern; only Sensitive skin has copy in Figma |
| How we formulate | Formulate | `formulate` | Done (21 Nov), body still Lorem ipsum in Figma |
| Approach | Approach | `approach` | Done (21 Nov) |
| Power of ritual | Ritual | `ritual` | Done (21 Nov) |
| Botanical farm | Botanical farm | `botanical-farm` | Done (21 Nov) |
| Ingredient explorer | Ingredient explorer + modal | `ingredient-explorer` | Done in Phase 2 |

## Phase 5. Utility pages (20 to 21 Nov)

| Template | Sections | Status |
|---|---|---|
| Page | Main page | Done 3 Nov: one layout (title left, text right), no layout setting; `templates/page.json`, policy pages follow |
| Contact | FAQ {Categories}, Contact | Done 21 Nov: new `faq-categories` (FAQ metaobjects per category block), `main-contact` restyled (Underline form, Contact blocks). Store page Help center (`/pages/contact`) is unpublished. |
| Landing system | Hero centered, Logo strip, Two columns narrow, Two columns equal | New `logo-strip`, `two-columns`. Not needed for launch unless ads go live with it. |

## Phase 6. QA and launch (23 to 26 Nov)

Follow `docs/CLIENT-START.md` step 5: theme check, mobile overflow on every template, keyboard pass on header, drawers and modals, fresh unpublished preview, store-side setup (subscription app, offer discounts, Judge.me, metafields filled for all three oils and the set).

## Content model (decide in Phase 0)

| Content | Per product? | Proposal |
|---|---|---|
| Ingredients (name, image, origin, benefit) | Shared across oils | Metaobject `ingredient`, product metafield `custom.ingredients` (list). Explorer and modal read it. |
| Results timeline (week, claim) | Per oil | Metaobject list or section blocks with a product condition. Prefer metafield so one template serves all oils. |
| Use guide steps | Per oil | Product metafield, list of metaobjects `use_step` |
| Trial results (stat, claim, sample size) | Per oil | Product metafield, list of metaobjects `trial_stat` |
| Product card hover photo | Per product | Product metafield `custom.hover_image` (file, image). Definition created 18 Nov. Falls back to the 2nd product image. |
| Product subtitle | Per product | Product metafield `custom.subtitle` (multi-line text): the line under the title on the PDP and in the quick view. Definition created 23 Nov. Empty uses the first sentence of the description. |
| Bottle with packaging | Per product | Product metafield `custom.packaging_image` (file, image): the packshot with the box, shown in the cart. Definition created 23 Nov. Empty uses the line's own image. |
| Page hover photo | Per page | Page metafield `custom.hover_image` (file, image), for the header dropdown. Definition created 23 Nov. No fallback. |
| FAQ entries | Mostly shared | Section blocks; product FAQ can add a product metafield later |
| Press logos and quotes | Global | Section blocks; metaobject `press_item` exists (18 Nov) |
| Benefits | Per product | Product metafield `custom.benefits`, list of `Title--Description`. Cards and picker show the titles, the PDP shows both (18 Nov). |
| Free mini offer | Per oil | Product metafields `custom.free_mini_pairs` (list of products) and `custom.mini` (product). Ritual builder reads only these (the section block fallback is removed, 20 Nov). |

## Mismatches to check in Figma

- Science: section order differs (Desktop: How we formulate before Approach; Mobile: Approach first). Template follows desktop (one order per template). Store page: Ingredients (`/pages/ingredients`, template suffix `science`).
- Landing: Mobile has no "Two columns 3".
- Product main uses Thumbnails right on desktop; Blanc code only has left, bottom and grid.

## Open questions for the client or store

- Confirm the Nimbus Sans and Sabon licences cover web use.
- Which subscription app (selling plans) and who sets it up.
- How the free minis for 2 different oils are applied (automatic discount, Shopify Function or app).
- Store access for the development theme.
