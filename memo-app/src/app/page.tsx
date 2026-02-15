"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Note } from "@/lib/types";

type FormState = {
  title: string;
  content: string;
};

const emptyForm: FormState = { title: "", content: "" };

export default function HomePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) ?? null,
    [notes, selectedId],
  );

  async function loadNotes() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", { cache: "no-store" });
      const body = (await res.json()) as { notes?: Note[]; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Failed to load notes");
      const list = body.notes ?? [];
      setNotes(list);
      if (!selectedId && list[0]) {
        setSelectedId(list[0].id);
        setForm({ title: list[0].title, content: list[0].content });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCreate() {
    setSelectedId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(note: Note) {
    setSelectedId(note.id);
    setForm({ title: note.title, content: note.content });
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const isUpdating = Boolean(selectedId);
      const res = await fetch(
        isUpdating ? `/api/notes/${selectedId}` : "/api/notes",
        {
          method: isUpdating ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const body = (await res.json()) as { note?: Note; error?: string };

      if (!res.ok) throw new Error(body.error ?? "Save failed");
      await loadNotes();

      if (body.note) {
        setSelectedId(body.note.id);
        setForm({ title: body.note.title, content: body.note.content });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? "Delete failed");

      await loadNotes();
      if (selectedId === id) {
        setSelectedId(null);
        setForm(emptyForm);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6 md:flex-row md:py-10">
      <section className="w-full rounded-xl border border-zinc-200 bg-white p-4 md:w-1/3">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Memo</h1>
          <button
            onClick={startCreate}
            className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:opacity-90"
          >
            New
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => startEdit(note)}
                  className={`w-full rounded-md border p-3 text-left ${
                    selectedId === note.id
                      ? "border-black bg-zinc-50"
                      : "border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  <p className="truncate font-medium">{note.title}</p>
                  <p className="mt-1 truncate text-xs text-zinc-500">
                    {note.content || "(empty)"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="w-full rounded-xl border border-zinc-200 bg-white p-4 md:w-2/3">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">
          {selected ? "Edit note" : "Create note"}
        </h2>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
            maxLength={120}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-black"
            required
          />
          <textarea
            value={form.content}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Write your memo..."
            maxLength={5000}
            rows={12}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-black"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : selected ? "Update" : "Create"}
            </button>
            {selected && (
              <button
                type="button"
                disabled={saving}
                onClick={() => onDelete(selected.id)}
                className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
