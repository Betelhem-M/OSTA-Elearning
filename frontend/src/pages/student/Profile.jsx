import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  FileBarChart,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Lock,
  LogOut,
  Menu,
  Pencil,
  Save,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  Outlet,
} from "react-router-dom";

import Sidebar from "@components/layout/Sidebar";
import BottomNav from "@components/layout/BottomNav";

import {
  STUDENT_BOTTOM_NAV,
  STUDENT_SIDEBAR_NAV,
  INSTRUCTOR_SIDEBAR_NAV,
  ADMIN_SIDEBAR_NAV,
} from "@constants/navigation";

import {
  useAuth,
} from "@context/AuthContext";

import {
  useNotifications,
} from "@context/NotificationContext";

import {
  useSidebarDrawer,
} from "@hooks/useSidebarDrawer";

import {
  apiRequest,
} from "@services/api";

const API_URL =
  "http://localhost:5000/api";

function getRoleInfo(user) {
  if (
    user?.role ===
    "admin"
  ) {
    return {
      label: "Administrator",
      title:
        "Administrator Profile",
      subtitle:
        "Manage your OSTA administrator account",
      icon: ShieldCheck,
      navigation:
        ADMIN_SIDEBAR_NAV,
    };
  }

  if (
    user?.role ===
    "instructor"
  ) {
    return {
      label: "Instructor",
      title:
        "Instructor Profile",
      subtitle:
        "Manage your teaching identity and account",
      icon: BookOpen,
      navigation:
        INSTRUCTOR_SIDEBAR_NAV,
    };
  }

  if (
    user?.account_type ===
    "researcher"
  ) {
    return {
      label: "Researcher",
      title:
        "Researcher Profile",
      subtitle:
        "Manage your research identity and account",
      icon: GraduationCap,
      navigation: [
        {
          label: "Research",
          href: "/research",
          icon: "FlaskConical",
        },
        {
          label: "Profile",
          href: "/profile",
          icon: "User",
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: "Bell",
        },
      ],
    };
  }

  if (
    user?.account_type ===
    "entrepreneur"
  ) {
    return {
      label: "Innovator",
      title:
        "Innovator Profile",
      subtitle:
        "Manage your innovation identity and account",
      icon: Lightbulb,
      navigation: [
        {
          label:
            "Innovation Hub",
          href:
            "/innovation-hub",
          icon: "Lightbulb",
        },
        {
          label: "Profile",
          href: "/profile",
          icon: "User",
        },
        {
          label: "Notifications",
          href: "/notifications",
          icon: "Bell",
        },
      ],
    };
  }

  return {
    label: "Student",
    title:
      "Student Profile",
    subtitle:
      "Manage your learning identity and account",
    icon: GraduationCap,
    navigation:
      STUDENT_SIDEBAR_NAV,
    student: true,
  };
}

