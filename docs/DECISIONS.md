# Decisions

Settled choices. Check here before reopening one. Dated, newest first.

- 2026-11-15 · Max content width is 1728 (was 1440). Changed in Figma first (`layout/max-width`, all three modes), then exported: `--container-page: 1728px`, class `max-w-page`. Figma frames stay 1440 wide, so 1440 to 1728 has no design of its own: content keeps growing until 1728, then centres. Blog image `sizes` hints updated to the 1728 widths.
- 2026-11-15 · Header follows the Manjula Figma: logo-center only, 52px desktop bar, text actions (Account, Cart (n), $/CAD), no search and no wishlist. Nav item, Icon button (32/40/48, caps text) and the ghost Localization selector were restyled once for this. `cart-icon-bubble` takes `type: text`; `sections/cart-icon-bubble.liquid` passes the same so cart.js re-renders match.
- 2026-11-15 · Header Tone=Inverse is a token swap, not a second set of classes: on the home page the bar overrides `--color-text` and `--color-text-muted` with `--color-text-on-media`, so every atom inside turns white without new parameters. The swap is dropped while a dropdown or the mobile menu is open, which matches Figma Menu open.
- 2026-11-15 · Home page-load intro: desktop only, home only, on every home page load (Hendrik, 15 Nov; was once per session), never with reduced motion or in the theme editor. An inline script in `theme.liquid` sets `html.intro` before first paint so nothing jumps; `hero-intro.js` shrinks the wordmark into the header logo (GSAP, ease `smooth`, 1.2s after 0.6s) and slides the bar up. A 4s timer removes the class if the script never runs. Mobile has no Page load frame, so no intro.
- 2026-11-15 · `localization-form.js` now also loads when the store has more than one country (it only loaded for more than one language, so the $/CAD switch would not submit).
- 2026-11-15 · Figma source page is **Templates FINAL** (`2526:25846`), not Templates (`246:13631`). FINAL is newer: Home section heights changed and the product template is split per product (Face oil, Hair oil, Body oil, Discovery set, Essentials set, Gua sha). Build from FINAL.
- 2026-11-15 · Button restyled to the Manjula Figma: styles Primary, Secondary, Inverse (Bone fill for photography), heights 32 / 40 / 48, label/caps (label/caps-lg on lg), 16px icons, gap 12. All existing callers get the new heights.
- 2026-11-15 · Hero is one section (`sections/hero.liquid`) with its markup inline, no snippet and no Type setting (Hendrik, 18 Nov); it is the Full-bleed layout, other hero layouts are their own sections. Image or video background. It is one screen tall (`h-svh`). Scrim is 10% Ink as on the Figma node (the component description says 30% plus grain; the node wins until the designer says otherwise). The marquee is `marquee-slider` fed by Review blocks; it stops for reduced motion.
- 2026-10-28 · Utilities live in snippets, not BEM files with `@apply`. Reason: Tailwind v4 direction, the Figma MCP outputs utilities, one file per component.
- 2026-10-28 · Max content width 1440 (Figma `layout/max-width`). The old `.container` at 1600 goes. Superseded 2026-11-15: 1728.
- 2026-10-28 · The three line-item snippet sets (`cart-line-item__*`, `drawer-line-item__*`, `cart-drawer-item`) merge into one `line-item` snippet with a `layout` parameter.
- 2026-10-28 · Breakpoints: base under 768, `md:` from 768, `lg:` from 1024. No tablet designs; tablet uses mobile layout with tablet token values.
- 2026-10-28 · Token export runs through the Figma MCP, not the REST API (variables endpoint is Enterprise-only).
- 2026-10-28 · Code Connect through the MCP mapping, not the CLI (no Liquid target).
- 2026-10-28 · Padding top and bottom are per-section selects (None, Small, Medium, Large), mirrored by Figma variable modes.
- 2026-10-28 · Grid gaps are their own tokens (`layout/grid-gap-x`, `layout/grid-gap-y`), separate from the page gutter.
- 2026-10-28 · Carousel cards keep a fixed width (3 columns). Everything else on a grid fills its cell.
- 2026-10-27 · No colour scheme modes on the Color collection. Brand changes are token edits on a per-project copy of the Figma file.
- 2026-10-27 · Design leads; code follows. Figma components are designed first, then mirrored here.

## 2026-10-28: Search opens in the side drawer, not a details modal

The details-modal pattern is retired. Search lives in `search-drawer`, a `side-drawer` instance: the real GET search form with the underline search-field in the header, predictive results in the body (`sections/predictive-search.liquid`, built from search-result-group, search-suggestion and search-product-result). `header__search` is the icon-button trigger. `DetailsModal`, `search-modal.css` and the four `predictive-search__*` partials are deleted. Done 2026-10-29.

## 2026-10-28: Focus state is a 1px text-colour border

`color/focus` aliases `color/text` (was blue 600) and all Focus variants use a 1px stroke, same weight as hover. In code: `focus-visible:border-focus` without `border-2`, outlines at 1px. The focus token stays so it can be changed in one place later.

## 2026-10-29: Cart built ahead of milestone 6

Cart drawer and cart page are built from the Figma Main cart and Cart drawer specs using the atoms (line-item, cart-summary, free-shipping-bar, discount-code). Discount codes apply through `cart/update.js` with `discount`, not a `/discount/CODE` redirect. Free shipping threshold is a snippet parameter (cents, default 5000); no theme settings in the boilerplate, those come later. Cross-sell block is not built yet; it needs the product recommendations API and comes with the section grid work.

## 2026-10-29: One drawer shell

`side-drawer` is the only slide-in panel. The cart drawer, the coming search drawer, filters, the mobile menu and the review form are instances of it (`content` or `body`/`footer`). The old `CartDrawer` class, `cart-icon` element and `cart-drawer.js` are gone; the cart icon is a plain trigger. Overlay opacity is 0.3 on the `overlay` token (as in Figma), panel widths 600 (cart) / 700 (default) / 800px, motion is GSAP `smooth` 0.6s with a reduced-motion fallback. Scroll lock stays the `data-scroll-lock` attribute read by `has-[[data-scroll-lock=true]]` on body.

## 2026-10-29: No settings in the boilerplate

No theme settings and no section settings are added while building the boilerplate. Everything renders on by default (quick add, vendor, rating in search results; free shipping bar). Settings are a later milestone. Pre-existing schemas (header, cookie consent, reviews) stay until their sections are rebuilt.

## 2026-10-29: Localization switch is language only, in the header

The switcher stays a small dropdown (Figma: Localization selector, menu, item) and only switches language. Country/region and currency are not built; they come with markets. It sits first in the header icons (`header__localization`, ghost style) and is hidden when the store has one language. No new interaction code: it reuses `custom-select` for open/close/keyboard, and `localization-form.js` is 10 lines that submit Shopify's localization form (`locale_code`). The old `language-localization` snippet and its 120-line script are gone. Flags (Figma Type=Flag) wait for flag assets in the theme; a language is not a country, so the mapping needs a decision first.

## 2026-10-29: Newsletter signup is two atoms on Shopify's customer form

`newsletter-input` (3 styles) and `newsletter-signup` (3 layouts) replace the old `newsletter` snippet and its four footer CSS classes. No Klaviyo or app code: the form posts to `/contact` with `contact[tags]=newsletter`, the success and error text is the form result. The footer uses `stacked-left` with the `inline` field. Copy defaults come from locale keys (`newsletter.title`, `description`, `fine_print_html`). `icon-button` got a `submit` flag for the underline arrow.

## 2026-10-29: Filters live in one drawer, applied live

The collection and search toolbar is Filter button + count + Sort dropdown; every filter and the sort live in one left drawer (440px, `side-drawer` size `xs`). Active filter chips only exist above the product grid, on desktop and mobile, never inside the drawer or a sidebar. The sidebar layout comes later and reuses the same `filter-group` snippets. Changes apply live: `filters.js` (`<collection-filters>`) fetches the section with `?section_id=` and swaps the grid, counts, chips and groups, so Show N products only closes the drawer. The group being edited keeps its DOM (only badge and summary refresh), the rest re-render with new counts. Sort exists twice (toolbar dropdown and drawer radios) and `filters.js` keeps them in step. The old `facets*` snippets, `facets.js`, `show-more.js` and their CSS are gone. The collection paginate size went from 1 to 24 so filtering is testable.

## 2026-10-29: One accordion for filters too

Filter group no longer has its own header. Figma: the Accordion header gained a `Show selected count` boolean (title row with a Count badge) and replaced Filter group header, which is deleted; Filter group keeps its Divider and inline content, so Show selection summary still works on the instance. Code: `filter-group` renders `accordion-item` (new `count` and `attributes` params) with the value stack as its content, and `filter-group-header` is gone. The header is now 60px (20px padding) instead of 56px.

## Grid density is two sizes, remembered per breakpoint
Large (4 columns, 1 on mobile) and Small (6, 2 on mobile) as in Figma. The switch only flips data attributes on the grid container, so live filtering keeps the choice. Defaults are Large on desktop and Small on mobile, no theme setting. The choice is stored in localStorage per breakpoint (try/catch, works without it).

## Mobile menu follows Figma: two styles, no setting
The menu is a full-screen panel from the left with the Accordion or Drill-down style as a snippet parameter (default accordion). Items, back header and extras are snippets of their own. The header still renders accordion until a style is chosen in the section. Feature card tiles wait for a rule on where their images come from (Shopify menus carry none).

## 2026-10-30: Swiper for sliders

Media gallery, media lightbox and Featured collection carousel run on Swiper (swiper-bundle.min.js, loaded in theme.liquid), not native scroll-snap. Swiper has no CSS file here: the container is `.swiper overflow-hidden`, the wrapper `.swiper-wrapper flex`, slides `.swiper-slide`, all styled with Tailwind. Our own arrows, thumbnails and progress segments are wired to the Swiper API.
- 2026-10-30 · No layout CSS file. Page wrapper is `mx-auto w-full max-w-page px-page-margin`, 12-col grid is `lg:grid lg:grid-cols-12 lg:gap-x-gutter`, written as token utilities in markup.
- 2026-10-30 · JS hooks are data attributes, never classes (CLAUDE.md rule 8). Legacy scripts still select by class and move over as their components are rebuilt.
- 2026-10-30 · Quick view is a side-drawer (size lg) filled from the quick-view-product section, not its own modal. Triggers are [data-quick-view-trigger]. The old quick-view modal, modal-opener, media-slider.js and product__form / product__media-slider are removed.

## 2026-10-30: Search page

`main-search` follows Figma Main search (Results and No results, desktop centered header, mobile left). Search is products only: no article or page results and no type tabs (removed from Figma and code). Every search form (drawer, page, filter drawer) sends `type=product`. Popular search chips come from the `templates.search.popular_terms` locale string (comma separated). Page size is 24.

## 2026-10-30: Blog and article

`main-blog` and `main-article` follow Figma Main blog and Main article. `article-card`, `article-meta` and `rich-text` are new snippets; `card-article` is deleted. The blog paginates by 7: the first article on every page is the Featured card, the other six the 3-column grid, so no page ends with an orphan row. Tag chips are links to `blog.url/tagged/<tag>`. Shopify blogs have no description, so the Figma Description is not rendered. The article lead is `article.excerpt`. Share row: native share (only when `navigator.share` exists), copy link and mailto, in `article-share.js`. Keep reading shows up to 3 other articles of the same blog. Mobile uses numbered pagination for now, Figma shows Load more (open, same as collection and search). The Newsletter section under both templates does not exist yet. Reading time is words / 200, minimum 1. The legacy `.article-grid` rule in `tailwind.input.css` is now unused.

