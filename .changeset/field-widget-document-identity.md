---
"@emdash-cms/admin": minor
---

Adds a `document` prop to plugin field widgets, giving them the collection and entry id of the content they are editing.

A field widget previously received only its own value, so a widget that needed to call its plugin's API routes for the current entry had to recover the entry id by parsing `location.pathname`. That workaround breaks silently whenever admin routing changes.

```tsx
import type { FieldWidgetDocument } from "@emdash-cms/admin";

function NotesWidget({ document }: { document?: FieldWidgetDocument }) {
	// document.collection === "posts", document.id === "01J..." | null
}
```

`document.id` is `null` while the entry has never been saved, so a widget can tell a new document apart from an older host that does not provide the prop at all. The prop is additive: existing widgets that ignore it keep working unchanged.
