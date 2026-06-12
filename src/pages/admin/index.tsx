import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Button,
  Skeleton,
  Tooltip,
  Stack,
  Paper,
  Badge,
  Code,
  Alert,
  Box,
} from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import {
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconArrowRight,
  IconAlertCircle,
  IconMailQuestion,
  IconLock,
  IconUserX,
  IconClockExclamation,
  IconFlask,
  IconShieldExclamation,
  IconReceiptRefund,
  IconBuildingOff,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { useDashboardCounts, useDashboardWidgets } from "@/shared/api";
import type { DashboardCountResult, WidgetCountResult } from "@/shared/api";

dayjs.extend(relativeTime);

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRefundStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "completed":
      return "green";
    case "pending":
      return "blue";
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case "CRITICAL":
      return "red";
    case "HIGH":
      return "orange";
    case "MEDIUM":
      return "blue";
    default:
      return "gray";
  }
}

// ─── Stat display components ──────────────────────────────────────────────────

function StatValue({ count }: { count: DashboardCountResult }) {
  if (count.isLoading) {
    return <Skeleton height={28} width={60} radius="sm" mb={4} />;
  }
  if (count.isError) {
    return (
      <Tooltip label={<Trans>Failed to load</Trans>} withArrow>
        <Text size="xl" fw={700} c="red" mb={4} style={{ cursor: "default" }}>
          <IconAlertCircle size={20} style={{ verticalAlign: "middle" }} />
        </Text>
      </Tooltip>
    );
  }
  return (
    <Text size="xl" fw={700} mb={4}>
      {count.value?.toLocaleString() ?? "—"}
    </Text>
  );
}

