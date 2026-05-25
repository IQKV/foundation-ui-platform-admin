import { useEffect } from "react";
import {
  Modal,
  Stack,
  TextInput,
  Select,
  Group,
  Button,
  Text,
  Divider,
  Box,
  Badge,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { Trans, useLingui } from "@lingui/react/macro";
import type { AdminAccount } from "@/shared/api";
import { localesApi } from "@/shared/api";
import { useEditAccount } from "../model";
import type { EditAccountFormValues } from "../model";

interface EditAccountModalProps {
  account: AdminAccount | null;
  opened: boolean;
  onClose: () => void;
}

export function EditAccountModal({ account, opened, onClose }: EditAccountModalProps) {
  const { t } = useLingui();

  // Fetch available locales from the backend — public endpoint, no auth needed
  const { data: locales, isLoading: localesLoading } = useQuery({
    queryKey: ["locales"],
    queryFn: () => localesApi.list(),
    staleTime: Infinity,
  });

  const localeOptions =
    locales?.map((l) => ({
      value: l.code,
      label: l.nativeName ? `${l.name} — ${l.nativeName}` : l.name,
    })) ?? [];

  const form = useForm<EditAccountFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      locale: null,
    },
    validate: {
      firstName: (v) => (v.trim().length < 1 ? t`First name is required` : null),
      lastName: (v) => (v.trim().length < 1 ? t`Last name is required` : null),
    },
  });

  useEffect(() => {
    if (account) {
      form.setValues({
        firstName: account.firstName,
        lastName: account.lastName,
        locale: account.locale ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const mutation = useEditAccount({ onSuccess: handleClose });

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
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Edit Profile</Trans>
          </Text>
          {account && (
            <Text size="xs" c="dimmed">
              {account.email}
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {account && (
            <Box
              p="sm"
              style={{
                background: "var(--mantine-color-gray-0)",
                borderRadius: "var(--mantine-radius-sm)",
                border: "1px solid var(--mantine-color-gray-2)",
              }}
            >
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  <Trans>Email verified:</Trans>
                </Text>
                <Badge color={account.emailVerified ? "green" : "orange"} variant="light" size="xs">
                  {account.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
                </Badge>
              </Group>
            </Box>
          )}

          <Group grow>
            <TextInput
              label={t`First name`}
              placeholder={t`First name`}
              {...form.getInputProps("firstName")}
            />
            <TextInput
              label={t`Last name`}
              placeholder={t`Last name`}
              {...form.getInputProps("lastName")}
            />
          </Group>

          <TextInput
            label={t`Email`}
            value={account?.email ?? ""}
            readOnly
            styles={{
              input: {
                cursor: "default",
                color: "var(--mantine-color-gray-6)",
                background: "var(--mantine-color-gray-0)",
              },
            }}
            rightSection={
              <Text size="xs" c="dimmed" pr={4}>
                <Trans>read-only</Trans>
              </Text>
            }
            rightSectionWidth={72}
          />

          <Select
            label={t`Language`}
            description={t`Sets your preferred language for notifications and emails.`}
            placeholder={localesLoading ? t`Loading…` : t`Select language`}
            data={localeOptions}
            rightSection={localesLoading ? <Loader size="xs" /> : undefined}
            disabled={localesLoading}
            clearable
            searchable
            {...form.getInputProps("locale")}
          />

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <Trans>Save changes</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
