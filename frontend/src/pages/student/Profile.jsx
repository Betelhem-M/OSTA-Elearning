import { useState } from "react";
import { Pencil, Moon, Sun, Award, Briefcase } from "lucide-react";
import { useTheme } from "@context/ThemeContext";
import AchievementGrid from "@components/dashboard/AchievementGrid";
import {
  profile as initialProfile,
  achievements,
  portfolio,
  completedCourses,
  skillsProgress,
  languageLabels,
} from "@mocks/profileData";

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();

  const [profile, setProfile] = useState(initialProfile);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState(profile.bio);
  const [language, setLanguage] = useState("en");

  const labels = languageLabels[language];

  function handleSaveBio() {
    setProfile((prev) => ({ ...prev, bio: bioDraft.trim() || prev.bio }));
    setIsEditingBio(false);
  }

  function handleCancelBio() {
    setBioDraft(profile.bio);
    setIsEditingBio(false);
  }

  function handleViewAllAchievements() {
    alert(
      "Only the badges shown here exist in this build — there are no additional achievements yet.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-start gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-extrabold text-primary">
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-ink dark:text-white">
              {profile.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              {profile.title}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {profile.location} · Joined {profile.joinedDate}
            </p>

            {isEditingBio ? (
              <div className="mt-3 max-w-lg">
                <textarea
                  value={bioDraft}
                  onChange={(e) => setBioDraft(e.target.value)}
                  className="w-full min-h-[72px] rounded-lg border border-primary p-2.5 text-sm outline-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleSaveBio}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelBio}
                    className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-3 max-w-lg text-[15px] leading-6 text-slate-600 dark:text-slate-300">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isEditingBio && (
            <button
              onClick={() => setIsEditingBio(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
            >
              <Pencil size={15} /> {labels.editProfile}
            </button>
          )}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 outline-none focus:border-primary"
          >
            <option value="en">English</option>
            <option value="om">Afaan Oromo</option>
            <option value="am">Amharic</option>
          </select>
          <button
            onClick={toggleTheme}
            aria-pressed={isDark}
            aria-label="Toggle theme"
            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:border-primary hover:text-primary"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:bg-slate-800 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-bold text-ink dark:text-white">
          {labels.achievements}
        </h2>
        <AchievementGrid
          achievements={achievements}
          onViewAll={handleViewAllAchievements}
        />
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:bg-slate-800 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-bold text-ink dark:text-white">
          {labels.portfolio}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {portfolio.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-100 p-4"
            >
              <div className="flex items-center gap-2">
                <Briefcase size={15} className="text-primary" />
                <h3 className="text-sm font-bold text-ink">{item.title}</h3>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:bg-slate-800 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-bold text-ink dark:text-white">
          {labels.completedCourses}
        </h2>
        {completedCourses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
          >
            <Award size={18} className="shrink-0 text-gold" />
            <div>
              <p className="text-sm font-semibold text-ink">{course.title}</p>
              <p className="text-xs text-slate-400">
                Completed {course.completedDate}
              </p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:bg-slate-800 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-bold text-ink dark:text-white">
          {labels.skills}
        </h2>
        <div className="space-y-3">
          {skillsProgress.map((item) => (
            <div key={item.skill}>
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>{item.skill}</span>
                <span>{item.percent}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
