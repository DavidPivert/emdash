---
"emdash": minor
---

Adds a `locale` prop to `LiveSearch`, forwarded to the search and suggest endpoints. Both already accept a `locale` query parameter, but the component had no way to pass one, so a multilingual site got every entry back once per language — a French visitor searching from a French page saw each result twice, with the second one opening its English page. Pass `locale={Astro.locals.locale}` to scope results to the visitor's language; leaving it unset keeps the current all-locales behaviour.
