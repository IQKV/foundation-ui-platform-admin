import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Group,
  Button,
  Alert,
  Text,
  Loader,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useEffect } from "react";
import { z } from "zod";
import { useNote, useUpdateNote, SEVERITY_OPTIONS, STATUS_OPTIONS } from "../model";
import type { NoteEditFormValues } from "../types";
import type { PlatformNoteSeverity, PlatformNoteStatus, UpdatePlatformNoteRequest } from "../types";

// ─── Validation schema ────────────────────────────────────────────────────────

const editSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Max 200 characters"),
  body: z.string().min(1, "Body is required").max(5000, "Max 5000 characters"),
  severity: z.enum(["INFO", "WARNING", "CRITICAL"]),
  status: z.enum(["OPEN", "RESOLVED", "ARCHIVED"]),
});

function validate(values: NoteEditFormValues): Record<string, string> {
  const result = editSchema.safeParse(values);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    errors[issue.path.join(".")] = issue.message;
  });
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  noteId: string | null;
  opened: boolean;
  onClose: () => void;
}

export function EditNoteModal({ noteId, opened, onClose }: Props) {
  const { data: note, isLoading } = useNote(noteId ?? "");

  const form = useForm<NoteEditFormValues>({
    initialValues: { title: "", body: "", severity: "INFO", status: "OPEN" },
    validate,
  });

  // Populate form whenever the loaded note changes
  useEffect(() => {
    if (note) {
      form.setValues({
        title: note.title,
        body: note.body,
        severity: note.severity,
        status: note.status,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  const mutation = useUpdateNote(noteId ?? "", {
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      title: values.title,
      body: values.body,
      severity: values.severity as PlatformNoteSeverity,
      status: values.status as PlatformNoteStatus,
    } satisfies UpdatePlatformNoteRequest);
  });

  function handleClose() {
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          Edit platform note
        </Text>
      }
      size="lg"
      centered
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="sm" />
        </Center>
      ) : (
        <form onSubmit={handleSubmit} data-testid="form--edit-note">
          <Stack gap="md">
            {mutation.isError && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                title="Save failed"
              >
                Please check the form and try again.
              </Alert>
            )}

            <TextInput label="Title" data-testid="input--title" {...form.getInputProps("title")} />

            <Textarea
              label="Body"
              minRows={4}
              autosize
              maxRows={12}
              data-testid="input--body"
              {...form.getInputProps("body")}
            />

            <Group grow>
              <Select
                label="Severity"
                data={SEVERITY_OPTIONS}
                data-testid="input--severity"
                {...form.getInputProps("severity")}
              />
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                data-testid="input--status"
                {...form.getInputProps("status")}
              />
            </Group>

            <Group justify="flex-end" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending} data-testid="button--save-note">
                Save changes
              </Button>
            </Group>
          </Stack>
        </form>
      )}
    </Modal>
  );
}
