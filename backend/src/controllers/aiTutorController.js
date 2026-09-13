const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Enrollment = require("../models/Enrollment");

const SUPPORTED_LANGUAGES = {
  en: "English",
  am: "Amharic",
  om: "Afaan Oromo",
};

function getLanguageName(value) {
  return SUPPORTED_LANGUAGES[String(value || "").toLowerCase()] || "English";
}

function getUserRole(user) {
  return String(user?.role || user?.account_type || "").toLowerCase();
}

function isStudentAccount(user) {
  return ["student", "learner"].includes(getUserRole(user));
}

function buildSystemPrompt({ language, course, lesson }) {
  const languageName = getLanguageName(language);

  return [
    "You are OSTA AI Tutor, an academic assistant inside the OSTA Learning and Innovation Platform.",
    `Always answer in ${languageName}. Do not switch languages unless the learner explicitly asks to change the OSTA language preference.`,
    "Teach rather than simply give answers. Explain concepts clearly, use examples when useful, and encourage the learner to reason for themselves.",
    "Stay focused on education, the learner's course context, and the supplied lesson context.",
    "Do not invent facts about the course or lesson. If the supplied context is insufficient, clearly say what is missing.",
    "Course context:",
    `Title: ${course?.title || "Not supplied"}`,
    `Description: ${course?.description || "Not supplied"}`,
    `Level: ${course?.level || "Not supplied"}`,
    `Instructor: ${course?.instructor_name || "Not supplied"}`,
    "Lesson context:",
    `Title: ${lesson?.title || "No specific lesson selected"}`,
    `Description: ${lesson?.description || "No lesson description supplied"}`,
  ].join("\n");
}

function extractAssistantText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();

  if (Array.isArray(content)) {
    const text = content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();
    if (text) return text;
  }

  // Responses API output can contain multiple items, including reasoning items
  // before the actual message. Do not assume output[0].content[0] is the answer.
  if (Array.isArray(data?.output)) {
    const text = data.output
      .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n")
      .trim();

    if (text) return text;
  }

  if (typeof data?.choices?.[0]?.text === "string" && data.choices[0].text.trim()) {
    return data.choices[0].text.trim();
  }

  return "";
}

function buildDemoAnswer({ language, course, lesson, message }) {
  const courseTitle = course?.title || "this course";
  const lessonTitle = lesson?.title || "the course material";
  const question = String(message || "").trim();

  if (language === "am") {
    return `የሙከራ OSTA AI Tutor ሁነታ።\n\nኮርስ: ${courseTitle}\nትምህርት: ${lessonTitle}\n\nጥያቄዎ: ${question}\n\nይህ የአካባቢ ዴሞ ሁነታ ነው። እውነተኛ AI መልስ ለማግኘት backend ላይ OPENAI_API_KEY ያስፈልጋል።`;
  }

  if (language === "om") {
    return `Haala demo OSTA AI Tutor.\n\nKoorsii: ${courseTitle}\nBarnoota: ${lessonTitle}\n\nGaaffii kee: ${question}\n\nKun haala demo naannoo ti. Deebii AI dhugaa argachuuf OPENAI_API_KEY backend irratti barbaachisa.`;
  }

  return `OSTA AI Tutor demo mode.\n\nCourse: ${courseTitle}\nLesson: ${lessonTitle}\n\nYour question: ${question}\n\nThe tutor is connected, but real AI generation requires OPENAI_API_KEY on the backend.`;
}

const aiTutorController = {
  async chat(req, res) {
    try {
      // Different parts of OSTA use either role=student or account_type=student/learner.
      // Accept both so a valid learner is not rejected by the AI Tutor.
      if (!isStudentAccount(req.user)) {
        return res.status(403).json({ message: "AI Tutor is available to student accounts" });
      }

      const message = String(req.body.message || "").trim();
      const language = String(req.body.language || "en").toLowerCase();
      const courseId = Number(req.body.courseId);
      const lessonId = req.body.lessonId ? Number(req.body.lessonId) : null;

      if (!message) return res.status(400).json({ message: "Enter a question for the AI Tutor" });
      if (message.length > 4000) return res.status(400).json({ message: "Tutor questions must be 4,000 characters or less" });
      if (!Number.isInteger(courseId) || courseId < 1) return res.status(400).json({ message: "Select a course before using the AI Tutor" });
      if (!SUPPORTED_LANGUAGES[language]) return res.status(400).json({ message: "Unsupported OSTA language preference" });

      const enrollment = await Enrollment.findByUserAndCourse(req.user.id, courseId);
      if (!enrollment) return res.status(403).json({ message: "Enroll in this course before using its AI Tutor" });

      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: "Course not found" });

      let lesson = null;
      if (lessonId) {
        lesson = await Lesson.findById(lessonId);
        if (!lesson || Number(lesson.course_id) !== courseId) {
          return res.status(400).json({ message: "The selected lesson does not belong to this course" });
        }
      }

      const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
      const demoMode = String(process.env.AI_TUTOR_DEMO_MODE || "true").toLowerCase() === "true";
      const apiUrl = process.env.OPENAI_API_URL || process.env.AI_API_URL || "https://api.openai.com/v1/responses";
      const model = process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-5";

      if (!apiKey) {
        if (demoMode) {
          return res.json({
            answer: buildDemoAnswer({ language, course, lesson, message }),
            language,
            demo: true,
            course: { id: course.id, title: course.title },
            lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
          });
        }

        return res.status(503).json({ message: "AI Tutor is not configured on this backend." });
      }

      const systemPrompt = buildSystemPrompt({ language, course, lesson });

      const providerResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
            { role: "user", content: [{ type: "input_text", text: message }] },
          ],
        }),
      });

      const providerData = await providerResponse.json().catch(() => ({}));

      if (!providerResponse.ok) {
        console.error("AI provider error:", providerResponse.status, providerData);
        return res.status(502).json({ message: "The AI Tutor service could not answer right now. Please try again." });
      }

      const answer = extractAssistantText(providerData);
      if (!answer) {
        // Log only safe response metadata, never the API key or request credentials.
        console.error("AI Tutor empty response:", {
          providerStatus: providerResponse.status,
          model,
          responseId: providerData?.id || null,
          responseStatus: providerData?.status || null,
          outputItems: Array.isArray(providerData?.output) ? providerData.output.length : 0,
          outputTypes: Array.isArray(providerData?.output)
            ? providerData.output.map((item) => item?.type || "unknown")
            : [],
        });
        return res.status(502).json({ message: "The AI Tutor returned an empty response. Please try again." });
      }

      return res.json({
        answer,
        language,
        demo: false,
        course: { id: course.id, title: course.title },
        lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
      });
    } catch (error) {
      console.error("AI Tutor error:", error);
      return res.status(500).json({ message: "Failed to process the AI Tutor request" });
    }
  },
};

module.exports = aiTutorController;
