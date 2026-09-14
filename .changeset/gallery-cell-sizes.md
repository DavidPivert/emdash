---
"emdash": patch
---

Fixes the Portable Text `Gallery` component telling browsers each image fills the viewport. Its `sizes` attribute now describes one grid cell, using the gallery's column count and its two-column layout at 640px and below, so browsers stop downloading oversized images for multi-column galleries. Pass the new `sizes` prop to `Gallery` when it renders in a container narrower than the viewport.
