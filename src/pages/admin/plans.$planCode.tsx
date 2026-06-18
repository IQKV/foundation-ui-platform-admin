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
  Badge,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  Code,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconAlertCircle, IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/plans/$planCode")({
  component: PlanDetailPage,
});

function PlanDetailPage() {
  const { t } = useLingui();
  const { planCode } = Route.useParams();

  const {
    data: plan,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "plans", planCode],
    queryFn: () => billingApi.getPlan(planCode),
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

      <Paper p="lg">
        <Stack gap="md">
          {/* Plan code + status badge */}
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              <Trans>Plan code</Trans>: <Code fz="sm">{planCode}</Code>
            </Text>
            {!isLoading && plan && (
              <Badge variant="dot" color={plan.active ? "green" : "gray"} size="md">
                {plan.active ? t`Active` : t`Inactive`}
              </Badge>
            )}
            {isLoading && <Skeleton height={20} width={70} radius="xl" />}
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <TextInput
              label={t`Plan code`}
              value={isLoading ? "" : (plan?.planCode ?? "")}
              readOnly
              disabled={isLoading}
            />
            <TextInput
              label={t`Internal id`}
              value={isLoading ? "" : (plan?.id ?? "")}
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
            value={isLoading ? "" : (plan?.displayName ?? "")}
            readOnly
            disabled={isLoading}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label={t`Billing period`}
              data={[
                { value: "MONTHLY", label: t`Monthly` },
                { value: "ANNUAL", label: t`Annual` },
              ]}
              value={isLoading ? null : (plan?.billingPeriod ?? null)}
              readOnly
              disabled={isLoading}
            />
            <Select
              label={t`Scope`}
              data={[
                { value: "TENANT", label: t`Tenant` },
                { value: "USER", label: t`User` },
              ]}
              value={isLoading ? null : (plan?.scope ?? null)}
              readOnly
              disabled={isLoading}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <NumberInput
              label={t`Price (minor units)`}
              description={t`Smallest currency unit (e.g. cents).`}
              value={isLoading ? "" : (plan?.priceMinor ?? "")}
              readOnly
              disabled={isLoading}
            />
            <TextInput
              label={t`Currency`}
              value={isLoading ? "" : (plan?.currency ?? "")}
              readOnly
              disabled={isLoading}
            />
          </SimpleGrid>

          <Textarea
            label={t`Feature set (JSON)`}
            value={isLoading ? "" : (plan?.featureSet ?? "")}
            readOnly
            disabled={isLoading}
            minRows={4}
            autosize
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
        </Stack>
      </Paper>
    </Container>
  );
}
