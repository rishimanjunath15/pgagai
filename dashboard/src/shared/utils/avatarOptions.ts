// Shared avatar colour options — used by profile page and header
export const AVATAR_OPTIONS = [
  { id: "blue",   gradient: "from-blue-500 to-purple-600",  label: "Blue" },
  { id: "green",  gradient: "from-green-400 to-teal-500",   label: "Green" },
  { id: "orange", gradient: "from-orange-400 to-red-500",   label: "Orange" },
  { id: "pink",   gradient: "from-pink-400 to-rose-500",    label: "Pink" },
  { id: "indigo", gradient: "from-indigo-500 to-blue-400",  label: "Indigo" },
];

export const AVATAR_LS_KEY = "dashboard_avatarId";

export function getAvatarGradient(avatarId?: string): string {
  const found = AVATAR_OPTIONS.find((a) => a.id === avatarId);
  return (found ?? AVATAR_OPTIONS[0]).gradient;
}
