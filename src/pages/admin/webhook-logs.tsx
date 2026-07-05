import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Paper,
  Alert,
  Badge,
  Box,
  CloseButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconSearch, IconAlertCircle, IconWebhook, IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import type { WebhookLog } from "@/entities";
import type { WebhookLogSortField, SortDirection } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/webhook-logs")({
  component: AdminWebhookLogsPage,
});

const PAGE_SIZE = 20;

const SORT_FIELD_MAP: Record<string, WebhookLogSortField> = {
  receivedAt: "receivedAt",
  processedAt: "processedAt",
  eventType: "eventType",
  tenantKey: "tenantKey",
  status: "status",
};

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Processed" },
  { value: "FAILED", label: "Failed" },
  { value: "IGNORED", label: "Ignored" },
];

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "PROCESSED":
      return "green";
    case "PENDING":
      return "blue";
    case "FAILED":
      return "red";
    case "IGNORED":
      return "gray";
    default:
      return "gray";
  }
}

function AdminWebhookLogsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [tenantKey, setTenantKey] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [debouncedTenantKey] = useDebouncedValue(tenantKey, 300);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<WebhookLog>>({
    columnAccessor: "receivedAt",
    direction: "desc",
  });

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor as string] ?? "receivedAt";
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "webhook-logs",
      page,
      debouncedSearch,
      debouncedTenantKey,
      status,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      billingApi.listWebhookLogs({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(debouncedTenantKey ? { tenantKey: debouncedTenantKey } : {}),
        ...(status ? { status } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<WebhookLog>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTenantKeyChange = (value: string) => {
    setTenantKey(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatus(value ?? "");
    setPage(1);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Webhook Logs`]} appTitle="Key Value Admin" />
      <PageHeader
        title={
          <Group gap="xs">
            <IconWebhook size={20} />
            <Trans>Webhook Logs</Trans>
          </Group>
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Webhook Logs</Trans> },
        ]}
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load webhook logs</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch webhook logs from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        <Paper style={{ overflow: "hidden" }}>
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
          >
            <Group gap="xs">
              <Text fw={600} size="sm">
                <Trans>Webhook Logs</Trans>
              </Text>
              {!isLoading && (
                <Badge
                  data-testid="badge-webhook-logs-total-count"
                  variant="light"
                  color="gray"
                  size="sm"
                  radius="sm"
                >
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                data-testid="input-webhook-logs-search-filter"
                placeholder={t`Search event type or ID…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 220 }}
                rightSection={
                  search ? (
                    <CloseButton
                      data-testid="button-webhook-logs-search-clear"
                      size="xs"
                      onClick={() => handleSearchChange("")}
                    />
                  ) : null
                }
              />
              <TextInput
                data-testid="input-webhook-logs-tenant-key-filter"
                placeholder={t`Filter by tenant key…`}
                leftSection={<IconSearch size={14} />}
                value={tenantKey}
                onChange={(e) => handleTenantKeyChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 200 }}
                rightSection={
                  tenantKey ? (
                    <CloseButton
                      data-testid="button-webhook-logs-tenant-key-clear"
                      size="xs"
                      onClick={() => handleTenantKeyChange("")}
                    />
                  ) : null
                }
              />
              <Select
                data-testid="select-webhook-logs-status-filter"
                data={STATUS_OPTIONS}
                value={status}
                onChange={handleStatusChange}
                size="xs"
                style={{ width: 150 }}
                clearable={false}
              />
            </Group>
          </Group>

          <DataTable
            minHeight={160}
            fetching={isLoading || isFetching}
            records={data?.content}
            page={page}
            onPageChange={setPage}
            totalRecords={totalElements}
            recordsPerPage={PAGE_SIZE}
            sortStatus={sortStatus}
            onSortStatusChange={handleSortChange}
            columns={[
              {
                accessor: "eventType",
                title: t`Event Type`,
                sortable: true,
                render: (r) => (
                  <Text size="sm" ff="monospace">
                    {r.eventType}
                  </Text>
                ),
              },
              {
                accessor: "tenantKey",
                title: t`Tenant`,
                sortable: true,
                render: (r) => (
                  <Text size="sm" ff="monospace">
                    {r.tenantKey}
                  </Text>
                ),
              },
              {
                accessor: "status",
                title: t`Status`,
                sortable: true,
                render: (r) => (
                  <Badge
                    data-testid={`badge-webhook-log-status--${r.id}`}
                    color={getStatusColor(r.status)}
                    variant="light"
                    size="sm"
                    radius="sm"
                  >
                    {r.status}
                  </Badge>
                ),
              },
              {
                accessor: "receivedAt",
                title: t`Received At`,
                sortable: true,
                render: (r) => (
                  <Text size="sm">{dayjs(r.receivedAt).format("YYYY-MM-DD HH:mm:ss")}</Text>
                ),
              },
              {
                accessor: "processedAt",
                title: t`Processed At`,
                sortable: true,
                render: (r) =>
                  r.processedAt ? (
                    <Text size="sm">{dayjs(r.processedAt).format("YYYY-MM-DD HH:mm:ss")}</Text>
                  ) : (
                    <Text size="sm" c="dimmed">
                      —
                    </Text>
                  ),
              },
              {
                accessor: "externalEventId",
                title: t`External Event ID`,
                render: (r) => (
                  <Text size="xs" c="dimmed" ff="monospace">
                    {r.externalEventId}
                  </Text>
                ),
              },
              {
                accessor: "actions",
                title: t`Actions`,
                textAlign: "right",
                render: (r) => (
                  <Group gap={4} justify="flex-end">
                    <Tooltip label={t`View details`}>
                      <ActionIcon
                        data-testid={`button-webhook-log-view--${r.id}`}
                        size="sm"
                        variant="subtle"
                        color="blue"
                        component={Link}
                        to="/admin/webhook-logs/$webhookLogId"
                        params={{ webhookLogId: r.id } as any}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                ),
              },
            ]}
          />

          <Box px="md" py="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">
                <Trans>
                  Showing {rangeStart} – {rangeEnd} of {totalElements} webhook logs
                </Trans>
              </Text>
            </Group>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
