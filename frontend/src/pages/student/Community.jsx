import { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Send,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Users,
  MessageSquare,
} from "lucide-react";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";

const CATEGORIES = [
  "General",
  "Course Help",
  "Programming",
  "Assignments",
  "Career",
  "Research",
  "Projects",
];

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getUserName(item) {
  if (!item) return "Community Member";

  if (
    item.first_name ||
    item.last_name
  ) {
    return `${item.first_name || ""} ${
      item.last_name || ""
    }`.trim();
  }

  if (item.user_name) {
    return item.user_name;
  }

  if (item.name) {
    return item.name;
  }

  return "Community Member";
}

export default function Community() {
  const { user, isAuthenticated } =
    useAuth();

  const [topics, setTopics] =
    useState([]);

  const [selectedTopic, setSelectedTopic] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [loadingTopic, setLoadingTopic] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("All");

  const [showCreate, setShowCreate] =
    useState(false);

  const [title, setTitle] =
    useState("");

  const [body, setBody] =
    useState("");

  const [newCategory, setNewCategory] =
    useState("General");

  const [reply, setReply] =
    useState("");

  const [editingReplyId, setEditingReplyId] =
    useState(null);

  const [editingReplyText, setEditingReplyText] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [editingTopic, setEditingTopic] =
    useState(false);

  const [editTopicTitle, setEditTopicTitle] =
    useState("");

  const [editTopicBody, setEditTopicBody] =
    useState("");

  const [editTopicCategory, setEditTopicCategory] =
    useState("General");

  // =====================================================
  // LOAD ALL TOPICS
  // =====================================================

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
      console.error(
        "Community load error:",
        err
      );

      setError(
        err.message ||
          "Failed to load community discussions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  // =====================================================
  // FILTER TOPICS
  // =====================================================

  const filteredTopics =
    useMemo(() => {
      const searchValue =
        search.trim().toLowerCase();

      return topics.filter(
        (topic) => {
          const matchesCategory =
            category === "All" ||
            topic.category ===
              category;

          if (!matchesCategory) {
            return false;
          }

          if (!searchValue) {
            return true;
          }

          return (
            String(
              topic.title || ""
            )
              .toLowerCase()
              .includes(
                searchValue
              ) ||
            String(
              topic.body || ""
            )
              .toLowerCase()
              .includes(
                searchValue
              )
          );
        }
      );
    }, [
      topics,
      search,
      category,
    ]);

  // =====================================================
  // OPEN TOPIC
  // =====================================================

  async function openTopic(topicId) {
    try {
      setLoadingTopic(true);
      setError("");

      const topic =
        await apiRequest(
          `/discussions/${topicId}`
        );

      setSelectedTopic(
        topic
      );
    } catch (err) {
      console.error(
        "Open discussion error:",
        err
      );

      setError(
        err.message ||
          "Failed to open discussion."
      );
    } finally {
      setLoadingTopic(false);
    }
  }

  // =====================================================
  // CREATE TOPIC
  // =====================================================

  async function createTopic() {
    if (!isAuthenticated) {
      setError(
        "Please log in to create a discussion."
      );
      return;
    }

    const cleanTitle =
      title.trim();

    const cleanBody =
      body.trim();

    if (!cleanTitle || !cleanBody) {
      setError(
        "Title and discussion body are required."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response =
        await apiRequest(
          "/discussions",
          {
            method: "POST",
            body: {
              title: cleanTitle,
              category:
                newCategory,
              body: cleanBody,
            },
          }
        );

      setTitle("");
      setBody("");
      setNewCategory("General");
      setShowCreate(false);

      await loadTopics();

      if (response.topic?.id) {
        await openTopic(
          response.topic.id
        );
      }
    } catch (err) {
      console.error(
        "Create discussion error:",
        err
      );

      setError(
        err.message ||
          "Failed to create discussion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // ADD REPLY
  // =====================================================

  async function addReply() {
    if (!isAuthenticated) {
      setError(
        "Please log in to reply."
      );
      return;
    }

    const cleanReply =
      reply.trim();

    if (
      !cleanReply ||
      !selectedTopic
    ) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/discussions/${selectedTopic.id}/replies`,
        {
          method: "POST",
          body: {
            body: cleanReply,
          },
        }
      );

      setReply("");

      await openTopic(
        selectedTopic.id
      );
    } catch (err) {
      console.error(
        "Add reply error:",
        err
      );

      setError(
        err.message ||
          "Failed to add reply."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // START EDIT REPLY
  // =====================================================

  function startEditReply(item) {
    setEditingReplyId(
      item.id
    );

    setEditingReplyText(
      item.body || ""
    );
  }

  function cancelEditReply() {
    setEditingReplyId(null);
    setEditingReplyText("");
  }

  // =====================================================
  // UPDATE REPLY
  // =====================================================

  async function updateReply(replyId) {
    const cleanText =
      editingReplyText.trim();

    if (!cleanText) return;

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/discussions/${selectedTopic.id}/replies/${replyId}`,
        {
          method: "PUT",
          body: {
            body: cleanText,
          },
        }
      );

      cancelEditReply();

      await openTopic(
        selectedTopic.id
      );
    } catch (err) {
      console.error(
        "Update reply error:",
        err
      );

      setError(
        err.message ||
          "Failed to update reply."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // DELETE REPLY
  // =====================================================

  async function deleteReply(replyId) {
    const confirmed =
      window.confirm(
        "Delete this reply?"
      );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/discussions/${selectedTopic.id}/replies/${replyId}`,
        {
          method: "DELETE",
        }
      );

      await openTopic(
        selectedTopic.id
      );
    } catch (err) {
      console.error(
        "Delete reply error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete reply."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // START EDIT TOPIC
  // =====================================================

  function startEditTopic() {
    if (!selectedTopic) return;

    setEditingTopic(true);

    setEditTopicTitle(
      selectedTopic.title ||
        ""
    );

    setEditTopicBody(
      selectedTopic.body ||
        ""
    );

    setEditTopicCategory(
      selectedTopic.category ||
        "General"
    );
  }

  function cancelEditTopic() {
    setEditingTopic(false);
    setEditTopicTitle("");
    setEditTopicBody("");
  }

  // =====================================================
  // UPDATE TOPIC
  // =====================================================

  async function updateTopic() {
    if (!selectedTopic) return;

    const cleanTitle =
      editTopicTitle.trim();

    const cleanBody =
      editTopicBody.trim();

    if (!cleanTitle || !cleanBody) {
      setError(
        "Title and body are required."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/discussions/${selectedTopic.id}`,
        {
          method: "PUT",
          body: {
            title: cleanTitle,
            category:
              editTopicCategory,
            body: cleanBody,
          },
        }
      );

      setEditingTopic(false);

      await loadTopics();

      await openTopic(
        selectedTopic.id
      );
    } catch (err) {
      console.error(
        "Update topic error:",
        err
      );

      setError(
        err.message ||
          "Failed to update discussion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // DELETE TOPIC
  // =====================================================

  async function deleteTopic() {
    if (!selectedTopic) return;

    const confirmed =
      window.confirm(
        "Delete this discussion and its replies?"
      );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/discussions/${selectedTopic.id}`,
        {
          method: "DELETE",
        }
      );

      setSelectedTopic(null);

      await loadTopics();
    } catch (err) {
      console.error(
        "Delete topic error:",
        err
      );

      setError(
        err.message ||
          "Failed to delete discussion."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // =====================================================
  // TOPIC OWNER CHECK
  // =====================================================

  function isTopicOwner(topic) {
    return (
      user &&
      Number(topic?.user_id) ===
        Number(user.id)
    );
  }

  function isReplyOwner(item) {
    return (
      user &&
      Number(item?.user_id) ===
        Number(user.id)
    );
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 lg:px-10">
        <div className="mx-auto max-w-[1150px]">
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
            <MessageCircle
              size={42}
              className="mx-auto animate-pulse text-primary/40"
            />

            <p className="mt-4 text-sm text-slate-500">
              Loading OSTA Community...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // SELECTED TOPIC
  // =====================================================

  if (selectedTopic) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-10 lg:px-10">
        <div className="mx-auto max-w-[950px]">
          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              setSelectedTopic(
                null
              )
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <ArrowLeft size={16} />
            Back to Community
          </button>

          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* TOPIC */}

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full bg-primary-light px-3 py-1 text-[11px] font-bold text-primary">
                    {selectedTopic.category ||
                      "General"}
                  </span>

                  {editingTopic ? (
                    <div className="mt-4 space-y-3">
                      <input
                        value={
                          editTopicTitle
                        }
                        onChange={(event) =>
                          setEditTopicTitle(
                            event.target
                              .value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 p-3 text-lg font-bold outline-none focus:border-primary"
                      />

                      <select
                        value={
                          editTopicCategory
                        }
                        onChange={(event) =>
                          setEditTopicCategory(
                            event.target
                              .value
                          )
                        }
                        className="rounded-lg border border-slate-200 p-2 text-sm outline-none"
                      >
                        {CATEGORIES.filter(
                          (item) =>
                            item !== "All"
                        ).map(
                          (item) => (
                            <option
                              key={
                                item
                              }
                              value={
                                item
                              }
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>

                      <textarea
                        value={
                          editTopicBody
                        }
                        onChange={(event) =>
                          setEditTopicBody(
                            event.target
                              .value
                          )
                        }
                        className="min-h-[150px] w-full rounded-lg border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-primary"
                      />
                    </div>
                  ) : (
                    <>
                      <h1 className="mt-4 text-2xl font-extrabold text-ink">
                        {
                          selectedTopic.title
                        }
                      </h1>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(
                          selectedTopic.created_at
                        )}
                      </p>
                    </>
                  )}
                </div>

                {isTopicOwner(
                  selectedTopic
                ) &&
                  !editingTopic && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={
                          startEditTopic
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-primary hover:text-primary"
                      >
                        <Pencil
                          size={
                            15
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={
                          deleteTopic
                        }
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-200 hover:text-red-500"
                      >
                        <Trash2
                          size={
                            15
                          }
                        />
                      </button>
                    </div>
                  )}
              </div>

              {editingTopic ? (
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={
                      updateTopic
                    }
                    disabled={
                      submitting
                    }
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {submitting
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      cancelEditTopic
                    }
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <p className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {
                    selectedTopic.body
                  }
                </p>
              )}
            </div>
          </section>

          {/* REPLIES */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare
                size={18}
                className="text-primary"
              />

              <h2 className="text-base font-bold text-ink">
                Replies
              </h2>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                {
                  selectedTopic
                    .replies?.length ||
                  0
                }
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {selectedTopic.replies?.length >
              0 ? (
                selectedTopic.replies.map(
                  (item) => (
                    <article
                      key={
                        item.id
                      }
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-ink">
                            {getUserName(
                              item
                            )}
                          </p>

                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatDate(
                              item.created_at
                            )}
                          </p>
                        </div>

                        {isReplyOwner(
                          item
                        ) && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startEditReply(
                                  item
                                )
                              }
                              className="text-slate-400 hover:text-primary"
                            >
                              <Pencil
                                size={
                                  14
                                }
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteReply(
                                  item.id
                                )
                              }
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2
                                size={
                                  14
                                }
                              />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingReplyId ===
                      item.id ? (
                        <div className="mt-3">
                          <textarea
                            autoFocus
                            value={
                              editingReplyText
                            }
                            onChange={(event) =>
                              setEditingReplyText(
                                event.target
                                  .value
                              )
                            }
                            className="min-h-[90px] w-full rounded-lg border border-primary bg-white p-3 text-sm outline-none"
                          />

                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateReply(
                                  item.id
                                )
                              }
                              disabled={
                                submitting
                              }
                              className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              onClick={
                                cancelEditReply
                              }
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                          {item.body}
                        </p>
                      )}
                    </article>
                  )
                )
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <MessageCircle
                    size={30}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    No replies yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Be the first person to join the conversation.
                  </p>
                </div>
              )}
            </div>

            {/* REPLY FORM */}

            {isAuthenticated ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <label className="text-xs font-bold text-ink">
                  Add your reply
                </label>

                <textarea
                  value={reply}
                  onChange={(event) =>
                    setReply(
                      event.target
                        .value
                    )
                  }
                  placeholder="Share your answer, idea, or question..."
                  className="mt-2 min-h-[100px] w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />

                <button
                  type="button"
                  onClick={
                    addReply
                  }
                  disabled={
                    submitting ||
                    !reply.trim()
                  }
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send size={14} />
                  {submitting
                    ? "Sending..."
                    : "Post Reply"}
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
                <p className="text-sm font-semibold text-ink">
                  Join the conversation
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Log in to ask questions and reply to other learners.
                </p>

                <a
                  href="/login"
                  className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
                >
                  Log In
                </a>
              </div>
            )}
          </section>
        </div>
      </main>
    );
  }

  // =====================================================
  // COMMUNITY LIST
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 lg:px-10">
      <div className="mx-auto max-w-[1150px]">
        {/* HERO */}

        <section className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-7 text-white shadow-lg sm:p-9">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />

          <div className="absolute -bottom-20 left-1/4 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Users size={23} />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
                  OSTA Community
                </span>
              </div>

              <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                Learn together. Ask questions. Build together.
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Connect with other OSTA learners, share ideas,
                ask for help, discuss programming and research,
                and learn from the experience of the community.
              </p>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    true
                  )
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-xs font-bold text-white hover:bg-primary-hover"
              >
                <Plus size={15} />
                Start Discussion
              </button>
            )}
          </div>
        </section>

        {/* CREATE DISCUSSION */}

        {showCreate && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ink">
                  Start a Discussion
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Ask a question or start a useful conversation.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target
                      .value
                  )
                }
                placeholder="Discussion title"
                className="rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <div>
                <label className="mb-2 block text-xs font-bold text-ink">
                  Category
                </label>

                <select
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(
                      event.target
                        .value
                    )
                  }
                  className="rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                >
                  {CATEGORIES.filter(
                    (item) =>
                      item !== "All"
                  ).map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              <textarea
                value={body}
                onChange={(event) =>
                  setBody(
                    event.target
                      .value
                  )
                }
                placeholder="Write your question or discussion..."
                className="min-h-[150px] resize-none rounded-lg border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={
                    createTopic
                  }
                  disabled={
                    submitting ||
                    !title.trim() ||
                    !body.trim()
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                >
                  <Send size={14} />

                  {submitting
                    ? "Posting..."
                    : "Post Discussion"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ERROR */}

        {error && (
          <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* SEARCH + FILTER */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search discussions..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-primary focus:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                "All",
                ...CATEGORIES,
              ].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setCategory(
                        item
                      )
                    }
                    className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                      category ===
                      item
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* STATS */}

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">
              Discussions
            </p>

            <p className="mt-1 text-2xl font-extrabold text-ink">
              {topics.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">
              Categories
            </p>

            <p className="mt-1 text-2xl font-extrabold text-ink">
              {new Set(
                topics.map(
                  (item) =>
                    item.category
                )
              ).size}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-400">
              Showing
            </p>

            <p className="mt-1 text-2xl font-extrabold text-ink">
              {
                filteredTopics.length
              }
            </p>
          </div>
        </div>

        {/* DISCUSSIONS */}

        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">
                Community Discussions
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Explore conversations started by OSTA learners.
              </p>
            </div>
          </div>

          {filteredTopics.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <MessageCircle
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 text-base font-bold text-ink">
                No discussions found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try another search or category, or start the
                first discussion in the community.
              </p>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(
                      true
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
                >
                  <Plus size={14} />
                  Start Discussion
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTopics.map(
                (topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() =>
                      openTopic(
                        topic.id
                      )
                    }
                    className="group w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                        <MessageCircle
                          size={19}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold text-primary">
                            {topic.category ||
                              "General"}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            {formatDate(
                              topic.created_at
                            )}
                          </span>
                        </div>

                        <h3 className="mt-2 text-sm font-bold text-ink group-hover:text-primary">
                          {topic.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {topic.body}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </section>

        {loadingTopic && (
          <div className="fixed bottom-5 right-5 rounded-lg bg-[#0F172A] px-4 py-3 text-xs font-bold text-white shadow-lg">
            Loading discussion...
          </div>
        )}
      </div>
    </main>
  );
}