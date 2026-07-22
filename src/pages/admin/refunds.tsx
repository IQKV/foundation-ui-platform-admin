import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
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
import { IconSearch, IconAlertCircle, IconReceiptRefund, IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import type { Refund } from "@/entities";
import type { RefundSortField, SortDirection } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/refunds")({
  component: AdminRefundsPage,
});

const PAGE_SIZE = 20;

const SORT_FIELD_MAP: Record<string, RefundSortField> = {
  tenantKey: "tenantKey",
  amount: "amount",
  currency: "currency",
  status: "status",
  occurredAt: "occurredAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function getStatusColor(status: string): string {
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

function AdminRefundsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [tenantKey, setTenantKey] = useState("");
  const [debouncedTenantKey] = useDebouncedValue(tenantKey, 300);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Refund>>({
    columnAccessor: "occurredAt",
    direction: "desc",
  });

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor as string] ?? "occurredAt";
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "refunds", page, debouncedTenantKey, sortBy, sortDir],
    queryFn: () =>
      billingApi.listRefunds({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedTenantKey ? { tenantKey: debouncedTenantKey } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<Refund>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleTenantKeyChange = (value: string) => {
    setTenantKey(value);
    setPage(1);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Refunds`]} />
      <PageHeader
        title={<Trans>Refunds</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Refunds</Trans> },
        ]}
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load refunds</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch refunds from the API.</Trans>{" "}
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
                <Trans>Refunds</Trans>
              </Text>
              {!isLoading && (
                <Badge
                  data-testid="badge-refunds-total-count"
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
                data-testid="input-refunds-tenant-key-filter"
                placeholder={t`Filter by tenant key…`}
                leftSection={<IconSearch size={14} />}
                value={tenantKey}
                onChange={(e) => handleTenantKeyChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 220 }}
                rightSection={
                  tenantKey ? (
                    <CloseButton
                      data-testid="button-refunds-tenant-key-clear"
                      size="xs"
                      onClick={() => handleTenantKeyChange("")}
                    />
                  ) : null
                }
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
                accessor: "amount",
                title: t`Amount`,
                sortable: true,
                render: (r) => (
                  <Text size="sm" fw={500}>
                    {(r.amount / 100).toFixed(2)} {r.currency.toUpperCase()}
                  </Text>
                ),
              },
              {
                accessor: "status",
                title: t`Status`,
                sortable: true,
                render: (r) => (
                  <Badge
                    data-testid={`badge-refund-status--${r.id}`}
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
                accessor: "occurredAt",
                title: t`Occurred At`,
                sortable: true,
                render: (r) => (
                  <Text size="sm">{dayjs(r.occurredAt).format("YYYY-MM-DD HH:mm")}</Text>
                ),
              },
              {
                accessor: "externalRefundId",
                title: t`External ID`,
                render: (r) => (
                  <Text size="xs" c="dimmed" ff="monospace">
                    {r.externalRefundId}
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
                        data-testid={`button-refund-view--${r.id}`}
                        size="sm"
                        variant="subtle"
                        color="blue"
                        component={Link}
                        to="/admin/refunds/$refundId"
                        params={{ refundId: r.id } as any}
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
                  Showing {rangeStart} – {rangeEnd} of {totalElements} refunds
                </Trans>
              </Text>
            </Group>
          </Box>
        </Paper>
      </Stack>
    </Container>
  );
}