function WidgetStatValue({ count }: { count: WidgetCountResult }) {
  if (count.isLoading) {
    return <Skeleton height={28} width={60} radius="sm" mb={4} />;
  }
  if (count.isError) {
    return (
      <Tooltip label={<Trans>Failed to load</Trans>} withArrow>
        <Text size="xl" fw={700} c="red" mb={4} style={{ cursor: "default" }}>
          <IconAlertCircle size={20} style={{ verticalAlign: "middle" }} />
        </Text>
      </Tooltip>
    );
  }
  return (
    <Text size="xl" fw={700} mb={4}>
      {count.value?.toLocaleString() ?? "—"}
    </Text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminDashboardPage() {
  const { t } = useLingui();
  const counts = useDashboardCounts();
  const widgets = useDashboardWidgets();

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Dashboard`)}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Dashboard</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans> }, { label: <Trans>Dashboard</Trans> }]}
      />

      <Stack gap="xl">
        {/* ── Row 1: Primary KPI cards ────────────────────────────────────── */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                <IconUsers size={20} />
              </ThemeIcon>
            </Group>
            <StatValue count={counts.users} />
            <Text size="sm" c="dimmed">
              <Trans>Total Users</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/users"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>Manage users</Trans>
            </Button>
          </Card>

          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                <IconBuilding size={20} />
              </ThemeIcon>
            </Group>
            <StatValue count={counts.tenants} />
            <Text size="sm" c="dimmed">
              <Trans>Organizations</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/organizations"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>Manage organizations</Trans>
            </Button>
          </Card>

          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                <IconCreditCard size={20} />
              </ThemeIcon>
            </Group>
            <StatValue count={counts.subscriptions} />
            <Text size="sm" c="dimmed">
              <Trans>Active Subscriptions</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/subscriptions"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>Manage subscriptions</Trans>
            </Button>
          </Card>
        </SimpleGrid>

        {/* ── Row 2: Signal KPI cards ─────────────────────────────────────── */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {/* Locked users */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="red">
                <IconLock size={20} />
              </ThemeIcon>
              {(widgets.lockedUsers.value ?? 0) > 0 && (
                <Badge color="red" variant="filled" size="sm" radius="sm">
                  <Trans>Action needed</Trans>
                </Badge>
              )}
            </Group>
            <WidgetStatValue count={widgets.lockedUsers} />
            <Text size="sm" c="dimmed">
              <Trans>Locked Accounts</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/users"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              c="red"
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>View locked users</Trans>
            </Button>
          </Card>

          {/* Suspended users */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconUserX size={20} />
              </ThemeIcon>
            </Group>
            <WidgetStatValue count={widgets.suspendedUsers} />
            <Text size="sm" c="dimmed">
              <Trans>Suspended Users</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/users"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>View users</Trans>
            </Button>
          </Card>

          {/* Past-due subscriptions */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconClockExclamation size={20} />
              </ThemeIcon>
              {(widgets.pastDueSubscriptions.value ?? 0) > 0 && (
                <Badge color="orange" variant="filled" size="sm" radius="sm">
                  <Trans>Revenue risk</Trans>
                </Badge>
              )}
            </Group>
            <WidgetStatValue count={widgets.pastDueSubscriptions} />
            <Text size="sm" c="dimmed">
              <Trans>Past-Due Subscriptions</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/subscriptions"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              c="orange"
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>View subscriptions</Trans>
            </Button>
          </Card>

          {/* Pending invitations */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                <IconMailQuestion size={20} />
              </ThemeIcon>
              {(widgets.pendingInvitations.value ?? 0) > 0 && (
                <Badge color="indigo" variant="light" size="sm" radius="sm">
                  {widgets.pendingInvitations.value}
                </Badge>
              )}
            </Group>
            <WidgetStatValue count={widgets.pendingInvitations} />
            <Text size="sm" c="dimmed">
              <Trans>Pending Invitations</Trans>
            </Text>
            <Button
              component={Link}
              to="/admin/invitations"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>View invitations</Trans>
            </Button>
          </Card>
        </SimpleGrid>

        {/* ── Row 3: Charts + Feeds ────────────────────────────────────────── */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Subscription status breakdown donut */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <Trans>Subscription Breakdown</Trans>
              </Text>
              <ThemeIcon size="md" radius="md" variant="light" color="teal">
                <IconFlask size={16} />
              </ThemeIcon>
            </Group>

            {widgets.subscriptionBreakdown.isLoading && (
              <Stack gap="xs" align="center" py="xl">
                <Skeleton circle height={140} width={140} />
                <Skeleton height={12} width={200} radius="sm" mt="md" />
              </Stack>
            )}

            {widgets.subscriptionBreakdown.isError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                <Trans>Failed to load subscription breakdown</Trans>
              </Alert>
            )}

            {!widgets.subscriptionBreakdown.isLoading && !widgets.subscriptionBreakdown.isError && (
              <>
                {widgets.subscriptionBreakdown.data.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    <Trans>No subscription data available</Trans>
                  </Text>
                ) : (
                  <Group gap="xl" justify="center" align="center" wrap="nowrap">
                    <DonutChart
                      data={widgets.subscriptionBreakdown.data.map((item) => ({
                        name:
                          item.status.charAt(0).toUpperCase() +
                          item.status.slice(1).replace(/_/g, " "),
                        value: item.count,
                        color: item.color,
                      }))}
                      size={160}
                      thickness={28}
                      tooltipDataSource="segment"
                    />
                    <Stack gap="xs">
                      {widgets.subscriptionBreakdown.data.map((item) => (
                        <Group key={item.status} gap="xs" wrap="nowrap">
                          <Box
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 2,
                              backgroundColor: `var(--mantine-color-${item.color}-6)`,
                              flexShrink: 0,
                            }}
                          />
                          <Text size="xs" c="dimmed" style={{ textTransform: "capitalize" }}>
                            {item.status.replace(/_/g, " ")}
                          </Text>
                          <Text size="xs" fw={600} ml="auto">
                            {item.count}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  </Group>
                )}
              </>
            )}

            <Button
              component={Link}
              to="/admin/subscriptions"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>All subscriptions</Trans>
            </Button>
          </Card>

          {/* Recent HIGH / CRITICAL audit events */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <Trans>Recent Critical Events</Trans>
              </Text>
              <ThemeIcon size="md" radius="md" variant="light" color="red">
                <IconShieldExclamation size={16} />
              </ThemeIcon>
            </Group>

            {widgets.recentCriticalAudit.isLoading && (
              <Stack gap="xs">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={40} radius="sm" />
                ))}
              </Stack>
            )}

            {widgets.recentCriticalAudit.isError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                <Trans>Failed to load audit events</Trans>
              </Alert>
            )}

            {!widgets.recentCriticalAudit.isLoading && !widgets.recentCriticalAudit.isError && (
              <>
                {widgets.recentCriticalAudit.records.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    <Trans>No critical events — all clear</Trans>
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {widgets.recentCriticalAudit.records.map((record) => (
                      <Paper
                        key={record.id}
                        px="sm"
                        py={8}
                        withBorder
                        style={{
                          borderLeft: `3px solid var(--mantine-color-${getSeverityColor(record.severity)}-6)`,
                        }}
                      >
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text size="xs" fw={500} truncate>
                              {record.action}
                            </Text>
                            <Group gap="xs">
                              <Text size="xs" c="dimmed">
                                {record.actorEmail ?? record.actorId ?? "system"}
                              </Text>
                              {record.tenantKey && (
                                <Code
                                  style={{
                                    fontSize: "var(--mantine-font-size-xs)",
                                    padding: "0 4px",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {record.tenantKey}
                                </Code>
                              )}
                            </Group>
                          </Stack>
                          <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                            <Badge
                              color={getSeverityColor(record.severity)}
                              variant="light"
                              size="xs"
                              radius="sm"
                            >
                              {record.severity}
                            </Badge>
                            <Text size="xs" c="dimmed">
                              {dayjs(record.occurredAt).fromNow()}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </>
            )}

            <Button
              component={Link}
              to="/admin/audit-logs"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>View all audit logs</Trans>
            </Button>
          </Card>
        </SimpleGrid>

        {/* ── Row 4: Refunds + Org problems ───────────────────────────────── */}
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
          {/* Recent refunds */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <Trans>Recent Refunds</Trans>
              </Text>
              <ThemeIcon size="md" radius="md" variant="light" color="grape">
                <IconReceiptRefund size={16} />
              </ThemeIcon>
            </Group>

            {widgets.recentRefunds.isLoading && (
              <Stack gap="xs">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={36} radius="sm" />
                ))}
              </Stack>
            )}

            {widgets.recentRefunds.isError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                <Trans>Failed to load recent refunds</Trans>
              </Alert>
            )}

            {!widgets.recentRefunds.isLoading && !widgets.recentRefunds.isError && (
              <>
                {widgets.recentRefunds.refunds.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    <Trans>No refunds recorded yet</Trans>
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {widgets.recentRefunds.refunds.map((refund) => (
                      <Paper key={refund.id} px="sm" py={8} withBorder>
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text size="xs" ff="monospace" truncate>
                              {refund.tenantKey}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {dayjs(refund.occurredAt).format("MMM D, YYYY HH:mm")}
                            </Text>
                          </Stack>
                          <Group gap="xs" style={{ flexShrink: 0 }}>
                            <Badge
                              color={getRefundStatusColor(refund.status)}
                              variant="light"
                              size="xs"
                              radius="sm"
                            >
                              {refund.status}
                            </Badge>
                            <Text size="sm" fw={600}>
                              {(refund.amount / 100).toFixed(2)}{" "}
                              <Text span size="xs" c="dimmed">
                                {refund.currency.toUpperCase()}
                              </Text>
                            </Text>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </>
            )}

            <Button
              component={Link}
              to="/admin/refunds"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>All refunds</Trans>
            </Button>
          </Card>

          {/* Suspended organizations */}
          <Card p="lg">
            <Group justify="space-between" mb="md">
              <Text fw={600} size="sm">
                <Trans>Suspended Organizations</Trans>
              </Text>
              <ThemeIcon size="md" radius="md" variant="light" color="orange">
                <IconBuildingOff size={16} />
              </ThemeIcon>
            </Group>

            {widgets.failedTenants.isLoading && (
              <Stack gap="xs">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} height={44} radius="sm" />
                ))}
              </Stack>
            )}

            {widgets.failedTenants.isError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                <Trans>Failed to load organization data</Trans>
              </Alert>
            )}

            {!widgets.failedTenants.isLoading && !widgets.failedTenants.isError && (
              <>
                {widgets.failedTenants.tenants.length === 0 ? (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    <Trans>All organizations are in good standing</Trans>
                  </Text>
                ) : (
                  <Stack gap={4}>
                    {widgets.failedTenants.tenants.map((tenant) => (
                      <Paper key={tenant.id} px="sm" py={8} withBorder>
                        <Group justify="space-between" wrap="nowrap">
                          <Stack gap={2} style={{ minWidth: 0 }}>
                            <Text size="xs" fw={500} truncate>
                              {tenant.name}
                            </Text>
                            <Code
                              style={{
                                fontSize: "var(--mantine-font-size-xs)",
                                padding: "0 4px",
                                lineHeight: 1.4,
                                display: "inline-block",
                              }}
                            >
                              {tenant.tenantKey}
                            </Code>
                          </Stack>
                          <Group gap="xs" style={{ flexShrink: 0 }}>
                            <Badge color="orange" variant="light" size="xs" radius="sm">
                              {tenant.status}
                            </Badge>
                            <Button
                              component={Link}
                              to="/admin/organizations/$tenantKey"
                              params={{ tenantKey: tenant.tenantKey } as never}
                              variant="subtle"
                              color="orange"
                              size="xs"
                              px={4}
                              rightSection={<IconArrowRight size={12} />}
                            >
                              <Trans>View</Trans>
                            </Button>
                          </Group>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </>
            )}

            <Button
              component={Link}
              to="/admin/organizations"
              variant="subtle"
              size="xs"
              mt="md"
              px={0}
              rightSection={<IconArrowRight size={14} />}
            >
              <Trans>All organizations</Trans>
            </Button>
          </Card>
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
