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
  Select,
  CloseButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconSearch, IconAlertCircle, IconFilter, IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";
import type { Subscription, SubscriptionSortField, SortDirection } from "@/shared/api";

export const Route = createFileRoute("/admin/organizations/$tenantKey/subscriptions")({
  component: OrganizationSubscriptionsPage,
});

const PAGE_SIZE = 20;

const SORT_FIELD_MAP: Record<string, SubscriptionSortField> = {
  tenantKey: "tenantKey",
  planId: "planId",
  status: "status",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "past_due", label: "Past Due" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
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

function OrganizationSubscriptionsPage() {
  const { t } = useLingui();
  const { tenantKey } = Route.useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Subscription>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "subscriptions",
      "tenant",
      tenantKey,
      page,
      debouncedSearch,
      statusFilter,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      billingApi.listSubscriptions({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        tenantKey,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<Subscription>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value);
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
          title={<Trans>Failed to load subscriptions</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch subscriptions for this organization.</Trans>{" "}
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
              <Trans>Subscriptions</Trans>
            </Text>
            {!isLoading && (
              <Badge variant="light" color="gray" size="sm" radius="sm">
                {totalElements}
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder={t`Search plan…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              size="xs"
              style={{ width: 180 }}
              rightSection={
                search ? <CloseButton size="xs" onClick={() => handleSearchChange("")} /> : null
              }
            />
            <Select
              placeholder={t`All statuses`}
              leftSection={<IconFilter size={14} />}
              data={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t`${o.label}` }))}
              value={statusFilter}
              onChange={handleStatusChange}
              size="xs"
              style={{ width: 150 }}
              clearable
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
              accessor: "planId",
              title: t`Plan`,
              sortable: true,
              render: (r) => (
                <Text size="sm" fw={500}>
                  {r.planId}
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
              accessor: "currentPeriodEnd",
              title: t`Period End`,
              render: (r) => (
                <Text size="sm">{dayjs(r.currentPeriodEnd).format("YYYY-MM-DD")}</Text>
              ),
            },
            {
              accessor: "createdAt",
              title: t`Created`,
              sortable: true,
              render: (r) => <Text size="sm">{dayjs(r.createdAt).format("YYYY-MM-DD")}</Text>,
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
                      to="/admin/subscriptions/$subscriptionId"
                      params={{ subscriptionId: r.id } as any}
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
              Showing {rangeStart} – {rangeEnd} of {totalElements} subscriptions
            </Trans>
          </Text>
        </Box>
      </Paper>
    </Stack>
  );
}
