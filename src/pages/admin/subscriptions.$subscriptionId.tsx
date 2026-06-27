import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Paper,
  Skeleton,
  Alert,
  TextInput,
  Select,
  NumberInput,
  Switch,
  Button,
  SimpleGrid,
  Modal,
  Badge,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { createElement } from "react";
import { isAxiosError } from "axios";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import type { UpdateSubscriptionRequest } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/subscriptions/$subscriptionId")({
  component: SubscriptionDetailPage,
});

interface SubscriptionFormValues {
  status: string;
  quantity: number;
  trialStart: string;
  trialEnd: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past Due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paused", label: "Paused" },
];

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "active":
      return "green";
    case "trialing":
      return "blue";
    case "past_due":
      return "orange";
    case "canceled":
      return "gray";
    case "unpaid":
      return "red";
    default:
      return "gray";
  }
}

function SubscriptionDetailPage() {
  const { t } = useLingui();
  const { subscriptionId: id } = Route.useParams();
  const queryClient = useQueryClient();
  const [confirmDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

  const form = useForm<SubscriptionFormValues>({
    initialValues: {
      status: "",
      quantity: 1,
      trialStart: "",
      trialEnd: "",
      currentPeriodEnd: "",
      cancelAtPeriodEnd: false,
    },
  });

  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "subscriptions", id],
    queryFn: () => billingApi.getSubscription(id),
  });

  useEffect(() => {
    if (subscription) {
      form.setValues({
        status: subscription.status,
        quantity: subscription.quantity,
        trialStart: subscription.trialStart
          ? dayjs(subscription.trialStart).format("YYYY-MM-DDTHH:mm")
          : "",
        trialEnd: subscription.trialEnd
          ? dayjs(subscription.trialEnd).format("YYYY-MM-DDTHH:mm")
          : "",
        currentPeriodEnd: dayjs(subscription.currentPeriodEnd).format("YYYY-MM-DDTHH:mm"),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  const updateMutation = useMutation({
    mutationFn: (body: UpdateSubscriptionRequest) => billingApi.updateSubscription(id, body),
    onSuccess: () => {
      notifications.show({
        title: "Subscription updated",
        message: "Changes have been saved.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions", id] });
    },
    onError: (err: unknown) => {
      const msg = isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;
      notifications.show({
        title: "Update failed",
        message: msg ?? "Could not save changes. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => billingApi.deleteSubscription(id),
    onSuccess: () => {
      notifications.show({
        title: "Subscription deleted",
        message: "The record has been permanently removed.",
        color: "teal",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      window.history.back();
    },
    onError: () => {
      notifications.show({
        title: "Deletion failed",
        message: "Could not delete this subscription.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const body: UpdateSubscriptionRequest = {
      status: values.status,
      quantity: values.quantity,
      cancelAtPeriodEnd: values.cancelAtPeriodEnd,
      currentPeriodEnd: values.currentPeriodEnd
        ? dayjs(values.currentPeriodEnd).toISOString()
        : undefined,
      trialStart: values.trialStart ? dayjs(values.trialStart).toISOString() : undefined,
      trialEnd: values.trialEnd ? dayjs(values.trialEnd).toISOString() : undefined,
    };
    updateMutation.mutate(body);
  });

  if (isError) {
    return (
      <Container size="md" py={0}>
        <PageHeader
          title={<Trans>Subscription</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Subscriptions</Trans>, to: "/admin/subscriptions" },
            { label: id },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load subscription</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch subscription details.</Trans>{" "}
          <Text
            data-testid="button-sub-detail-error-retry"
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py={0}>
      <Helmet>
        <title>{pageTitle(subscription ? `Subscription ${subscription.id}` : t`Loading…`)}</title>
      </Helmet>
      <PageHeader
        title={
          subscription ? (
            <Group gap="sm">
              <Trans>Subscription</Trans>
              <Badge
                data-testid="badge-sub-detail-status"
                color={getStatusColor(subscription.status)}
                variant="light"
                size="lg"
                radius="sm"
              >
                {subscription.status}
              </Badge>
            </Group>
          ) : (
            <Trans>Loading…</Trans>
          )
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Subscriptions</Trans>, to: "/admin/subscriptions" },
          { label: subscription?.id ?? id },
        ]}
      />

      <Stack gap="lg">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          to="/admin/subscriptions"
          size="xs"
          w="fit-content"
        >
          <Trans>Back to list</Trans>
        </Button>

        <Paper p="xl">
          {isLoading ? (
            <Stack>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : (
            <form onSubmit={handleSubmit} data-testid="form-sub-detail">
              <Stack gap="xl">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <TextInput
                    data-testid="input-sub-id"
                    label={<Trans>Subscription ID</Trans>}
                    value={subscription?.id}
                    readOnly
                    disabled
                  />
                  <TextInput
                    data-testid="input-sub-tenant-key"
                    label={<Trans>Tenant Key</Trans>}
                    value={subscription?.tenantKey}
                    readOnly
                    disabled
                  />
                  <TextInput
                    data-testid="input-sub-plan-id"
                    label={<Trans>Plan ID</Trans>}
                    value={subscription?.planId}
                    readOnly
                    disabled
                  />
                  <TextInput
                    data-testid="input-sub-external-id"
                    label={<Trans>External ID</Trans>}
                    value={subscription?.externalSubscriptionId}
                    readOnly
                    disabled
                  />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <Select
                    data-testid="input-sub-status"
                    label={<Trans>Status</Trans>}
                    data={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t`${o.label}` }))}
                    {...form.getInputProps("status")}
                  />
                  <NumberInput
                    data-testid="input-sub-quantity"
                    label={<Trans>Quantity</Trans>}
                    min={1}
                    {...form.getInputProps("quantity")}
                  />
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  <TextInput
                    data-testid="input-sub-trial-start"
                    type="datetime-local"
                    label={<Trans>Trial Start</Trans>}
                    {...form.getInputProps("trialStart")}
                  />
                  <TextInput
                    data-testid="input-sub-trial-end"
                    type="datetime-local"
                    label={<Trans>Trial End</Trans>}
                    {...form.getInputProps("trialEnd")}
                  />
                  <TextInput
                    data-testid="input-sub-period-end"
                    type="datetime-local"
                    label={<Trans>Current Period End</Trans>}
                    {...form.getInputProps("currentPeriodEnd")}
                  />
                  <Switch
                    data-testid="input-sub-cancel-at-period-end"
                    label={<Trans>Cancel at period end</Trans>}
                    pt="xl"
                    {...form.getInputProps("cancelAtPeriodEnd", { type: "checkbox" })}
                  />
                </SimpleGrid>

                <Group justify="space-between" pt="md">
                  <Button
                    data-testid="button-sub-delete"
                    variant="light"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={openDelete}
                  >
                    <Trans>Delete record</Trans>
                  </Button>
                  <Group>
                    <Button
                      data-testid="button-sub-reset"
                      variant="subtle"
                      color="gray"
                      onClick={() => void refetch()}
                    >
                      <Trans>Reset</Trans>
                    </Button>
                    <Button
                      data-testid="button-sub-save"
                      type="submit"
                      loading={updateMutation.isPending}
                    >
                      <Trans>Save changes</Trans>
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          )}
        </Paper>

        {subscription && (
          <Paper p="md" bg="var(--mantine-color-gray-0)">
            <Stack gap="xs">
              <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                <Trans>Metadata</Trans>
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                <Text size="xs">
                  <Trans>Created:</Trans>{" "}
                  {dayjs(subscription.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                </Text>
                <Text size="xs">
                  <Trans>Updated:</Trans>{" "}
                  {dayjs(subscription.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
                </Text>
                <Text size="xs">
                  <Trans>Subject Type:</Trans> {subscription.subjectType || "N/A"}
                </Text>
                <Text size="xs">
                  <Trans>Subject Key:</Trans> {subscription.subjectKey || "N/A"}
                </Text>
              </SimpleGrid>
            </Stack>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={confirmDelete}
        onClose={closeDelete}
        title={<Trans>Delete subscription record</Trans>}
        centered
      >
        <Stack>
          <Text size="sm">
            <Trans>
              Are you sure you want to permanently delete this subscription record? This action
              cannot be undone and will remove the record from the local database.
            </Trans>
          </Text>
          <Group justify="flex-end" mt="md">
            <Button
              data-testid="button-sub-delete-cancel"
              variant="subtle"
              color="gray"
              onClick={closeDelete}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              data-testid="button-sub-delete-confirm"
              color="red"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
            >
              <Trans>Confirm delete</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
