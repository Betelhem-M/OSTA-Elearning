import {
  Atom,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Compass,
  FlaskConical,
  Lightbulb,
  Palette,
  Rocket,
  Sparkles,
} from 'lucide-react';

const AVATAR_OPTIONS = [
  { id: 'atom', label: 'Atom', icon: Atom, background: 'bg-indigo-600', foreground: 'text-white' },
  { id: 'book', label: 'Book', icon: BookOpen, background: 'bg-emerald-600', foreground: 'text-white' },
  { id: 'brain', label: 'Brain', icon: Brain, background: 'bg-rose-500', foreground: 'text-white' },
  { id: 'briefcase', label: 'Briefcase', icon: BriefcaseBusiness, background: 'bg-amber-400', foreground: 'text-slate-950' },
  { id: 'compass', label: 'Compass', icon: Compass, background: 'bg-cyan-600', foreground: 'text-white' },
  { id: 'flask', label: 'Flask', icon: FlaskConical, background: 'bg-violet-600', foreground: 'text-white' },
  { id: 'idea', label: 'Idea', icon: Lightbulb, background: 'bg-yellow-300', foreground: 'text-slate-950' },
  { id: 'palette', label: 'Palette', icon: Palette, background: 'bg-orange-500', foreground: 'text-white' },
  { id: 'rocket', label: 'Rocket', icon: Rocket, background: 'bg-slate-900', foreground: 'text-white' },
  { id: 'sparkles', label: 'Sparkles', icon: Sparkles, background: 'bg-teal-500', foreground: 'text-white' },
];

export const DEFAULT_AVATAR_ID = AVATAR_OPTIONS[0].id;

export function getStoredAvatarId(userId) {
  if (!userId || typeof window === 'undefined') return DEFAULT_AVATAR_ID;

  const stored = window.localStorage.getItem(`osta-avatar-${userId}`);
  return AVATAR_OPTIONS.some((avatar) => avatar.id === stored)
    ? stored
    : DEFAULT_AVATAR_ID;
}

export function storeAvatarId(userId, avatarId) {
  if (!userId || typeof window === 'undefined') return;
  if (AVATAR_OPTIONS.some((avatar) => avatar.id === avatarId)) {
    window.localStorage.setItem(`osta-avatar-${userId}`, avatarId);
  }
}

export function UserAvatar({ user, avatarId, imageUrl, className = '', iconSize = 20 }) {
  const selectedId = avatarId || getStoredAvatarId(user?.id);
  const avatar = AVATAR_OPTIONS.find((option) => option.id === selectedId) || AVATAR_OPTIONS[0];
  const Icon = avatar.icon;
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${avatar.background} ${avatar.foreground} ${className}`}
      aria-label={`${user?.first_name || 'User'} profile avatar`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <Icon size={iconSize} strokeWidth={2.2} aria-hidden="true" />
          <span className="sr-only">{initials}</span>
        </>
      )}
    </span>
  );
}

export function AvatarPicker({ user, selectedId, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10" aria-label="Choose a profile avatar">
      {AVATAR_OPTIONS.map((avatar) => {
        const Icon = avatar.icon;
        const selected = avatar.id === selectedId;

        return (
          <button
            key={avatar.id}
            type="button"
            onClick={() => onChange(avatar.id)}
            aria-label={`Choose ${avatar.label} avatar`}
            title={`${avatar.label} avatar`}
            aria-pressed={selected}
            className={`flex aspect-square items-center justify-center rounded-full ${avatar.background} ${avatar.foreground} transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
          >
            <Icon size={22} strokeWidth={2.2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
