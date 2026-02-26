// ============================================
// PROFILE PAGE - User profile customization
// ============================================
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AVATAR_OPTIONS, AVATAR_LS_KEY, getAvatarGradient } from "@/lib/avatarOptions";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName]         = useState("");
  const [bio, setBio]           = useState("");
  const [avatarId, setAvatarId] = useState("blue");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ---- Sync form fields from session once it loads ----
  useEffect(() => {
    if (status === "authenticated" && session?.user && !hydrated) {
      const u = session.user as Record<string, unknown>;
      setName((u.name as string) ?? "");
      setBio((u.bio as string) ?? "");
      // Load avatar from session (persisted in JWT) or localStorage fallback
      const savedAvatar =
        (u.avatarId as string) ??
        (typeof window !== "undefined" ? localStorage.getItem(AVATAR_LS_KEY) : null) ??
        "blue";
      setAvatarId(savedAvatar);
      setHydrated(true);
    }
  }, [status, session, hydrated]);

  // ---- Safe redirect for unauthenticated users ----
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // ---- Persist avatar choice in localStorage immediately ----
  function handleAvatarChange(id: string) {
    setAvatarId(id);
    if (typeof window !== "undefined") localStorage.setItem(AVATAR_LS_KEY, id);
  }

  if (status === "loading" || !hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const user = session?.user as Record<string, string | undefined> | undefined;

  // Live initials from the current name input (not the old session value)
  const liveInitials = name.trim()
    ? name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : user?.initials ?? "U";

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === avatarId) ?? AVATAR_OPTIONS[0];
  const avatarGradient = getAvatarGradient(avatarId);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    // update() triggers the jwt callback with trigger=="update" — persists into JWT
    await update({ name: name.trim(), bio: bio.trim(), avatarId });
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400
                     hover:text-blue-600 dark:hover:text-blue-400 mb-6"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {t("profile.title")}
        </h1>

        {/* Avatar + name card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
                        dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-5">
            {/* Avatar - live preview reflects current form input */}
            <div
              className={`w-20 h-20 rounded-full bg-gradient-to-br ${avatarGradient}
                          flex items-center justify-center text-white text-3xl font-bold
                          flex-shrink-0 shadow-md transition-all duration-300`}
            >
              {liveInitials}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {name || user?.name || "User"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <span className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full
                               bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">
                {user?.plan ?? "Free"} plan
              </span>
            </div>
          </div>

          {/* Avatar colour picker */}
          <div className="mt-5">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("profile.avatar")} colour
            </p>
            <div className="flex gap-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAvatarChange(opt.id)}
                  aria-label={opt.label}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${opt.gradient}
                              transition-all ring-2 ring-offset-2 dark:ring-offset-gray-900
                              ${avatarId === opt.id
                                ? "ring-blue-500 scale-110"
                                : "ring-transparent hover:scale-105"}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200
                     dark:border-gray-800 p-6 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("profile.name")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("profile.email")}
            </label>
            <input
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700
                         bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400
                         cursor-not-allowed"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("profile.bio")}
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg font-medium text-white
                         bg-gradient-to-r from-blue-500 to-blue-600
                         hover:from-blue-600 hover:to-blue-700
                         disabled:opacity-60 transition-all
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {saving ? "Saving…" : t("profile.save")}
            </button>

            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ {t("profile.saved")}
              </span>
            )}
          </div>
        </form>

        {/* Sign-out */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400
                       border border-red-200 dark:border-red-900
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            {t("nav.logout")} →
          </button>
        </div>
      </div>
    </div>
  );
}
