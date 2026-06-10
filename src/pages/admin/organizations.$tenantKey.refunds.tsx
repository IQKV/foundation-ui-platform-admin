import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Text,
  Stack,
  Group,
  TextInput,
  ActionIcon,
  Tooltip,
  Box,
  Button,
  Paper,
  Alert,
  Badge,
  CloseButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconSearch, IconAlertCircle, IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";
import type { AdminRefund, RefundSortField, SortDirection } from "@/shared/api";

export const Route = createFileRoute("/admin/organizations/$tenantKey/refunds")({
  component: OrganizationRefundsPage,
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

function OrganizationRefundsPage() {
  const { t } = useLingui();
  const { tenantKey } = Route.useParams();
  const [page, setPage] = useState(1);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<AdminRefund>>({
    columnAccessor: "occurredAt",
    direction: "desc",
  });

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "occurredAt";
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "refunds", "tenant", tenantKey, page, sortBy, sortDir],
    queryFn: () =>
      billingApi.listRefunds({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        tenantKey,
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<AdminRefund>) => {
    setSortStatus(next);
    setPage(1);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Stack gap="md" mt="md">
      {isError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load refunds</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch refunds for this organization.</Trans>{" "}
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
              <Badge variant="light" color="gray" size="sm" radius="sm">
                {totalElements}
              </Badge>
            )}
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
                <Badge color={getStatusColor(r.status)} variant="light" size="sm" radius="sm">
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
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart} – {rangeEnd} of {totalElements} refunds
            </Trans>
          </Text>
        </Box>
      </Paper>
    </Stack>
  );
}
