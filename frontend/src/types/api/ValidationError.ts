export type ValidationViolation = {
  propertyPath: string;
  title: string;
  template: string;
  parameters: Record<string, string>;
  type: string;
};

export type SymfonyValidationError = {
  type: string;
  title: string;
  status: number;
  detail: string;
  violations: ValidationViolation[];
};

export function isValidationError(
  error: unknown
): error is { body: SymfonyValidationError } {
  return (
    typeof error === "object" &&
    error !== null &&
    "body" in error &&
    typeof (error as any).body === "object" &&
    (error as any).body !== null &&
    "violations" in (error as any).body &&
    Array.isArray((error as any).body.violations)
  );
}
