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

function AdminMasterCatalogPage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);

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
                <Trans>Master venues</Trans>
              </Text>
              {!isLoading && (
                <Badge
                  data-testid={TestSelectors.BADGE.MASTER_CATALOG_TOTAL_COUNT}
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
                  ? t`No master venues match the current filters`
                  : t`No master venues found`
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
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "var(--mantine-color-gray-1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconBuildingStore size={18} color="var(--mantine-color-gray-6)" />
                      </Box>
                      <Stack gap={1}>
                        <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                          {venue.name}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1} maw={320}>
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
                    <Text size="sm" c="dimmed">
                      {venue.city ?? "—"}
                    </Text>
                  ),
                },
                {
                  accessor: "source",
                  title: t`Source`,
                  render: (venue) => (
                    <Badge variant="light" color="gray" size="sm">
                      {venue.source}
                    </Badge>
                  ),
                },
                {
                  accessor: "confidence",
                  title: t`Confidence`,
                  render: (venue) => {
                    if (venue.confidence === null)
                      return (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      );
                    const pct = Math.round(venue.confidence * 100);
                    const color = pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";
                    return (
                      <Badge variant="light" color={color} size="sm">
                        {pct}%
                      </Badge>
                    );
                  },
                },
                {
                  accessor: "updatedAt",
                  title: t`Updated`,
                  render: (venue) => (
                    <Text size="sm" c="dimmed">
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
                      <Tooltip label={t`View venue`} withArrow>
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
                      <Tooltip label={t`Edit venue`} withArrow>
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
                      <Tooltip label={t`Delete venue`} withArrow>
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
        </Paper>

        {!isLoading && totalElements > 0 && (
          <Text size="xs" c="dimmed">
            <Trans>
              Showing {rangeStart}–{rangeEnd} of {totalElements} master venues
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
