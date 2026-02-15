import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { getSupabaseServerClient, isMockMode } from "./supabase";
import type { Note, NoteInput } from "./types";

const dataFile = path.join(process.cwd(), ".data", "notes.json");

async function ensureDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, "[]", "utf8");
  }
}

async function readLocalNotes(): Promise<Note[]> {
  await ensureDataFile();
  const raw = await fs.readFile(dataFile, "utf8");
  const parsed = JSON.parse(raw) as Note[];
  return parsed.sort((a, b) =>
    a.updated_at < b.updated_at ? 1 : a.updated_at > b.updated_at ? -1 : 0,
  );
}

async function writeLocalNotes(notes: Note[]) {
  await ensureDataFile();
  await fs.writeFile(dataFile, JSON.stringify(notes, null, 2), "utf8");
}

export async function listNotes(): Promise<Note[]> {
  if (isMockMode()) return readLocalNotes();

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id,title,content,created_at,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(`Failed to fetch notes: ${error.message}`);
  return data as Note[];
}

export async function createNote(input: NoteInput): Promise<Note> {
  if (isMockMode()) {
    const notes = await readLocalNotes();
    const now = new Date().toISOString();
    const note: Note = {
      id: crypto.randomUUID(),
      title: input.title,
      content: input.content,
      created_at: now,
      updated_at: now,
    };
    notes.unshift(note);
    await writeLocalNotes(notes);
    return note;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .insert({ title: input.title, content: input.content })
    .select("id,title,content,created_at,updated_at")
    .single();

  if (error) throw new Error(`Failed to create note: ${error.message}`);
  return data as Note;
}

export async function updateNote(
  id: string,
  input: NoteInput,
): Promise<Note | null> {
  if (isMockMode()) {
    const notes = await readLocalNotes();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const updated: Note = {
      ...notes[index],
      title: input.title,
      content: input.content,
      updated_at: new Date().toISOString(),
    };
    notes[index] = updated;
    await writeLocalNotes(notes);
    return updated;
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("notes")
    .update({
      title: input.title,
      content: input.content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id,title,content,created_at,updated_at")
    .maybeSingle();

  if (error) throw new Error(`Failed to update note: ${error.message}`);
  return (data as Note | null) ?? null;
}

export async function deleteNote(id: string): Promise<boolean> {
  if (isMockMode()) {
    const notes = await readLocalNotes();
    const filtered = notes.filter((n) => n.id !== id);
    const changed = filtered.length !== notes.length;
    if (changed) await writeLocalNotes(filtered);
    return changed;
  }

  const supabase = getSupabaseServerClient();
  const { error, count } = await supabase
    .from("notes")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) throw new Error(`Failed to delete note: ${error.message}`);
  return (count ?? 0) > 0;
}
