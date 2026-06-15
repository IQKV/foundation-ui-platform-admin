import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  ThemeIcon,
  Code,
  ActionIcon,
  Tooltip,
  Tabs,
  Badge,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  IconBuilding,
  IconAlertCircle,
  IconKey,
  IconCalendar,
  IconRefresh,
  IconCreditCard,
  IconUsers,
  IconEdit,
  IconFileInvoice,
  IconReceiptRefund,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi, billingApi } from "@/shared/api";
import { TenantStatusBadge, PageHeader } from "@/shared/ui";
import { useState } from "react";
import type { IamTenant } from "@/shared/api";
import { EditTenantModal } from "@/features/edit-tenant";
import { organizationTenantSubtab } from "./-organization-tenant-subtab";

export const Route = createFileRoute("/admin/organizations/$tenantKey")({
  component: OrganizationTenantLayout,
});

function OrganizationTenantLayout() {
  const { t } = useLingui();
  const { tenantKey } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeTab = organizationTenantSubtab(pathname);

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editTarget, setEditTarget] = useState<IamTenant | null>(null);

  const {
    data: tenant,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "tenants", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey),
  });

  const { data: subscriptionsPage, isLoading: subsLoading } = useQuery({
    queryKey: ["admin", "subscriptions", "byTenant", tenantKey],
    queryFn: () => billingApi.listSubscriptions({ tenantKey, size: 100 }),
    enabled: !!tenant,
  });

  const { data: memberCountData, isLoading: membersLoading } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", "count"],
    queryFn: () => iamApi.countTenantMembers(tenantKey),
    enabled: !!tenant,
  });

  const subscriptionCount = subscriptionsPage?.totalElements ?? 0;
  const memberCount = memberCountData?.total ?? 0;

  const handleEdit = () => {
    if (tenant) {
      setEditTarget(tenant);
      openEdit();
    }
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setEditTarget(null), 300);
  };

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>Organization</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Organizations</Trans>, to: "/admin/organizations" },
            { label: tenantKey },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load organization</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch organization details.</Trans>{" "}
          <Text
            data-testid="button-org-detail-error-retry"
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
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(isLoading ? t`Organization` : (tenant?.name ?? t`Organization`))}</title>
      </Helmet>

      <PageHeader
        title={isLoading ? <Skeleton height={24} width={160} radius="sm" /> : <>{tenant?.name}</>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Organizations</Trans>, to: "/admin/organizations" },
          { label: isLoading ? tenantKey : (tenant?.name ?? tenantKey) },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Edit organization`} withArrow>
              <ActionIcon
                data-testid="button-org-detail-edit"
                variant="light"
                color="blue"
                size="md"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <IconEdit size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                data-testid="button-org-detail-refresh"
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

      <Paper data-testid="org-detail-hero-card" p="xl" mb="md">
        <Stack align="center" gap="xs">
          <Box
            data-testid="org-detail-icon"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--mantine-color-blue-1)",
              border: "3px solid var(--mantine-color-blue-3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconBuilding size={36} color="var(--mantine-color-blue-6)" />
          </Box>

          <Group gap="xs" align="center">
            {isLoading ? (
              <Skeleton height={24} width={180} radius="sm" />
            ) : (
              <Text data-testid="org-detail-name" size="xl" fw={700}>
                {tenant?.name}
              </Text>
            )}
            {!isLoading && tenant && <TenantStatusBadge status={tenant.status} />}
          </Group>

          <Group gap="lg" justify="center" wrap="wrap">
            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconKey size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Code data-testid="org-detail-tenant-key" style={{ fontSize: "var(--mantine-font-size-sm)" }}>{tenant?.tenantKey}</Code>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCalendar size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={100} radius="sm" />
              ) : (
                <Text data-testid="org-detail-created-at" size="sm" c="dimmed">
                  <Trans>Created</Trans>{" "}
                  {tenant ? dayjs(tenant.createdAt).format("MMM D, YYYY") : "—"}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconUsers size={13} />
              </ThemeIcon>
              {membersLoading ? (
                <Skeleton height={14} width={60} radius="sm" />
              ) : (
                <Text data-testid="org-detail-member-count" size="sm" c="dimmed">
                  {memberCount} <Trans>member(s)</Trans>
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCreditCard size={13} />
              </ThemeIcon>
              {subsLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Text data-testid="org-detail-subscription-count" size="sm" c="dimmed">
                  {subscriptionCount > 0 ? (
                    <Trans>{subscriptionCount} subscription(s)</Trans>
                  ) : (
                    <Trans>No subscriptions</Trans>
                  )}
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      <Tabs
        value={activeTab}
        styles={{
          tab: { fontSize: "var(--mantine-font-size-sm)" },
          list: { borderBottom: "1px solid var(--mantine-color-gray-1)" },
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            data-testid="tab-org-overview"
            value="overview"
            leftSection={<IconBuilding size={14} />}
            renderRoot={(props) => (
              <Link to="/admin/organizations/$tenantKey" params={{ tenantKey }} {...props} />
            )}
          >
            <Trans>Overview</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-org-members"
            value="members"
            leftSection={<IconUsers size={14} />}
            rightSection={
              !membersLoading && memberCount > 0 ? (
                <Badge data-testid="badge-org-member-count" variant="light" color="gray" size="xs" radius="sm">
                  {memberCount}
                </Badge>
              ) : undefined
            }
            renderRoot={(props) => (
              <Link
                to="/admin/organizations/$tenantKey/members"
                params={{ tenantKey }}
                {...props}
              />
            )}
          >
            <Trans>Members</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-org-billing"
            value="billing"
            leftSection={<IconFileInvoice size={14} />}
            renderRoot={(props) => (
              <Link
                to="/admin/organizations/$tenantKey/billing"
                params={{ tenantKey }}
                {...props}
              />
            )}
          >
            <Trans>Billing Settings</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-org-subscriptions"
            value="subscriptions"
            leftSection={<IconCreditCard size={14} />}
            rightSection={
              !subsLoading && subscriptionCount > 0 ? (
                <Badge data-testid="badge-org-subscription-count" variant="light" color="gray" size="xs" radius="sm">
                  {subscriptionCount}
                </Badge>
              ) : undefined
            }
            renderRoot={(props) => (
              <Link
                to="/admin/organizations/$tenantKey/subscriptions"
                params={{ tenantKey }}
                {...props}
              />
            )}
          >
            <Trans>Subscriptions</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-org-refunds"
            value="refunds"
            leftSection={<IconReceiptRefund size={14} />}
            renderRoot={(props) => (
              <Link
                to="/admin/organizations/$tenantKey/refunds"
                params={{ tenantKey }}
                {...props}
              />
            )}
          >
            <Trans>Refunds</Trans>
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <Outlet />

      <EditTenantModal tenant={editTarget} opened={editOpened} onClose={handleCloseEdit} />
    </Container>
  );
}
