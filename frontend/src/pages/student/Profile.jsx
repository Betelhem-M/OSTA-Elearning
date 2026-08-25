import { useEffect, useMemo, useState } from "react";
import {
  Pencil,
  Moon,
  Sun,
  Award,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  X,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
  LogOut,
  UserCircle2,
} from "lucide-react";

import { useTheme } from "@context/ThemeContext";
import { useAuth } from "@context/AuthContext";
import { apiRequest } from "@services/api";

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(user) {
  if (!user) return "U";

  const first = user.first_name?.[0] || "";
  const last = user.last_name?.[0] || "";

  const initials = `${first}${last}`.trim();

  if (initials) {
    return initials.toUpperCase();
  }

  return (
    user.email?.[0] || "U"
  ).toUpperCase();
}

export default function Profile() {
  const { isDark, toggleTheme } = useTheme();

  const {
    user: authUser,
    logout,
  } = useAuth();

  const [user, setUser] = useState(
    authUser || null
  );

  const [certificates, setCertificates] =
    useState([]);

  const [enrollments, setEnrollments] =
    useState([]);

  const [progressRows, setProgressRows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false);

  const [
    editingProfile,
    setEditingProfile,
  ] = useState(false);

  const [
    showPasswordForm,
    setShowPasswordForm,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    region: "",
  });

  const [
    passwordForm,
    setPasswordForm,
  ] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const [
        profileResponse,
        certificatesResponse,
        enrollmentsResponse,
        progressResponse,
      ] = await Promise.all([
        apiRequest("/users/me"),
        apiRequest("/certificates/my"),
        apiRequest("/enrollments/my"),
        apiRequest("/progress/my"),
      ]);

      const realUser =
        profileResponse?.user || null;

      setUser(realUser);

      setForm({
        firstName:
          realUser?.first_name || "",
        lastName:
          realUser?.last_name || "",
        email:
          realUser?.email || "",
        phone:
          realUser?.phone || "",
        region:
          realUser?.region || "",
      });

      setCertificates(
        Array.isArray(
          certificatesResponse
        )
          ? certificatesResponse
          : []
      );

      setEnrollments(
        Array.isArray(
          enrollmentsResponse
        )
          ? enrollmentsResponse
          : []
      );

      setProgressRows(
        Array.isArray(
          progressResponse
        )
          ? progressResponse
          : []
      );
    } catch (err) {
      console.error(
        "Profile load error:",
        err
      );

      setError(
        err.message ||
          "Failed to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // UPDATE FORM
  // =====================================================

  function handleFormChange(
    field,
    value
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSuccess("");
    setError("");
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const firstName =
        form.firstName.trim();

      const lastName =
        form.lastName.trim();

      const email =
        form.email.trim();

      const phone =
        form.phone.trim();

      const region =
        form.region.trim();

      if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !region
      ) {
        throw new Error(
          "First name, last name, email, phone, and region are required."
        );
      }

      const response =
        await apiRequest(
          "/users/me",
          {
            method: "PUT",
            body: {
              firstName,
              lastName,
              email,
              phone,
              region,
            },
          }
        );

      const updatedUser =
        response?.user;

      if (!updatedUser) {
        throw new Error(
          "The server did not return the updated profile."
        );
      }

      setUser(updatedUser);

      setForm({
        firstName:
          updatedUser.first_name || "",
        lastName:
          updatedUser.last_name || "",
        email:
          updatedUser.email || "",
        phone:
          updatedUser.phone || "",
        region:
          updatedUser.region || "",
      });

      localStorage.setItem(
        "osta_user",
        JSON.stringify(
          updatedUser
        )
      );

      setEditingProfile(false);

      setSuccess(
        "Your profile was updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      setError(
        err.message ||
          "Failed to update your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  function handleCancelProfileEdit() {
    setForm({
      firstName:
        user?.first_name || "",
      lastName:
        user?.last_name || "",
      email:
        user?.email || "",
      phone:
        user?.phone || "",
      region:
        user?.region || "",
    });

    setEditingProfile(false);
    setError("");
  }

  // =====================================================
  // PASSWORD FORM
  // =====================================================

  function handlePasswordChange(
    field,
    value
  ) {
    setPasswordForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setError("");
    setSuccess("");
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function handleChangePassword() {
    try {
      setChangingPassword(true);
      setError("");
      setSuccess("");

      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = passwordForm;

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        throw new Error(
          "Please complete all password fields."
        );
      }

      if (newPassword.length < 6) {
        throw new Error(
          "New password must be at least 6 characters."
        );
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        throw new Error(
          "New password and confirmation do not match."
        );
      }

      await apiRequest(
        "/users/me/password",
        {
          method: "PUT",
          body: {
            currentPassword,
            newPassword,
          },
        }
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);

      setSuccess(
        "Your password was changed successfully."
      );
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setError(
        err.message ||
          "Failed to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    logout();
  }

  // =====================================================
  // REAL STATISTICS
  // =====================================================

  const completedLessons =
    useMemo(() => {
      return progressRows.filter(
        (item) =>
          Boolean(
            item.completed
          )
      ).length;
    }, [progressRows]);

  const completedCourses =
    useMemo(() => {
      return certificates.length;
    }, [certificates]);

  const averageProgress =
    useMemo(() => {
      if (!progressRows.length) {
        return 0;
      }

      const total =
        progressRows.reduce(
          (sum, item) =>
            sum +
            Number(
              item.progress_percent ||
                0
            ),
          0
        );

      return Math.round(
        total /
          progressRows.length
      );
    }, [progressRows]);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <ShieldCheck
            size={40}
            className="mx-auto animate-pulse text-primary/50"
          />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
            Loading your profile...
          </p>
        </section>
      </div>
    );
  }

  const displayName =
    `${user?.first_name || ""} ${
      user?.last_name || ""
    }`.trim() ||
    "OSTA Student";

  return (
    <div className="space-y-6">
      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-700">
            {success}
          </p>
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          PROFILE HEADER
      ================================================= */}

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {user?.profile_image ? (
              <img
                src={user.profile_image}
                alt={displayName}
                className="h-20 w-20 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary-light text-xl font-extrabold text-primary">
                {getInitials(user)}
              </span>
            )}

            <div>
              <h1 className="text-xl font-extrabold text-ink dark:text-white">
                {displayName}
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                OSTA Student
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Member since{" "}
                {formatDate(
                  user?.created_at
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!editingProfile ? (
              <button
                type="button"
                onClick={() =>
                  setEditingProfile(
                    true
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={
                    handleSaveProfile
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  <Save size={15} />

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleCancelProfileEdit
                  }
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  <X size={15} />
                  Cancel
                </button>
              </>
            )}

            <button
              type="button"
              onClick={toggleTheme}
              aria-pressed={isDark}
              aria-label="Toggle theme"
              className="rounded-lg border border-slate-200 p-2.5 text-slate-500 hover:border-primary hover:text-primary dark:border-slate-600"
            >
              {isDark ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </div>
        </div>

        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <div className="mt-7 border-t border-slate-100 pt-6 dark:border-slate-700">
          <h2 className="text-sm font-bold text-ink dark:text-white">
            Personal Information
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {/* FIRST NAME */}

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                First Name
              </label>

              <input
                value={
                  form.firstName
                }
                disabled={
                  !editingProfile
                }
                onChange={(event) =>
                  handleFormChange(
                    "firstName",
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
              />
            </div>

            {/* LAST NAME */}

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Last Name
              </label>

              <input
                value={
                  form.lastName
                }
                disabled={
                  !editingProfile
                }
                onChange={(event) =>
                  handleFormChange(
                    "lastName",
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={
                    form.email
                  }
                  disabled={
                    !editingProfile
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "email",
                      event.target
                        .value
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
                />
              </div>
            </div>

            {/* PHONE */}

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={
                    form.phone
                  }
                  disabled={
                    !editingProfile
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "phone",
                      event.target
                        .value
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
                />
              </div>
            </div>

            {/* REGION */}

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Region
              </label>

              <div className="relative">
                <MapPin
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={
                    form.region
                  }
                  disabled={
                    !editingProfile
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "region",
                      event.target
                        .value
                    )
                  }
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-ink outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          LEARNING STATISTICS
      ================================================= */}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <BookOpen
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Enrolled Courses
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink dark:text-white">
            {enrollments.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <CheckCircle2
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Completed Lessons
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink dark:text-white">
            {completedLessons}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <Award
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Certificates
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink dark:text-white">
            {completedCourses}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <ShieldCheck
            size={20}
            className="text-primary"
          />

          <p className="mt-3 text-xs font-semibold text-slate-400">
            Learning Progress
          </p>

          <p className="mt-1 text-2xl font-extrabold text-ink dark:text-white">
            {averageProgress}%
          </p>
        </div>
      </section>

      {/* =================================================
          ACHIEVEMENTS
      ================================================= */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div>
          <h2 className="text-lg font-bold text-ink dark:text-white">
            Achievements
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Certificates and achievements earned through your
            actual learning progress.
          </p>
        </div>

        {certificates.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-600">
            <Award
              size={35}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-300">
              No certificates earned yet
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Complete your courses and pass the required assessments
              to unlock your first certificate.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {certificates.map(
              (certificate) => (
                <div
                  key={
                    certificate.id
                  }
                  className="rounded-xl border border-slate-100 p-4 dark:border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <Award
                      size={19}
                      className="shrink-0 text-primary"
                    />

                    <div>
                      <p className="text-sm font-bold text-ink dark:text-white">
                        {
                          certificate.course_title
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Completed{" "}
                        {formatDate(
                          certificate.completion_date
                        )}
                      </p>

                      {certificate.score !==
                        null && (
                        <p className="mt-1 text-xs font-semibold text-primary">
                          Score:{" "}
                          {
                            certificate.score
                          }%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          COMPLETED COURSES
      ================================================= */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-lg font-bold text-ink dark:text-white">
          Completed Courses
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Courses completed through the OSTA learning platform.
        </p>

        <div className="mt-4 space-y-3">
          {certificates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-600">
              <p className="text-sm text-slate-400">
                No completed courses yet.
              </p>
            </div>
          ) : (
            certificates.map(
              (certificate) => (
                <div
                  key={
                    certificate.id
                  }
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-700"
                >
                  <Award
                    size={18}
                    className="shrink-0 text-primary"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink dark:text-white">
                      {
                        certificate.course_title
                      }
                    </p>

                    <p className="text-xs text-slate-400">
                      Completed{" "}
                      {formatDate(
                        certificate.completion_date
                      )}
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </section>

      {/* =================================================
          ACCOUNT SECURITY
      ================================================= */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">
              Account Security
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Keep your OSTA account secure and up to date.
            </p>
          </div>

          {!showPasswordForm && (
            <button
              type="button"
              onClick={() =>
                setShowPasswordForm(
                  true
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-primary hover:text-primary dark:border-slate-600 dark:text-slate-300"
            >
              <Lock size={15} />
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="mt-6 max-w-xl space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Current Password
              </label>

              <input
                type="password"
                autoComplete="current-password"
                value={
                  passwordForm.currentPassword
                }
                onChange={(event) =>
                  handlePasswordChange(
                    "currentPassword",
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                value={
                  passwordForm.newPassword
                }
                onChange={(event) =>
                  handlePasswordChange(
                    "newPassword",
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                Confirm New Password
              </label>

              <input
                type="password"
                autoComplete="new-password"
                value={
                  passwordForm.confirmPassword
                }
                onChange={(event) =>
                  handlePasswordChange(
                    "confirmPassword",
                    event.target
                      .value
                  )
                }
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  handleChangePassword
                }
                disabled={
                  changingPassword
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
              >
                <Lock size={14} />

                {changingPassword
                  ? "Changing..."
                  : "Change Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(
                    false
                  );

                  setPasswordForm({
                    currentPassword:
                      "",
                    newPassword:
                      "",
                    confirmPassword:
                      "",
                  });

                  setError("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =================================================
          ACCOUNT
      ================================================= */}

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            <UserCircle2
              size={20}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">
              Account
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Manage your OSTA account session. Logging out will
              securely remove your active session from this browser.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={16} />
          Log Out
        </button>
      </section>
    </div>
  );
}