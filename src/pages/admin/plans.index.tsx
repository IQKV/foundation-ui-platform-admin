import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
  TextInput,
  ActionIcon,
  Tooltip,
  Box,
  Paper,
  Skeleton,
  Alert,
  Badge,
  Select,
  CloseButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import { IconSearch, IconEye, IconRefresh, IconAlertCircle, IconFilter } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import type { Plan } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/plans/")({
  component: AdminPlansPage,
});

const PAGE_SIZE = 20;

type ActiveFilter = "active" | "inactive" | null;

function comparePlans(a: Plan, b: Plan, columnAccessor: string, direction: "asc" | "desc"): number {
  const dir = direction === "asc" ? 1 : -1;
  switch (columnAccessor) {
    case "priceMinor":
      return (a.priceMinor - b.priceMinor) * dir;
    case "active":
      return (Number(a.active) - Number(b.active)) * dir;
    case "planCode":
      return a.planCode.localeCompare(b.planCode) * dir;
    case "displayName":
      return a.displayName.localeCompare(b.displayName) * dir;
    case "billingPeriod":
      return a.billingPeriod.localeCompare(b.billingPeriod) * dir;
    case "currency":
      return a.currency.localeCompare(b.currency) * dir;
    case "scope":
      return a.scope.localeCompare(b.scope) * dir;
    case "updatedAt":
      return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
    case "createdAt":
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
    default:
      return a.planCode.localeCompare(b.planCode) * dir;
  }
}

function AdminPlansPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Plan>>({
    columnAccessor: "planCode",
    direction: "asc",
  });

  const hasActiveFilters = debouncedSearch !== "" || activeFilter !== null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => billingApi.listPlans(),
  });

  const filteredSorted = useMemo(() => {
    let rows = data ?? [];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      rows = rows.filter(
        (p) => p.planCode.toLowerCase().includes(q) || p.displayName.toLowerCase().includes(q),
      );
    }
    if (activeFilter === "active") {
      rows = rows.filter((p) => p.active);
    } else if (activeFilter === "inactive") {
      rows = rows.filter((p) => !p.active);
    }
    const sorted = [...rows].sort((a, b) =>
      comparePlans(a, b, String(sortStatus.columnAccessor), sortStatus.direction),
    );
    return sorted;
  }, [data, debouncedSearch, activeFilter, sortStatus]);

  const totalElements = filteredSorted.length;
  const pageRecords = useMemo(
    () => filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredSorted, page],
  );

  const handleSortChange = (next: DataTableSortStatus<Plan>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleActiveFilterChange = (value: string | null) => {
    setActiveFilter((value as ActiveFilter) ?? null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setActiveFilter(null);
    setPage(1);
  };

  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Plans`]} />
      <PageHeader
        title={<Trans>Plan catalog</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Plans</Trans> },
        ]}
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load plans</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch plans from the API.</Trans>{" "}
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
                <Trans>Plans</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder={t`Search by code or name…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 220 }}
                rightSection={
                  search ? <CloseButton size="xs" onClick={() => handleSearchChange("")} /> : null
                }
              />

              <Select
                placeholder={t`All plans`}
                leftSection={<IconFilter size={14} />}
                data={[
                  { value: "active", label: t`Active only` },
                  { value: "inactive", label: t`Inactive only` },
                ]}
                value={activeFilter}
                onChange={handleActiveFilterChange}
                clearable
                size="xs"
                style={{ width: 150 }}
              />

              {hasActiveFilters && (
                <Tooltip label={t`Clear filters`} withArrow>
                  <Button variant="subtle" color="gray" size="xs" onClick={handleClearFilters}>
                    <Trans>Clear</Trans>
                  </Button>
                </Tooltip>
              )}

              <Tooltip label={t`Refresh`} withArrow>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => void refetch()}
                  loading={isFetching}
                >
                  <IconRefresh size={15} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {isLoading ? (
            <Stack gap={0}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Box
                  key={i}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Group gap="sm">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Skeleton height={12} width="30%" radius="sm" />
                      <Skeleton height={10} width="20%" radius="sm" />
                    </Stack>
                    <Skeleton height={20} width={60} radius="xl" />
                    <Skeleton height={20} width={80} radius="xl" />
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : (
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              records={pageRecords}
              totalRecords={totalElements}
              recordsPerPage={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              fetching={isFetching && !isLoading}
              minHeight={300}
              noRecordsText={
                hasActiveFilters
                  ? t`No plans match the current filters`
                  : t`No plans in the catalog`
              }
              sortStatus={sortStatus}
              onSortStatusChange={handleSortChange}
              styles={{
                header: {
                  background: "var(--mantine-color-gray-0)",
                  fontSize: "var(--mantine-font-size-xs)",
                  fontWeight: 600,
                  color: "var(--mantine-color-gray-6)",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                },
              }}
              columns={[
                {
                  accessor: "planCode",
                  title: t`Code`,
                  sortable: true,
                  render: (plan) => (
                    <Text size="sm" fw={500} ff="monospace">
                      {plan.planCode}
                    </Text>
                  ),
                },
                {
                  accessor: "displayName",
                  title: t`Name`,
                  sortable: true,
                  render: (plan) => (
                    <Text size="sm" truncate="end" maw={220}>
                      {plan.displayName}
                    </Text>
                  ),
                },
                {
                  accessor: "billingPeriod",
                  title: t`Period`,
                  sortable: true,
                  render: (plan) => (
                    <Badge variant="light" color="gray" size="sm" radius="sm">
                      {plan.billingPeriod}
                    </Badge>
                  ),
                },
                {
                  accessor: "priceMinor",
                  title: t`Price (minor units)`,
                  sortable: true,
                  render: (plan) => (
                    <Text size="sm">
                      {(plan.priceMinor / 100).toFixed(2)} {plan.currency.toUpperCase()}
                    </Text>
                  ),
                },
                {
                  accessor: "scope",
                  title: t`Scope`,
                  sortable: true,
                  render: (plan) => (
                    <Badge variant="outline" color="blue" size="sm" radius="sm">
                      {plan.scope}
                    </Badge>
                  ),
                },
                {
                  accessor: "active",
                  title: t`Status`,
                  sortable: true,
                  render: (plan) => (
                    <Badge variant="dot" color={plan.active ? "green" : "gray"} size="sm">
                      {plan.active ? t`Active` : t`Inactive`}
                    </Badge>
                  ),
                },
                {
                  accessor: "updatedAt",
                  title: t`Updated`,
                  sortable: true,
                  render: (plan) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(plan.updatedAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  width: 80,
                  sortable: false,
                  render: (plan) => (
                    <Tooltip label={t`View plan`} withArrow>
                      <ActionIcon
                        component={Link}
                        variant="subtle"
                        color="gray"
                        size="sm"
                        to="/admin/plans/$planCode"
                        params={{ planCode: plan.planCode } as never}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  ),
                },
              ]}
            />
          )}
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} plans
            </Trans>
          </Text>
        )}
      </Stack>
    </Container>
  );
}
