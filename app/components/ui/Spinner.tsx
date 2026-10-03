export default function Spinner({
  message,
  className = "",
  size = "md",
}: {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-label="Loading"
    >
      <div
        className={`animate-spin rounded-full border-blue-600 border-t-transparent ${sizeClasses[size]}`}
      />
      {message && (
        <p className="max-w-xs text-center text-sm text-gray-500 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
