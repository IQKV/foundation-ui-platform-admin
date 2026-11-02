import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
  SimpleGrid,
  Card,
  Pagination,
  SegmentedControl,
  Center,
  Image,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import {
  IconSearch,
  IconEdit,
  IconEye,
  IconRefresh,
  IconAlertCircle,
  IconFilter,
  IconPlus,
  IconTrash,
  IconBuildingStore,
  IconLayoutList,
  IconLayoutGrid,
  IconMapPin,
  IconDatabase,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { catalogApi } from "@/shared/api";
import type { MasterVenue } from "@/entities";
import { PageHeader } from "@/shared/ui";
import {
  CreateMasterVenueModal,
  EditMasterVenueModal,
  DeleteMasterVenueModal,
} from "@/features/master-venue-admin";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/admin/master-catalog/")({
  component: AdminMasterCatalogPage,
});

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function confidenceColor(value: number | null): string {
  if (value === null) return "gray";
  const pct = Math.round(value * 100);
  return pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null) return <Text size="xs" c="dimmed">—</Text>;
  const pct = Math.round(value * 100);
  return (
    <Badge variant="light" color={confidenceColor(value)} size="sm">
      {pct}%
    </Badge>
  );
}

// ── Venue thumbnail ───────────────────────────────────────────────────────────

function VenueThumbnail({ url, name, size = 40 }: { url: string | null; name: string; size?: number }) {
  if (url) {
    return (
      <Box
        style={{
          width: size,
          height: size,
          borderRadius: "var(--mantine-radius-sm)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Image
          src={url}
          alt={name}
          w={size}
          h={size}
          style={{ objectFit: "cover", display: "block" }}
        />
      </Box>
    );
  }
  return (
    <ThemeIcon
      size={size}
      radius="sm"
      variant="light"
      color="gray"
      style={{ flexShrink: 0 }}
    >
      <IconBuildingStore size={Math.round(size * 0.5)} />
    </ThemeIcon>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────

interface VenueCardProps {
  venue: MasterVenue;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function VenueCard({ venue, onView, onEdit, onDelete }: VenueCardProps) {
  const { t } = useLingui();
  const color = confidenceColor(venue.confidence);

  return (
    <Card
      shadow="xs"
      radius="md"
      padding={0}
      withBorder
      style={{ overflow: "hidden", cursor: "default" }}
    >
      {/* confidence accent bar */}
      <Box
        style={{
          height: 3,
          background: `var(--mantine-color-${color}-5)`,
          opacity: venue.confidence === null ? 0.15 : 0.7,
        }}
      />

      <Stack gap={0} p="md">
        {/* thumbnail + name */}
        <Group gap="sm" wrap="nowrap" align="flex-start" mb="xs">
          <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} size={48} />
          <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
            <Text size="sm" fw={600} lineClamp={2} lh={1.3}>
              {venue.name}
            </Text>
            {(venue.city ?? venue.address) && (
              <Group gap={4} wrap="nowrap">
                <IconMapPin size={11} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {venue.city
                    ? `${venue.city}${venue.address ? ` · ${venue.address}` : ""}`
                    : venue.address}
                </Text>
              </Group>
            )}
          </Stack>
        </Group>

        {/* badges */}
        <Group gap={6} wrap="wrap" mb="sm">
          <Badge variant="light" color="blue" size="xs" tt="uppercase" style={{ letterSpacing: "0.03em" }}>
            {venue.source}
          </Badge>
          <ConfidenceBadge value={venue.confidence} />
          <Text size="xs" c="dimmed" style={{ marginLeft: "auto" }}>
            {dayjs(venue.updatedAt).format("MMM D, YYYY")}
          </Text>
        </Group>

        {/* actions */}
        <Group
          gap={4}
          justify="flex-end"
          pt="xs"
          style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}
        >
          <Tooltip label={t`View record`} withArrow>
            <ActionIcon
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_VIEW(venue.id)}
              variant="subtle"
              color="gray"
              size="sm"
              onClick={onView}
            >
              <IconEye size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t`Edit record`} withArrow>
            <ActionIcon
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_EDIT(venue.id)}
              variant="subtle"
              color="blue"
              size="sm"
              onClick={onEdit}
            >
              <IconEdit size={15} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t`Delete record`} withArrow>
            <ActionIcon
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DELETE(venue.id)}
              variant="subtle"
              color="red"
              size="sm"
              onClick={onDelete}
            >
              <IconTrash size={15} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Stack>
    </Card>
  );
}

