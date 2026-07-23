import { Stack, TextInput, Textarea, Select, Group, Button, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { z } from "zod";
import { useCreateNote, SEVERITY_OPTIONS } from "../model";
import type { NoteFormValues } from "../types";
import type { CreatePlatformNoteRequest, PlatformNoteSeverity } from "../types";

// ─── Validation schema ────────────────────────────────────────────────────────

const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  body: z.string().min(1, "Body is required").max(5000, "Max 5000 characters"),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
});

function validateNote(values: NoteFormValues): Record<string, string> {
  const result = noteSchema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    errors[issue.path.join(".")] = issue.message;
  });
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateNoteForm({ onSuccess, onCancel }: Props) {
  const form = useForm<NoteFormValues>({
    initialValues: { title: "", body: "", severity: "INFO" },
    validate: validateNote,
  });

  const mutation = useCreateNote({
    onSuccess: () => {
      form.reset();
      mutation.reset();
      onSuccess?.();
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      title: values.title,
      body: values.body,
      severity: values.severity as PlatformNoteSeverity,
    } satisfies CreatePlatformNoteRequest);
  });

  return (
    <form onSubmit={handleSubmit} data-testid="form--create-note">
      <Stack gap="md">
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title="Failed to create note"
          >
            Please check the form and try again.
          </Alert>
        )}

        <TextInput
          label="Title"
          placeholder="e.g. DB replication lag on prod-eu"
          data-testid="input--title"
          {...form.getInputProps("title")}
        />

        <Textarea
          label="Body"
          placeholder="Describe the issue, impact, and any mitigation steps…"
          minRows={4}
          autosize
          maxRows={12}
          data-testid="input--body"
          {...form.getInputProps("body")}
        />

        <Select
          label="Severity"
          data={SEVERITY_OPTIONS}
          data-testid="input--severity"
          {...form.getInputProps("severity")}
        />

        <Group justify="flex-end" gap="sm">
          {onCancel && (
            <Button
              variant="subtle"
              color="gray"
              onClick={onCancel}
              disabled={mutation.isPending}
              data-testid="button--cancel"
            >
              Cancel
            </Button>
          )}
          <Button type="submit" loading={mutation.isPending} data-testid="button--create-note">
            Create note
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