function getInitials(user) {
  const initials =
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`;

  if (initials) {
    return initials.toUpperCase();
  }

  return (
    user?.email?.[0] ||
    "U"
  ).toUpperCase();
}

export default function Profile() {
  const {
    user,
    setUser,
    logout,
  } = useAuth();

  const {
    unreadCount,
  } = useNotifications();

  const drawer =
    useSidebarDrawer();

  const roleInfo =
    useMemo(
      () =>
        getRoleInfo(user),
      [user]
    );

  const RoleIcon =
    roleInfo.icon;

  const fileInputRef =
    useRef(null);

  const [
    profile,
    setProfile,
  ] = useState(user);

  const [
    form,
    setForm,
  ] = useState({
    firstName:
      user?.first_name ||
      "",
    lastName:
      user?.last_name ||
      "",
    email:
      user?.email ||
      "",
    phone:
      user?.phone ||
      "",
    region:
      user?.region ||
      "",
  });

  const [
    editing,
    setEditing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    removingPhoto,
    setRemovingPhoto,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    password,
    setPassword,
  ] = useState({
    currentPassword:
      "",
    newPassword:
      "",
    confirmPassword:
      "",
  });

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const response =
        await apiRequest(
          "/users/me"
        );

      const currentUser =
        response?.user;

      if (!currentUser) {
        throw new Error(
          "Profile information was not returned."
        );
      }

      setProfile(
        currentUser
      );

      setUser(
        currentUser
      );

      setForm({
        firstName:
          currentUser.first_name ||
          "",
        lastName:
          currentUser.last_name ||
          "",
        email:
          currentUser.email ||
          "",
        phone:
          currentUser.phone ||
          "",
        region:
          currentUser.region ||
          "",
      });
    } catch (err) {
      console.error(
        "Profile loading error:",
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

  // =====================================================
  // UPDATE FIELD
  // =====================================================

  function updateField(
    field,
    value
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setError("");
    setSuccess("");
  }

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  async function saveProfile() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.region.trim()
      ) {
        throw new Error(
          "All profile fields are required."
        );
      }

      const response =
        await apiRequest(
          "/users/me",
          {
            method: "PUT",
            body: {
              firstName:
                form.firstName.trim(),
              lastName:
                form.lastName.trim(),
              email:
                form.email.trim(),
              phone:
                form.phone.trim(),
              region:
                form.region.trim(),
            },
          }
        );

      if (!response?.user) {
        throw new Error(
          "Updated profile was not returned."
        );
      }

      setProfile(
        response.user
      );

      setUser(
        response.user
      );

      setEditing(false);

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

  function cancelEdit() {
    setForm({
      firstName:
        profile?.first_name ||
        "",
      lastName:
        profile?.last_name ||
        "",
      email:
        profile?.email ||
        "",
      phone:
        profile?.phone ||
        "",
      region:
        profile?.region ||
        "",
    });

    setEditing(false);
  }

  // =====================================================
  // SELECT PHOTO
  // =====================================================

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  // =====================================================
  // UPLOAD PHOTO
  // =====================================================

  async function handlePhotoChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Please choose a JPG, PNG, WEBP, or GIF image."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Profile photo must be 5 MB or smaller."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const token =
        localStorage.getItem(
          "osta_token"
        );

      const formData =
        new FormData();

      formData.append(
        "profileImage",
        file
      );

      const response =
        await fetch(
          `${API_URL}/users/me/profile-image`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body:
              formData,
          }
        );

      const data =
        await response
          .json()
          .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to upload profile photo."
        );
      }

      setProfile(
        data.user
      );

      setUser(
        data.user
      );

      localStorage.setItem(
        "osta_user",
        JSON.stringify(
          data.user
        )
      );

      setSuccess(
        "Profile photo updated successfully."
      );
    } catch (err) {
      console.error(
        "Profile photo upload error:",
        err
      );

      setError(
        err.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploading(false);
    }
  }

  // =====================================================
  // REMOVE PHOTO
  // =====================================================

  async function removePhoto() {
    try {
      setRemovingPhoto(true);
      setError("");
      setSuccess("");

      const response =
        await apiRequest(
          "/users/me/profile-image",
          {
            method: "DELETE",
          }
        );

      setProfile(
        response.user
      );

      setUser(
        response.user
      );

      setSuccess(
        "Profile photo removed successfully."
      );
    } catch (err) {
      console.error(
        "Remove profile photo error:",
        err
      );

      setError(
        err.message ||
          "Failed to remove profile photo."
      );
    } finally {
      setRemovingPhoto(false);
    }
  }

  // =====================================================
  // PASSWORD
  // =====================================================

  async function changePassword() {
    try {
      setError("");
      setSuccess("");

      if (
        !password.currentPassword ||
        !password.newPassword ||
        !password.confirmPassword
      ) {
        throw new Error(
          "Please complete all password fields."
        );
      }

      if (
        password.newPassword.length <
        6
      ) {
        throw new Error(
          "New password must be at least 6 characters."
        );
      }

      if (
        password.newPassword !==
        password.confirmPassword
      ) {
        throw new Error(
          "New password confirmation does not match."
        );
      }

      await apiRequest(
        "/users/me/password",
        {
          method: "PUT",
          body: {
            currentPassword:
              password.currentPassword,
            newPassword:
              password.newPassword,
          },
        }
      );

      setPassword({
        currentPassword:
          "",
        newPassword:
          "",
        confirmPassword:
          "",
      });

      setShowPassword(
        false
      );

      setSuccess(
        "Your password was changed successfully."
      );
    } catch (err) {
      console.error(
        "Password change error:",
        err
      );

      setError(
        err.message ||
          "Failed to change password."
      );
    }
  }

  // =====================================================
  // PHOTO URL
  // =====================================================

  const profileImageUrl =
    profile?.profile_image
      ? profile.profile_image.startsWith(
          "http"
        )
        ? profile.profile_image
        : `${API_URL.replace(
            "/api",
            ""
          )}${profile.profile_image}`
      : null;

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <User
            size={40}
            className="mx-auto animate-pulse text-primary/50"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      {/* =================================================
          ROLE SIDEBAR
      ================================================= */}

      <Sidebar
        navItems={
          roleInfo.navigation
        }
        isOpen={
          drawer.isOpen
        }
        onClose={
          drawer.close
        }
        subtitle={
          roleInfo.subtitle
        }
      />

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:pl-64">
        <button
          type="button"
          onClick={
            drawer.open
          }
          className="rounded-lg p-2 hover:bg-slate-50 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-50"
          >
            <Bell size={20} />

            {unreadCount >
              0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {
                  unreadCount
                }
              </span>
            )}
          </Link>

          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-black text-primary">
            {profileImageUrl ? (
              <img
                src={
                  profileImageUrl
                }
                alt={`${profile.first_name} ${profile.last_name}`}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(
                profile
              )
            )}
          </div>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}

      <main
        className={`pb-24 lg:pb-8 lg:pl-64`}
      >
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="space-y-6">
            {/* =================================================
                PROFILE HEADER
            ================================================= */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  {/* AVATAR */}

                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary-light text-2xl font-extrabold text-primary ring-4 ring-white shadow-md">
                      {profileImageUrl ? (
                        <img
                          src={
                            profileImageUrl
                          }
                          alt={`${profile.first_name} ${profile.last_name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(
                          profile
                        )
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={
                        handlePhotoClick
                      }
                      disabled={
                        uploading
                      }
                      className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-sm hover:bg-primary-hover disabled:opacity-60"
                      title="Upload profile photo"
                    >
                      <Upload
                        size={14}
                      />
                    </button>

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={
                        handlePhotoChange
                      }
                      className="hidden"
                    />
                  </div>

                  {/* IDENTITY */}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-[10px] font-bold uppercase text-primary">
                        <RoleIcon
                          size={
                            12
                          }
                        />

                        {
                          roleInfo.label
                        }
                      </span>
                    </div>

                    <h1 className="mt-2 text-xl font-extrabold text-ink">
                      {
                        profile.first_name
                      }{" "}
                      {
                        profile.last_name
                      }
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      {
                        roleInfo.subtitle
                      }
                    </p>

                    {profile.email && (
                      <p className="mt-1 text-xs text-slate-400">
                        {
                          profile.email
                        }
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={
                          handlePhotoClick
                        }
                        disabled={
                          uploading
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-60"
                      >
                        <Upload
                          size={13}
                        />

                        {uploading
                          ? "Uploading..."
                          : profileImageUrl
                            ? "Change Photo"
                            : "Upload Photo"}
                      </button>

                      {profileImageUrl && (
                        <button
                          type="button"
                          onClick={
                            removePhoto
                          }
                          disabled={
                            removingPhoto
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                        >
                          <Trash2
                            size={
                              13
                            }
                          />

                          {removingPhoto
                            ? "Removing..."
                            : "Remove Photo"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* EDIT */}

                {!editing && (
                  <button
                    type="button"
                    onClick={() =>
                      setEditing(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-hover"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </button>
                )}

                {editing && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={
                        saveProfile
                      }
                      disabled={
                        saving
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                    >
                      <Save
                        size={
                          14
                        }
                      />

                      {saving
                        ? "Saving..."
                        : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEdit
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* =================================================
                MESSAGES
            ================================================= */}

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700">
                {success}
              </div>
            )}

            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <User
                  size={17}
                  className="text-primary"
                />

                <h2 className="text-base font-bold text-ink">
                  Personal Information
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "First Name",
                    "firstName",
                    form.firstName,
                  ],
                  [
                    "Last Name",
                    "lastName",
                    form.lastName,
                  ],
                  [
                    "Email",
                    "email",
                    form.email,
                  ],
                  [
                    "Phone",
                    "phone",
                    form.phone,
                  ],
                  [
                    "Region",
                    "region",
                    form.region,
                  ],
                ].map(
                  ([
                    label,
                    field,
                    value,
                  ]) => (
                    <div key={field}>
                      <label className="mb-2 block text-xs font-bold text-slate-500">
                        {label}
                      </label>

                      <input
                        type={
                          field ===
                          "email"
                            ? "email"
                            : "text"
                        }
                        value={
                          value
                        }
                        disabled={
                          !editing
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            field,
                            event
                              .target
                              .value
                          )
                        }
                        className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  )
                )}
              </div>
            </section>

            {/* =================================================
                ROLE CARD
            ================================================= */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <RoleIcon
                  size={17}
                  className="text-primary"
                />

                <h2 className="text-base font-bold text-ink">
                  OSTA{" "}
                  {
                    roleInfo.label
                  }{" "}
                  Account
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Account Role
                  </p>

                  <p className="mt-1 text-sm font-bold text-ink">
                    {roleInfo.label}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Account Status
                  </p>

                  <p className="mt-1 text-sm font-bold text-primary">
                    Active
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                SECURITY
            ================================================= */}

            <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
                    <Lock size={18} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-ink">
                      Account Security
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Keep your OSTA account secure.
                    </p>
                  </div>
                </div>

                {!showPassword && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        true
                      )
                    }
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {showPassword && (
                <div className="mt-5 max-w-xl space-y-4">
                  <input
                    type="password"
                    placeholder="Current password"
                    value={
                      password.currentPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        (
                          previous
                        ) => ({
                          ...previous,
                          currentPassword:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <input
                    type="password"
                    placeholder="New password"
                    value={
                      password.newPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        (
                          previous
                        ) => ({
                          ...previous,
                          newPassword:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={
                      password.confirmPassword
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        (
                          previous
                        ) => ({
                          ...previous,
                          confirmPassword:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={
                        changePassword
                      }
                      className="rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white"
                    >
                      Change Password
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          false
                        )
                      }
                      className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                LOGOUT
            ================================================= */}

            <section className="rounded-2xl border border-red-100 bg-red-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-red-700">
                    Sign out of OSTA
                  </h2>

                  <p className="mt-1 text-xs text-red-600/80">
                    End your current session on this device.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    logout
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  <LogOut
                    size={14}
                  />
                  Log Out
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* STUDENT BOTTOM NAV */}

      {roleInfo.student && (
        <BottomNav />
      )}
    </div>
  );
}