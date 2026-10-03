interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  imageSrc?: string | null;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const bgColors = [
  "bg-blue-600 dark:bg-blue-500",
  "bg-indigo-600 dark:bg-indigo-500",
  "bg-emerald-600 dark:bg-emerald-500",
  "bg-violet-600 dark:bg-violet-500",
  "bg-amber-600 dark:bg-amber-500",
  "bg-rose-600 dark:bg-rose-500",
  "bg-teal-600 dark:bg-teal-500",
  "bg-cyan-600 dark:bg-cyan-500",
];

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getDeterministicColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % bgColors.length;
  return bgColors[index];
}

export default function Avatar({
  name,
  size = "md",
  className = "",
  imageSrc,
}: AvatarProps) {
  const initials = getInitials(name);
  const colorClass = getDeterministicColor(name || "User");

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={name}
        className={`inline-block rounded-full object-cover ring-2 ring-white dark:ring-slate-900 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${colorClass} ${sizeClasses[size]} ${className}`}
      aria-label={name}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
