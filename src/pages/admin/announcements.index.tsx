import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Button,
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
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import {
  IconEdit,
  IconRefresh,
  IconAlertCircle,
  IconFilter,
  IconPlus,
  IconTrash,
  IconSpeakerphone,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi } from "@/shared/api";
import type { SiteAnnouncement, SiteAnnouncementStatus } from "@/shared/api";
import { AnnouncementStatusBadge, PageHeader } from "@/shared/ui";
import {
  CreateAnnouncementModal,
  EditAnnouncementModal,
  DeleteAnnouncementModal,
} from "@/features/announcement-admin";

export const Route = createFileRoute("/admin/announcements/")({
  component: AdminAnnouncementsPage,
});

const PAGE_SIZE = 20;

const STATUS_OPTIONS: { value: SiteAnnouncementStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "PUBLISHING", label: "Publishing" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FAILED", label: "Failed" },
];

const TYPE_COLOR: Record<string, string> = {
  INFO: "blue",
  WARNING: "orange",
  MAINTENANCE: "violet",
  FEATURE: "teal",
  SECURITY: "red",
};

function AdminAnnouncementsPage() {
  const { t } = useLingui();

  // ─── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ─── Filters ────────────────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<SiteAnnouncementStatus | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  // ─── Modal state ────────────────────────────────────────────────────────────
  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<SiteAnnouncement | null>(null);

  const hasActiveFilters = statusFilter !== null || typeFilter !== null;

  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "announcements", page, statusFilter, typeFilter],
    queryFn: () => iamApi.listAnnouncements({ limit: PAGE_SIZE, offset }),
  });

  // Client-side type filter (backend doesn't support it yet)
  const filteredItems = (data?.items ?? []).filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const totalElements =
    statusFilter || typeFilter ? filteredItems.length : (data?.totalElements ?? 0);

  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  const handleEdit = (announcement: SiteAnnouncement) => {
    setSelectedAnnouncement(announcement);
    openEdit();
  };

  const handleDelete = (announcement: SiteAnnouncement) => {
    setSelectedAnnouncement(announcement);
    openDelete();
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setSelectedAnnouncement(null), 300);
  };

  const handleCloseDelete = () => {
    closeDelete();
    setTimeout(() => setSelectedAnnouncement(null), 300);
  };

  const handleStatusChange = (value: string | null) => {
    setStatusFilter(value as SiteAnnouncementStatus | null);
    setPage(1);
  };

  const handleTypeChange = (value: string | null) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setPage(1);
  };

  const typeOptions = ["INFO", "WARNING", "MAINTENANCE", "FEATURE", "SECURITY"].map((v) => ({
    value: v,
    label: v.charAt(0) + v.slice(1).toLowerCase(),
  }));

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Announcements`)}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Site Announcements</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Platform</Trans> },
          { label: <Trans>Announcements</Trans> },
        ]}
        toolbar={
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={openCreate}>
            <Trans>New announcement</Trans>
          </Button>
        }
      />

      <Stack gap="md">
        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load announcements</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch announcements from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        <Paper style={{ overflow: "hidden" }}>
          {/* ─── Toolbar ──────────────────────────────────────────────────── */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
          >
            <Group gap="xs">
              <Text fw={600} size="sm">
                <Trans>Announcements</Trans>
              </Text>
              {!isLoading && (
                <Badge variant="light" color="gray" size="sm" radius="sm">
                  {data?.totalElements ?? 0}
                </Badge>
              )}
            </Group>

            <Group gap="xs">
              <Select
                placeholder={t`All types`}
                leftSection={<IconFilter size={14} />}
                data={typeOptions}
                value={typeFilter}
                onChange={handleTypeChange}
                clearable
                size="xs"
                style={{ width: 150 }}
                rightSection={
                  typeFilter ? (
                    <CloseButton size="xs" onClick={() => handleTypeChange(null)} />
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

          {/* ─── Skeleton ─────────────────────────────────────────────────── */}
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
                      <Skeleton height={12} width="40%" radius="sm" />
                      <Skeleton height={10} width="25%" radius="sm" />
                    </Stack>
                    <Skeleton height={20} width={70} radius="xl" />
                    <Skeleton height={20} width={80} radius="xl" />
                  </Group>
                </Box>
              ))}
            </Stack>
          ) : (
            /* ─── Data table ──────────────────────────────────────────────── */
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              records={filteredItems}
              totalRecords={totalElements}
              recordsPerPage={PAGE_SIZE}
              page={page}
              onPageChange={setPage}
              fetching={isFetching && !isLoading}
              minHeight={300}
              idAccessor="id"
              noRecordsText={
                hasActiveFilters
                  ? t`No announcements match the current filters`
                  : t`No announcements found`
              }
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
                  accessor: "type",
                  title: t`Announcement`,
                  render: (announcement) => {
                    const enTranslation = announcement.translations.find(
                      (tr) => tr.locale === "en-US",
                    );
                    const typeColor = TYPE_COLOR[announcement.type] ?? "gray";
                    return (
                      <Group gap="sm" wrap="nowrap">
                        <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: `var(--mantine-color-${typeColor}-1)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <IconSpeakerphone
                            size={18}
                            color={`var(--mantine-color-${typeColor}-6)`}
                          />
                        </Box>
                        <Stack gap={1}>
                          <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                            {enTranslation?.title ?? t`(no title)`}
                          </Text>
                          <Text size="xs" c="dimmed" lineClamp={1} maw={320}>
                            {enTranslation?.message ?? "—"}
                          </Text>
                        </Stack>
                      </Group>
                    );
                  },
                },
                {
                  accessor: "type",
                  title: t`Type`,
                  render: (announcement) => (
                    <Badge
                      color={TYPE_COLOR[announcement.type] ?? "gray"}
                      variant="light"
                      size="sm"
                    >
                      {announcement.type}
                    </Badge>
                  ),
                },
                {
                  accessor: "status",
                  title: t`Status`,
                  render: (announcement) => (
                    <AnnouncementStatusBadge status={announcement.status} />
                  ),
                },
                {
                  accessor: "translations",
                  title: t`Locales`,
                  render: (announcement) => (
                    <Group gap={4} wrap="wrap">
                      {announcement.translations.map((tr) => (
                        <Badge key={tr.locale} variant="outline" color="gray" size="xs" radius="sm">
                          {tr.locale}
                        </Badge>
                      ))}
                    </Group>
                  ),
                },
                {
                  accessor: "createdAt",
                  title: t`Created`,
                  render: (announcement) => (
                    <Text size="sm" c="dimmed">
                      {dayjs(announcement.createdAt).format("MMM D, YYYY")}
                    </Text>
                  ),
                },
                {
                  accessor: "actions",
                  title: "",
                  textAlign: "right",
                  render: (announcement) => {
                    const isDeletable = ["DRAFT", "FAILED"].includes(announcement.status);
                    return (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        <Tooltip label={t`Edit announcement`} withArrow>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(announcement);
                            }}
                          >
                            <IconEdit size={15} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip
                          label={
                            isDeletable
                              ? t`Delete announcement`
                              : t`Cannot delete a published or in-progress announcement`
                          }
                          withArrow
                        >
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            disabled={!isDeletable}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(announcement);
                            }}
                          >
                            <IconTrash size={15} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    );
                  },
                },
              ]}
            />
          )}
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} announcements
            </Trans>
          </Text>
        )}
      </Stack>

      <CreateAnnouncementModal opened={createOpened} onClose={closeCreate} />
      <EditAnnouncementModal
        announcement={selectedAnnouncement}
        opened={editOpened}
        onClose={handleCloseEdit}
      />
      <DeleteAnnouncementModal
        announcement={selectedAnnouncement}
        opened={deleteOpened}
        onClose={handleCloseDelete}
      />
    </Container>
  );
}
