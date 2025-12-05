import { cn } from "@/lib/utils";
import { PasswordStrength } from "@/hooks/usePasswordStrength";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

export const PasswordStrengthIndicator = ({
  strength,
}: PasswordStrengthIndicatorProps) => {
  const { score, label, color } = strength;

  if (!label) return null;

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              score >= level ? color : "bg-gray-200"
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span
          className={cn(
            "text-sm font-medium",
            score <= 1 && "text-red-600",
            score === 2 && "text-orange-600",
            score === 3 && "text-yellow-600",
            score === 4 && "text-lime-600",
            score === 5 && "text-green-600"
          )}
        >
          Síla hesla: <strong>{label}</strong>
        </span>
      </div>
    </div>
  );
};
