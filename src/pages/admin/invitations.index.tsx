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
  Skeleton,
  Alert,
  Badge,
  Select,
  CloseButton,
  Code,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable, type DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconEdit,
  IconRefresh,
  IconAlertCircle,
  IconFilter,
  IconMail,
  IconPlus,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi } from "@/shared/api";
import type {
  IamInvitation,
  IamInvitationSortField,
  IamInvitationStatus,
  SortDirection,
} from "@/shared/api";
import { InvitationStatusBadge, PageHeader } from "@/shared/ui";
import { EditInvitationModal, ProposeInvitationModal } from "@/features/invitation-admin";

export const Route = createFileRoute("/admin/invitations/")({
  component: AdminInvitationsPage,
});

const PAGE_SIZE = 20;

const SORT_FIELD_MAP: Record<string, IamInvitationSortField> = {
  email: "email",
  tenantKey: "tenantKey",
  status: "status",
  expiresAt: "expiresAt",
  updatedAt: "updatedAt",
  createdAt: "createdAt",
};

const STATUS_OPTIONS: { value: IamInvitationStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REVOKED", label: "Revoked" },
  { value: "EXPIRED", label: "Expired" },
];

function AdminInvitationsPage() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [tenantKeyFilter, setTenantKeyFilter] = useState("");
  const [debouncedTenantKey] = useDebouncedValue(tenantKeyFilter, 300);
  const [statusFilter, setStatusFilter] = useState<IamInvitationStatus | null>(null);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IamInvitation>>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [proposeModalOpened, { open: openProposeModal, close: closeProposeModal }] =
    useDisclosure(false);
  const [selectedInvitation, setSelectedInvitation] = useState<IamInvitation | null>(null);

  const sortBy = SORT_FIELD_MAP[sortStatus.columnAccessor] ?? "createdAt";
  const sortDir = sortStatus.direction as SortDirection;

  const hasActiveFilters =
    debouncedSearch !== "" || debouncedTenantKey !== "" || statusFilter !== null;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "invitations",
      page,
      debouncedSearch,
      debouncedTenantKey,
      statusFilter,
      sortBy,
      sortDir,
    ],
    queryFn: () =>
      iamApi.listInvitations({
        page: page - 1,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(debouncedTenantKey ? { tenantKey: debouncedTenantKey } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
  });

  const handleSortChange = (next: DataTableSortStatus<IamInvitation>) => {
    setSortStatus(next);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTenantKeyChange = (value: string) => {
    setTenantKeyFilter(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value as IamInvitationStatus | null);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setTenantKeyFilter("");
    setStatusFilter(null);
    setPage(1);
  };

  const handleEdit = (invitation: IamInvitation) => {
    setSelectedInvitation(invitation);
    openEditModal();
  };

  const handleCloseEdit = () => {
    closeEditModal();
    setTimeout(() => setSelectedInvitation(null), 300);
  };

  const totalElements = data?.totalElements ?? 0;
  const rangeStart = totalElements === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalElements);

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Invitations`)}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Invitations</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Invitations</Trans> },
        ]}
        toolbar={
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={openProposeModal}>
            <Trans>Propose invitation</Trans>
          </Button>
        }
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load invitations</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch invitations from the API.</Trans>{" "}
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
                <Trans>Invitations</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {totalElements}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <TextInput
                placeholder={t`Search by email…`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(e) => handleSearchChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 200 }}
                rightSection={
                  search ? <CloseButton size="xs" onClick={() => handleSearchChange("")} /> : null
                }
              />

              <TextInput
                placeholder={t`Tenant key…`}
                value={tenantKeyFilter}
                onChange={(e) => handleTenantKeyChange(e.currentTarget.value)}
                size="xs"
                style={{ width: 140 }}
                rightSection={
                  tenantKeyFilter ? (
                    <CloseButton size="xs" onClick={() => handleTenantKeyChange("")} />
                  ) : null
                }
              />

              <Select
                placeholder={t`All statuses`}
                leftSection={<IconFilter size={14} />}
                data={STATUS_OPTIONS.map((o) => ({ value: o.value, label: t`${o.label}` }))}
                value={statusFilter}
                onChange={handleStatusChange}
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
                    <Skeleton circle height={36} width={36} />
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Skeleton height={12} width="30%" radius="sm" />
                      <Skeleton height={10} width="20%" radius="sm" />
                    </Stack>
                    <Skeleton height={20} width={60} radius="xl" />
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : (
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              records={data?.content ?? []}
              totalRecords={totalElements}
              recordsPerPage={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              fetching={isFetching && !isLoading}
              minHeight={300}
              idAccessor="invitationId"
              noRecordsText={
                hasActiveFilters
                  ? t`No invitations match the current filters`
                  : t`No invitations found`
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
                  accessor: "email",
                  title: t`Invitee`,
                  sortable: true,
                  render: (invitation) => (
                    <Group gap="sm" wrap="nowrap">
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--mantine-color-violet-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <IconMail size={18} color="var(--mantine-color-violet-6)" />
                      </Box>
                      <Stack gap={1}>
                        <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                          {invitation.email}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {invitation.authority}
                        </Text>
                      </Stack>
                    </Group>
                  ),
                },
                {
                  accessor: "tenantKey",
                  title: t`Tenant`,
                  sortable: true,
                  render: (invitation) => (
                    <Code
                      style={{
                        fontSize: "var(--mantine-font-size-xs)",
                        lineHeight: 1.3,
                        padding: "0 4px",
                      }}
                    >
                      {invitation.tenantKey}
                    </Code>
                  ),
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  sortable: true,
                  render: (invitation) => <InvitationStatusBadge status={invitation.status} />,
                },
                {
                  accessor: "expiresAt",
                  title: t`Expires`,
                  sortable: true,
                  render: (invitation) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(invitation.expiresAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: t`Created`,
                  sortable: true,
                  render: (invitation) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(invitation.createdAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  textAlign: "right",
                  render: (invitation) => (
                    <Group gap={4} justify="flex-end" wrap="nowrap">
                      <Tooltip label={t`View / manage invitation`} withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(invitation);
                          }}
                        >
                          <IconEdit size={15} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ),
                },
              ]}
            />
          )}
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} invitations
            </Trans>
          </Text>
        )}
      </Stack>

      <EditInvitationModal
        invitation={selectedInvitation}
        opened={editModalOpened}
        onClose={handleCloseEdit}
      />
      <ProposeInvitationModal opened={proposeModalOpened} onClose={closeProposeModal} />
    </Container>
  );
}
