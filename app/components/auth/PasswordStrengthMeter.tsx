"use client";

import { evaluatePasswordStrength } from "../../lib/passwordStrength";

interface PasswordStrengthMeterProps {
  password?: string;
}

export default function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const strength = evaluatePasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Strength:</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {strength.label}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${strength.percentage}%` }}
        />
      </div>
    </div>
  );
}
