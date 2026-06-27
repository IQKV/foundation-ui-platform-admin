import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  SimpleGrid,
  Group,
  ThemeIcon,
  Button,
  Badge,
  Stack,
} from "@mantine/core";
import {
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconArrowRight,
  IconMailQuestion,
  IconLock,
  IconUserX,
  IconClockExclamation,
} from "@tabler/icons-react";
import { useLingui, Trans } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { useDashboardCounts, useDashboardWidgets } from "@/shared/api";
import {
  CardGroup,
  SubCard,
  StatValue,
  WidgetStatValue,
  TenantSignupChartCard,
  SubscriptionBreakdownWidget,
  RecentCriticalAuditWidget,
  RecentRefundsWidget,
  SuspendedTenantsWidget,
} from "@/widgets";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { t } = useLingui();
  const counts = useDashboardCounts();
  const widgets = useDashboardWidgets();

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Dashboard`]} appTitle={t`Key Value Admin`} />
      <PageHeader
        title={<Trans>Dashboard</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans> }, { label: <Trans>Dashboard</Trans> }]}
      />

      <Stack gap="lg">
        <CardGroup title={<Trans>Platform Overview</Trans>}>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconUsers size={20} />
                </ThemeIcon>
              </Group>
              <StatValue count={counts.users} data-testid="stat-total-users" />
              <Text size="sm" c="dimmed">
                <Trans>Total Users</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/users"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>Manage users</Trans>
              </Button>
            </SubCard>

            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconBuilding size={20} />
                </ThemeIcon>
              </Group>
              <StatValue count={counts.tenants} data-testid="stat-total-organizations" />
              <Text size="sm" c="dimmed">
                <Trans>Organizations</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/organizations"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>Manage organizations</Trans>
              </Button>
            </SubCard>

            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="teal">
                  <IconCreditCard size={20} />
                </ThemeIcon>
              </Group>
              <StatValue count={counts.subscriptions} data-testid="stat-active-subscriptions" />
              <Text size="sm" c="dimmed">
                <Trans>Active Subscriptions</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/subscriptions"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>Manage subscriptions</Trans>
              </Button>
            </SubCard>
          </SimpleGrid>
        </CardGroup>

        <CardGroup title={<Trans>Attention Required</Trans>}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="red">
                  <IconLock size={20} />
                </ThemeIcon>
                {(widgets.lockedUsers.value ?? 0) > 0 && (
                  <Badge
                    data-testid="badge-locked-users-action-needed"
                    color="red"
                    variant="filled"
                    size="sm"
                    radius="sm"
                  >
                    <Trans>Action needed</Trans>
                  </Badge>
                )}
              </Group>
              <WidgetStatValue count={widgets.lockedUsers} data-testid="stat-locked-users" />
              <Text size="sm" c="dimmed">
                <Trans>Locked Accounts</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/users"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                c="red"
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>View locked users</Trans>
              </Button>
            </SubCard>

            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconUserX size={20} />
                </ThemeIcon>
              </Group>
              <WidgetStatValue count={widgets.suspendedUsers} data-testid="stat-suspended-users" />
              <Text size="sm" c="dimmed">
                <Trans>Suspended Users</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/users"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>View users</Trans>
              </Button>
            </SubCard>

            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconClockExclamation size={20} />
                </ThemeIcon>
                {(widgets.pastDueSubscriptions.value ?? 0) > 0 && (
                  <Badge
                    data-testid="badge-past-due-subscriptions-revenue-risk"
                    color="orange"
                    variant="filled"
                    size="sm"
                    radius="sm"
                  >
                    <Trans>Revenue risk</Trans>
                  </Badge>
                )}
              </Group>
              <WidgetStatValue
                count={widgets.pastDueSubscriptions}
                data-testid="stat-past-due-subscriptions"
              />
              <Text size="sm" c="dimmed">
                <Trans>Past-Due Subscriptions</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/subscriptions"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                c="orange"
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>View subscriptions</Trans>
              </Button>
            </SubCard>

            <SubCard>
              <Group justify="space-between" mb="sm">
                <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
                  <IconMailQuestion size={20} />
                </ThemeIcon>
                {(widgets.pendingInvitations.value ?? 0) > 0 && (
                  <Badge
                    data-testid="badge-pending-invitations-count"
                    color="indigo"
                    variant="light"
                    size="sm"
                    radius="sm"
                  >
                    {widgets.pendingInvitations.value}
                  </Badge>
                )}
              </Group>
              <WidgetStatValue
                count={widgets.pendingInvitations}
                data-testid="stat-pending-invitations"
              />
              <Text size="sm" c="dimmed">
                <Trans>Pending Invitations</Trans>
              </Text>
              <Button
                component={Link}
                to="/admin/invitations"
                variant="subtle"
                size="xs"
                mt="sm"
                px={0}
                rightSection={<IconArrowRight size={14} />}
              >
                <Trans>View invitations</Trans>
              </Button>
            </SubCard>
          </SimpleGrid>
        </CardGroup>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <SubscriptionBreakdownWidget data={widgets.subscriptionBreakdown} />
          <RecentCriticalAuditWidget data={widgets.recentCriticalAudit} />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          <RecentRefundsWidget data={widgets.recentRefunds} />
          <SuspendedTenantsWidget data={widgets.failedTenants} />
        </SimpleGrid>

        <TenantSignupChartCard />
      </Stack>
    </Container>
  );
}
