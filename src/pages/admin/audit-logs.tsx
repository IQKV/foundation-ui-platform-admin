import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
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
  Alert,
  Badge,
  Code,
  ScrollArea,
  Modal,
  Grid,
  SimpleGrid,
  Title,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconEye,
  IconRefresh,
  IconAlertCircle,
  IconActivity,
  IconCalendar,
  IconUser,
  IconNetwork,
  IconDevices,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { auditApi } from "@/shared/api";
import type { AuditRecord, AuditActionCount, SortDirection } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/audit-logs")({
  component: AdminAuditLogsPage,
});

const PAGE_SIZE = 20;

function SeverityBadge({ severity }: { severity: AuditRecord["severity"] }) {
  const colors = {
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "orange",
    CRITICAL: "red",
  };
  return (
    <Badge variant="light" color={colors[severity]} size="sm" radius="sm">
      {severity}
    </Badge>
  );
}

function AdminAuditLogsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [tenantKey, setTenantKey] = useState("");
  const [debouncedTenantKey] = useDebouncedValue(tenantKey, 300);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<AuditRecord>>({
    columnAccessor: "occurredAt",
    direction: "desc",
  });

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);

  const sortBy = sortStatus.columnAccessor;
  const sortDir = sortStatus.direction as SortDirection;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "audit-logs", page, debouncedTenantKey, sortBy, sortDir],
    queryFn: () =>
      auditApi.listRecords({
        page: page - 1,
        size: PAGE_SIZE,
        tenantKey: debouncedTenantKey || undefined,
        sortBy,
        sortDir,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin", "audit-stats", debouncedTenantKey],
    queryFn: () => auditApi.getActionStats(debouncedTenantKey || undefined),
  });

  const handleSortChange = (next: DataTableSortStatus<AuditRecord>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleViewDetails = (record: AuditRecord) => {
    setSelectedRecord(record);
    openDetails();
  };

  const totalElements = data?.totalElements ?? 0;

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Audit Logs`)}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Audit Logs</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Audit Logs</Trans> },
        ]}
        toolbar={
          <Button
            variant="light"
            leftSection={<IconRefresh size={16} />}
            onClick={() => void refetch()}
            loading={isFetching}
          >
            <Trans>Refresh</Trans>
          </Button>
        }
      />

      <Stack gap="md">
        {/* Stats Section */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {stats?.slice(0, 4).map((stat: AuditActionCount) => (
            <Paper key={stat.action} withBorder p="md" radius="md">
              <Group justify="space-between">
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  {stat.action}
                </Text>
                <IconActivity size={16} color="var(--mantine-color-blue-6)" />
              </Group>
              <Group align="flex-end" gap="xs" mt="xs">
                <Text size="xl" fw={700}>
                  {stat.count}
                </Text>
                <Text size="xs" c="dimmed" pb={3}>
                  <Trans>total events</Trans>
                </Text>
              </Group>
            </Paper>
          ))}
          {(!stats || stats.length === 0) && (
            <Paper withBorder p="md" radius="md" style={{ gridColumn: "1 / -1" }}>
              <Text size="sm" c="dimmed" ta="center">
                <Trans>No event statistics available</Trans>
              </Text>
            </Paper>
          )}
        </SimpleGrid>

        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load audit logs</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch audit records from the API.</Trans>
          </Alert>
        )}

        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Group gap="xs">
              <Text fw={600} size="sm">
                <Trans>Activity History</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder={t`Filter by tenant key…`}
                size="xs"
                value={tenantKey}
                onChange={(e) => {
                  setTenantKey(e.currentTarget.value);
                  setPage(1);
                }}
                leftSection={<IconSearch size={14} />}
                rightSection={
                  tenantKey ? (
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="gray"
                      onClick={() => setTenantKey("")}
                    >
                      <IconRefresh size={12} />
                    </ActionIcon>
                  ) : null
                }
              />
            </Group>
          </Group>

          <DataTable
            minHeight={160}
            fetching={isLoading}
            records={data?.content}
            columns={[
              {
                accessor: "occurredAt",
                title: t`Timestamp`,
                sortable: true,
                width: 180,
                render: (record) => (
                  <Group gap="xs" wrap="nowrap">
                    <IconCalendar size={14} color="gray" />
                    <Text size="xs">{dayjs(record.occurredAt).format("YYYY-MM-DD HH:mm:ss")}</Text>
                  </Group>
                ),
              },
              {
                accessor: "action",
                title: t`Action`,
                sortable: true,
                render: (record) => (
                  <Text size="xs" fw={500}>
                    {record.action}
                  </Text>
                ),
              },
              {
                accessor: "tenantKey",
                title: t`Tenant`,
                sortable: true,
                render: (record) => (
                  <Code color="blue.0" c="blue.8">
                    {record.tenantKey || "PLATFORM"}
                  </Code>
                ),
              },
              {
                accessor: "actorEmail",
                title: t`Actor`,
                render: (record) => (
                  <Group gap="xs" wrap="nowrap">
                    <IconUser size={14} color="gray" />
                    <Text size="xs">{record.actorEmail || record.actorId || t`System`}</Text>
                  </Group>
                ),
              },
              {
                accessor: "severity",
                title: t`Severity`,
                sortable: true,
                render: (record) => <SeverityBadge severity={record.severity} />,
              },
              {
                accessor: "actions",
                title: "",
                textAlign: "right",
                render: (record) => (
                  <Group gap={4} justify="flex-end" wrap="nowrap">
                    <Tooltip label={t`View details`}>
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="blue"
                        onClick={() => handleViewDetails(record)}
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                ),
              },
            ]}
            totalRecords={totalElements}
            recordsPerPage={PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            sortStatus={sortStatus}
            onSortStatusChange={handleSortChange}
            highlightOnHover
            verticalSpacing="xs"
            horizontalSpacing="md"
            loaderType="bars"
          />
        </Paper>
      </Stack>

      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title={
          <Group gap="xs">
            <IconActivity size={18} />
            <Text fw={600}>{t`Audit Record Details`}</Text>
          </Group>
        }
        size="lg"
      >
        {selectedRecord && (
          <Stack gap="md">
            <Paper withBorder p="md" radius="md" bg="var(--mantine-color-gray-0)">
              <Grid gutter="md">
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    <Trans>Action</Trans>
                  </Text>
                  <Text size="sm" fw={600}>
                    {selectedRecord.action}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    <Trans>Severity</Trans>
                  </Text>
                  <SeverityBadge severity={selectedRecord.severity} />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    <Trans>Timestamp</Trans>
                  </Text>
                  <Text size="sm">
                    {dayjs(selectedRecord.occurredAt).format("YYYY-MM-DD HH:mm:ss.SSS")}
                  </Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    <Trans>Tenant Key</Trans>
                  </Text>
                  <Code color="blue.0" c="blue.8">
                    {selectedRecord.tenantKey || "PLATFORM"}
                  </Code>
                </Grid.Col>
              </Grid>
            </Paper>

            <Title order={6}>
              <Trans>Actor Information</Trans>
            </Title>
            <SimpleGrid cols={2}>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  <Trans>ID / Email</Trans>
                </Text>
                <Text size="sm">{selectedRecord.actorEmail || selectedRecord.actorId || "—"}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  <Trans>Actor Type</Trans>
                </Text>
                <Text size="sm">{selectedRecord.actorType || "—"}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={4}>
                  <IconNetwork size={14} color="gray" />
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    <Trans>IP Address</Trans>
                  </Text>
                </Group>
                <Text size="sm">{selectedRecord.actorIp || "—"}</Text>
              </Stack>
              <Stack gap={4}>
                <Group gap={4}>
                  <IconDevices size={14} color="gray" />
                  <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                    <Trans>User Agent</Trans>
                  </Text>
                </Group>
                <Text size="sm" style={{ wordBreak: "break-all" }}>
                  {selectedRecord.actorUa || "—"}
                </Text>
              </Stack>
            </SimpleGrid>

            <Title order={6}>
              <Trans>Technical Context</Trans>
            </Title>
            <SimpleGrid cols={2}>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  <Trans>Entity Type</Trans>
                </Text>
                <Text size="sm">{selectedRecord.entityType || "—"}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  <Trans>Entity ID</Trans>
                </Text>
                <Text size="sm">{selectedRecord.entityId || "—"}</Text>
              </Stack>
              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                  <Trans>Correlation ID</Trans>
                </Text>
                <Text size="sm" style={{ wordBreak: "break-all" }}>
                  {selectedRecord.correlationId || "—"}
                </Text>
              </Stack>
            </SimpleGrid>

            <Title order={6}>
              <Trans>Event Payload</Trans>
            </Title>
            <ScrollArea.Autosize mah={300} type="always">
              <Code block style={{ width: "100%" }}>
                {JSON.stringify(selectedRecord.details, null, 2)}
              </Code>
            </ScrollArea.Autosize>

            <Group justify="flex-end" mt="md">
              <Button onClick={closeDetails}>
                <Trans>Close</Trans>
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
