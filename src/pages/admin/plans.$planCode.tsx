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
  Textarea,
  Switch,
  Button,
  Code,
  SimpleGrid,
  Modal,
  ActionIcon,
  Tooltip,
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
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import type { PlanRequest } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/plans/$planCode")({
  component: PlanDetailPage,
});

interface PlanFormValues {
  displayName: string;
  billingPeriod: string;
  priceMinor: number;
  currency: string;
  featureSet: string;
  scope: string;
  active: boolean;
}

function PlanDetailPage() {
  const { t } = useLingui();
  const { planCode } = Route.useParams();
  const queryClient = useQueryClient();
  const [confirmDeactivate, { open: openDeactivate, close: closeDeactivate }] =
    useDisclosure(false);

  const form = useForm<PlanFormValues>({
    initialValues: {
      displayName: "",
      billingPeriod: "MONTHLY",
      priceMinor: 0,
      currency: "USD",
      featureSet: "",
      scope: "TENANT",
      active: true,
    },
    validate: {
      displayName: (v) => (v.trim().length < 1 ? t`Display name is required` : null),
      priceMinor: (v) =>
        !Number.isFinite(v) || v < 1 ? t`Price must be at least 1 minor unit` : null,
      currency: (v) => (v.trim().length !== 3 ? t`Currency must be a 3-letter ISO code` : null),
    },
  });

  const {
    data: plan,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "plans", planCode],
    queryFn: () => billingApi.getPlan(planCode),
  });

  useEffect(() => {
    if (plan) {
      form.setValues({
        displayName: plan.displayName,
        billingPeriod: plan.billingPeriod,
        priceMinor: plan.priceMinor,
        currency: plan.currency,
        featureSet: plan.featureSet ?? "",
        scope: plan.scope,
        active: plan.active,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan]);

  const replaceMutation = useMutation({
    mutationFn: (body: PlanRequest) => billingApi.replacePlan(planCode, body),
    onSuccess: () => {
      notifications.show({
        title: "Plan updated",
        message: "Changes have been saved.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "plans", planCode] });
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

  const deactivateMutation = useMutation({
    mutationFn: () => billingApi.deactivatePlan(planCode),
    onSuccess: () => {
      notifications.show({
        title: "Plan deactivated",
        message: "The plan is no longer active.",
        color: "teal",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "plans"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "plans", planCode] });
      closeDeactivate();
    },
    onError: () => {
      notifications.show({
        title: "Deactivation failed",
        message: "Could not deactivate this plan.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const body: PlanRequest = {
      planCode,
      displayName: values.displayName.trim(),
      billingPeriod: values.billingPeriod,
      priceMinor: values.priceMinor,
      currency: values.currency.trim().toUpperCase(),
      featureSet: values.featureSet.trim() ? values.featureSet.trim() : null,
      scope: values.scope,
      active: values.active,
    };
    replaceMutation.mutate(body);
  });

  const displayTitle = plan?.displayName ?? planCode;

  if (isError) {
    return (
      <Container size="md" py={0}>
        <PageHeader
          title={<Trans>Plan</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Plans</Trans>, to: "/admin/plans" },
            { label: planCode },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load plan</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch plan details.</Trans>{" "}
          <Text
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
        <title>{pageTitle(isLoading ? t`Plan` : displayTitle)}</title>
      </Helmet>

      <PageHeader
        title={isLoading ? <Skeleton height={24} width={200} radius="sm" /> : displayTitle}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Plans</Trans>, to: "/admin/plans" },
          { label: isLoading ? planCode : displayTitle },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Back to list`} withArrow>
              <ActionIcon
                component={Link}
                variant="subtle"
                color="gray"
                size="md"
                to="/admin/plans"
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => void refetch()}
                loading={isLoading}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      <Paper radius="md" p="lg">
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput label={t`Plan code`} value={planCode} readOnly disabled={isLoading} />
              <TextInput
                label={t`Internal id`}
                value={plan?.id ?? ""}
                readOnly
                disabled={isLoading}
                styles={{
                  input: {
                    fontFamily: "var(--mantine-font-family-monospace)",
                    fontSize: "var(--mantine-font-size-xs)",
                  },
                }}
              />
            </SimpleGrid>

            <TextInput
              label={t`Display name`}
              disabled={isLoading}
              {...form.getInputProps("displayName")}
            />

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <Select
                label={t`Billing period`}
                data={[
                  { value: "MONTHLY", label: t`Monthly` },
                  { value: "ANNUAL", label: t`Annual` },
                ]}
                disabled={isLoading}
                {...form.getInputProps("billingPeriod")}
              />
              <Select
                label={t`Scope`}
                data={[
                  { value: "TENANT", label: t`Tenant` },
                  { value: "USER", label: t`User` },
                ]}
                disabled={isLoading}
                {...form.getInputProps("scope")}
              />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <NumberInput
                label={t`Price (minor units)`}
                description={t`Smallest currency unit (e.g. cents).`}
                min={1}
                disabled={isLoading}
                {...form.getInputProps("priceMinor")}
              />
              <TextInput
                label={t`Currency`}
                maxLength={3}
                disabled={isLoading}
                {...form.getInputProps("currency")}
              />
            </SimpleGrid>

            <Textarea
              label={t`Feature set (JSON)`}
              minRows={4}
              autosize
              disabled={isLoading}
              {...form.getInputProps("featureSet")}
            />

            <Switch
              label={t`Active`}
              disabled={isLoading}
              {...form.getInputProps("active", { type: "checkbox" })}
            />

            {!isLoading && plan && (
              <Group gap="xl">
                <Text size="xs" c="dimmed">
                  <Trans>Created</Trans> {dayjs(plan.createdAt).format("MMM D, YYYY HH:mm")}
                </Text>
                <Text size="xs" c="dimmed">
                  <Trans>Updated</Trans> {dayjs(plan.updatedAt).format("MMM D, YYYY HH:mm")}
                </Text>
              </Group>
            )}

            <Group justify="space-between" mt="md">
              <Button
                type="button"
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                disabled={isLoading || !plan?.active}
                onClick={openDeactivate}
              >
                <Trans>Deactivate</Trans>
              </Button>
              <Group gap="sm">
                <Button component={Link} to="/admin/plans" variant="subtle" color="gray">
                  <Trans>Cancel</Trans>
                </Button>
                <Button type="submit" loading={replaceMutation.isPending} disabled={isLoading}>
                  <Trans>Save changes</Trans>
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Paper>

      <Modal
        opened={confirmDeactivate}
        onClose={closeDeactivate}
        title={<Trans>Deactivate plan?</Trans>}
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            <Trans>
              This sets the plan to inactive. Existing subscriptions are not changed. You can set
              the plan back to active later from this page.
            </Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>Plan code:</Trans> <Code>{planCode}</Code>
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" color="gray" onClick={closeDeactivate}>
              <Trans>Cancel</Trans>
            </Button>
            <Button
              color="red"
              loading={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate()}
            >
              <Trans>Deactivate</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
