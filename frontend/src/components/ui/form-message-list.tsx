import { useFormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { splitErrorMessages } from "@/lib/validationErrors";

interface FormMessageListProps {
  className?: string;
}

export function FormMessageList({ className }: FormMessageListProps) {
  const { error } = useFormField();
  const messages = splitErrorMessages(error?.message as string | undefined);

  if (messages.length === 0) {
    return null;
  }

  if (messages.length === 1) {
    return (
      <p
        data-slot="form-message"
        className={cn("text-destructive text-sm", className)}
      >
        {messages[0]}
      </p>
    );
  }

  return (
    <ul
      data-slot="form-message"
      className={cn(
        "text-destructive text-sm list-disc list-inside space-y-1",
        className
      )}
    >
      {messages.map((message, index) => (
        <li key={index}>{message}</li>
      ))}
    </ul>
  );
}
