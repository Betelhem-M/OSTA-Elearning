import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Save,
  X,
} from "lucide-react";

import { formatTime } from "@hooks/useMockVideoPlayer";
import { apiRequest } from "@services/api";

export default function NotesPanel({
  lessonId,
  currentSeconds = 0,
}) {
  const [notes, setNotes] =
    useState([]);

  const [draft, setDraft] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [editDraft, setEditDraft] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadNotes() {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest(
          `/notes/lesson/${lessonId}`
        );

      setNotes(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Load notes error:",
        err
      );

      setError(
        err.message ||
          "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (lessonId) {
      loadNotes();
    }
  }, [lessonId]);

  async function handleAdd() {
    const text =
      draft.trim();

    if (!text) return;

    try {
      setSaving(true);
      setError("");

      const response =
        await apiRequest(
          `/notes/lesson/${lessonId}`,
          {
            method: "POST",
            body: {
              timestampSeconds:
                Math.floor(
                  Number(
                    currentSeconds
                  ) || 0
                ),
              noteText: text,
            },
          }
        );

      if (response.note) {
        setNotes((previous) => [
          ...previous,
          response.note,
        ]);
      }

      setDraft("");
    } catch (err) {
      console.error(
        "Add note error:",
        err
      );

      setError(
        err.message ||
          "Failed to add note."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditDraft(
      note.note_text
    );
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft("");
  }

  async function saveEdit(id) {
    const text =
      editDraft.trim();

    if (!text) return;

    try {
      setSaving(true);

      const response =
        await apiRequest(
          `/notes/${id}`,
          {
            method: "PUT",
            body: {
              noteText: text,
            },
          }
        );

      setNotes((previous) =>
        previous.map((note) =>
          note.id === id
            ? response.note
            : note
        )
      );

      cancelEdit();
    } catch (err) {
      setError(
        err.message ||
          "Failed to update note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id) {
    try {
      setSaving(true);

      await apiRequest(
        `/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      setNotes((previous) =>
        previous.filter(
          (note) =>
            note.id !== id
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete note."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleDownload() {
    const lines =
      notes.map((note) => {
        const time =
          formatTime(
            Number(
              note.timestamp_seconds
            ) || 0
          );

        return `[${time}] ${note.note_text}`;
      });

    const blob =
      new Blob(
        [
          lines.join(
            "\n\n"
          ) ||
            "No notes yet.",
        ],
        {
          type: "text/plain;charset=utf-8",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;
    link.download =
      "lesson-notes.txt";

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading your notes...
      </div>
    );
  }

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-ink">
            My Notes
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Notes are saved to your account.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={
            saving ||
            !draft.trim()
          }
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          <Plus size={14} />
          Add Note at{" "}
          {formatTime(
            Number(
              currentSeconds
            ) || 0
          )}
        </button>
      </div>

      <textarea
        value={draft}
        onChange={(event) =>
          setDraft(
            event.target.value
          )
        }
        placeholder="Type your note here..."
        className="mt-4 min-h-[90px] w-full resize-none rounded-lg border border-slate-200 p-3 text-xs outline-none focus:border-primary"
      />

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            No notes yet.
          </div>
        ) : (
          notes.map((note) => {
            const editing =
              editingId ===
              note.id;

            return (
              <article
                key={note.id}
                className="flex gap-3 rounded-lg border border-slate-100 p-3"
              >
                <span className="h-fit rounded bg-[#FFF3CD] px-2 py-1 text-[11px] font-bold text-[#8a6200]">
                  {formatTime(
                    Number(
                      note.timestamp_seconds
                    ) || 0
                  )}
                </span>

                {editing ? (
                  <textarea
                    autoFocus
                    value={
                      editDraft
                    }
                    onChange={(
                      event
                    ) =>
                      setEditDraft(
                        event.target
                          .value
                      )
                    }
                    className="min-h-[70px] flex-1 rounded border border-primary p-2 text-xs outline-none"
                  />
                ) : (
                  <p className="flex-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {note.note_text}
                  </p>
                )}

                <div className="flex gap-2">
                  {editing ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          saveEdit(
                            note.id
                          )
                        }
                        className="text-primary"
                      >
                        <Save
                          size={15}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={
                          cancelEdit
                        }
                        className="text-slate-400"
                      >
                        <X
                          size={15}
                        />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          startEdit(
                            note
                          )
                        }
                        className="text-slate-400 hover:text-primary"
                      >
                        <Pencil
                          size={14}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteNote(
                            note.id
                          )
                        }
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2
                          size={14}
                        />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={
          handleDownload
        }
        className="mt-5 flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
      >
        <Download size={14} />
        Download Notes
      </button>
    </div>
  );
}