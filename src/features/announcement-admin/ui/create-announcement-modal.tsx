import { Modal, Stack, TextInput, Select, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import { useCreateAnnouncement, getTypeOptions, getStatusOptions } from "../model";
import type { AnnouncementFormValues } from "../model";
import { TranslationFields } from "./translation-fields";

interface CreateAnnouncementModalProps {
  opened: boolean;
  onClose: () => void;
}

export function CreateAnnouncementModal({ opened, onClose }: CreateAnnouncementModalProps) {
  const { t } = useLingui();

  const form = useForm<AnnouncementFormValues>({
    initialValues: {
      type: "INFO",
      status: "DRAFT",
      translations: [{ locale: "en-US", title: "", message: "" }],
    },
    validate: {
      type: (v) => (v.trim().length < 1 ? t`Type is required` : null),
      translations: {
        title: (v) => (v.trim().length < 1 ? t`Title is required` : null),
        message: (v) => (v.trim().length < 1 ? t`Message is required` : null),
        locale: (v) => (v.trim().length < 1 ? t`Locale is required` : null),
      },
    },
  });

  const mutation = useCreateAnnouncement({ onSuccess: handleClose });

  const hasEnUs = form.values.translations.some((tr) => tr.locale === "en-US");

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  function handleClose() {
    form.reset();
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          <Trans>Create Announcement</Trans>
        </Text>
      }
      size="lg"
      centered
      scrollAreaComponent={undefined}
    >
      <form onSubmit={handleSubmit} data-testid="modal--create-announcement">
        <Stack gap="md">
          {mutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Failed to create announcement</Trans>}
            >
              <Trans>Please check the form and try again.</Trans>
            </Alert>
          )}

          <Group grow>
            <Select
              label={t`Type`}
              data={getTypeOptions()}
              data-testid="input--type"
              {...form.getInputProps("type")}
            />
            <Select
              label={t`Initial status`}
              data={getStatusOptions()}
              data-testid="input--status"
              {...form.getInputProps("status")}
            />
          </Group>

          <TranslationFields form={form} />

          {!hasEnUs && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
              <Trans>An English (en-US) translation is required.</Trans>
            </Alert>
          )}

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
              data-testid="button--cancel"
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              disabled={!hasEnUs}
              data-testid="button--create-announcement"
            >
              <Trans>Create announcement</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
