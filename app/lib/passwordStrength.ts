export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  color: string;
  percentage: number;
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Very Weak", color: "bg-slate-300 dark:bg-slate-700", percentage: 0 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 0.5;
  if (/[^A-Za-z0-9]/.test(password)) score += 0.5;

  const normalized = Math.min(4, Math.floor(score));

  switch (normalized) {
    case 0:
      return { score: 0, label: "Very Weak", color: "bg-red-500", percentage: 20 };
    case 1:
      return { score: 1, label: "Weak", color: "bg-orange-500", percentage: 40 };
    case 2:
      return { score: 2, label: "Fair", color: "bg-amber-500", percentage: 60 };
    case 3:
      return { score: 3, label: "Good", color: "bg-blue-500", percentage: 80 };
    case 4:
      return { score: 4, label: "Strong", color: "bg-emerald-500", percentage: 100 };
    default:
      return { score: 0, label: "Very Weak", color: "bg-red-500", percentage: 20 };
  }
}
