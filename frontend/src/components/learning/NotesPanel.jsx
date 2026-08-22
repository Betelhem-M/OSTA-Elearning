import { useState } from "react";
import { Plus, Pencil, Trash2, Download } from "lucide-react";
import { formatTime } from "@hooks/useMockVideoPlayer";

let nextNoteId = 100;

export default function NotesPanel({ currentSeconds }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      timestamp: "02:14",
      text: "Remember: Python variables are dynamically typed.",
    },
    {
      id: 2,
      timestamp: "05:40",
      text: "type() function is useful for debugging type errors.",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");

  function handleAdd() {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [
      ...prev,
      { id: nextNoteId++, timestamp: formatTime(currentSeconds), text },
    ]);
    setDraft("");
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditDraft(note.text);
  }

  function saveEdit(id) {
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, text: editDraft.trim() || n.text } : n,
      ),
    );
    setEditingId(null);
  }

  function deleteNote(id) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  function handleDownload() {
    const lines = notes.map((n) => `[${n.timestamp}] ${n.text}`);
    const blob = new Blob([lines.join("\n\n") || "No notes yet."], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lesson-notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">My Notes</h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          <Plus size={14} /> Add Note at {formatTime(currentSeconds)}
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your note here... it will be saved with the timestamp."
        className="mt-4 min-h-[84px] w-full resize-none rounded-lg border border-slate-200 p-3 text-xs outline-none placeholder:text-slate-400 focus:border-primary"
      />

      <div className="mt-4 space-y-3">
        {notes.map((note) => (
          <article
            key={note.id}
            className="group flex gap-3 rounded-lg border border-slate-100 p-3 shadow-sm"
          >
            <span className="h-fit shrink-0 rounded bg-[#FFF3CD] px-2 py-1 text-[11px] font-bold text-[#8a6200]">
              {note.timestamp}
            </span>

            {editingId === note.id ? (
              <textarea
                autoFocus
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                className="flex-1 rounded border border-primary p-2 text-xs outline-none"
              />
            ) : (
              <p className="flex-1 text-xs leading-5 text-slate-600">
                {note.text}
              </p>
            )}

            <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
              {editingId === note.id ? (
                <button
                  onClick={() => saveEdit(note.id)}
                  className="text-xs font-bold text-primary"
                >
                  Save
                </button>
              ) : (
                <button
                  aria-label="Edit note"
                  onClick={() => startEdit(note)}
                  className="text-slate-400 hover:text-primary"
                >
                  <Pencil size={14} />
                </button>
              )}
              <button
                aria-label="Delete note"
                onClick={() => deleteNote(note.id)}
                className="text-slate-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <button
        onClick={handleDownload}
        className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
      >
        <Download size={14} /> Download Notes as .txt
      </button>
    </div>
  );
}
