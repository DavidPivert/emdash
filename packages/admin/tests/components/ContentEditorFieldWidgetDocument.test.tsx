/**
 * Pins the document identity a plugin field widget receives.
 *
 * Field widgets used to get their own value and nothing else, so a widget that
 * needed to reach its plugin route had to parse `location.pathname` for the
 * entry id — a workaround that breaks silently whenever admin routing changes.
 * These tests hold the replacement contract in place.
 */

import * as React from "react";
import { describe, it, expect, vi } from "vitest";

import {
	ContentEditor,
	type ContentEditorProps,
	type FieldDescriptor,
	type FieldWidgetDocument,
} from "../../src/components/ContentEditor";
import type { ContentItem } from "../../src/lib/api";
import { PluginAdminProvider, type PluginAdmins } from "../../src/lib/plugin-context.js";
import { render } from "../utils/render.tsx";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual("@tanstack/react-router");
	return {
		...actual,
		Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
	};
});

const fields: Record<string, FieldDescriptor> = {
	title: { kind: "string", label: "Title", required: true },
	notes: { kind: "json", label: "Notes", widget: "editorial-workflow:notes" },
};

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
	return {
		id: "item-1",
		type: "posts",
		slug: "my-post",
		status: "draft",
		data: { title: "My Post", notes: {} },
		authorId: null,
		createdAt: "2025-01-15T10:30:00Z",
		updatedAt: "2025-01-15T10:30:00Z",
		publishedAt: null,
		scheduledAt: null,
		liveRevisionId: null,
		draftRevisionId: null,
		...overrides,
	};
}

/** Records every `document` prop the widget is handed, in render order. */
function makeProbe() {
	const seen: Array<FieldWidgetDocument | undefined> = [];
	function NotesWidget({ document }: { document?: FieldWidgetDocument }) {
		seen.push(document);
		return (
			<div data-testid="notes-widget">
				{document?.collection ?? "no-collection"}/{document?.id ?? "no-id"}
			</div>
		);
	}
	return { seen, NotesWidget };
}

function renderEditor(
	NotesWidget: React.ComponentType<any>,
	props: Partial<ContentEditorProps> = {},
) {
	const pluginAdmins: PluginAdmins = {
		"editorial-workflow": { fields: { notes: NotesWidget } },
	};
	const base: ContentEditorProps = {
		collection: "posts",
		collectionLabel: "Post",
		fields,
		isNew: false,
		item: makeItem(),
		onSave: vi.fn(),
		onAutosave: vi.fn(),
		onPublish: vi.fn(),
		onDelete: vi.fn(),
		...props,
	};
	return render(
		<PluginAdminProvider pluginAdmins={pluginAdmins}>
			<ContentEditor {...base} />
		</PluginAdminProvider>,
	);
}

describe("plugin field widget document identity", () => {
	it("hands the widget the collection and entry id", async () => {
		const { seen, NotesWidget } = makeProbe();
		const screen = await renderEditor(NotesWidget);

		await expect.element(screen.getByTestId("notes-widget")).toHaveTextContent("posts/item-1");
		expect(seen[0]).toEqual({ collection: "posts", id: "item-1" });
	});

	it("reports a null id while the entry has never been saved", async () => {
		const { seen, NotesWidget } = makeProbe();
		const screen = await renderEditor(NotesWidget, { isNew: true, item: undefined });

		await expect.element(screen.getByTestId("notes-widget")).toHaveTextContent("posts/no-id");
		// null, not undefined: a widget must be able to tell "new entry" apart
		// from "older host that does not provide this prop at all".
		expect(seen[0]).toEqual({ collection: "posts", id: null });
	});

	it("keeps the document reference stable across unrelated edits", async () => {
		const { seen, NotesWidget } = makeProbe();
		const screen = await renderEditor(NotesWidget);
		await expect.element(screen.getByTestId("notes-widget")).toBeInTheDocument();

		const first = seen[0];
		await screen.getByLabelText("Title").fill("A completely new title");

		// Typing re-renders the editor; the identity object must not be rebuilt,
		// or a future memo on FieldRenderer would be defeated silently.
		expect(seen.length).toBeGreaterThan(1);
		expect(seen.at(-1)).toBe(first);
	});
});
