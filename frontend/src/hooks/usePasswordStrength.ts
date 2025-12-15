export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
  isValid: boolean;
};

export const usePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return {
      score: 0,
      label: "",
      color: "bg-gray-200",
      isValid: false,
    };
  }

  // let score = 0;

  // if (password.length >= 8) score += 1;
  // if (password.length >= 12) score += 1;

  // const hasLower = /[a-z]/.test(password);
  // const hasUpper = /[A-Z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  // if (hasLower) score += 1;
  // if (hasUpper) score += 1;
  // if (hasNumber) score += 1;
  // if (hasSpecial) score += 1;

  // const commonPatterns = [
  //   /^123/,
  //   /password/i,
  //   /qwerty/i,
  //   /(.)\1{2,}/,
  //   /^[a-z]+$/i,
  //   /^[0-9]+$/,
  // ];

  // for (const pattern of commonPatterns) {
  //   if (pattern.test(password)) {
  //     score = Math.max(0, score - 2);
  //     break;
  //   }
  // }

  // score = Math.min(5, Math.max(0, score));

  const length = password.length;
  const uniqueChars = new Set(password).size;

  const entropy = length * Math.log2(Math.max(uniqueChars, 1));

  let score = 0;

  if (entropy >= 25) score = 1;
  if (entropy >= 35) score = 2;
  if (entropy >= 50) score = 3;
  if (entropy >= 65) score = 4;
  if (entropy >= 80) score = 5;

  const getLabel = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return "velmi slabé";
      case 2:
        return "slabé";
      case 3:
        return "dobré";
      case 4:
        return "silné";
      case 5:
        return "velmi silné";
      default:
        return "";
    }
  };

  const getColor = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-lime-500";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  return {
    score,
    label: getLabel(score),
    color: getColor(score),
    isValid: score >= 2,
  };
};
