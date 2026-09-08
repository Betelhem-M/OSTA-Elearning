import { useState } from "react";
import { Bot, Loader2, Send, Sparkles } from "lucide-react";

import { apiRequest } from "@services/api";
import { useAuth } from "@context/AuthContext";
import { useLanguage } from "@context/LanguageContext";

const copy = {
  en: {
    title: "AI Tutor",
    subtitle: "Ask about this lesson and get guidance from your course tutor.",
    placeholder: "Ask about this lesson...",
    send: "Send",
    thinking: "Thinking...",
    error: "The AI Tutor could not answer right now. Please try again.",
    signIn: "Please sign in to use the AI Tutor.",
  },
  am: {
    title: "ኤአይ አስተማሪ",
    subtitle: "ስለዚህ ትምህርት ይጠይቁ።",
    placeholder: "ስለዚህ ትምህርት ይጠይቁ...",
    send: "ላክ",
    thinking: "በማሰብ ላይ...",
    error: "ኤአይ አስተማሪው አሁን መልስ መስጠት አልቻለም።",
    signIn: "ኤአይ አስተማሪን ለመጠቀም ይግቡ።",
  },
  om: {
    title: "AI Tutor",
    subtitle: "Waa'ee barnoota kanaa gaafadhu.",
    placeholder: "Waa'ee barnoota kanaa gaafadhu...",
    send: "Ergi",
    thinking: "Yaadaa jira...",
    error: "AI Tutor yeroo ammaa deebii kennuu hin dandeenye.",
    signIn: "AI Tutor fayyadamuuf seeni.",
  },
};

export default function EmbeddedAITutor({ embeddedCourseId, embeddedLessonId }) {
  const { token, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const text = copy[language] || copy.en;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const message = question.trim();
    const courseId = Number(embeddedCourseId);
    const lessonId = Number(embeddedLessonId);

    if (!message || !courseId || sending) return;

    setMessages((current) => [...current, { role: "user", content: message }]);
    setQuestion("");
    setSending(true);
    setError("");

    try {
      const response = await apiRequest("/ai-tutor/chat", {
        token,
        method: "POST",
        body: {
          courseId,
          lessonId: Number.isInteger(lessonId) && lessonId > 0 ? lessonId : null,
          language,
          message,
        },
      });

      setMessages((current) => [
        ...current,
        { role: "assistant", content: response.answer },
      ]);
    } catch (requestError) {
      setError(requestError.message || text.error);
    } finally {
      setSending(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-slate-600">{text.signIn}</p>
      </aside>
    );
  }

  return (
    <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-light p-2 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-ink">{text.title}</h2>
            <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{text.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-h-[390px] min-h-[180px] space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center text-center">
            <Bot size={30} className="text-primary" />
            <p className="mt-3 text-xs leading-5 text-slate-500">{text.subtitle}</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={message.role === "user" ? "ml-6" : "mr-4"}>
              <div
                className={
                  message.role === "user"
                    ? "rounded-xl rounded-br-sm bg-primary px-3 py-2 text-xs leading-5 text-white"
                    : "rounded-xl rounded-bl-sm bg-slate-50 px-3 py-2 text-xs leading-5 text-ink"
                }
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
            <Loader2 size={14} className="mr-1 inline animate-spin" />
            {text.thinking}
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-2 text-xs font-semibold text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="border-t border-slate-100 p-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={text.placeholder}
            maxLength={4000}
            disabled={sending || !embeddedCourseId}
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
          <button
            type="submit"
            disabled={sending || !question.trim() || !embeddedCourseId}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2.5 text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={text.send}
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
      </form>
    </aside>
  );
}
