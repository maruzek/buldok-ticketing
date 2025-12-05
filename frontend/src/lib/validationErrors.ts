import { UseFormReturn, FieldValues, Path } from "react-hook-form";
import { isValidationError } from "@/types/api/ValidationError";

type FieldErrorMap<T extends FieldValues> = Partial<Record<Path<T>, string[]>>;

const ERROR_SEPARATOR = "|||";

export function parseValidationErrors<T extends FieldValues>(
  error: unknown
): FieldErrorMap<T> | null {
  if (!isValidationError(error)) {
    return null;
  }

  const fieldErrors: FieldErrorMap<T> = {};

  for (const violation of error.body.violations) {
    const field = violation.propertyPath as Path<T>;
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field]!.push(violation.title);
  }

  return fieldErrors;
}

export function applyValidationErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown
): boolean {
  const fieldErrors = parseValidationErrors<T>(error);

  if (!fieldErrors) {
    return false;
  }

  const entries = Object.entries(fieldErrors) as [Path<T>, string[]][];

  for (const [field, messages] of entries) {
    if (messages && messages.length > 0) {
      form.setError(field, {
        type: "server",
        message: messages.join(ERROR_SEPARATOR),
      });
    }
  }

  return true;
}

export function splitErrorMessages(message: string | undefined): string[] {
  if (!message) return [];
  return message.split(ERROR_SEPARATOR);
}
