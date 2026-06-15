import {
  Stack,
  Group,
  Button,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Text,
  Box,
  Divider,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { SUPPORTED_LOCALES } from "../model";
import type { AnnouncementFormValues } from "../model";

interface TranslationFieldsProps {
  form: UseFormReturnType<AnnouncementFormValues>;
}

export function TranslationFields({ form }: TranslationFieldsProps) {
  const { t } = useLingui();

  const usedLocales = form.values.translations.map((tr) => tr.locale);

  const availableLocales = SUPPORTED_LOCALES.filter((loc) => !usedLocales.includes(loc.value));

  const handleAddTranslation = () => {
    const nextLocale = availableLocales[0]?.value ?? "";
    form.insertListItem("translations", { locale: nextLocale, title: "", message: "" });
  };

  const handleRemoveTranslation = (index: number) => {
    form.removeListItem("translations", index);
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600}>
          <Trans>Translations</Trans>
        </Text>
        <Button
          data-testid="button-translation-add-locale"
          size="xs"
          variant="light"
          leftSection={<IconPlus size={13} />}
          onClick={handleAddTranslation}
          disabled={availableLocales.length === 0}
        >
          <Trans>Add locale</Trans>
        </Button>
      </Group>

      {form.values.translations.map((_, index) => {
        const isEnUs = form.values.translations[index].locale === "en-US";
        const otherUsedLocales = form.values.translations
          .filter((_, i) => i !== index)
          .map((tr) => tr.locale);
        const localeOptions = SUPPORTED_LOCALES.filter(
          (loc) => !otherUsedLocales.includes(loc.value),
        );

        return (
          <Box
            key={index}
            p="sm"
            style={{
              border: "1px solid var(--mantine-color-gray-2)",
              borderRadius: "var(--mantine-radius-sm)",
              background: isEnUs ? "var(--mantine-color-blue-0)" : undefined,
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Select
                  size="xs"
                  style={{ width: 220 }}
                  data={localeOptions}
                  {...form.getInputProps(`translations.${index}.locale`)}
                  disabled={isEnUs}
                  description={isEnUs ? t`Required` : undefined}
                />
                {!isEnUs && (
                  <ActionIcon
                    data-testid={`button-translation-remove--${index}`}
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={() => handleRemoveTranslation(index)}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                )}
              </Group>

              <TextInput
                data-testid={`input-translation-title--${index}`}
                label={t`Title`}
                placeholder={t`Announcement title`}
                size="sm"
                {...form.getInputProps(`translations.${index}.title`)}
              />

              <Textarea
                data-testid={`input-translation-message--${index}`}
                label={t`Message`}
                placeholder={t`Announcement message body`}
                size="sm"
                minRows={3}
                autosize
                {...form.getInputProps(`translations.${index}.message`)}
              />
            </Stack>
          </Box>
        );
      })}

      {form.values.translations.length === 0 && (
        <Text size="xs" c="dimmed">
          <Trans>No translations added. At least en-US is required.</Trans>
        </Text>
      )}

      <Divider />
    </Stack>
  );
}
