import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  LogOut,
} from "lucide-react";

import { apiRequest } from "@services/api";

export default function AdminSettings() {
  const navigate = useNavigate();

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    region: "",
  });

  // =====================================================
  // PASSWORD STATE
  // =====================================================

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingPassword, setSavingPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // LOAD ADMIN PROFILE
  // =====================================================

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await apiRequest(
        "/users/me",
        {
          token,
        }
      );

      const user = data?.user;

      if (!user) {
        throw new Error(
          "User information was not found."
        );
      }

      setProfile({
        firstName:
          user.first_name || "",
        lastName:
          user.last_name || "",
        email:
          user.email || "",
        phone:
          user.phone || "",
        region:
          user.region || "",
      });
    } catch (err) {
      console.error(
        "Load admin profile error:",
        err
      );

      setError(
        err.message ||
          "Failed to load admin profile."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================

  function handleLogout() {
    localStorage.removeItem("osta_token");
    localStorage.removeItem("osta_user");

    navigate("/login", {
      replace: true,
    });
  }

  // =====================================================
  // PROFILE INPUT
  // =====================================================

  function handleProfileChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================================
  // PASSWORD INPUT
  // =====================================================

  function handlePasswordChange(event) {
    const { name, value } = event.target;

    setPassword((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function handleProfileSubmit(event) {
    event.preventDefault();

    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await apiRequest(
        "/users/me",
        {
          token,
          method: "PUT",
          body: profile,
        }
      );

      setSuccess(
        data.message ||
          "Profile updated successfully."
      );

      const storedUser =
        localStorage.getItem("osta_user");

      if (storedUser && data.user) {
        localStorage.setItem(
          "osta_user",
          JSON.stringify(data.user)
        );
      }
    } catch (err) {
      console.error(
        "Update admin profile error:",
        err
      );

      setError(
        err.message ||
          "Failed to update profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !password.currentPassword ||
      !password.newPassword ||
      !password.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (password.newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );

      return;
    }

    if (
      password.newPassword !==
      password.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation do not match."
      );

      return;
    }

    if (
      password.currentPassword ===
      password.newPassword
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );

      return;
    }

    try {
      setSavingPassword(true);

      const token =
        localStorage.getItem("osta_token");

      if (!token) {
        throw new Error(
          "You are not logged in."
        );
      }

      const data = await apiRequest(
        "/users/me/password",
        {
          token,
          method: "PUT",
          body: {
            currentPassword:
              password.currentPassword,
            newPassword:
              password.newPassword,
          },
        }
      );

      setPasswordSuccess(
        data.message ||
          "Password changed successfully."
      );

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(
        "Change admin password error:",
        err
      );

      setPasswordError(
        err.message ||
          "Failed to change password."
      );
    } finally {
      setSavingPassword(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_2px_12px_rgba(0,0,0,0.07)]">
        <p className="text-sm text-slate-500">
          Loading settings...
        </p>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start justify-between gap-4">

        {/* LEFT */}

        <div>
          <h1 className="text-xl font-extrabold text-ink">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your administrator profile and account security.
          </p>
        </div>

        {/* LOGOUT */}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
        >
          <LogOut size={16} />
          Logout
        </button>

      </div>

      {/* =================================================
          GENERAL ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          PROFILE INFORMATION
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* HEADER */}

        <div className="flex items-center gap-3 border-b border-slate-100 p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <User size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Profile Information
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Update your administrator information.
            </p>
          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleProfileSubmit}
          className="space-y-5 p-5"
        >

          {/* SUCCESS */}

          {success && (
            <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
              <CheckCircle
                size={17}
                className="text-green-600"
              />

              <p className="text-sm font-semibold text-green-600">
                {success}
              </p>
            </div>
          )}

          {/* FIRST + LAST NAME */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label
                htmlFor="firstName"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                First Name
              </label>

              <input
                id="firstName"
                name="firstName"
                type="text"
                value={profile.firstName}
                onChange={handleProfileChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                Last Name
              </label>

              <input
                id="lastName"
                name="lastName"
                type="text"
                value={profile.lastName}
                onChange={handleProfileChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

          </div>

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-bold text-slate-600"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleProfileChange}
              required
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* PHONE + REGION */}

          <div className="grid gap-5 sm:grid-cols-2">

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                Phone
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleProfileChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label
                htmlFor="region"
                className="mb-1.5 block text-xs font-bold text-slate-600"
              >
                Region
              </label>

              <input
                id="region"
                name="region"
                type="text"
                value={profile.region}
                onChange={handleProfileChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

          </div>

          {/* SAVE */}

          <div className="flex justify-end border-t border-slate-100 pt-5">

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      </section>

      {/* =================================================
          CHANGE PASSWORD
      ================================================= */}

      <section className="rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]">

        {/* HEADER */}

        <div className="flex items-center gap-3 border-b border-slate-100 p-5">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Lock size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-ink">
              Change Password
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Keep your administrator account secure.
            </p>
          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-5 p-5"
        >

          {/* SUCCESS */}

          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
              <CheckCircle
                size={17}
                className="text-green-600"
              />

              <p className="text-sm font-semibold text-green-600">
                {passwordSuccess}
              </p>
            </div>
          )}

          {/* ERROR */}

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-3">
              <AlertCircle
                size={17}
                className="text-red-500"
              />

              <p className="text-sm font-semibold text-red-600">
                {passwordError}
              </p>
            </div>
          )}

          {/* CURRENT PASSWORD */}

          <div>
            <label
              htmlFor="currentPassword"
              className="mb-1.5 block text-xs font-bold text-slate-600"
            >
              Current Password
            </label>

            <div className="relative">

              <input
                id="currentPassword"
                name="currentPassword"
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={password.currentPassword}
                onChange={handlePasswordChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={
                  showCurrentPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>
          </div>

          {/* NEW PASSWORD */}

          <div>
            <label
              htmlFor="newPassword"
              className="mb-1.5 block text-xs font-bold text-slate-600"
            >
              New Password
            </label>

            <div className="relative">

              <input
                id="newPassword"
                name="newPassword"
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={password.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={
                  showNewPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showNewPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>

            <p className="mt-1.5 text-[11px] text-slate-400">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* CONFIRM PASSWORD */}

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-1.5 block text-xs font-bold text-slate-600"
            >
              Confirm New Password
            </label>

            <div className="relative">

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={password.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 pr-10 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    (value) => !value
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>

            </div>
          </div>

          {/* CHANGE PASSWORD */}

          <div className="flex justify-end border-t border-slate-100 pt-5">

            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock size={16} />

              {savingPassword
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </form>
      </section>
    </div>
  );
}