Blog posts (Figma Sections / Blog posts) is the `blog-posts` snippet plus a `blog-posts` section with a fixed blog handle, added to `templates/index.json` under the atom showcase as the homepage example, like product recommendations does for Featured collection. Figma has no mobile Featured layout; below lg the Overlay card stays 4:5 and the Horizontal cards render as Vertical cards. `sections/featured-collection.liquid` is an empty stray file.

## 2026-10-30: Meta tags

`meta-tags` (rendered in `<head>`) was an empty file. It now outputs Open Graph and Twitter card tags on every page with fallbacks (description to `shop.description`, image to `page_image`, then the latest article image on a blog, then `settings.share_image`), `og:type` article/product/website, article published time, author and tags, product price, and a BreadcrumbList JSON-LD that mirrors the breadcrumbs snippet. The description meta in `theme.liquid` falls back to `shop.description`. Home and blog descriptions read the shop name until the store has a description.

## 2026-10-30: Page

`main-page` follows Figma Main page: title (heading/1, heading/2 below lg) and optional subtitle in the prose column, body through `rich-text`. No breadcrumbs, as in the design. The subtitle reads `page.metafields.custom.subtitle` (Figma Show subtitle); Shopify pages have no last-updated date in Liquid, so nothing is invented when the metafield is empty.

## 2026-10-30: Policy pages