// ── Grid skeleton ─────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} shadow="xs" radius="md" padding={0} withBorder style={{ overflow: "hidden" }}>
          <Skeleton height={3} radius={0} />
          <Stack gap="xs" p="md">
            <Group gap="sm" wrap="nowrap">
              <Skeleton width={48} height={48} radius="sm" style={{ flexShrink: 0 }} />
              <Stack gap={4} style={{ flex: 1 }}>
                <Skeleton height={12} width="70%" radius="sm" />
                <Skeleton height={10} width="50%" radius="sm" />
              </Stack>
            </Group>
            <Group gap={6}>
              <Skeleton height={18} width={60} radius="xl" />
              <Skeleton height={18} width={44} radius="xl" />
            </Group>
          </Stack>
        </Card>
      ))}
    </SimpleGrid>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = "table" | "grid";

function AdminMasterCatalogPage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [selectedVenue, setSelectedVenue] = useState<MasterVenue | null>(null);

  const hasActiveFilters = debouncedSearch !== "" || cityFilter !== null;
  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "master-venues", page, debouncedSearch, cityFilter],
    queryFn: () =>
      catalogApi.listMasterVenues({
        search: debouncedSearch || undefined,
        city: cityFilter || undefined,
        limit: PAGE_SIZE,
        offset,
      }),
  });

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = Math.ceil(totalElements / PAGE_SIZE);
  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  // shortcut: city options come from the loaded page only (no city-list endpoint); upgrade when one exists.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    items.forEach((venue) => {
      if (venue.city) cities.add(venue.city);
    });
    if (cityFilter) cities.add(cityFilter);
    return [...cities].sort().map((city) => ({ value: city, label: city }));
  }, [items, cityFilter]);

  const handleEdit = (venue: MasterVenue) => {
    setSelectedVenue(venue);
    openEdit();
  };

  const handleDelete = (venue: MasterVenue) => {
    setSelectedVenue(venue);
    openDelete();
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setSelectedVenue(null), 300);
  };

  const handleCloseDelete = () => {
    closeDelete();
    setTimeout(() => setSelectedVenue(null), 300);
  };

  const handleClearFilters = () => {
    setSearch("");
    setCityFilter(null);
    setPage(1);
  };

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Master Catalog`]} />
      <PageHeader
        title={<Trans>Master Venue Catalog</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Catalog</Trans> },
          { label: <Trans>Master Catalog</Trans> },
        ]}
        toolbar={
          <Button
            data-testid={TestSelectors.BUTTON.MASTER_CATALOG_CREATE}
            leftSection={<IconPlus size={16} />}
            size="sm"
            onClick={openCreate}
          >
            <Trans>New venue</Trans>
          </Button>
        }
      />

      <Stack gap="md">
        {/* ── Catalog context strip ────────────────────────────────────── */}
        <Paper shadow="xs" radius="md" p="md" withBorder>
          <Group gap="md" wrap="nowrap" align="flex-start">
            <ThemeIcon size={40} radius="md" variant="light" color="blue" style={{ flexShrink: 0 }}>
              <IconDatabase size={20} />
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="sm" fw={600}>
                <Trans>Platform-owned reference dataset</Trans>
              </Text>
              <Text size="xs" c="dimmed" lh={1.5}>
                <Trans>
                  Records are ingested and enriched automatically by the catalog worker. Use this
                  view to inspect, correct, or manually add catalog entries.
                </Trans>
              </Text>
            </Stack>
            {!isLoading && (
              <Badge
                data-testid={TestSelectors.BADGE.MASTER_CATALOG_TOTAL_COUNT}
                variant="light"
                color="blue"
                size="lg"
                radius="sm"
                style={{ flexShrink: 0, marginLeft: "auto" }}
              >
                {totalElements.toLocaleString()}
              </Badge>
            )}
          </Group>
        </Paper>

        {isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load master venues</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch master venues from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        {/* ── Records panel ────────────────────────────────────────────── */}
        <Paper shadow="xs" radius="md" withBorder style={{ overflow: "hidden" }}>
          {/* toolbar */}
          <Group
            justify="space-between"
            align="center"
            px="md"
            py="sm"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
            <Text fw={600} size="sm" c="dimmed" tt="uppercase" lts={0.04} style={{ fontSize: 11 }}>
              <Trans>Records</Trans>
            </Text>

            <Group gap="xs">
              <Select
                data-testid={TestSelectors.SELECT.MASTER_CATALOG_CITY_FILTER}
                placeholder={t`All cities`}
                leftSection={<IconFilter size={14} />}
                data={cityOptions}
                value={cityFilter}
                onChange={(value) => {
                  setCityFilter(value);
                  setPage(1);
                }}
                searchable
                clearable
                size="xs"
                style={{ width: 180 }}
              />

              <TextInput
                data-testid={TestSelectors.INPUT.MASTER_CATALOG_SEARCH}
                placeholder={t`Search name, address or city`}
                leftSection={<IconSearch size={14} />}
                value={search}
                onChange={(event) => {
                  setSearch(event.currentTarget.value);
                  setPage(1);
                }}
                size="xs"
                style={{ width: 240 }}
                rightSection={
                  search ? (
                    <CloseButton
                      size="xs"
                      data-testid={TestSelectors.BUTTON.MASTER_CATALOG_SEARCH_CLEAR}
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                    />
                  ) : null
                }
              />

              {hasActiveFilters && (
                <Tooltip label={t`Clear filters`} withArrow>
                  <Button
                    data-testid={TestSelectors.BUTTON.MASTER_CATALOG_CLEAR_FILTERS}
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={handleClearFilters}
                  >
                    <Trans>Clear</Trans>
                  </Button>
                </Tooltip>
              )}

              <Tooltip label={t`Refresh`} withArrow>
                <ActionIcon
                  data-testid={TestSelectors.BUTTON.MASTER_CATALOG_REFRESH}
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => void refetch()}
                  loading={isFetching}
                >
                  <IconRefresh size={15} />
                </ActionIcon>
              </Tooltip>

              <SegmentedControl
                size="xs"
                value={viewMode}
                onChange={(v) => setViewMode(v as ViewMode)}
                data={[
                  {
                    value: "table",
                    label: (
                      <Center>
                        <Tooltip label={t`Table view`} withArrow>
                          <IconLayoutList size={14} />
                        </Tooltip>
                      </Center>
                    ),
                  },
                  {
                    value: "grid",
                    label: (
                      <Center>
                        <Tooltip label={t`Grid view`} withArrow>
                          <IconLayoutGrid size={14} />
                        </Tooltip>
                      </Center>
                    ),
                  },
                ]}
              />
            </Group>
          </Group>

          {/* ── Table view ──────────────────────────────────────────────── */}
          {viewMode === "table" && (
            <>
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
                        <Skeleton width={40} height={40} radius="sm" />
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Skeleton height={12} width="40%" radius="sm" />
                          <Skeleton height={10} width="25%" radius="sm" />
                        </Stack>
                        <Skeleton height={20} width={70} radius="xl" />
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
                  records={items}
                  totalRecords={totalElements}
                  recordsPerPage={PAGE_SIZE}
                  page={page}
                  onPageChange={setPage}
                  fetching={isFetching && !isLoading}
                  minHeight={300}
                  idAccessor="id"
                  noRecordsText={
                    hasActiveFilters
                      ? t`No catalog records match the current filters`
                      : t`No catalog records found`
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
                      accessor: "name",
                      title: t`Venue`,
                      render: (venue) => (
                        <Group gap="sm" wrap="nowrap">
                          <VenueThumbnail
                            url={venue.primaryPhotoUrl}
                            name={venue.name}
                            size={40}
                          />
                          <Stack gap={1}>
                            <Text size="sm" fw={600} lh={1.3}>
                              {venue.name}
                            </Text>
                            <Text size="xs" c="dimmed" lineClamp={1} maw={300}>
                              {venue.address ?? "—"}
                            </Text>
                          </Stack>
                        </Group>
                      ),
                    },
                    {
                      accessor: "city",
                      title: t`City`,
                      render: (venue) => (
                        <Group gap={4} wrap="nowrap">
                          {venue.city && (
                            <IconMapPin size={12} color="var(--mantine-color-gray-5)" />
                          )}
                          <Text size="sm" c="dimmed">
                            {venue.city ?? "—"}
                          </Text>
                        </Group>
                      ),
                    },
                    {
                      accessor: "source",
                      title: t`Source`,
                      render: (venue) => (
                        <Badge variant="light" color="blue" size="sm" tt="uppercase" style={{ letterSpacing: "0.03em" }}>
                          {venue.source}
                        </Badge>
                      ),
                    },
                    {
                      accessor: "confidence",
                      title: t`Confidence`,
                      render: (venue) => <ConfidenceBadge value={venue.confidence} />,
                    },
                    {
                      accessor: "updatedAt",
                      title: t`Updated`,
                      render: (venue) => (
                        <Text size="xs" c="dimmed">
                          {dayjs(venue.updatedAt).format("MMM D, YYYY")}
                        </Text>
                      ),
                    },
                    {
                      accessor: "actions",
                      title: "",
                      textAlign: "right",
                      render: (venue) => (
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label={t`View record`} withArrow>
                            <ActionIcon
                              data-testid={TestSelectors.BUTTON.MASTER_VENUE_VIEW(venue.id)}
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                void navigate({
                                  to: "/admin/master-catalog/$venueId",
                                  params: { venueId: venue.id },
                                });
                              }}
                            >
                              <IconEye size={15} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t`Edit record`} withArrow>
                            <ActionIcon
                              data-testid={TestSelectors.BUTTON.MASTER_VENUE_EDIT(venue.id)}
                              variant="subtle"
                              color="blue"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(venue);
                              }}
                            >
                              <IconEdit size={15} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t`Delete record`} withArrow>
                            <ActionIcon
                              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DELETE(venue.id)}
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(venue);
                              }}
                            >
                              <IconTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      ),
                    },
                  ]}
                />
              )}
            </>
          )}

          {/* ── Grid view ───────────────────────────────────────────────── */}
          {viewMode === "grid" && (
            <Box p="md">
              {isLoading ? (
                <GridSkeleton />
              ) : items.length === 0 ? (
                <Stack align="center" py="xl" gap="xs">
                  <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                    <IconBuildingStore size={24} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed" ta="center">
                    {hasActiveFilters
                      ? t`No catalog records match the current filters`
                      : t`No catalog records found`}
                  </Text>
                </Stack>
              ) : (
                <Stack gap="md">
                  <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                    {items.map((venue) => (
                      <VenueCard
                        key={venue.id}
                        venue={venue}
                        onView={() =>
                          void navigate({
                            to: "/admin/master-catalog/$venueId",
                            params: { venueId: venue.id },
                          })
                        }
                        onEdit={() => handleEdit(venue)}
                        onDelete={() => handleDelete(venue)}
                      />
                    ))}
                  </SimpleGrid>

                  {totalPages > 1 && (
                    <Group justify="center">
                      <Pagination
                        value={page}
                        onChange={setPage}
                        total={totalPages}
                        size="sm"
                        withEdges
                      />
                    </Group>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} records
            </Trans>
          </Text>
        )}
      </Stack>

      <CreateMasterVenueModal opened={createOpened} onClose={closeCreate} />
      <EditMasterVenueModal venue={selectedVenue} opened={editOpened} onClose={handleCloseEdit} />
      <DeleteMasterVenueModal
        venue={selectedVenue}
        opened={deleteOpened}
        onClose={handleCloseDelete}
      />
    </Container>
  );
}
