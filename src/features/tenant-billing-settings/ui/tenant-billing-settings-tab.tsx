import { useEffect } from "react";
import {
  Stack,
  Paper,
  Group,
  Text,
  Skeleton,
  Alert,
  Button,
  TextInput,
  Textarea,
  Modal,
  SimpleGrid,
  Code,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconExternalLink,
  IconPlus,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { createElement } from "react";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";
import { GatewayTypeBadge } from "@/shared/ui";
import type {
  AdminBillingSettings,
  AdminCreateBillingSettingsRequest,
  AdminReplaceBillingSettingsRequest,
} from "@/shared/api";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function emptyToNull(s: string): string | null {
  const t = s.trim();
  return t.length === 0 ? null : t;
}

function parseProfileOwnerId(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  if (!UUID_RE.test(t)) return null;
  return t;
}

interface BillingFields {
  externalCustomerId: string;
  billingEmail: string;
  companyName: string;
  billingAddress: string;
  taxId: string;
  taxIdType: string;
  currency: string;
  profileOwnerId: string;
}

function settingsToForm(s: AdminBillingSettings): BillingFields {
  return {
    externalCustomerId: s.externalCustomerId,
    billingEmail: s.billingEmail,
    companyName: s.companyName ?? "",
    billingAddress: s.billingAddress ?? "",
    taxId: s.taxId ?? "",
    taxIdType: s.taxIdType ?? "",
    currency: s.currency,
    profileOwnerId: s.profileOwnerId ?? "",
  };
}

function isValidBillingAddressJson(raw: string): boolean {
  const tval = raw.trim();
  if (!tval) return true;
  try {
    JSON.parse(tval);
    return true;
  } catch {
    return false;
  }
}

export interface TenantBillingSettingsTabProps {
  tenantKey: string;
}

export function TenantBillingSettingsTab({ tenantKey }: TenantBillingSettingsTabProps) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const {
    data: settings,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "billing-settings", tenantKey],
    queryFn: async () => {
      try {
        return await billingApi.getAdminTenantBillingSettings(tenantKey);
      } catch (e) {
        if (isAxiosError(e) && e.response?.status === 404) {
          return null as AdminBillingSettings | null;
        }
        throw e;
      }
    },
  });

  const editForm = useForm<BillingFields>({
    initialValues: {
      externalCustomerId: "",
      billingEmail: "",
      companyName: "",
      billingAddress: "",
      taxId: "",
      taxIdType: "",
      currency: "USD",
      profileOwnerId: "",
    },
    validate: {
      externalCustomerId: (v) => (v.trim().length < 1 ? t`External customer id is required` : null),
      billingEmail: (v) => (v.trim().length < 1 ? t`Billing email is required` : null),
      currency: (v) => (v.trim().length !== 3 ? t`Currency must be a 3-letter ISO code` : null),
      billingAddress: (v) =>
        isValidBillingAddressJson(v) ? null : t`Billing address must be valid JSON or empty`,
      profileOwnerId: (v) => {
        const tval = v.trim();
        if (!tval) return null;
        return UUID_RE.test(tval) ? null : t`Profile owner id must be a valid UUID or empty`;
      },
    },
  });

  const createForm = useForm<BillingFields>({
    initialValues: {
      externalCustomerId: "",
      billingEmail: "",
      companyName: "",
      billingAddress: "",
      taxId: "",
      taxIdType: "",
      currency: "USD",
      profileOwnerId: "",
    },
    validate: {
      externalCustomerId: (v) => (v.trim().length < 1 ? t`External customer id is required` : null),
      billingEmail: (v) => (v.trim().length < 1 ? t`Billing email is required` : null),
      currency: (v) => (v.trim().length !== 3 ? t`Currency must be a 3-letter ISO code` : null),
      billingAddress: (v) =>
        isValidBillingAddressJson(v) ? null : t`Billing address must be valid JSON or empty`,
      profileOwnerId: (v) => {
        const tval = v.trim();
        if (!tval) return null;
        return UUID_RE.test(tval) ? null : t`Profile owner id must be a valid UUID or empty`;
      },
    },
  });

  useEffect(() => {
    if (settings) {
      editForm.setValues(settingsToForm(settings));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "billing-settings", tenantKey] });
  };

  const createMutation = useMutation({
    mutationFn: (body: AdminCreateBillingSettingsRequest) =>
      billingApi.createAdminTenantBillingSettings(tenantKey, body),
    onSuccess: () => {
      notifications.show({
        title: "Billing settings created",
        message: "The tenant now has billing settings.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      invalidate();
      createForm.reset();
      closeCreate();
    },
    onError: (err: unknown) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        notifications.show({
          title: "Already exists",
          message: "Billing settings already exist for this tenant.",
          color: "red",
          icon: createElement(IconX, { size: 16 }),
        });
        return;
      }
      notifications.show({
        title: "Create failed",
        message: "Could not create billing settings.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: (body: AdminReplaceBillingSettingsRequest) =>
      billingApi.replaceAdminTenantBillingSettings(tenantKey, body),
    onSuccess: () => {
      notifications.show({
        title: "Billing settings saved",
        message: "Changes have been saved.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      invalidate();
    },
    onError: () => {
      notifications.show({
        title: "Save failed",
        message: "Could not save billing settings.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => billingApi.deleteAdminTenantBillingSettings(tenantKey),
    onSuccess: () => {
      notifications.show({
        title: "Billing settings deleted",
        message: "The billing profile row has been removed.",
        color: "teal",
        icon: createElement(IconCheck, { size: 16 }),
      });
      invalidate();
      closeDelete();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete billing settings.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => billingApi.createPortalSession(tenantKey),
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: () => {
      notifications.show({
        title: t`Portal error`,
        message: t`Could not open the billing portal. Please try again.`,
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const toCreateBody = (v: BillingFields): AdminCreateBillingSettingsRequest => ({
    externalCustomerId: v.externalCustomerId.trim(),
    billingEmail: v.billingEmail.trim(),
    companyName: emptyToNull(v.companyName),
    billingAddress: emptyToNull(v.billingAddress),
    taxId: emptyToNull(v.taxId),
    taxIdType: emptyToNull(v.taxIdType),
    currency: v.currency.trim().toUpperCase(),
    profileOwnerId: parseProfileOwnerId(v.profileOwnerId),
  });

  const toReplaceBody = (v: BillingFields): AdminReplaceBillingSettingsRequest => ({
    externalCustomerId: v.externalCustomerId.trim(),
    billingEmail: v.billingEmail.trim(),
    companyName: emptyToNull(v.companyName),
    billingAddress: emptyToNull(v.billingAddress),
    taxId: emptyToNull(v.taxId),
    taxIdType: emptyToNull(v.taxIdType),
    currency: v.currency.trim().toUpperCase(),
    profileOwnerId: parseProfileOwnerId(v.profileOwnerId),
  });

  const handleCreate = createForm.onSubmit((values) => {
    createMutation.mutate(toCreateBody(values));
  });

  const handleSave = editForm.onSubmit((values) => {
    replaceMutation.mutate(toReplaceBody(values));
  });

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={<Trans>Failed to load billing settings</Trans>}
        color="red"
        variant="light"
        mt="md"
      >
        <Trans>Could not fetch billing settings.</Trans>{" "}
        {isAxiosError(error) && error.response?.status ? (
          <Text size="xs" component="span" c="dimmed">
            ({error.response.status})
          </Text>
        ) : null}{" "}
        <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
          <Trans>Retry</Trans>
        </Button>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Stack gap="md" pt="md">
        <Skeleton height={120} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (settings === null || settings === undefined) {
    return (
      <Stack gap="md" pt="md">
        <Paper withBorder radius="md" p="lg">
          <Stack gap="sm">
            <Text fw={600} size="sm">
              <Trans>No billing settings</Trans>
            </Text>
            <Text size="sm" c="dimmed">
              <Trans>
                This organization does not have a billing settings row yet. Create one to attach
                gateway customer data and invoicing details.
              </Trans>
            </Text>
            <Text size="xs" c="dimmed">
              <Trans>Tenant key:</Trans> <Code>{tenantKey}</Code>
            </Text>
            <div>
              <Button
                data-testid="button-billing-create"
                leftSection={<IconPlus size={16} />}
                onClick={openCreate}
              >
                <Trans>Create billing settings</Trans>
              </Button>
            </div>
          </Stack>
        </Paper>

        <Modal
          opened={createOpened}
          onClose={() => {
            if (!createMutation.isPending) {
              createForm.reset();
              closeCreate();
            }
          }}
          title={<Trans>New billing settings</Trans>}
          size="lg"
          centered
        >
          <form onSubmit={handleCreate}>
            <Stack gap="md">
              <TextInput
                label={t`External customer id`}
                description={t`Payment gateway customer identifier (e.g. Stripe cus_…).`}
                {...createForm.getInputProps("externalCustomerId")}
              />
              <TextInput
                label={t`Billing email`}
                type="email"
                {...createForm.getInputProps("billingEmail")}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label={t`Company name`} {...createForm.getInputProps("companyName")} />
                <TextInput
                  label={t`Currency`}
                  maxLength={3}
                  {...createForm.getInputProps("currency")}
                />
              </SimpleGrid>
              <Textarea
                label={t`Billing address (JSON)`}
                description={t`Optional structured address as JSON.`}
                minRows={3}
                autosize
                {...createForm.getInputProps("billingAddress")}
              />
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput label={t`Tax id`} {...createForm.getInputProps("taxId")} />
                <TextInput label={t`Tax id type`} {...createForm.getInputProps("taxIdType")} />
              </SimpleGrid>
              <TextInput
                label={t`Profile owner user id`}
                description={t`Optional UUID of the user who owns the billing profile.`}
                {...createForm.getInputProps("profileOwnerId")}
              />
              <Group justify="flex-end" gap="sm">
                <Button
                  data-testid="button-billing-create-cancel"
                  variant="subtle"
                  color="gray"
                  onClick={() => {
                    createForm.reset();
                    closeCreate();
                  }}
                  disabled={createMutation.isPending}
                >
                  <Trans>Cancel</Trans>
                </Button>
                <Button
                  data-testid="button-billing-create-submit"
                  type="submit"
                  loading={createMutation.isPending}
                >
                  <Trans>Create</Trans>
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>
      </Stack>
    );
  }

  return (
    <Stack gap="md" pt="md">
      <Paper withBorder radius="md" p="lg">
        <Group justify="space-between" mb="md" wrap="wrap">
          <div>
            <Group gap="xs" align="center">
              <Text fw={600} size="sm">
                <Trans>Billing settings</Trans>
              </Text>
              {settings.gatewayType && <GatewayTypeBadge gatewayType={settings.gatewayType} />}
            </Group>
            <Text size="xs" c="dimmed" mt={4}>
              <Trans>Last updated</Trans> {dayjs(settings.updatedAt).format("MMM D, YYYY HH:mm")}
            </Text>
          </div>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => void refetch()}
            loading={isFetching && !isLoading}
          >
            <Trans>Refresh</Trans>
          </Button>
        </Group>

        <form onSubmit={handleSave}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label={t`Internal id`} value={settings.id} readOnly disabled />
              <TextInput label={t`Tenant key`} value={settings.tenantKey} readOnly disabled />
            </SimpleGrid>
            <TextInput
              label={t`External customer id`}
              description={t`Payment gateway customer identifier.`}
              {...editForm.getInputProps("externalCustomerId")}
            />
            <TextInput
              label={t`Billing email`}
              type="email"
              {...editForm.getInputProps("billingEmail")}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label={t`Company name`} {...editForm.getInputProps("companyName")} />
              <TextInput
                label={t`Currency`}
                maxLength={3}
                {...editForm.getInputProps("currency")}
              />
            </SimpleGrid>
            <Textarea
              label={t`Billing address (JSON)`}
              minRows={3}
              autosize
              {...editForm.getInputProps("billingAddress")}
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label={t`Tax id`} {...editForm.getInputProps("taxId")} />
              <TextInput label={t`Tax id type`} {...editForm.getInputProps("taxIdType")} />
            </SimpleGrid>
            <TextInput
              label={t`Profile owner user id`}
              description={t`UUID or leave empty to clear.`}
              {...editForm.getInputProps("profileOwnerId")}
            />
            <Text size="xs" c="dimmed">
              <Trans>Created</Trans> {dayjs(settings.createdAt).format("MMM D, YYYY HH:mm")}
            </Text>

            <Group justify="space-between" mt="md" wrap="wrap">
              <Button
                data-testid="button-billing-delete"
                type="button"
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={openDelete}
              >
                <Trans>Delete billing settings</Trans>
              </Button>
              <Group gap="sm">
                <Button
                  data-testid="button-billing-open-portal"
                  type="button"
                  variant="outline"
                  leftSection={<IconExternalLink size={16} />}
                  onClick={() => portalMutation.mutate()}
                  loading={portalMutation.isPending}
                >
                  <Trans>Open Billing Portal</Trans>
                </Button>
                <Button
                  data-testid="button-billing-save"
                  type="submit"
                  loading={replaceMutation.isPending}
                >
                  <Trans>Save changes</Trans>
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Modal
        opened={deleteOpened}
        onClose={closeDelete}
        title={<Trans>Delete billing settings?</Trans>}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            <Trans>
              This permanently removes the billing settings row for this tenant. Subscriptions and
              gateway objects are not automatically deleted.
            </Trans>
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button
              data-testid="button-billing-delete-cancel"
              variant="subtle"
              color="gray"
              onClick={closeDelete}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              data-testid="button-billing-delete-confirm"
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              <Trans>Delete</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