Shopify renders /policies/* itself inside the theme layout; a theme cannot provide a policy template. `tailwind/components/shopify-policy.css` styles Shopify's markup (`.shopify-policy__container`, `__title`, `__body .rte`) with `@apply` of the same utilities as `main-page` and `rich-text`, so the policy pages look like the Page template. This is the one deliberate exception to the no-component-CSS rule, because the markup is not ours. Shopify's own policy stylesheet centers the title; `text-left` overrides it. Keep this file in step with `rich-text.liquid`.

## 2026-10-30: Contact

The Figma Contact template is a Section grid preset built from Block / Text, Block / Buttons, Field and Icon text. Section grid and blocks are milestone 5, so `main-contact` composes the same layout from the atoms: details cell (4 columns) and form cell (7 columns from column 6), form first on mobile. Contact details come from `shop.email`, `shop.phone` and `shop.address.summary`; opening hours, title, body and the subject list are locale strings. New `social-links` snippet and Lucide `phone`, `map-pin` and `clock` icons. The FAQ section under the form is not built yet (needs the accordion section and a content source).

Shopify injects a `div.h-captcha` (invisible hCaptcha) into contact and customer forms on first interaction. As a block-level flex child it takes a `gap` slot and pushes the content below the form down by one gap. Forms that use `gap` get `[&>.h-captcha]:absolute` (with `relative` on the form) so the widget stays in the DOM but out of the flow.

## 2026-10-31: 404

`main-404` follows Figma Main 404: Empty state type 404 (the search field and the Show search property were removed from the Figma component, no search on the 404), then Featured collection in grid layout with the title Popular right now and 4 products of a fixed collection set in the section. `empty-state` lost its own `py-16`: a `class` override could not beat it (same utility, later in the cascade), so the parent now owns the padding.

## 2026-10-31: Reviews rebuild

The reviews module keeps its three JS layers (`reviews__core.js` state and cache, `reviews__judgeme.js` adapter, `reviews__ui.js` DOM) and its `data-reviews-*` hooks; the snippets are rebuilt one by one on the atoms with utilities, and each legacy `reviews__*.css` file goes when its snippet is done. Review card first: `reviews__card`, the answer/photo/video templates and the list wrapper, `reviews__list.css` deleted. Dates render as "5 July 2026" (day, long month, year) in every locale, as in Figma. Tested on the Manjula Essentials store, which has live Judge.me reviews.

Rating summary and histogram rebuilt (summary markup in the section, `reviews__histogram` snippet); `reviews__histogram.css` and the summary rules in `reviews.css` deleted.

Reviews toolbar, chips, pagination and empty states rebuilt on `input`, `chip` (dropdown and active, new `label_attributes` for the JS label slot, `aria-selected` styles the selected dropdown chip at runtime), `dropdown-menu` + `menu-item` (the check now follows `aria-selected` through `group-aria-selected`, and the label span carries `data-menu-item-label`), `link` and the pagination-item classes. `reviews__ui.js`: `showEmpty(type, message)` drives the empty block and its three actions, every `[data-reviews-clear]` clears. Four more `reviews__*.css` files deleted.

## 2026-10-31: Reviews section in Figma

The review atoms existed in Figma but no composed section did. Added Sections / Reviews (Viewport Desktop and Mobile, Show pagination) built from Rating summary, Reviews toolbar, three Review cards (40px apart on desktop, 32px on mobile) and Pagination (Numbered on desktop, Load more on mobile), with the section padding (Medium) and page margin variables on the page background, and placed it in the Product template under Product main. Fixed the Rating summary Mobile atom on the way: its heading and histogram were fixed 400px and overflowed a 358px column, now they fill. Code follows: `sections/reviews.liquid` wrapper is `bg-background py-section-md`, the legacy beige `.reviews` rule is gone.

Rating summary moved to the 12-column grid (Figma atom and code): heading in columns 1 to 8, aside in columns 10 to 12, gutter from the layout variable; the 288px fixed aside is gone. Review filter and sort dropdowns render the `dropdown-menu` snippet (new `width` and `attributes` parameters, `w-60` under a chip as in the Figma Chip Open state) instead of a hand-written list; the chip chevron turns with `aria-expanded`.

Reviews toolbar filters and sort are the Select atom (sm), in Figma and in code, not dropdown chips: `reviews__ui.js` clones `select` from the template, fills the options before the element connects, and listens for `select:change`; its own open/close/keyboard code is gone. The Figma Reviews toolbar got Show search, Show filters, Show sort and Show write toggles; its Mobile variant is a vertical stack with the selects filling the width.

Select got a Width property (Fill, Hug) in Figma and a `width` parameter in code; Hug fits the value with a 240px menu and is what the reviews toolbar uses from md.

The review form (Figma Review form, 129:2665) is built from the atoms: `field` around `input`, `textarea`, `rating-input`, `file-upload` and `upload-preview`, name format and custom questions are radio `chip`s (`input_type: 'radio'`), submit and close are `button`. `reviews__form.css` is deleted. Errors and the status line are `helper-text`, so `reviews__ui.js` writes into `[data-helper-text]` and hides the email hint while its error shows. Rating hover preview is a tiny custom element (`rating-input.js`) instead of sibling selectors, so the fill logic stays readable.

Media lightbox follows a reference with no thumbnails or dots: the image fills the window height (4:5), one white pill holds previous, counter and next, close sits top right. Click zooms 2.5x at the click point and the zoomed image is dragged to pan (Figma State=Zoomed). The reviews photo dialog is gone: reviews render the same `media-lightbox` with `dynamic: true` and call `setItems`, so review videos play in the same viewer with native controls. `tailwind/components/reviews.css` is deleted, so no legacy `reviews__*.css` is left.

Footer rebuilt on atoms: `snippets/footer.liquid` (layout standard or minimal) with `menu-heading`, new `menu-links`, `accordion-item` (mobile), `social-links`, `newsletter-signup`, `divider`, `localization-selector` and new `payment-icons` (also used by the cart summary). No section settings: the columns come from the `footer` menu (top-level links = headings, children = links), the about text and copyright from `footer.*` locale keys, policies from `shop.policies`. `footer.css`, `footer__linklist` and `footer__socials` are deleted. Desktop and mobile use one DOM order with `order-*` utilities, except the menus, which render twice (columns, accordions) and swap with `lg:hidden`.

Placeholder logo: "Blanc" in Inter Semi Bold, outlined, `assets/logo.svg` (fill #171717, 106x32) and `assets/logo-symbol.svg` (the B). Figma Logo component (Wordmark, Symbol) holds the same vectors bound to `color/text`. `header__logo` is the one logo snippet (header, mobile menu, footer): `h-6` on mobile, `h-8` from lg, width follows the drawing, alt is the shop name. Swap the SVG per client. In Figma, scale a logo instance with Rescale, then set the height back (resizing the vector inside an instance does nothing).


## 2026-10-31: Header rebuilt on atoms

`snippets/header.liquid` (layout logo-left or logo-center) replaces `header__menu`, `header__account`, `header__cart`, `header__localization`, `header__search` and the legacy `header.css` / `header__menu.css`; only `header__logo` and `wishlist__link` stay as their own snippets. The section schema lost its `menu` setting (no settings in the boilerplate): the menu is `linklists['header-menu']` with `main-menu` as fallback. New atoms `nav-item` and `mega-menu` (Columns layout). The panel is positioned against the `<header>` (the list item is not `relative`), so it is full width and flush under the bar like Figma. The no-JS hover fallback for the panel is dropped with the CSS file. Header icon buttons are md (44px) as in Figma, the mobile menu button too. Announcement bar is not built because it needs merchant text; it comes with settings.

Mega menu backdrop: Figma Header State=Menu open gained a Backdrop (color/overlay at 30%, bottom of the panel to the bottom of a 900px window) and Templates / Home has a Menu open frame. Code: a fixed overlay inside `header` that fades in through `group-has-[[data-nav-item][data-open]]/header`, no JS. The bar (background and border) moved to an inner `relative z-10` wrapper so the overlay dims the page but not the bar.


## 2026-10-31: Buy box add-ons

Optional extra products in the buy box. Figma: Button got Show price + Price (shape dot, no text dot), new Add-on component (Molecules) and Product form Type=Add-ons. Code: `button` takes `price`/`price_amount`; `add-on` is the card (checkbox + label stretched over the card, so no nested labels); `add-ons` is the block. The products come from the product metafield `custom.add_ons` (list.product_reference, storefront PUBLIC_READ) instead of a section setting. `product-form` shows the total in the Add to cart button only when the product has add-ons. `product-form.js` recalculates the total on quantity, add-on and variant changes (the variant price rides on `data-amount` of the price in the refetched button) and, when add-ons are checked, posts one JSON request to cart/add with the page product (id, quantity, selling plan, properties) plus each add-on at quantity 1. Without add-ons the old FormData request is unchanged. Open: unchecking an add-on once it is in the cart is a cart drawer matter, not this card.


## 2026-10-31: Bundle builder

Figma: Templates / Bundle builder (Desktop, Mobile) on the existing Bundle builder Type=Box composition. Code: page template `page.bundle-builder.json` with section `main-bundle-builder`, snippets `bundle-tile`, `bundle-slot`, `bundle-tier-progress`, `bundle-tray`, and one custom element `bundle-builder` (`assets/bundle-builder.js`). Products come from the page metafield `custom.bundle_collection` (collection reference), falling back to all products, max 24. Tiers (2, 4, 6 items; 10, 15, 20%) are static in the section: the discount is only communicated here. The merchant makes it in the Shopify admin as an automatic discount on the same quantities, and the tray shows an estimate from the static tiers. One JSON request to cart/add with every selected variant, then the cart drawer opens and the selection resets. Placeholder strings in the locale use `[number]` style tokens because `{...}` breaks the Liquid tokenizer inside `t` args. Not built: the Multi-step type, multi-variant products, stock limits per variant (the cart reports them as an error under the button).


## 2026-10-31: Customer accounts removed from the theme

Shopify's new customer accounts are hosted by Shopify, so the legacy storefront account templates are gone: `main-account`, `main-reset-password`, the login snippets and `customer.js`. The header and mobile menu account icons keep linking to `routes.account_url`, which Shopify routes to the hosted accounts.

## 2026-10-31: Gift card template removed

The Dawn gift_card template had missing translation keys and a missing stylesheet. It is removed for v1 and comes back as a proper build with a Figma design.


## 2026-11-01: Newsletter section and popup

Figma: Sections / Newsletter existed (Centered, With image); added With image / Mobile. New Molecules / Newsletter popup (Desktop 800 with image, Mobile image on top) and a Templates / Newsletter popup section with Home Desktop and Mobile frames. Code: `snippets/newsletter.liquid` plus a thin `sections/newsletter.liquid` (centered, no settings, preset so it can be added in the editor; also added to `templates/index.json`), and `snippets/newsletter-popup.liquid` with `assets/newsletter-popup.js`, rendered once in `theme.liquid` above the cookie banner. The popup reuses the Newsletter signup atom with its own form id (`popup-newsletter`) so the form result (the page reloads after the post) lands in the popup, which then reopens by itself. Timing and snooze are parameters with defaults (8 seconds, 7 days), not settings. The image of the popup and of the with-image section waits for theme settings. Not testable on the dev store: the actual POST (Shopify answers automated requests with a bot check); the markup and logic are the unchanged signup atom plus the popup shell.

## 2026-11-01: Minimal footer removed

Figma Footer lost its Minimal layout (Desktop and Mobile); the footer snippet has no `layout` parameter any more and renders the standard footer only.

## 2026-11-01: Comparison table

Figma: Atoms / Comparison (cell set, column header set, row label), Sections / Comparison table (Highlight fill, card, tint, none x Dividers solid, dashed, dotted x Desktop, Mobile). Code: snippets `comparison-cell`, `comparison-column-header`, `comparison-row-label`, `comparison-table`, section `comparison-table` and `comparison-table.js` (tooltip pinning, scroll fade). Real `table` markup; the label column is two units wide next to one per column. No switcher: on mobile 2 to 3 columns fit as is, 4 or more scroll horizontally with native scroll, a sticky label column and a fade. Data is placeholder strings in the section (`name::type::highlighted::cta_label::cta_url::product::image` per column, `label::description::info::values` per row, values split by `;;`), because Liquid cannot build objects and `parse_json` does not exist in Shopify. No metafields or metaobjects yet: a later adapter only has to emit the same strings. No theme or section settings.

## 2026-11-01: Breakout grid and Section breakout

Figma: Sections / Section breakout (Preset Media band, Bleed right x Viewport) on a 14-track grid (6 on mobile): two outer tracks around 12 content columns. Outer track = page margin minus gutter (24 on desktop, 0 on mobile; Figma holds 0.01 because a grid track cannot be 0). Also a Blank breakout grid pair of frames. Code: `build-tokens.js` generates `.section-breakout` and `--grid-breakout` in `tailwind/tokens.css` (outer tracks are `minmax(max(margin - gutter, 0), 1fr)`, so they grow on windows wider than `layout/max-width` while content stays capped). Cells are placed by content column number (`--start`, `--span`; `--start-mobile`, `--span-mobile`) and `data-bleed` full, right or left. The column count switches at 1024 (lg), matching the other sections, not at the tablet layout mode. The existing 21 sections keep `max-w-page px-page-margin`; convert one only when a design needs a full-bleed cell. Two section files, one per preset, because there are no section settings to pick a preset; both pass placeholder copy to `snippets/section-breakout.liquid`. Verified with the real CSS at 1440, 1900 and 390 in a static render; the dev server was not reachable for a Liquid render.

## 2026-11-01: Video and UGC

Figma: Atoms / Media / Play button and Video (Ratio 4:5, 9:16 x State Paused, Playing x Sound Muted, Unmuted), Sections / UGC (Layout Grid, Carousel x Desktop, Mobile). There is no pause button: Paused shows only a play button; Playing hides it and shows the sound toggle and the progress bar, and tapping the video pauses. Code: snippets `play-button`, `video`, `ugc`, sections `ugc-grid` and `ugc-carousel`, `video-player.js`, icons `icon__volume-2` and `icon__volume-x`. Defaults: videos start muted, loop, `preload none`, only one plays at a time, and a video pauses when it leaves the viewport. Two section files because there are no section settings to pick the layout. Data is placeholder cards; the snippet takes a `videos` list of Shopify video media so a later source only has to supply that.

## 2026-11-03: Main page Sidebar layout (Manjula)

`main-page` got a `layout` select, centered (Blanc) or sidebar (Figma Main page Layout=Sidebar): from lg the title (display/2, heading/1 below lg) and subtitle sit over columns 1 to 4 and the rich text over columns 6 to 10, stacked below lg. `templates/page.json` uses sidebar. Shopify policy pages are the same legal pages, so `shopify-policy.css` now mirrors the sidebar layout. Rich text links use the link/base text style in text colour, as in the Figma Rich text block, in both `rich-text` and the policy CSS.

## 2026-11-03: Text trimming like Figma

Figma trims every text box to cap height and baseline, so its spacing is measured from the letters, not the line box. `tailwind/text-trim.css` does the same for all text, without classes: `text-box: trim-both cap alphabetic` on every element where the browser supports it (Chrome, Edge, Safari 18.2+), which reads the metrics from the font itself. Firefox gets a ::before / ::after fallback on block text elements (headings, p, blockquote, figcaption, dt, dd, not flex or grid containers), sized by `--trim-top` and `--trim-bottom` (Nimbus Sans 0.5em and 0.167em, Sabon 0.324em and 0.374em). The @font-face rules carry ascent, descent and line-gap overrides so Windows uses the same metrics as macOS. Spacing values from Figma can be used as they are.

## 2026-11-04: Font metrics normalised

The self-hosted WOFF files are patched so every browser and OS measures text the same way: hhea, typo and win ascent/descent are equal (Nimbus Sans 667/333, Sabon 976/228), all line gaps are 0 and USE_TYPO_METRICS is set. Nimbus Sans shipped with a 200-unit line gap and separate Windows metrics (880/250). Sabon's OS/2 cap height said 726 while its capitals are 698 high, so the native cap trim left a gap above the letters; it is now 698 and its fallback top trim is 0.324em. Re-exporting the fonts means repeating this patch.

## 2026-11-15: Header dropdown is the Image dropdown panel

The Manjula header opens `snippets/dropdown-panel.liquid` (Figma: Dropdown panel, Type=Image), not the Blanc full-width mega menu. The panel sits under its own nav item, with the list text lined up with the item (left -24px), and starts at the bar's bottom edge (the nav stretches to the bar height). While a dropdown is open the other nav items dim to 30%. There is no backdrop: the Menu open frame has none. Shopify menus carry no images, so the 180px image is the child link's collection or product image (`link.object.featured_image`), swapped on hover or focus.

## 2026-11-15: No current-page underline, header stays transparent, no gaps in the dropdown list

Hendrik: the nav item has no Current look any more (aria-current stays for screen readers). Figma: the State=Current variants of Nav item (157:5093) are deleted; no instance used them. The Inverse header bar no longer turns white when a dropdown opens; it stays transparent with on-media text, and panels inside it get the normal text colours back via --header-text. The dropdown list has no gaps between links: the 16px spacing is padding on each link, so hovering down the list never drops into a gap.

## 2026-11-15: Homepage sections built

All homepage sections from Templates FINAL are built and in `templates/index.json` in Figma order: Hero, Products (featured-collection tiles), Formulas (image-with-text gallery), Press, Founder (image-with-text centered), Experience (ugc-carousel slider), Offer (bundle-offer). Choices made on the way:
- Product tile hover shows the product's 2nd image (the Figma Face oil tile shows a photo; the component's Hover only tints). To confirm with the designer.
- Tile benefits read the product metafield `custom.benefits` (single-line text).
- Press logos are merchant uploads per block; no outlet logos are stored in the theme. The first block starts selected.
- The Offer price comes from the bundle product (`essentials-set`); the heading is copy, so it must match the real discount.
- Eyebrow and Bracket are shared snippets (`eyebrow`, `bracket`), one per Figma component, used by featured-collection-tiles, image-with-text-gallery and bundle-offer.

## 2026-11-15: Footer

Built from Footer Layout=Standard (210:1263). The bottom bar (policies, language and country, payment icons) is off, as in Figma, behind the section setting "Show bottom bar"; the legal links live in the Help column instead. The footer columns are the `footer` menu: the store must nest it (Shop, About, Help with their links) to get the Figma columns; a flat menu shows as one column. Figma shows a Spotify icon in Follow us; social-links has no Spotify yet. The underline newsletter input now shows SUBSCRIBE as caps text instead of an arrow (Figma: Newsletter input, Underline).

## 2026-11-15: One section per layout

Hendrik: no section with a layout select for Image with text. Each Figma layout is its own section and snippet: `image-with-text-gallery` (Formulas), `image-with-text-centered` (Founder), and every new Image with text layout gets its own file too (Founder note, Column/Story). The old `image-with-text` section and snippet are deleted. Same for the other sections: Products is `featured-collection-tiles` and Experience is `ugc-slider`, each its own section and snippet. The Blanc carousel and grid layouts stay in the `featured-collection` and `ugc` snippets (used by main-404, product-recommendations, ugc-carousel and ugc-grid); the multi-layout `featured-collection` section is deleted and `ugc-carousel` is carousel-only again.

## 2026-11-15: Header items line up; text trim gotcha

`tailwind/text-trim.css` trims every block's line box to cap height. A plain block (`div`, `custom-select`, `localization-form`) that holds an inline-flex button therefore puts the button on a trimmed baseline, 1px lower than its siblings. Wrappers of buttons in a flex row must be `flex` (or `inline-flex`), never `block`. Fixed for `#cart-icon-bubble`, `localization-form` and its `custom-select`; every header label now sits on the same centre line.


## 2026-11-15: UGC slider loops from 8 videos

Hendrik: loop the UGC slider, but when there are too few videos stop at the container edges. `ugc-slider.js` loops with 8 or more videos (desktop shows about 4.5, Swiper needs spare ones to loop without a gap). With fewer it does not loop: the first video stops on the left page margin and the last on the right one, on every screen size; arrows switch off at the ends. How: the edge is `padding-inline` on the Swiper track (Swiper measures inside it), plus `centeredSlidesBounds` on desktop. Do not use `slidesOffsetBefore/After` with bounds: the snap points come out wrong. With bounds Swiper's `activeIndex` also sticks (several videos share one stop at each end), so in non-loop mode the component owns the active index (`goTo`): arrows, clicks and swipes move it one video at a time.

## 2026-11-15: Product templates

One template per product, each from its own Templates FINAL frame: `product.face.json`, `product.hair.json`, `product.body.json`, `product.discovery.json`, `product.essentials.json` (Essentials set), `product.gua-sha.json` (renamed 22 Nov, see below). Per-product copy lives in section settings and blocks, not in metafields (Hendrik). Choices made on the way:
- Ingredient modal (Figma Ingredient modal, 21 Nov) is `snippets/ingredient-modal.liquid`, rendered once per ingredient by the explorer. It uses the side-drawer shell for focus trap, Escape and overlay, with its own content: photo, Close, name, facts (function, botanical, Ayurvedic name), description, research sources. Mobile is full screen; desktop is a 620px panel 40px from the right and bottom edge, as high as its content. Content lives on the `ingredient` metaobject (sources are `research_source` entries: label + url). Descriptions are two short paragraphs, story then evidence, with no drug claims (no eczema, acne or hair-growth claims) and lab-only research named as such.
- Ingredient explorer reads the store, not blocks (Hendrik, 21 Nov): a product list setting picks the oils (each one a Product type filter); the index is every `custom.ingredients` entry of those oils, once each, tagged with each oil that has it. On an oil page that oil is selected first. Functions match the ingredient Function field. The old Selected product type setting and the ingredient blocks are gone.
- Product form Type=Bundle is derived, not a setting: main-product shows the "What's inside" list when it has Bundle item blocks, and the button then drops its price. Gua sha uses the same main-product: with no ritual oils and no selling plan, the ritual builder is a plain Add to cart with the price in the button.
- Comparison price shows display figures (heading-4 / heading-2) formatted in the section, not through the Price atom: the Price atom has no heading sizes and these are not live prices of products in the store, except "one bottle", which is the product's own price.
- Results timeline mobile Next button scrolls the native overflow track; no Swiper.
- Accordion item default title is now label/base (Figma). This changes filter group titles too; caps stays for the footer and the PDP details.
- New atom variants: Badge style glass, Progress bar size xs.

## 2026-11-15: About page

`templates/page.about.json` from Templates FINAL (About us). Choices made on the way:
- The Section breakout presets Story and Heritage are their own sections (`section-breakout-story`, `section-breakout-heritage`), not new presets on the old `section-breakout` snippet, following one section per layout. They use the shared breakout grid in tokens.css.
- The video hero is its own section (`hero-video`), not a new type on `hero`.
- The header gets a setting "Also transparent on templates" (default `page.about`), so any template that starts with a full-bleed hero can use the transparent header. Home still uses "Transparent over the homepage hero".
- Play video opens the full video with sound in a native dialog; the background keeps playing muted.
- Press grid logos are uploads per block, like the Press section. The Figma wordmarks are not stored in the theme.
- Lorem copy in Figma (Heritage quote, press excerpts) is left empty in the template.

## 2026-11-15: Subscription page

`templates/page.subscription.json` from Templates FINAL (Subscription). Choices made on the way:
- The hero reuses `hero-video` with a photo and no video (same layout; Play video only shows when there is a video). The header default for "Also transparent on templates" is now `page.about, page.subscription`.
- Horizontal scroll pins on desktop and moves the track sideways while the page scrolls (Figma: a 900px track scrolled sideways, clipped). With reduced motion it is a native sideways scroll instead. The four steps keep their Figma positions, so the section takes at most 4 blocks.
- The numerals are exported from Figma as `assets/numeral-1.svg` to `numeral-4.svg`, filled with currentColor (Surface). The Figma background blur on them is dropped: they sit on a plain background.
- Testimonials {Quote} and FAQ {Offset} are their own sections (`testimonial-quote`, `faq-offset`), one section per layout.
- Figma has step 3 text equal to step 2 text and only one FAQ answer; the other answers are left empty in the template.

## 2026-11-15: Product card hover photo

The tile hover photo comes from a product metafield `custom.hover_image` (Hendrik, 15 Nov), so it stays out of the product gallery. The 2nd product image is the fallback; with neither, the tile only tints. The Figma Product card has only the tint in its Hover state.

## 2026-11-18: Store data created (Manjula admin)

Approved by Hendrik, from the Notion page "MANJULA store data". The store is live, so nothing shows on the live site before launch:
- Metaobjects: `research_source`, `ingredient`, `use_step`, `faq`, `press_item`, `ugc_video` (storefront readable, translatable).
- Product metafields (custom): `benefits` (list, `Title--Description`), `usp_tags` (list), `scent`, `size`, `use_steps` (list), `ingredients` (list of `ingredient`), `faqs` (list), `hover_image`, `solo_image`, `packaging_image`, `subtitle`, `whats_inside` (list), `free_mini_pairs` (list), `mini`, `add_ons` (list). Page metafields (custom): `faqs` (list), `subtitle`, `bundle_collection`, `hover_image`.
- Mini products Face, Hair and Body oil mini as drafts (`custom.size` 30ml), with redirects to the full oils. A redirect only fires while the mini page 404s. The minis are active and on the Online Store now (19 Nov, so the cart can add the gift), so they use template `product.mini` (template suffix `mini`): it sends the visitor to the full oil (handle minus "-mini"), noindex, canonical to the full oil. The store redirects stay for when the minis go back to draft.
- Pages About us (`about`), Subscription (`subscription`), Help center (`contact`), Ingredients (`ingredients`, template suffix `science`), all hidden until launch.
- New menus `header-2026` and `footer-2026`; the theme reads these, so the live `footer` and `header-menu` stay untouched.
- Three automatic free-mini discounts (buy 2 of the other two oils, one-time only, get the mini free), scheduled from 27 Nov. Shopify cannot check "two different oils": two of the same oil also qualify. WELCOME10 already existed, so no new welcome code. Since the theme adds the minis at £0, these three discounts save nothing; Hendrik (19 Nov) keeps them active anyway.
- `custom.ingredients` is now a list of `ingredient` metaobjects; the product details accordion lists their names, comma separated.

## 2026-11-18: Header is one layout, inline in the section

`snippets/header.liquid` is gone: its Manjula markup (logo center) lives in `sections/header.liquid`, and the Blanc `logo-left` layout with search icon, account icon and wishlist link is removed, so there is no `layout` parameter (Hendrik, 18 Nov: never keep a variant that is not in the final design; section markup is not a snippet). `wishlist__link` was only used there, so it is deleted too. The dropdown panel opens instantly; only closing fades. Section settings never mention Figma (merchant-facing text only).

## 2026-11-18: Mobile menu is accordion only

The drill-down style is removed from `mobile-menu`, `mobile-menu-item` and `mobile-menu.js`, and `mobile-menu-header` (its back bar) is deleted. Categories expand in place as `<details>`; there is no `style` parameter (Hendrik, 18 Nov).

Categories render `accordion-item` (icon plus, style caps), the same accordion as the footer and FAQ; `mobile-menu-item` is link rows only (Hendrik, 18 Nov: one accordion, not two). Close is a text button ("Close"). On the inverse header the menu panel gets the normal text colours back, like the dropdowns.
Child links that point to a product show as `product-card` (layout tile) in a 2-column grid inside the category, the same tile as featured-collection-tiles; the "All …" row is then left out.
The mobile menu has no account link (not in the final design). Its bottom bar holds language and country (country as "$/CAD", menus open upward) and the social links. Child link rows have no indent.

## 2026-11-18: Social links come from the store's brand settings

`social-links` reads `shop.brand.metafields.social_links.<platform>` (Settings > Brand > Social links), so the footer, contact page and mobile menu show the store's own accounts. The theme settings group "Social media" is removed: it held another store's links. Platforms without an icon (Spotify, Snapchat, Tumblr, Vimeo) are skipped.

## 2026-11-18: Header hides on scroll down, shows on scroll up

The header is not fixed in view. Scrolling down past it slides it up out of view; any scroll up brings it back with a solid background (`bg-background`, and on the inverse header the normal text colours). Back at the top it is transparent again on the home page. How: the section wrapper is `sticky top-0 pointer-events-none` (schema `class`), and `sticky-header.js` sets `data-hidden` and `data-scrolled` on `[data-header]`. It never hides while a menu or drawer locks the scroll (Hendrik, 18 Nov; reference olafhussein.com).

The homepage logo intro is triggered by scroll: past 80px it plays in full (1.2s, `smooth` ease), back above 80px it plays in reverse. The big wordmark lives in the header (above the bar, same stacking context), not in the hero, because the hero's `isolate` kept it under the header bar. `<html data-intro="waiting|played|done">`: the text and wordmark turn dark as soon as the intro plays, the background only comes in once it is done, and the header only starts hiding then too.

## 2026-11-18: Parallax image

`paralax-img` (assets/global.js) moves the image or video inside it from -15% to 0% while it scrolls through the viewport (GSAP ScrollTrigger, scrubbed; nothing moves with reduced motion). Sizing is utilities in the markup, not `@apply` CSS: the element fills its box (`absolute inset-0 overflow-hidden`), the media is `h-[118%] w-full`, top aligned: 1 / 0.85 rounded up, so the media covers the box at both ends of the move. `data-parallax-start` sets the ScrollTrigger start (default `top bottom`). The hero uses `top top`: it is on screen at load, so with the default half the move was already spent and it was barely visible (Hendrik, 18 Nov).

## 2026-11-18: Ghost icon buttons have no hover background

`icon-button` style ghost lost `hover:bg-accent-subtle`: the mobile menu button showed a light square over the hero. It is gone for every ghost button (menu button, drawer and lightbox close, lightbox arrows, social icons, cart icon), so the style keeps one look (Hendrik, 18 Nov).

## 2026-11-18: Header dead code removed

Removed what the Manjula header no longer uses: `snippets/mega-menu.liquid` (the header renders dropdown panels) and its `sections.header.view_all` key, the mobile menu backdrop, the `show_extras` and `open` params of `mobile-menu`, the `open` param of `nav-item`, the drill-down `back` and `account` keys, duplicate click listeners in `mobile-menu.js`, the unused pointer-type tracking in `header-nav.js`, and the `.dropdown-menu` colour selector in the header. `tailwind/components/mobile-menu.css` is gone; its styles now live as utilities in the snippets (rule 3).

## 2026-11-18: Footer hover, reveal and input text

- Footer links dim the other links to 30% on hover or focus, the same effect as the header nav. It lives in `menu-links`; the space between links is padding (not gap) so the hover never falls in a gap.
- Footer reveal (lg and up only; no reveal on mobile, Hendrik 18 Nov): the lower part (wordmark, menu columns, bottom bar) is `sticky` to the bottom of the screen under the image band (`relative z-10`), so the band and newsletter card scroll up off it while it stays put. CSS only: a first version moved the part with a scroll-linked GSAP tween and was jumpy (Hendrik: "don't move the position"). `footer-reveal` in global.js only sets `--reveal-bottom` (0, or minus the overflow when the part is taller than the screen, so its top is pinned and all of it can be read). Needs no `overflow: hidden` on any parent of the footer. On top of that a small parallax (Hendrik, 18 Nov): the part itself never moves, only its content (`[data-footer-reveal-inner]`) slides up from 30% lower to its place while the band scrolls off, scroll-linked to the band, ending at the end of the page. The part clips it (`lg:overflow-hidden`), so the page does not get longer. At the same time a subtle Ink overlay (`[data-footer-reveal-overlay]`, `bg-text`) fades from 15% to 0, so the part looks shaded while it is still under the band. The overlay is `opacity-0` in the markup, so without the script nothing is shaded. Off with reduced motion.
- Footer markup moved from `snippets/footer.liquid` into `sections/footer.liquid` (section markup stays inline).
- Inputs switch off the native `text-box` trim (value and placeholder). Chrome trimmed the value a second time on top of the margin method, which pushed it down, cut off g, j, p and y, and put it lower than the placeholder.

## 2026-11-18: Accordions fade on open

`accordion-item` fades its content in while the height opens (opacity on `::details-content`, same 300ms transition), and out again on close. One change in the snippet, so every accordion has it: footer, FAQ, mobile menu, product details, filters. Off with reduced motion; browsers without `::details-content` open instantly as before.

## 2026-11-19: Accordion plus turns into minus

The plus icon of `accordion-item` is the minus-circle icon with a 1px vertical bar on top. On open the bar rotates 90° (150ms, Hendrik: "faster") onto the horizontal line, so the plus turns into the minus instead of swapping icons. Off with reduced motion (it then switches at once). The other plus-circle users (bundle offer, ritual builder, bundle slot) keep the plain icon.

## 2026-11-19: Footer bottom bar removed

The footer has no bottom bar any more (Hendrik): no copyright, policy links, language and country selectors or payment icons. The `show_bottom_bar` setting and the `footer.copyright` and `footer.legal_label` keys are gone. `payment-icons` stays (the cart summary uses it); language and country stay in the header and mobile menu.

## 2026-11-19: Newsletter Subscribe label lines up with the input

The underline style's Subscribe label sat 2px higher than the input text: bare text in a flex button is an anonymous box, so the text trim never reached it and the label centred its full line box instead of its capitals. The label is now in its own `<span>` (a block flex item, so it is trimmed). Input text and label now share the same cap centre; their baselines differ by 0.7px because the input is 14px and the label 12px. Same gotcha as the header items (15 Nov): text next to trimmed text in a flex row needs its own element.

## 2026-11-19: Section markup inline, no section snippets

Hendrik: a section never renders a same-named snippet that holds its markup. Moved inline (snippet deleted): featured-collection-tiles, newsletter, press, image-with-text-founder-note, image-with-text-centered, image-with-text-gallery, ugc-slider, blog-posts, bundle-offer, comparison-table. Each section reads its settings into variables at the top, then the markup follows. CLAUDE.md rule 4 now says so; it used to say "its own section and snippet", which is how this started.
- Dropped while moving, not in the final design: the newsletter with-image layout and the blog-posts featured layout.
- blog-posts: the variable is `news_blog` (`blog` is Shopify's own object), and it checks `articles.size`, because `articles_count` is an empty string when the `news` blog does not exist, and `> 0` then fails. The store has no `news` blog, so the section renders nothing for now.
- Still shared on purpose: `cart-drawer` (layout), `cart-icon-bubble` (header), `featured-collection` (main-404, product-recommendations). Open: `ugc` (ugc-carousel, ugc-grid) and `section-breakout` (two breakout sections) are one snippet with a layout parameter for two sections.

## 2026-11-19: Products tiles use a product picker; eyebrow dot centred

- `featured-collection-tiles` picks products (`product_list`, up to 12) instead of a collection, and the Products count setting is gone: the number of tiles is the number of picked products, in the picked order. The home template keeps the four products it showed before (body-oil, discovery-set, essentials-set, face-oil, which were the first four of all products).
- Eyebrow: the label is now its own `<span>`. As bare text in the flex row it was not trimmed, so the dot centred on the full line box and sat 3.3px below the capitals. Fixed in the snippet, so every eyebrow (Products, gallery, bundle offer) lines up.

## 2026-11-19: Product card subtitle metafield

New product metafield `custom.product_card_subtitle` (Product card subtitle, single line text, storefront readable), created in the Manjula admin with Hendrik's OK. The tile product card shows it under the name ("Softens, Strengthens, Smooths"); when it is empty the card still builds the line from the titles in `custom.benefits`, so nothing changes until it is filled. Products without benefits (sets, Gua Sha, minis) had no line; they get one once this is filled. The old `theme.cutline` and `custom.product_subheading` fields (e.g. "Condition and Grow") were left alone.

## 2026-11-19: Solo bottle images set

`custom.solo_image` is filled for Hair oil, Face oil and Body oil: transparent 2587px PNGs exported from Hendrik's cropped frames in the Manjula Working file (node 5076:1887), uploaded to Files as hair-oil-solo.png, face-oil-solo.png and body-oil-solo.png. The Discovery set followed (node 5077:1901, discovery-set-solo.png). Minis and the Essentials set have none. The tile product card shows it as the packshot (else the featured image).

## 2026-11-19: Product card subtitles and hover images set

`custom.product_card_subtitle` is filled from the Products section in Templates FINAL: Hair oil "Softens, Strengthens, Smooths", Face oil "Brightens, Calms, Hydrates", Body oil "Softens, Smooths, Hydrates", Discovery set "Face, hair & body oil minis". The Essentials set has no design copy, so it has no subtitle yet.

`custom.hover_image` is set with Hendrik's OK, using existing photos from Files where a person holds the product: Hair oil R1-06129-0026-Edit.jpg, Face oil R1-06147-0008-Edit.jpg, Body oil R1-06129-0028-Edit.jpg (Hair and Body swapped by Hendrik in the admin), Discovery set R1-06128-0030-Edit.jpg, Essentials set R1-06129-0011-Edit.jpg. All come from the bathroom shoot, so the tiles read as one set. The header dropdown panel shows the same photo for a product link (else the featured image).

## 2026-11-19: Press section reads press_item metaobjects

The Press section no longer has blocks. It has a `metaobject_list` setting (`items`, `press_item`, up to 8); empty shows every press item (alphabetical by handle). The quote falls back to the excerpt, so FASHION, S Magazine, Gent's Post and CP24 show their headline. In a JSON template the list value is plain handles (`["elle", "sharp"]`); `"press_item.elle"` resolves blank. Logos are SVGs in Files (press-*.svg), shown at a fixed `h-10`: with `max-h-10` the SVGs that carry only a viewBox rendered 0x0. The 8 entries were filled from manjulaessentials.com with Hendrik's OK; ELLE and Vogue Business have no article link. This replaces the 2026-11 note that press logos are uploads per block.

The 128px width cap is gone (Hendrik): it made wide wordmarks (FASHION, Gent's Post, CP24) shrink below 40px. Every logo is now 40px tall; CP24 is the widest at 234px and the row fills 1360px at 1440, so it scrolls sideways on smaller screens. press-s-magazine.svg was re-cropped to the S (viewBox 91 81.3 195 280.2) and replaced in Files, keeping the same file id.

## 2026-11-19: Press auto-rotates, no layout shift, staggered words

Hendrik asked for auto-rotation (3s per outlet), no layout shift when a logo is clicked, the active logo centred on mobile, and a word-by-word animation on the quote. New `<press-tabs>` (assets/press-tabs.js) extends `CustomTabs`, so keyboard handling and the `tabs:change` event stay the same; custom-tabs.js is unchanged. Panels are no longer `hidden`: all sit in one grid cell so the tallest quote sets the height, and inactive ones are `inert` and `aria-hidden`. Words are split in Liquid (no JS text splitting) so they render without JS. Rotation pauses on mouse hover and keyboard focus (WCAG 2.2.2) and is off with prefers-reduced-motion. On mobile the logo row has 50% side padding so the first and last logo can also sit centred.

## 2026-11-19: Press quotes are verbatim and about Manjula

Hendrik asked that every press quote mention Manjula. The FASHION quote uses the short fragment (no "Founded by a mother-daughter duo") to keep the section height down. The quotes for Sharp, Coveteur, FASHION, S Magazine and Gent's Post are now copied exactly from each article (CP24 shows its video title as the excerpt). ELLE and Vogue Business are left out of the home template: no article from either that mentions Manjula could be found, and the old quotes were generic. Their metaobjects still exist; add them back to the Press items list once the client sends the article links. Never write or paraphrase a quote for a real outlet.

## 2026-11-19: Founder video controls reuse the Video snippet

Hendrik asked for a usable progress bar, mute and play/pause on the founder video, shown on hover (tap on touch). Instead of a second player, the `video` snippet got a 16:9 ratio, `autoplay` and `controls: 'bar'`; the UGC cards keep `controls: 'tap'` (the default) unchanged. Seeking is a transparent native `<input type="range">` over the existing progress bar, so dragging, clicking and arrow keys need no custom code and screen readers announce it ("0:12 / 0:34"). Controls show on `:focus-visible` (not `:focus-within`, which kept them up after every mouse click). New icon: `icon__pause.svg` (outline, pairs with `icon__play.svg`; both drawn with a 1px non-scaling stroke at 14px to match the sound icons). The buttons and progress line copy the UGC slider's glass sound button and 2px line (Hendrik; the line sits 8px in from the edges), so the founder video and the UGC videos look the same. The glass button classes now live in two places (ugc-slider and the video snippet); if a third place needs it, make it a snippet.

## UGC slider videos are metaobjects (19 Nov)

Hendrik: the UGC slider takes its videos from `ugc_video` metaobjects (video, product), picked in the section's Videos list (`metaobject_list`), like Press. Empty uses all entries. Size and benefits are no longer typed per video: the UGC product card reads them from the product (`custom.size`, then `mm-google-shopping.size`; `custom.product_card_subtitle`), so one product edit updates every card. Entries: hameem-face, hair-essentials, natasha-face, danny-body, ash-essentials (the five videos in the design, matched to files already in Files). Liquid gotcha: a metaobject list setting loops with `for`, but `items[0]` and `items.first` return nothing, so the slide loop runs over the list itself (and over five plain strings for the placeholders).

Follow-up (19 Nov): clicking the active UGC video pauses or plays it (other videos: make them active). Hendrik: no dragging from 1024px (Swiper `allowTouchMove` off; arrows and clicks move the track), swiping stays on mobile. A tap that moves a few pixels still counts (Swiper `threshold: 8`, no swiping from buttons); a click is only ignored when the track really moved (`sliderMove`), not on Swiper's `allowClick`, which a real mouse's small shift during a click already sets to false. The progress line uses `width` again: Tailwind v4 `scale-x-0` sets the CSS `scale` property, which kept the line at 0 under the script's `transform`. Video weight: the five 1080p files are about 14.5 MB, the 720p ones about 9.5 MB and look the same at 332px wide. Liquid only exposes the 1080p mp4, so the section lists the 720p URL (Shopify's file naming) first with the 1080p file as fallback, plus a 720px poster.

Follow-up 2 (19 Nov), Hendrik: the mobile Next button is one button over the track (not one per slide), over the middle of the second video, and it fades out once the visitor is past the first video (`data-past-first` on `<ugc-slider>`). The product card slides out from under the active video (the video box is `z-10`, the card starts translated up behind it) and slides back up behind it when the video stops being active. The UGC product card shows the product's solo shot (`custom.solo_image`, same as the product card tile), falling back to the main image (Essentials set has no solo shot).

## Offer (bundle offer) from Templates FINAL (19 Nov)

Matched to Templates FINAL Offer (desktop 2526:25949, mobile 2526:25959): no top padding on desktop, section-md on mobile, section-lg at the bottom; the note link starts on its own line on mobile. The tiles take a Products list instead of item blocks, and title, size, description and the solo shot come from each product (same sources as the UGC product card), so nothing is typed twice. The heading takes `[savings]`, filled with the bundle's compare-at price minus its price in the shopper's currency, so "$25 off" can never drift from the real price. Left photo: `R1-06128-0030-Edit.jpg` (the bathroom trio in the design). Right photo: `offer-body-oil-hands.jpg`, uploaded to Files from the design (it was not in the store). In euro markets the Essentials set has no compare-at price (store preview: €162,95, nothing struck through), so `[savings]` came out as "€0 off". The section now shows `heading_no_savings` ("All three oils") whenever there is no saving. The store side (why the euro market loses the compare-at price) is still open.

## Quick view is only the Details drawer (19 Nov)

Templates FINAL has one Quick view, Type=Details (2526:26013): read-only details of one product, opened from View details on a bundle item. Hendrik: no quick view on product cards, so the card's Quick add button and icon options and the quick add in search results are gone, and the starter's product-form quick view (`sections/quick-view-product.liquid`) is deleted. `quick-view.js` loads `quick-view-details`. Data comes from what the store already has, nothing new: media is `product.media` (not the solo shot), How to use is `custom.use_steps` (`use_step` metaobjects), The scent is `custom.scent`, Key ingredients is `custom.ingredients` (`ingredient` metaobjects, name and function), Delivery and returns is one theme setting (`delivery_returns`, Theme settings > Products). An accordion without data is left out, so today only Delivery and returns shows: use_steps, scent and ingredients are still empty on every product. The PDP reads the same metafields (Hendrik, 19 Nov): the `detail` blocks of `main-product` are removed from the section and from the product templates (they held the face oil text on every product), and both the PDP and the drawer render `product-details`, so the text is entered once. The template's delivery text is now the default of the theme setting. Width 640 (Hendrik agreed), set with the new side-drawer `width_class`, since 640 is not on the size scale. The benefits label column is 120px, 240 from lg here (`product-benefits` `column: 'wide'`), 160 on the PDP.

## Cart drawer and the free mini (19 Nov)

Built from Templates FINAL Cart drawer (2526:25995). Hendrik: the theme adds the free mini (no app or Function). An oil is a product with `custom.free_mini_pairs`; with 2 different oils in the cart, the third oil's `custom.mini` is added once, and any gift line that is no longer due is removed. Any mini in the cart is the gift line (no `_gift` property any more: cart/update can only add by variant id, without properties; the minis are not sold on their own). `cart-drawer.liquid` decides in Liquid and renders `<cart-gift>` only when the cart has to change, so every path (product form, drawer, page load) is covered by the same section render; each action runs once per page view so a failing add cannot loop. Subscribed oils count too (Hendrik, 19 Nov: the free mini also comes with a subscription, for one or both oils; this overrules the earlier no-stacking reading of the 2 oils mixed frame). The gift line is one-time, so it ships with the first order only. The minis cost 0, so no discount is needed, and they are published to the Online Store (19 Nov) so Liquid can see them and the cart can add them. Hendrik (19 Nov): when one add makes 2 different oils (ritual builder, drawer row, bundle builder), the free mini goes in the same cart/add request, not a second cart update: the drawer renders `[data-cart-gift-rules]` JSON (oil variants, mini per oil pair, oils and gifts in the cart) and `CartGift.withGift(items)` adds the gift item. Hendrik (19 Nov): 1 cart request per change, also for remove and quantity: `CartGift.updatesFor()` sends one cart/update with the line change plus the gift added (by variant id) or removed (3 oils, remove one: the removed oil's mini comes in the same request). An add that makes 3 oils goes as one cart/update too (`CartGift.addRequest()`: adds the oil and removes the gift). `<cart-gift>` stays as the fallback for what one request can not do: an add with a selling plan or line properties that makes 3 oils (cart/update can not set those). Cart line quantity inputs are now named `updates[<line key>]`, so the gift can sit above the other lines without breaking the checkout form. The Drawer header atom now follows Figma (heading/1, superscript count, CLOSE text) in every drawer; `subtitle` became `count`. Hendrik: keep `free-shipping-bar.liquid`; the drawer just does not render it (nor the discount code, tax note and payment icons). `cart-drawer__line-items.liquid` is removed (its markup moved into the drawer). Subscription parts (Delivered once select, Subscribe & save, Subscription • 15% off, Subscription savings row) render only when a product has selling plans (Subscribe & save, see Subscriptions plan).


## 2026-11-19: Subscriptions plan

Shopify Subscriptions (the store data plan names it) is installed by Hendrik. One plan, "Subscribe & save", on Face, Hair and Body oil: deliver every 2, 3 or 4 months, 15% off each (Hendrik, 19 Nov). The live theme has no subscription widget, so nothing shows there before launch; the dev theme PDP and cart drawer read the plan from `selling_plan_groups`. A plan change does not change the free mini (subscribed oils count too), so it stays one cart/change request.

`price.liquid`: a passed `price` now wins over `product`. On product pages the global `product` object is always set, so cart lines in the drawer showed the page product's price.

## 2026-11-19: Cart line delivery dropdown

The Delivered once / plan choice in the cart drawer line is a `custom-select` (the theme's select-only combobox: button, `dropdown-menu` of `menu-item`s, hidden input) instead of a native `<select>` (Hendrik, 19 Nov). The trigger keeps the underlined label with the caret; the hidden `input[data-cart-plan][data-index]` gets the native change event, so cart.js is unchanged. Below md the menu starts at the image's left edge so the plan names fit at 375px. The options use `menu-item` size `sm` (label/base, the trigger's text style; Hendrik, 19 Nov); other menus keep the default body/base. After every cart update, cart.js puts keyboard focus back on the same control (the dropdown button or quantity field, by id).
Subscribed line below md: the price column is only as wide as its longest price (plan price and struck one-time price stack), and the Subscription • n% off tag moves under the quantity row; md and up keep the Figma layout.

## Square corners, cart page, gift line (19 Nov)

- Manjula has no rounded corners anywhere (Hendrik, 19 Nov). `tailwind.input.css` sets the Tailwind radius scale (`--radius-xs` to `--radius-4xl`) to 0, so `rounded-xs`, `rounded-sm` and the rest render square; `rounded-full` (dots) stays.
- `/cart` is not used: `templates/cart.liquid` (replaces `cart.json`) sends visitors to `/#cart-drawer`, and `side-drawer.js` opens the drawer whose id is the URL hash. `main-cart` stays as a section file.
- The free mini gift line does not link (image and title): the mini page only redirects to the full oil.
- Dropdown menus have no inner padding; `menu-item` size `sm` is 32px high. The quantity selector has no background. Small icons that are scaled down (quantity, cart message) use `vector-effect: non-scaling-stroke` so the stroke stays 1px.

## Product main fixes (19 Nov)

- The selected Purchase option (one-time or Subscribe & save) has the Surface alt fill on top of the Ink border (Hendrik, 19 Nov). Picked from the tokens: Figma was not connected for this change, check it against the Purchase option component.
- Most popular: the section setting `popular_frequency` matches part of the plan name ("Deliver every 3 months"), so the "15% off" suffix in the plan name does not break it. Set on Face, Hair and Body oil.
- The FREE MINI badge in the mini offer keeps its space while hidden (`visibility`, `data-shown`), so the offer does not jump when an oil is picked. On hover, the empty "Add a different oil" slot only scales its plus icon down (Hendrik, 20 Nov).
- Ritual builder packshots (slots and picker rows) use `custom.solo_image` (bottle without box), `object-contain`, with the featured image as fallback.
- Community strip shows the store's UGC video entries (`ugc_video`), this product's videos first, instead of section blocks. The `community_video` block type is removed (no template used it).
- Loose text in the USP tag marquee is wrapped in a span so text trim centres it on the dot.
- Ritual builder filled slots: the packshot fills the slot above the name (no top padding, `object-contain`), so the solo bottle reads bigger (Hendrik, 19 Nov). The plus icon in the empty slot scales down a little on hover.
- PDP gallery (thumbnails-right): the main media stays 1:1 and as big as the column allows, but never taller than the screen (`100svh`, minus the 4px edge on desktop). It always starts at the left edge of the page (Hendrik, 19 Nov); any space left over sits between the media and the form.
- Details accordion (client Figma 1286:4298, 20 Nov): How to use rows are a roman numeral (40px), the step title (120px, muted) and the text, 20px apart. Key ingredients is one plain line of the ingredient names, then a "See full ingredients list" link that scrolls to the Ingredient explorer section on the same page (`#ingredient-explorer`, Hendrik, 20 Nov). Ingredient botanical names have no common name in brackets (Hendrik, 20 Nov).
- In-page anchor links scroll smoothly: `<html>` has `motion-safe:scroll-smooth` (off for reduced motion; Hendrik, 20 Nov).
- Ritual builder picker rows open the Quick view drawer (the name link covers the row, `data-quick-view-trigger`); the add button sits above it (Hendrik, 20 Nov).
- Header bar: glass background instead of solid Background: the blur of the buttons over videos on a whiter tint (`bg-surface/30 backdrop-blur-xl`) with a light gray bottom line at 40% (`border-border/40`, Hendrik, 20 Nov). It sits on a `::before` layer so the bar does not become the containing block of the fixed mobile menu. On every page the header is clear at the top; the glass and line fade in (300ms) once the page scrolls (Hendrik, 20 Nov).
- Frequency rows drop the savings suffix of the plan name ("Deliver every 3 months, 15% off" shows as "Deliver every 3 months"); the saving shows on the Subscribe row. The Subscriptions app owns the plan names, so the theme trims them (Hendrik, 20 Nov).
- Accordion panels clip with `overflow: clip` and a 4px `overflow-clip-margin` (`var(--spacing)`; Chrome does not take calc() there): with `overflow: hidden` the trimmed first line lost the tops of tall letters.
- Use guide clips sideways on its full-width section wrapper (schema `class: overflow-x-clip`): from lg its step thumbnails ran past the screen and the PDP scrolled sideways at 1024px.
- Header on touch: the hover dimming of nav and utility items runs only under `@media (hover: hover)`; Tailwind's `not-hover` also matches under `not (hover: hover)`, so a tap dimmed every item to 30%. The first tap on a dropdown's own link (Shop) opens its panel on touch; a second tap follows the link (header-nav.js).
- (Removed 20 Nov, Hendrik: the gallery shows only the product media again.) PDP gallery showed temporary sample media (`dummy_media: true` in main-product): images of other products and 2 UGC videos after the product's own media, until the real media is in (Hendrik, 20 Nov). Remove the parameter to turn it off.
- Cart line plan names drop the savings suffix too (dropdown, selected label, plan line); the Subscription • 15% off tag shows the saving.
- PDP gallery transition: on mobile (below lg) a plain slide without blur (Hendrik, 20 Nov). From lg no slide, no fade. Swiper swaps the media at once (speed 0); the new media eases from 110% and a 2px blur into focus over 1.25s (`--ease-out-quint`, `--blur-2xs` in tailwind.input.css), after the Sunset Row retail slider Hendrik pointed to (20 Nov). Gallery videos autoplay muted on a loop without controls.
- PDP community strip: a tile plays its video in place (muted, looped, one at a time, tap again to pause), no lightbox (Hendrik, 20 Nov).
- Delivery estimate (Hendrik, 20 Nov): global theme settings (Theme settings > Delivery estimate) replace the main-product "Days to delivery" setting. Five country slots (ISO codes, comma separated, matched to localization.country) with their own days, a default for other countries, an order cut-off hour (store time zone, later orders count from the next day) and business days only (skips Saturday and Sunday). Computed in Liquid in ritual-builder; the date is the store's render time.
- PDP dead code removed (Hendrik, 20 Nov): product-form, product__variant-picker, product-price-block, add-ons and add-on snippets (nothing rendered them), product-info.js (every product has one variant; <product-info> stays as the buy-part scope), the media-gallery layouts other than Thumbnails right plus zoom, counter, lightbox and variant media, the purchase-options checkbox layout and dropdown and buttons frequencies, window.variantStrings. Kept: the benefit and ritual_oil blocks and the size and tags settings, the fallbacks when a product has no metafield.
- PDP store data only (Hendrik, 20 Nov): the main-product fallbacks are removed. Benefits come only from custom.benefits, the tag marquee only from custom.usp_tags, the size only from custom.size, the offer oils only from custom.free_mini_pairs and the free mini size only from the third oil's custom.mini > custom.size. Removed: the benefit and ritual_oil blocks and the size, tags and mini_size settings. A product without a metafield shows nothing for it (the Gua sha has no benefits yet). The gallery has no Sale / Sold out badge.
- Use guide photos (Hendrik, 20 Nov): from lg the photo row is a grid whose columns use-guide.js sets like the Blanc product page reference: active 4fr, others 1fr, 4:5 photos, eased over 0.8s (--ease-in-out-circ). Fills Figma's 7 columns (788px at 1440). Mobile stays the Figma 290x356 slider. The guide moves on every 5s while on screen (not with reduced motion); a click on a photo or an arrow restarts the timer. Text column, progress bar, arrows and notes unchanged (Figma 2526:26025, 2526:26036).
- Use guide steps come from the product (Hendrik, 20 Nov): `custom.use_steps` (`use_step` metaobjects: title, text, image), the same entries the details accordion reads. The section's `step` blocks are gone from the schema and the product templates; usage notes stay blocks. A product without steps shows no Use guide. Only the Face oil has steps today. Their photos are placeholders picked from photos already in the store's Files (no uploads); swap them for real step photos in the use_step entries.
- Timeline photo (Hendrik, 20 Nov): first an Osmo-style cursor follower, now the 300x380 frame follows the cursor (GSAP quickTo, 0.6s) but never covers text: it stays right of the widest year and event text plus a gutter, inside the list's right edge and inside its own section, and below or right of the label and heading (right of it when there is no room below); up and down its centre sits on the cursor (between the list's top and bottom); sideways it rests in the middle of the free space and drifts up to a quarter of its width with the cursor, as the Sunset Row retailers section. From lg to xl the heading keeps 312px clear on the right so the frame has room. It shows only while the row list is hovered or has keyboard focus (grows in, CSS group-has, --ease-out-quint). The strong blur on the change comes from the Sunset Row retailers section. Inside the frame the photos are one stacked column in list order; the column moves (0.6s, power3.out) so the active row's photo fills the frame, blurred 3px while it moves, so a jump over several rows runs past every photo in between. Rows are all full strength until the list is hovered; then the hovered row stays full and its siblings dim to 30% (CSS, also for keyboard focus). No pointer cursor. The row rules are 1px dots that fade out to the right from 20%, as Figma's gradient stroke (CSS mask). Mobile cards unchanged. Lightbox video on About hero: 80vw / 80dvh from lg, full width below; overlay 30% like the drawers; the video scales from 110% and a 12px blur.

## 2026-11-20: About page parallax and Press grid from metaobjects

Hendrik: every big image on the About page uses the existing `<paralax-img>` (global.js, as the home hero): the hero-video background (video or photo, start `top top`), the Origin story portrait and the Heritage archival photo. The media is 110% tall and moves from -9% to 0% while the image scrolls by (made subtler the same day, was 118% and -15%; this applies to every parallax image, also the home hero and Image with text gallery). The footer photo band moves the same way. Small photos (Origin story pair, Heritage small photo, timeline frame) do not move. The Press grid no longer has blocks: it reads `press_item` metaobjects through a `metaobject_list` setting (`items`, empty shows every entry), like the Press section. The card text is only the item's Excerpt field, never the quote. With Hendrik's OK (20 Nov) the six Excerpt fields hold a short passage copied word for word from each article (the paragraph about Manjula; CP24: the video description), replacing the headlines. Never write or paraphrase an excerpt; the link shows only when the item has an article link. Press grid logos are balanced by area, not by height: each logo gets about 60x60px of area from its own aspect ratio, held inside the 160x40 slot (CSS min() and sqrt() on --logo-ratio from the file), so wide wordmarks shrink and tall marks grow to the slot height. The About template picks the six outlets with an article (Gent's Post, Coveteur, Sharp, FASHION, S Magazine, CP24); ELLE and Vogue Business are left out for the same reason as on the home page. Gotcha: when a template and the section schema it relies on change together, theme dev can upload the template first and Shopify drops the unknown setting; push the template again to the development theme.

## 2026-11-20: Clamped text trims with margins only

Press grid excerpts are clamped to 3 lines with an ellipsis (`line-clamp-3`). That exposed a Chrome quirk: with native `text-box` trim plus the padding give-back, a `line-clamp` box whose text fits skipped the bottom trim and sat 8px taller than a clamped one. `tailwind/text-trim.css` now switches native trim off on `.truncate`, `[class*=line-clamp-]` and `.text-ellipsis` and trims the layout with negative margins only. Same layout height as before (cap to baseline), full letters inside the clip area, and the same height whether the text is cut or not.

## 2026-11-20: Photos go up uncropped, the frame crops them with the focal point

Photos are uploaded to Shopify Files at full size and uncropped (Hendrik, 20 Nov), never pre-cropped to the frame in the design: a pre-cropped file is cut a second time by a frame with another shape (mobile) and the merchant loses the full photo. The `media` snippet reads `image.presentation.focal_point` and sets it as `object-position`, so the merchant moves the crop by setting the focal point in Content > Files; no focal point means centred. The Admin API cannot set focal points, so they are set in admin. The Subscription photos for step 2, step 3 and the founder note were replaced by their uncropped originals (same file names). The About page photos (the three Origin story photos, heritage-family and heritage-grandmother) were replaced the same way by their full-size originals.

## 2026-11-21: FAQ: Offset reads FAQ metaobjects

The FAQ: Offset section (Subscription page) no longer has question blocks. A Questions setting picks FAQ metaobjects (faq: question, answer), shown in the picked order; none picked renders nothing. The Subscription questions are entries with handle `subscription-*` and category Subscription. "How often will I receive my oils?" has the answer from the design; the other 7 have placeholder answers (written 21 Nov) that Karishma must check before launch, mainly billing, discount codes, and the reminder email. The damaged-oil question was taken off the page (Hendrik, 21 Nov).

## 2026-11-21: Science page

- Six new sections, one per Figma layout, all content in section settings or blocks: `page-intro`, `concerns` (+ `assets/concerns.js`, one block per concern), `section-breakout-feature-bleed-left`, `section-breakout-feature-bleed-right`, `section-breakout-text-full-bleed`, `section-breakout-full-bleed-panel`. `list-row` got size `lg` for the concern rows.
- Section order follows Desktop; Mobile in Figma puts Approach and Power of ritual before How we formulate, which one template cannot do.
- Photos uploaded uncropped as `science-*`; reused `origin-story-hair-ritual` and `formula-philosophy-bottle-detail` where Figma uses the same original.

## 2026-11-21: Contact page

- `faq-categories`: own section on the breakout grid. One Category block per row, each picks FAQ metaobjects; a category without questions is hidden. One accordion group per section. JS `faq-categories.js` (data-faq-tab, data-faq-panel).
- `main-contact`: matches Figma Contact. Only name, email and message (Underline style), no subject select and no privacy note (not in the final design). Labels are visually hidden. Contact details are blocks (label, email). `textarea` got `style: 'underline'`.
- Breakout grid row gaps come from `--grid-gap-y` (unlayered CSS), so set the variable (`[--grid-gap-y:--spacing(10)]`), not `gap-y-*`.

## 2026-11-21: Sections FINAL page and breakout leftovers removed

- Figma: used section sets moved to a new page Sections FINAL (moved, not duplicated, so instances keep their links); 41 unused variants deleted; the old page is Sections (unused) and also holds the system pages (cart, search, blog, article, 404).
- Code: removed the starter breakout presets `section-breakout-media-band`, `section-breakout-bleed-right` and their snippet `snippets/section-breakout.liquid` (not in Templates FINAL). Every breakout preset in use is its own section; the grid itself (`.section-breakout` in tokens.css) stays.

## Bracket radius token (21 Nov)

- The bracket is the one rounded element in Manjula. Figma has `radius/bracket` (alias of `radius/sm`, 4px), bound on every Bracket variant. In code it is `--radius-bracket: 4px` (`rounded-l-bracket` and so on in `snippets/bracket.liquid`), because the Tailwind radius scale stays 0 (square corners everywhere, 19 Nov). `figma-tokens.json` stores it as `4px`; `build-tokens.js` passes px values through (Hendrik, 21 Nov).
- Size comes only from `custom.size`. The `mm-google-shopping.size` fallback is gone from the UGC product card, line item, cart offer and bundle offer: it is feed data ("Set of 3 bottles, 30-100ml each" on the sets, "100ml" on the Gua sha). Sets show no size (Hendrik, 21 Nov).
- Press quotes rotate every 3s, always. No pause on mouse hover (scrolling past with the cursor over the section paused it); only keyboard focus pauses (Hendrik, 21 Nov).

## 2026-11-21: One Figma set per section layout

- Figma Sections FINAL now has one component set per unique section (42), like the code: Hero full-bleed, Hero statement, Hero centered; Image with text founder note, gallery, centered; FAQ image, offset, categories; Two columns equal, narrow; Section breakout story, heritage, feature bleed right, feature bleed left, full bleed panel, text full bleed. Variant properties left are Viewport (and State on Hero full-bleed). Components were moved, not copied, so every template instance kept its link (Hendrik, 21 Nov).
- Image with text column (mobile only, unused) moved to Sections (unused) as its own set. Main page lost its single-value Layout property in Figma and its layout select in code (only Sidebar exists).
- Toggles nothing used (Hero Show eyebrow and Show secondary button, FAQ Show description) were not carried into the new sets.

## 2026-11-21: One name per section, Figma and code

- Each section has one name in Figma, in the section file and in the schema (Hendrik, 21 Nov). Code renamed: `hero` is `hero-full-bleed`, `hero-video` is `video-statement` (also `video-statement.js`, the `<video-statement>` tag, `data-video-statement-*` hooks and the `sections.video_statement` locale keys). Figma renamed to the code names: Comparison composition (was Section breakout bleed left), Featured collection tiles, UGC slider, Testimonial quote, Main contact, Main product.
- Still without code: Hero statement (Subscription, above Video statement), Hero centered, Logo strip, Two columns equal and narrow (landing page, not needed for launch).
- Gotcha: theme dev can miss files renamed with `mv` while it runs ("Section type ... does not refer to an existing section file"); touch the new files so it uploads them.
- Header glass when scrolled: Surface at 80% with the blur (was 30%), so the nav reads over dark sections (Hendrik, 21 Nov).

## Use guide steps can have a video (22 Nov)

Hendrik asked for the Face oil videos in the use guide. `use_step` got an optional `video` field (file reference, video only) next to `image`. A step has a photo, a video or both (neither field is required). The photo is the poster and the fallback (reduced motion, Low Power Mode); a step without a photo uses the video's first frame (`video.preview_image`). Only the active step's video plays, muted, from the start, while the guide is on screen; the guide moves on when it ends, instead of after 5 seconds. The storefront only gives an HLS stream and a 1080p mp4 per video (no 720p), so both are `<source>`s and `preload="none"` keeps the other steps from loading. Face oil steps are linked to `faceOil-video-1` to `-4` and `face-oil.mov`, matched on the first frame against the step photo with the same number.

## Comparison sections on the breakout grid (22 Nov)

Comparison texture, price and composition were a flex row in `max-w-page` with a fixed photo (560px, 560px, 485px). On screens wider than the page the photo left the screen edge, and 560 was not on a column line, so the content did not line up with the other sections. Hendrik chose to end the photo at column 4. Figma: the Texture and Price desktop frames now use the same 14-track Grid as Composition (photo cell bleed left, span 5 from track 0; content span 8 from track 5). Code: all three are `.section-breakout`; the photo is `data-bleed="left"` with `--start: 1; --span: 4`, the content `--start: 5` with `--span: 8` (Composition `7`, as its frame). Checked at 1440 (photo 0 to 485, content from 497, as Figma), 1920 (photo from the screen edge, content on column 5 and the page's right edge) and 390 (unchanged).

## Product templates get short names (22 Nov)

Hendrik: simple names, one word, two at most. `product.face`, `product.hair`, `product.body`, `product.essentials`, `product.discovery`; `product.gua-sha` and `product.mini` stay. `product.json` stays the default (today a copy of Face oil, the fallback for any product without its own template).
The template a product uses is store data (`templateSuffix`) that the live theme reads too, so the products keep their old suffixes until launch: on launch day set Face oil to `face`, Hair oil to `hair`, Body oil to `body`, Essentials set to `essentials`, Discovery set to `discovery`. Until then preview with `?view=face` and so on. Found on the way: Face oil points to `face-oil-product-page-tem` and the listed Gift card to `gift-card-page-template`, neither of which exists in this theme, so both fall back to `product.json` (the Gift card shows the Face oil layout; still open).

## Face oil feedback round, 22 Nov

From the Templates FEEDBACK annotations on PDP / Face oil:
- Delivery and returns accordion: a link under the text, like the Key ingredients link. New theme setting `delivery_returns_link` (Theme settings > Products), set to the Shipping & Returns page; no link when empty.
- Use guide progress bar: shows how long the current step is still shown (0 to 100% over 5 seconds, or over the step's video). With reduced motion or one step it shows the step position. aria-valuenow is always the step position.
- Use guide: all step texts share one grid cell and only the active one is visible, so the block is as tall as the longest step and the page below does not move (it moved on mobile).
- Picker row: 60x70 packshot on mobile (80x93 from lg). The thumb background is flush and runs the full row height; the packshot keeps its size and the row is as tall as its content. The picker around the rows has 12px padding on mobile (24px from lg).
- Ingredient explorer, mobile: Function and Ingredient columns are a fixed half and half (2 + 2 of the 4-column grid). A content-sized column shifted the ingredient list sideways when a product hid the widest function. 173px at 390 fits "Barrier support" with its arrow.
- Ingredient names: "Extract" removed from the 14 names that had it (store data).
- Write a review form: title, review, email and name use the underline field style, like the contact and newsletter forms. No Figma design for the form yet.

## 2026-11-23: No parallax images

Hendrik: remove the `<paralax-img>` effect on the whole site. The element and its script (`ParalaxImg` in assets/global.js) are gone. The 8 sections that used it (hero full bleed, video statement, image with text gallery, the 4 breakout sections, footer) now use a plain `div` with the same classes, and the media fills it (`inset-0 size-full`, no longer 110% tall). This replaces the entries of 18 Nov (Parallax image) and 20 Nov (About page parallax). Other scroll motion stays: the horizontal scroll photos that slide sideways while pinned, and the footer reveal on desktop.

## 2026-11-23: Science sections named by content

Hendrik: the four generic Science sections are named after what they show, like the About page story and heritage sections. Figma component set and code file renamed together: Section breakout feature bleed left is `formulate`, Section breakout text full bleed is `approach`, Section breakout feature bleed right is `ritual`, Section breakout full bleed panel is `botanical-farm`. Theme editor names: Formulate, Approach, Ritual, Botanical farm. Older entries above still use the old file names.


## 2026-11-23: Science feedback round

- Video or photo: Page intro (large and small), Formulate, Approach, Ritual (large and small) and Botanical farm each have a Video setting next to the photo. A video plays muted and looped through the media snippet and wins over its photo; a mobile photo still replaces it on mobile where the section has one.
- Botanical farm: Figma uses a video fill. The Figma tools cannot export video, so the section keeps its photo for now (Hendrik, 23 Nov); the Video setting is there when the farm video is uploaded. The panel is sticky: it stays at the top while the section scrolls by (overflow-clip on the section, since overflow-hidden would stop sticky), and moves down by the bar height while the header shows.
- Concerns: the first concern always starts active. The explanation is at most 680px wide (lg:max-w-170). Placeholder copy (intro and three points) for Dry skin, Skin breakouts, Breakage and thinning, Flaky and itchy scalp, written by us and to be replaced by the client; they reuse the Sensitive skin photo on mobile.
- Page intro text: an empty line between the paragraphs (one line height, 21px). Figma has 14px paragraph spacing, which read as no enter on the page.
- Max widths (second round): the Concerns points at most 560px (lg:max-w-140), the Formulate intro at most 600px (lg:max-w-150), so lines stay readable.
- Ingredient explorer frame: it reads the section's position on every move (it kept the position from when the pointer entered, so after a wheel scroll it sat beside the wrong row) and follows the row under a still pointer while the page scrolls. The frame also shows for an ingredient without a photo (the placeholder), as before (Hendrik, 23 Nov).

## 2026-11-23: About sections named by content, feedback round

- Renamed like the Science sections: Section breakout story is `origin-story` (Origin story), Section breakout heritage is `heritage` (Heritage), in Figma and code.
- Text balance on the whole About page: `text-balance` on each section root (text-wrap is inherited). Video statement and Featured collection tiles are also used on Home and Subscription, so it applies there too.
- Origin story: every photo (1, 2, portrait) can be a video; heading and story at most 560px wide (lg:max-w-140); an empty line between story paragraphs (1lh).
- Heritage: the archival and the small photo can each be a video.
- Timeline: no "Active at start" setting; the first row starts active.
- Press grid: Read article opens in a new tab (target _blank, rel noopener).

## 2026-11-23: Policy pages and Main page bug check

- Policy HTML comes as paragraphs straight in `.rte` (refund, shipping, terms) or wrapped in divs, sometimes a div in a div (privacy). Every div that holds text blocks gets the 24px gap, at any depth. Only the div shape had a gap, so neighbouring paragraphs touched and their trimmed text boxes overlapped. Now both shapes get 24px between blocks, and a bare `<br>` between blocks is hidden. `snippets/rich-text.liquid` (pages, articles) got the same rules.
- Links in running text (policies, pages, articles) keep the text's own style, underlined. The caps link style made an email address mid-sentence small caps.
- "See delivery and returns" on the product page now opens `/policies/shipping-policy`. The Shipping & Returns page it pointed to is empty in this theme: its content lived in sections of the old theme.
- Text sizes as the Figma Main page (Hendrik, 23 Nov): every heading heading/3, lists body/sm, paragraphs body/base; 24px between all blocks on desktop, 64px above a heading on mobile (Figma has a spacer there). `rich-text` got `size: 'sm'` for this (Main page only); articles keep the Rich text block sizes. The policy CSS mirrors it. The Figma Lead (first paragraph body/lg, muted) has no HTML equivalent, so it is not applied.

## 2026-11-23: Collection pages redirect to home

- The collection page (`/collections/<handle>`, also `/collections/all` and `/products`) and the collection list (`/collections`) send visitors to the home page (Hendrik, 23 Nov). A small script at the top of `<head>` in `layout/theme.liquid` runs `location.replace('/')`, so the back button does not loop. It does not run in the theme editor, so both templates stay editable. Search and product pages are not affected.

## 2026-11-23: Page hover photo in the header menu

- Pages get the same `custom.hover_image` metafield as products (Hendrik, 23 Nov). The header dropdown already reads it from any linked object, so the About panel shows a photo per page link. Pages have no featured image, so without the metafield a page link shows no photo.
- Set with existing photos (each page's own hero): About origin-story-manjula.jpg, Ingredients science-intro-sofa.jpg, Subscription subscription-hero.jpg.

## 2026-11-23: Header intro, scroll and dropdown images

- Home header text stays light while the logo intro plays and turns dark together with the glass background, when the intro is done (Hendrik, 23 Nov). Before, the text turned dark at the start of the intro, over the hero photo. The text fades in the same 300ms as the background: `--color-text` and `--color-text-muted` are registered as colours (`@property` in tailwind.input.css) and the bar transitions the variables, so every item that reads them fades along (most set their own colour, so a plain colour transition on the bar did not reach them).
- After the intro is done the header does not hide on the scroll that is still running. It waits until the page has been still for 200ms; only a new scroll down hides it. Before, it slid up right after the logo animation, which felt jumpy.
- Dropdown panel images swap like the product page gallery: at once, then from 110% and a 1px blur (`blur-3xs`, lighter than the gallery's 2px) into focus (1.25s, ease-out-quint). The image box clips the zoom.

## 2026-11-23: Quick view size and product subtitle

- Quick view drawer is 480px wide (`max-w-120`), not Figma's 640px (Hendrik, 23 Nov); full width on mobile. The cart drawer stays 640px. Its benefits rows have a 120px label (`product-benefits` `column: 'compact'`); the PDP keeps 160px. The footer (Go back, View full product) sits below the scroll area and never shrinks, so it never covers the content.
- The line under the product title is product metafield `custom.subtitle` (multi-line text), shown on the PDP and in the quick view. Before it was a section setting per product template, which the quick view could not read. Empty: the first sentence of the description, with a full stop, on both.
- Moved from the templates: Face oil and Discovery set. Hair, Body, Gua sha and the default template had the Face oil line, and Essentials the Discovery line, as placeholders. Hair, Body and Essentials got their own line (written from each product description, 23 Nov); Gua sha has none yet and shows the description's first sentence.

## 2026-11-23: FAQ category field removed

The FAQ metaobject has only Question and Answer (Hendrik, 23 Nov). The Category field was deleted in the admin: the theme never read it, the Help center categories are Category blocks in the section.

## 2026-11-23: Cart packshots and mini photos

- Cart lines show product metafield `custom.packaging_image` ("Bottle with packaging", file image), else the line's own image (Hendrik, 23 Nov). Face, Hair and Body oil have the bottle-and-box packshots from Figma (node 2810:26069), uploaded as face/hair/body-oil-packshot.jpg.
- The three minis had no photo. Their single-bottle shots (Figma node 2809:26064, transparent PNG) are now their product photo and their `solo_image`, so the free mini shows a bottle in the cart and the mini offer.
