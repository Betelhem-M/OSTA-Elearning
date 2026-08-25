import { useEffect, useState } from "react";
import {
  MessageCircle,
  Send,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function DiscussionPanel({
  lesson,
}) {
  const [topics, setTopics] =
    useState([]);

  const [selectedTopic, setSelectedTopic] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [body, setBody] =
    useState("");

  const [reply, setReply] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadTopics() {
    try {
      setLoading(true);
      setError("");

      const data =
        await apiRequest(
          "/discussions"
        );

      setTopics(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load discussions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function openTopic(id) {
    try {
      const topic =
        await apiRequest(
          `/discussions/${id}`
        );

      setSelectedTopic(
        topic
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to load discussion."
      );
    }
  }

  async function createTopic() {
    if (
      !title.trim() ||
      !body.trim()
    ) {
      return;
    }

    try {
      await apiRequest(
        "/discussions",
        {
          method: "POST",
          body: {
            title:
              title.trim(),
            category:
              "Lesson Discussion",
            body:
              body.trim(),
          },
        }
      );

      setTitle("");
      setBody("");

      await loadTopics();
    } catch (err) {
      setError(
        err.message ||
          "Failed to create discussion."
      );
    }
  }

  async function addReply() {
    if (
      !selectedTopic ||
      !reply.trim()
    ) {
      return;
    }

    try {
      await apiRequest(
        `/discussions/${selectedTopic.id}/replies`,
        {
          method: "POST",
          body: {
            body:
              reply.trim(),
          },
        }
      );

      setReply("");

      await openTopic(
        selectedTopic.id
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to add reply."
      );
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading discussions...
      </div>
    );
  }

  return (
    <div className="p-5">
      <h3 className="text-sm font-bold text-ink">
        Lesson Discussion
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        Discuss this lesson with other learners.
      </p>

      {selectedTopic ? (
        <div className="mt-5">
          <button
            type="button"
            onClick={() =>
              setSelectedTopic(
                null
              )
            }
            className="text-xs font-bold text-primary hover:underline"
          >
            ← Back to discussions
          </button>

          <div className="mt-4 rounded-xl border border-slate-200 p-5">
            <h4 className="text-base font-bold text-ink">
              {
                selectedTopic.title
              }
            </h4>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {
                selectedTopic.body
              }
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {(
              selectedTopic.replies ||
              []
            ).map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="rounded-xl bg-slate-50 p-4"
                >
                  <p className="text-sm leading-6 text-slate-600">
                    {
                      item.body
                    }
                  </p>
                </div>
              )
            )}
          </div>

          <textarea
            value={reply}
            onChange={(event) =>
              setReply(
                event.target
                  .value
              )
            }
            placeholder="Write a reply..."
            className="mt-4 min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
          />

          <button
            type="button"
            onClick={
              addReply
            }
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            <Send size={14} />
            Reply
          </button>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-xl border border-slate-200 p-4">
            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target
                    .value
                )
              }
              placeholder={`Question about ${
                lesson?.title ||
                "this lesson"
              }`}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
            />

            <textarea
              value={body}
              onChange={(event) =>
                setBody(
                  event.target
                    .value
                )
              }
              placeholder="Write your question..."
              className="mt-3 min-h-[100px] w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
            />

            <button
              type="button"
              onClick={
                createTopic
              }
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
            >
              <Send size={14} />
              Start Discussion
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {topics.length ===
            0 ? (
              <p className="py-8 text-center text-sm text-slate-400">
                No discussions yet.
              </p>
            ) : (
              topics.map(
                (topic) => (
                  <button
                    type="button"
                    key={
                      topic.id
                    }
                    onClick={() =>
                      openTopic(
                        topic.id
                      )
                    }
                    className="w-full rounded-xl border border-slate-100 p-4 text-left hover:bg-slate-50"
                  >
                    <div className="flex gap-3">
                      <MessageCircle
                        size={
                          18
                        }
                        className="text-primary"
                      />

                      <div>
                        <h4 className="text-sm font-bold text-ink">
                          {
                            topic.title
                          }
                        </h4>

                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {
                            topic.body
                          }
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )
            )}
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}