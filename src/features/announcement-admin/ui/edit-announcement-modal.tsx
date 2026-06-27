import { useEffect } from "react";
import { Modal, Stack, Select, Group, Button, Text, Alert, Box, Divider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertCircle, IconSend } from "@tabler/icons-react";
import type { Announcement } from "@/entities";

// For the translation map:
import type { AnnouncementTranslation } from "@/entities";
import {
  useUpdateAnnouncement,
  usePublishAnnouncement,
  getTypeOptions,
  getStatusOptions,
  buildAnnouncementSchema,
} from "../model";
import type { AnnouncementFormValues } from "../model";
import { TranslationFields } from "./translation-fields";
import { AnnouncementStatusBadge } from "@/shared/ui";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

interface EditAnnouncementModalProps {
  announcement: Announcement | null;
  opened: boolean;
  onClose: () => void;
}

const EDITABLE_STATUSES = ["DRAFT", "FAILED"];

export function EditAnnouncementModal({
  announcement,
  opened,
  onClose,
}: EditAnnouncementModalProps) {
  const { t } = useLingui();

  const isEditable = announcement != null && EDITABLE_STATUSES.includes(announcement.status);

  const form = useForm<AnnouncementFormValues>({
    initialValues: {
      type: "INFO",
      status: "DRAFT",
      translations: [{ locale: "en-US", title: "", message: "" }],
    },
    validate: (values) => validateWithZod(buildAnnouncementSchema(), values),
  });

  useEffect(() => {
    if (announcement) {
      form.setValues({
        type: announcement.type,
        status:
          announcement.status === "DRAFT" || announcement.status === "FAILED"
            ? announcement.status
            : "DRAFT",
        translations: announcement.translations.map((tr: AnnouncementTranslation) => ({
          locale: tr.locale,
          title: tr.title,
          message: tr.message,
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [announcement]);

  const updateMutation = useUpdateAnnouncement({
    announcementId: announcement?.id ?? "",
    onSuccess: handleClose,
  });

  const publishMutation = usePublishAnnouncement({ onSuccess: handleClose });

  const hasEnUs = form.values.translations.some((tr) => tr.locale === "en-US");

  const handleSubmit = form.onSubmit((values) => {
    updateMutation.mutate(values);
  });

  const handlePublish = () => {
    if (announcement) {
      publishMutation.mutate(announcement.id);
    }
  };

  function handleClose() {
    form.reset();
    updateMutation.reset();
    publishMutation.reset();
    onClose();
  }

  const isPending = updateMutation.isPending || publishMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Edit Announcement</Trans>
          </Text>
          {announcement && (
            <Group gap="xs">
              <Text size="xs" c="dimmed">
                <Trans>ID: {announcement.id}</Trans>
              </Text>
              <AnnouncementStatusBadge status={announcement.status} />
            </Group>
          )}
        </Stack>
      }
      size="lg"
      centered
    >
      {!isEditable && announcement && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="blue"
          variant="light"
          mb="md"
          title={<Trans>Read-only</Trans>}
        >
          <Trans>
            Announcements in <strong>{announcement.status}</strong> status cannot be edited.
          </Trans>
        </Alert>
      )}

      <form onSubmit={handleSubmit} data-testid="modal--edit-announcement">
        <Stack gap="md">
          {(updateMutation.isError || publishMutation.isError) && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Operation failed</Trans>}
            >
              <Trans>Please try again.</Trans>
            </Alert>
          )}

          <Group grow>
            <Select
              label={t`Type`}
              data={getTypeOptions()}
              disabled={!isEditable}
              data-testid="input--type"
              {...form.getInputProps("type")}
            />
            <Select
              label={t`Status`}
              data={getStatusOptions()}
              disabled={!isEditable}
              data-testid="input--status"
              {...form.getInputProps("status")}
            />
          </Group>

          <TranslationFields form={form} />

          {!hasEnUs && isEditable && (
            <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light">
              <Trans>An English (en-US) translation is required.</Trans>
            </Alert>
          )}

          <Divider />

          <Group justify="space-between" gap="sm">
            {/* Publish action — only for DRAFT */}
            <Box>
              {announcement?.status === "DRAFT" && (
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconSend size={15} />}
                  loading={publishMutation.isPending}
                  disabled={updateMutation.isPending}
                  onClick={handlePublish}
                  data-testid="button--publish"
                >
                  <Trans>Publish</Trans>
                </Button>
              )}
            </Box>

            <Group gap="sm">
              <Button
                variant="subtle"
                color="gray"
                onClick={handleClose}
                disabled={isPending}
                data-testid="button--cancel"
              >
                <Trans>Cancel</Trans>
              </Button>
              {isEditable && (
                <Button
                  type="submit"
                  loading={updateMutation.isPending}
                  disabled={publishMutation.isPending || !hasEnUs}
                  data-testid="button--save-changes"
                >
                  <Trans>Save changes</Trans>
                </Button>
              )}
            </Group>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
