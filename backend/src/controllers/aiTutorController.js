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

function buildSystemPrompt({ language, course, lesson }) {
  const languageName = getLanguageName(language);

  return [
    "You are OSTA AI Tutor, an academic assistant inside the OSTA Learning and Innovation Platform.",
    `Always answer in ${languageName}. Do not switch languages unless the learner explicitly asks to change the OSTA language preference.`,
    "Teach rather than simply give answers. Explain concepts clearly, use examples when useful, and encourage the learner to reason for themselves.",
    "Stay focused on education, the learner's course context, and the supplied lesson context. If the learner asks something unrelated, briefly redirect them to learning or innovation topics.",
    "Do not invent facts about the course or lesson. If the supplied context is insufficient, say that you do not have enough course material and explain what additional information would help.",
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
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => part?.text || "")
      .join("\n")
      .trim();
  }

  return (
    data?.choices?.[0]?.text ||
    data?.output?.[0]?.content?.[0]?.text ||
    ""
  ).trim();
}

const aiTutorController = {
  async chat(req, res) {
    try {
      if (req.user.role !== "student") {
        return res
          .status(403)
          .json({ message: "AI Tutor is available to student accounts" });
      }

      const message = String(req.body.message || "").trim();
      const language = String(req.body.language || "en").toLowerCase();
      const courseId = Number(req.body.courseId);
      const lessonId = req.body.lessonId ? Number(req.body.lessonId) : null;

      if (!message) {
        return res
          .status(400)
          .json({ message: "Enter a question for the AI Tutor" });
      }

      if (message.length > 4000) {
        return res
          .status(400)
          .json({ message: "Tutor questions must be 4,000 characters or less" });
      }

      if (!Number.isInteger(courseId) || courseId < 1) {
        return res
          .status(400)
          .json({ message: "Select a course before using the AI Tutor" });
      }

      if (!SUPPORTED_LANGUAGES[language]) {
        return res
          .status(400)
          .json({ message: "Unsupported OSTA language preference" });
      }

      const enrollment = await Enrollment.findByUserAndCourse(
        req.user.id,
        courseId
      );
      if (!enrollment) {
        return res
          .status(403)
          .json({ message: "Enroll in this course before using its AI Tutor" });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      let lesson = null;
      if (lessonId) {
        lesson = await Lesson.findById(lessonId);
        if (!lesson || Number(lesson.course_id) !== courseId) {
          return res.status(400).json({
            message: "The selected lesson does not belong to this course",
          });
        }
      }

      // Keep the OpenAI credential on the backend only. ChatGPT/OpenAI API
      // keys must never be exposed in the React frontend or committed to Git.
      const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY;
      const apiUrl =
        process.env.OPENAI_API_URL ||
        process.env.AI_API_URL ||
        "https://api.openai.com/v1/responses";
      const model =
        process.env.OPENAI_MODEL ||
        process.env.AI_MODEL ||
        "gpt-5.6-luna";

      if (!apiKey) {
        return res.status(503).json({
          message:
            "AI Tutor is not configured yet. Add OPENAI_API_KEY to the backend environment.",
        });
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
            {
              role: "system",
              content: [{ type: "input_text", text: systemPrompt }],
            },
            {
              role: "user",
              content: [{ type: "input_text", text: message }],
            },
          ],
        }),
      });

      const providerData = await providerResponse.json().catch(() => ({}));

      if (!providerResponse.ok) {
        console.error(
          "AI provider error:",
          providerResponse.status,
          providerData
        );
        return res.status(502).json({
          message:
            "The AI Tutor service could not answer right now. Please try again.",
        });
      }

      const answer = extractAssistantText(providerData);
      if (!answer) {
        return res.status(502).json({
          message: "The AI Tutor returned an empty response. Please try again.",
        });
      }

      return res.json({
        answer,
        language,
        course: {
          id: course.id,
          title: course.title,
        },
        lesson: lesson
          ? {
              id: lesson.id,
              title: lesson.title,
            }
          : null,
      });
    } catch (error) {
      console.error("AI Tutor error:", error);
      return res
        .status(500)
        .json({ message: "Failed to process the AI Tutor request" });
    }
  },
};

module.exports = aiTutorController;
