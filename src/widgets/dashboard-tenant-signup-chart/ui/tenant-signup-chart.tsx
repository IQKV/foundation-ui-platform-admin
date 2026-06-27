import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Group, Select, SegmentedControl, Text, Skeleton, Alert, Box, Button } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { IconBuilding, IconArrowRight } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useLingui, Trans } from "@lingui/react/macro";
import { CardGroup } from "@/widgets/dashboard-card-group";
import { SubCard } from "@/widgets/dashboard-sub-card";
import { iamApi } from "@/shared/api";
import type { TenantUserStatsParams } from "@/shared/api/iam";

export function TenantSignupChartCard() {
  const { t } = useLingui();

  const [tenantSearch, setTenantSearch] = useState("");
  const [selectedTenantKey, setSelectedTenantKey] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<"day" | "month">("day");

  const { data: tenantsPage, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin", "tenants", "selector", tenantSearch],
    queryFn: () =>
      iamApi.listTenants({
        page: 0,
        size: 50,
        sortBy: "name",
        sortDir: "asc",
        status: "ACTIVE",
        ...(tenantSearch ? { search: tenantSearch } : {}),
      }),
    staleTime: 60_000,
  });

  const tenantOptions =
    tenantsPage?.content.map((t) => ({
      value: t.tenantKey,
      label: `${t.name} (${t.tenantKey})`,
    })) ?? [];

  const from = (() => {
    const d = new Date();
    if (granularity === "month") {
      d.setMonth(d.getMonth() - 11);
      d.setDate(1);
    } else {
      d.setDate(d.getDate() - 29);
    }
    return d.toISOString().slice(0, 10);
  })();

  const params: TenantUserStatsParams = { from, granularity };

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "tenant-stats", selectedTenantKey, granularity],
    queryFn: () => iamApi.getTenantUserStats(selectedTenantKey!, params),
    enabled: !!selectedTenantKey,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const isLoadingChart = statsLoading || isFetching;

  return (
    <CardGroup title={<Trans>Member Signup Trend</Trans>}>
      <SubCard>
        <Group justify="space-between" mb="md" wrap="wrap" gap="sm">
          <Select
            placeholder={tenantsLoading ? t`Loading organizations…` : t`Select an organization…`}
            data={tenantOptions}
            value={selectedTenantKey}
            onChange={setSelectedTenantKey}
            searchable
            onSearchChange={setTenantSearch}
            searchValue={tenantSearch}
            clearable
            leftSection={<IconBuilding size={14} />}
            size="xs"
            style={{ minWidth: 280 }}
            disabled={tenantsLoading}
            nothingFoundMessage={t`No organizations found`}
          />
          <SegmentedControl
            size="xs"
            value={granularity}
            onChange={(v) => setGranularity(v as "day" | "month")}
            data={[
              { label: t`Daily`, value: "day" },
              { label: t`Monthly`, value: "month" },
            ]}
            disabled={!selectedTenantKey}
          />
        </Group>

        {!selectedTenantKey && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            <Trans>Select an organization above to view its member signup trend.</Trans>
          </Text>
        )}

        {selectedTenantKey && statsError && (
          <Alert icon={<IconArrowRight size={16} />} color="red" variant="light">
            <Trans>Failed to load stats for the selected organization.</Trans>
          </Alert>
        )}

        {selectedTenantKey && isLoadingChart && !statsError && (
          <Skeleton height={220} radius="sm" />
        )}

        {selectedTenantKey && !isLoadingChart && !statsError && stats && (
          <>
            <AreaChart
              h={220}
              data={stats.signupSeries}
              dataKey="period"
              series={[{ name: "signups", color: "violet.6", label: t`New signups` }]}
              curveType="monotone"
              withTooltip
              withXAxis
              withYAxis
              yAxisProps={{ allowDecimals: false }}
              tooltipAnimationDuration={150}
              gridAxis="y"
            />

            <Group gap="xl" mt="md" justify="center" wrap="wrap">
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Total members</Trans>
                </Text>
                <Text size="sm" fw={700}>
                  {stats.totalMembers.toLocaleString()}
                </Text>
              </Box>
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Active</Trans>
                </Text>
                <Text size="sm" fw={700} c="green">
                  {stats.activeMembers.toLocaleString()}
                </Text>
              </Box>
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Locked</Trans>
                </Text>
                <Text size="sm" fw={700} c="orange">
                  {stats.lockedMembers.toLocaleString()}
                </Text>
              </Box>
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Suspended</Trans>
                </Text>
                <Text size="sm" fw={700} c="red">
                  {stats.suspendedMembers.toLocaleString()}
                </Text>
              </Box>
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Email verified</Trans>
                </Text>
                <Text size="sm" fw={700} c="blue">
                  {stats.emailVerifiedCount.toLocaleString()}
                </Text>
              </Box>
              <Box ta="center">
                <Text size="xs" c="dimmed">
                  <Trans>Period</Trans>
                </Text>
                <Text size="sm" fw={700} c="dimmed">
                  {stats.periodFrom} → {stats.periodTo}
                </Text>
              </Box>
            </Group>
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
      </SubCard>
    </CardGroup>
  );
}
