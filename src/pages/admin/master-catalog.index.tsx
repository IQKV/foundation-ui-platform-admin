import { useEffect, useMemo, useState } from "react";
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
  Anchor,
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
  Divider,
  Menu,
  Checkbox,
} from "@mantine/core";
import { useDisclosure, useDebouncedValue, useLocalStorage } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  IconSearch,
  IconEdit,
  IconEye,
  IconRefresh,
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconBuildingStore,
  IconLayoutList,
  IconLayoutGrid,
  IconMapPin,
  IconDots,
  IconChevronDown,
  IconX,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { catalogApi } from "@/shared/api";
import type { SemanticSearchFilters } from "@/shared/api";
import type { MasterVenue } from "@/entities";
import { PageHeader } from "@/shared/ui";
import {
  CreateMasterVenueModal,
  EditMasterVenueModal,
  DeleteMasterVenueModal,
  BulkDeleteMasterVenuesModal,
} from "@/features/master-venue-admin";
import {
  MasterVenueSemanticSearchWidget,
  SemanticSearchFiltersSummary,
} from "@/features/master-venue-semantic-search";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/admin/master-catalog/")({
  component: AdminMasterCatalogPage,
});

const PAGE_SIZE = 20;

/** Blue→cyan accent shared by the card, row and sidebar borders. */
const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-4) 0%, var(--mantine-color-cyan-4) 100%)";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Narrows the list-vs-semantic union: only the semantic-search response carries the
 * AI-derived filters, so the presence of the property is the discriminator.
 */
function hasAppliedFilters(value: unknown): value is { appliedFilters: SemanticSearchFilters } {
  return typeof value === "object" && value !== null && "appliedFilters" in value;
}

function confidenceColor(value: number | null): string {
  if (value === null) return "gray";
  const pct = Math.round(value * 100);
  return pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";
}

function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null)
    return (
      <Text size="xs" c="dimmed">
        —
      </Text>
    );
  const pct = Math.round(value * 100);
  return (
    <Badge variant="light" color={confidenceColor(value)} size="xs">
      {pct}%
    </Badge>
  );
}

function SimilarityBadge({ value }: { value: number | undefined }) {
  if (value === undefined) return null;
  const pct = Math.round(value * 100);
  return (
    <Badge variant="filled" color="blue" size="xs" leftSection={<IconSparkles size={10} />}>
      {pct}%
    </Badge>
  );
}

// ── Venue thumbnail ───────────────────────────────────────────────────────────

function VenueThumbnail({
  url,
  name,
  height = 148,
}: {
  url: string | null;
  name: string;
  height?: number;
}) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{ width: "100%", height, objectFit: "cover", display: "block" }}
      />
    );
  }
  return (
    <Group
      justify="center"
      align="center"
      style={{ height, background: "var(--mantine-color-gray-1)" }}
    >
      <ThemeIcon size={40} radius="xl" variant="light" color="gray">
        <IconBuildingStore size={22} />
      </ThemeIcon>
    </Group>
  );
}

// ── Grid card — mirrors VenueCard from mockup ─────────────────────────────────

interface VenueCardProps {
  venue: MasterVenue;
  selected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function VenueCard({ venue, selected, onToggleSelect, onView, onEdit, onDelete }: VenueCardProps) {
  const { t } = useLingui();
  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      data-selected={selected || undefined}
      style={{ position: "relative" }}
      styles={{
        root: {
          overflow: "hidden",
          transition: "box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease",
          // Gradient border ring — revealed on hover and while selected.
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: "inherit",
            padding: 1,
            background: ACCENT_GRADIENT,
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0,
            transition: "opacity 180ms ease",
            pointerEvents: "none",
          },
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 16px 32px -16px rgba(34,139,230,0.55)",
          },
          "&:hover::after": { opacity: 1 },
          "&[data-selected]": {
            borderColor: "var(--mantine-color-blue-5)",
            boxShadow: "0 0 0 2px rgba(34,139,230,0.3)",
          },
          "&[data-selected]::after": { opacity: 1 },
        },
      }}
    >
      {/* photo strip */}
      <Card.Section onClick={onView} style={{ cursor: "pointer" }}>
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={148} />
      </Card.Section>

      {/* selection + confidence accent — mirrors stage badge overlay */}
      <Box
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          zIndex: 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Group gap={6} wrap="nowrap">
          <Checkbox
            size="xs"
            checked={selected}
            onChange={onToggleSelect}
            aria-label={t`Select venue`}
            data-testid={TestSelectors.CHECKBOX.MASTER_VENUE_SELECT(venue.id)}
          />
          <ConfidenceBadge value={venue.confidence} />
          <SimilarityBadge value={venue.similarity} />
        </Group>
      </Box>

      {/* dots menu — mirrors VenueCard actions overlay */}
      <Box
        style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="white"
              size="sm"
              radius="sm"
              style={{ boxShadow: "var(--mantine-shadow-xs)" }}
            >
              <IconDots size={14} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_VIEW(venue.id)}
              onClick={onView}
            >
              {t`View record`}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_EDIT(venue.id)}
              onClick={onEdit}
            >
              {t`Edit record`}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DELETE(venue.id)}
              onClick={onDelete}
            >
              {t`Delete`}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Box>

      {/* body */}
      <Stack gap={6} mt="xs">
        <Text
          fw={600}
          size="sm"
          lineClamp={2}
          lh={1.3}
          onClick={onView}
          styles={{
            root: { cursor: "pointer", "&:hover": { color: "var(--mantine-color-blue-6)" } },
          }}
        >
          {venue.name}
        </Text>
        {(venue.city ?? venue.address) && (
          <Group gap={4} wrap="nowrap">
            <IconMapPin size={12} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {venue.city
                ? `${venue.city}${venue.address ? ` · ${venue.address}` : ""}`
                : venue.address}
            </Text>
          </Group>
        )}
        <Group gap="xs" wrap="wrap">
          <Badge variant="outline" color="gray" size="xs" tt="uppercase">
            {venue.source.replace(/_/g, " ")}
          </Badge>
          <Text size="xs" c="dimmed" style={{ marginLeft: "auto" }}>
            {dayjs(venue.updatedAt).format("MMM D, YYYY")}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}

// ── List row — mirrors VenueRow from mockup ────────────────────────────────────

function VenueRow({ venue, selected, onToggleSelect, onView, onEdit, onDelete }: VenueCardProps) {
  const { t } = useLingui();

  const hasCoordinates = venue.locationLat != null && venue.locationLng != null;
  const coordinates = hasCoordinates ? `${venue.locationLat}, ${venue.locationLng}` : null;
  const mapUrl = hasCoordinates
    ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
    : null;
  const locationLine = [venue.address, venue.city].filter(Boolean).join(", ");

  return (
    <Card
      padding={0}
      radius="md"
      withBorder
      data-selected={selected || undefined}
      style={{
        display: "flex",
        flexDirection: "row",
      }}
      styles={{
        root: {
          overflow: "hidden",
          position: "relative",
          transition: "box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease",
          // Gradient accent bar running down the leading edge.
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 4,
            background: ACCENT_GRADIENT,
            opacity: 0.55,
            transition: "opacity 180ms ease",
            pointerEvents: "none",
          },
          "&:hover": {
            transform: "translateX(2px)",
            borderColor: "var(--mantine-color-blue-3)",
            boxShadow: "0 12px 28px -18px rgba(34,139,230,0.6)",
          },
          "&:hover::before": { opacity: 1 },
          "&[data-selected]": {
            borderColor: "var(--mantine-color-blue-5)",
            boxShadow: "0 0 0 2px rgba(34,139,230,0.3)",
          },
          "&[data-selected]::before": { opacity: 1 },
        },
      }}
    >
      {/* photo strip — 140px, mirrors VenueRow */}
      <Box
        onClick={onView}
        style={{
          flexShrink: 0,
          width: 140,
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={110} />
      </Box>

      {/* identity — name, real address, ingestion identifiers */}
      <Group
        gap="md"
        align="center"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "var(--mantine-spacing-md) var(--mantine-spacing-lg)",
        }}
      >
        <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text
              fw={700}
              size="md"
              lineClamp={1}
              onClick={onView}
              styles={{
                root: { cursor: "pointer", "&:hover": { color: "var(--mantine-color-blue-6)" } },
              }}
            >
              {venue.name}
            </Text>
            <Badge
              variant="outline"
              color="gray"
              size="xs"
              tt="uppercase"
              style={{ flexShrink: 0 }}
            >
              {venue.source.replace(/_/g, " ")}
            </Badge>
          </Group>

          <Group gap={4} wrap="nowrap">
            <IconMapPin size={13} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
            {locationLine ? (
              <Text size="sm" lineClamp={1}>
                {locationLine}
              </Text>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                <Trans>No address on record</Trans>
              </Text>
            )}
          </Group>

          <Group gap={8} wrap="wrap">
            <Group gap={4} wrap="nowrap">
              <Text size="xs" c="dimmed">
                <Trans>Coordinates</Trans>:
              </Text>
              {coordinates ? (
                <>
                  <Text size="xs" ff="monospace">
                    {coordinates}
                  </Text>
                  {mapUrl && (
                    <Anchor
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={3} wrap="nowrap">
                        <IconExternalLink size={11} />
                        <Trans>Maps</Trans>
                      </Group>
                    </Anchor>
                  )}
                </>
              ) : (
                <Text size="xs" c="dimmed" fs="italic">
                  —
                </Text>
              )}
            </Group>
            <Text size="xs" c="dimmed" ff="monospace" lineClamp={1} style={{ minWidth: 0 }}>
              {venue.id}
            </Text>
          </Group>
        </Stack>

        {/* quality — exact confidence score and ingestion metadata presence */}
        <Divider orientation="vertical" />
        <Stack gap={6} style={{ flexShrink: 0, minWidth: 132 }}>
          <Text size="xs" c="dimmed">
            <Trans>Confidence</Trans>
          </Text>
          <Group gap={6} wrap="nowrap">
            <ConfidenceBadge value={venue.confidence} />
            <Text size="xs" c="dimmed" ff="monospace">
              {venue.confidence != null ? venue.confidence.toFixed(4) : "—"}
            </Text>
            <SimilarityBadge value={venue.similarity} />
          </Group>
          <Group gap={6} wrap="nowrap" mt={2}>
            <Text size="xs" c="dimmed">
              <Trans>Metadata</Trans>
            </Text>
            <Badge size="xs" variant="light" color={venue.metadata ? "teal" : "gray"}>
              {venue.metadata ? <Trans>Present</Trans> : <Trans>Missing</Trans>}
            </Badge>
          </Group>
        </Stack>

        {/* timing */}
        <Divider orientation="vertical" />
        <Stack gap={8} style={{ flexShrink: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text size="xs" c="dimmed" w={56}>
              <Trans>Updated</Trans>
            </Text>
            <Text size="sm" fw={500}>
              {dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm")}
            </Text>
          </Group>
          <Group gap={8} wrap="nowrap">
            <Text size="xs" c="dimmed" w={56}>
              <Trans>Created</Trans>
            </Text>
            <Text size="sm" fw={500}>
              {dayjs(venue.createdAt).format("MMM D, YYYY HH:mm")}
            </Text>
          </Group>
        </Stack>
      </Group>

      {/* actions column — mirrors VenueRow right border column */}
      <Stack
        justify="flex-start"
        align="center"
        py="sm"
        px="xs"
        style={{
          flexShrink: 0,
          borderLeft: "1px solid var(--mantine-color-default-border)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          size="sm"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={t`Select venue`}
          data-testid={TestSelectors.CHECKBOX.MASTER_VENUE_SELECT(venue.id)}
        />
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" size="md" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_VIEW(venue.id)}
              onClick={onView}
            >
              {t`View record`}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_EDIT(venue.id)}
              onClick={onEdit}
            >
              {t`Edit record`}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={13} />}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DELETE(venue.id)}
              onClick={onDelete}
            >
              {t`Delete`}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Stack>
    </Card>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <Card padding="sm" radius="md" withBorder>
      <Card.Section>
        <Skeleton height={148} />
      </Card.Section>
      <Stack gap={6} mt="xs">
        <Skeleton height={14} width="80%" />
        <Skeleton height={12} width="40%" />
        <Skeleton height={12} width="60%" />
      </Stack>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <Card
      padding={0}
      radius="md"
      withBorder
      style={{ display: "flex", flexDirection: "row", overflow: "hidden" }}
    >
      <Skeleton height={110} width={140} radius={0} style={{ flexShrink: 0 }} />
      <Group
        gap="md"
        align="center"
        style={{ flex: 1, padding: "var(--mantine-spacing-md) var(--mantine-spacing-lg)" }}
      >
        <Stack gap={5} style={{ flex: 1, minWidth: 0 }}>
          <Skeleton height={18} width="55%" />
          <Skeleton height={14} width="40%" />
          <Skeleton height={13} width="70%" />
        </Stack>
        <Stack gap={8} style={{ flexShrink: 0, width: 132 }}>
          <Skeleton height={13} width={72} />
          <Skeleton height={16} width={96} />
          <Skeleton height={16} width={88} />
        </Stack>
        <Stack gap={8} style={{ flexShrink: 0, width: 200 }}>
          <Skeleton height={16} width={150} />
          <Skeleton height={16} width={150} />
        </Stack>
      </Group>
      <Stack justify="flex-start" align="center" py="sm" px="xs" style={{ flexShrink: 0 }}>
        <Skeleton height={28} width={28} radius="sm" />
      </Stack>
    </Card>
  );
}

// ── Filter sidebar — mirrors FilterSidebar from mockup ────────────────────────

interface FilterSidebarProps {
  search: string;
  cityFilter: string | null;
  cityOptions: { value: string; label: string }[];
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onCityChange: (v: string | null) => void;
  onReset: () => void;
}

function FilterSidebar({
  search,
  cityFilter,
  cityOptions,
  hasActiveFilters,
  onSearchChange,
  onCityChange,
  onReset,
}: FilterSidebarProps) {
  const { t } = useLingui();
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      style={{
        width: 220,
        flexShrink: 0,
        position: "sticky",
        top: 16,
        alignSelf: "flex-start",
      }}
      styles={{
        root: {
          overflow: "hidden",
          transition: "border-color 180ms ease, box-shadow 180ms ease",
          // Gradient strip along the top edge of the panel.
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: ACCENT_GRADIENT,
            pointerEvents: "none",
          },
          "&:focus-within": {
            borderColor: "var(--mantine-color-blue-4)",
            boxShadow: "0 10px 26px -20px rgba(34,139,230,0.65)",
          },
        },
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" mb={2}>
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.06em" }}>
            <Trans>Filters</Trans>
          </Text>
          {hasActiveFilters && (
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              data-testid={TestSelectors.BUTTON.MASTER_CATALOG_CLEAR_FILTERS}
              onClick={onReset}
            >
              <IconX size={11} />
            </ActionIcon>
          )}
        </Group>

        <TextInput
          placeholder={t`Name or city…`}
          leftSection={<IconSearch size={13} />}
          value={search}
          data-testid={TestSelectors.INPUT.MASTER_CATALOG_SEARCH}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="xs"
          rightSection={
            search ? (
              <CloseButton
                size="xs"
                data-testid={TestSelectors.BUTTON.MASTER_CATALOG_SEARCH_CLEAR}
                onClick={() => onSearchChange("")}
              />
            ) : null
          }
        />

        <Divider />

        <Stack gap={4}>
          <Text size="xs" fw={600} c="dimmed">
            <Trans>City</Trans>
          </Text>
          <Select
            data-testid={TestSelectors.SELECT.MASTER_CATALOG_CITY_FILTER}
            placeholder={t`All cities`}
            data={cityOptions}
            value={cityFilter}
            onChange={onCityChange}
            searchable
            clearable
            size="xs"
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type ViewMode = "grid" | "list";

function AdminMasterCatalogPage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");

  const isSemanticSearchActive = semanticQuery.trim().length > 0;

  // Grid/list preference is persisted locally so it survives reloads.
  // Normalize the stored value: anything other than "list" falls back to "grid".
  const [storedViewMode, setStoredViewMode] = useLocalStorage<ViewMode>({
    key: "iqkv_master_catalog_view_mode",
    defaultValue: "grid",
    getInitialValueInEffect: false,
  });
  const viewMode: ViewMode = storedViewMode === "list" ? "list" : "grid";

  // ── Sort order ──────────────────────────────────────────────────────────────
  type SortOrder = "recent" | "name_asc" | "name_desc";
  const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
    { value: "recent", label: t`Recently Added` },
    { value: "name_asc", label: t`Name A → Z` },
    { value: "name_desc", label: t`Name Z → A` },
  ];
  const [storedSortOrder, setStoredSortOrder] = useLocalStorage<SortOrder>({
    key: "iqkv_master_catalog_sort_order",
    defaultValue: "recent",
    getInitialValueInEffect: false,
  });
  const sortOrder: SortOrder =
    storedSortOrder === "name_asc" || storedSortOrder === "name_desc" ? storedSortOrder : "recent";
  const sortParams =
    sortOrder === "name_asc"
      ? { sortBy: "name" as const, sortDir: "asc" as const }
      : sortOrder === "name_desc"
        ? { sortBy: "name" as const, sortDir: "desc" as const }
        : {};

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [bulkDeleteOpened, { open: openBulkDelete, close: closeBulkDelete }] = useDisclosure(false);
  const [selectedVenue, setSelectedVenue] = useState<MasterVenue | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const hasActiveFilters = debouncedSearch !== "" || cityFilter !== null;
  // Covers semantic search too, so a zero-result AI query shows "no match" copy
  // rather than the "add your first venue" onboarding state.
  const isSearching = hasActiveFilters || isSemanticSearchActive;
  const offset = (page - 1) * PAGE_SIZE;

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "master-venues",
      page,
      debouncedSearch,
      cityFilter,
      semanticQuery,
      sortOrder,
    ],
    queryFn: () => {
      if (isSemanticSearchActive) {
        return catalogApi.semanticSearch({
          q: semanticQuery,
          city: cityFilter || undefined,
          limit: PAGE_SIZE,
        });
      }
      return catalogApi.listMasterVenues({
        search: debouncedSearch || undefined,
        city: cityFilter || undefined,
        limit: PAGE_SIZE,
        offset,
        ...sortParams,
      });
    },
  });

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  // Only the semantic-search response carries the AI-derived filters; the plain list response
  // does not, so narrow on the property rather than asserting the type.
  const appliedFilters =
    isSemanticSearchActive && hasAppliedFilters(data) ? data.appliedFilters : null;
  const totalPages = isSemanticSearchActive ? 1 : Math.ceil(totalElements / PAGE_SIZE);
  const rangeStart = totalElements === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + PAGE_SIZE, totalElements);

  // Bulk selection is scoped to the current page: it covers only the rows already loaded,
  // and is reset whenever the page or the filters change (ids would no longer be visible).
  const selectedCount = selectedIds.size;
  const allOnPageSelected = items.length > 0 && items.every((v) => selectedIds.has(v.id));
  const someOnPageSelected = items.some((v) => selectedIds.has(v.id));

  useEffect(() => {
    setSelectedIds(new Set());
  }, [page, debouncedSearch, cityFilter, semanticQuery]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    setSelectedIds((prev) => {
      const allSelected = items.length > 0 && items.every((v) => prev.has(v.id));
      return allSelected ? new Set() : new Set(items.map((v) => v.id));
    });
  };

  // shortcut: city options come from the loaded page only (no city-list endpoint); upgrade when one exists.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    items.forEach((v) => {
      if (v.city) cities.add(v.city);
    });
    if (cityFilter) cities.add(cityFilter);
    return [...cities].sort().map((c) => ({ value: c, label: c }));
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
  const handleBulkDeleted = () => {
    setSelectedIds(new Set());
  };
  const handleReset = () => {
    setSearch("");
    setCityFilter(null);
    setSemanticQuery("");
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
          /* Split button mirrors the Quick add / Full form menu in the mockup */
          <Menu shadow="md" width={220} position="bottom-end">
            <Group gap={0}>
              <Button
                leftSection={<IconPlus size={14} />}
                size="sm"
                data-testid={TestSelectors.BUTTON.MASTER_CATALOG_CREATE}
                onClick={openCreate}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              >
                <Trans>New venue</Trans>
              </Button>
              <Menu.Target>
                <Button
                  size="sm"
                  px="xs"
                  aria-label={t`More options`}
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderLeft: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <IconChevronDown size={14} />
                </Button>
              </Menu.Target>
            </Group>
            <Menu.Dropdown>
              <Menu.Label>
                <Trans>Add venue</Trans>
              </Menu.Label>
              <Menu.Item leftSection={<IconPlus size={14} />} onClick={openCreate}>
                <Trans>New venue</Trans>
                <Text size="xs" c="dimmed" mt={1}>
                  <Trans>Fill all fields manually</Trans>
                </Text>
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        }
      />

      {isError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load master venues</Trans>}
          color="red"
          variant="light"
          mb="md"
        >
          <Trans>Could not fetch master venues from the API.</Trans>{" "}
          <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
            <Trans>Retry</Trans>
          </Button>
        </Alert>
      )}

      <MasterVenueSemanticSearchWidget
        onSearch={setSemanticQuery}
        onClear={() => setSemanticQuery("")}
        isSearching={isFetching && isSemanticSearchActive}
      />

      {isSemanticSearchActive && (
        <SemanticSearchFiltersSummary
          filters={appliedFilters}
          onClear={() => setSemanticQuery("")}
        />
      )}

      {/* ── Two-column layout — mirrors VenueListWidget ──────────────── */}
      <Group align="flex-start" gap="lg" wrap="nowrap">
        {/* left: filter sidebar */}
        <FilterSidebar
          search={search}
          cityFilter={cityFilter}
          cityOptions={cityOptions}
          hasActiveFilters={isSearching}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onCityChange={(v) => {
            setCityFilter(v);
            setPage(1);
          }}
          onReset={handleReset}
        />

        {/* right: toolbar + results */}
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          {/* toolbar */}
          <Group justify="space-between" wrap="wrap" gap="sm">
            <Group gap="sm" wrap="nowrap">
              {!isLoading && items.length > 0 && (
                <Checkbox
                  size="xs"
                  checked={allOnPageSelected}
                  indeterminate={someOnPageSelected && !allOnPageSelected}
                  onChange={handleToggleSelectAll}
                  aria-label={t`Select all venues on this page`}
                  data-testid={TestSelectors.CHECKBOX.MASTER_CATALOG_SELECT_ALL}
                />
              )}
              {!isLoading ? (
                <Group gap="xs">
                  {isSemanticSearchActive && (
                    <Badge
                      variant="light"
                      color="blue"
                      size="xs"
                      leftSection={<IconSparkles size={10} />}
                    >
                      <Trans>AI Ranked</Trans>
                    </Badge>
                  )}
                </Group>
              ) : (
                <Skeleton height={14} width={80} />
              )}
            </Group>

            {totalPages > 1 && items.length > 10 && (
              <Group gap={4} align="center" style={{ flex: 1, justifyContent: "center" }}>
                {!isLoading && totalElements > 0 && (
                  <Text size="xs" c="dimmed" lh={1}>
                    <Trans>
                      Showing {rangeStart}–{rangeEnd} of {totalElements}
                    </Trans>
                  </Text>
                )}
                <Pagination
                  withPages={false}
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                  size="xs"
                />
              </Group>
            )}

            <Group gap="xs" style={{ marginLeft: "auto" }}>
              {selectedCount > 0 && (
                <>
                  <Text size="xs" c="dimmed">
                    <Trans>{selectedCount} selected</Trans>
                  </Text>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={14} />}
                    data-testid={TestSelectors.BUTTON.MASTER_CATALOG_BULK_DELETE}
                    onClick={openBulkDelete}
                  >
                    <Trans>Delete selected</Trans>
                  </Button>
                  <Tooltip label={t`Clear selection`} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={t`Clear selection`}
                      data-testid={TestSelectors.BUTTON.MASTER_CATALOG_CLEAR_SELECTION}
                      onClick={() => setSelectedIds(new Set())}
                    >
                      <IconX size={15} />
                    </ActionIcon>
                  </Tooltip>
                </>
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
                onChange={(v) => setStoredViewMode(v as ViewMode)}
                data={[
                  {
                    value: "grid",
                    label: (
                      <Tooltip label={t`Grid view`} withArrow>
                        <Center>
                          <IconLayoutGrid size={14} />
                        </Center>
                      </Tooltip>
                    ),
                  },
                  {
                    value: "list",
                    label: (
                      <Tooltip label={t`List view`} withArrow>
                        <Center>
                          <IconLayoutList size={14} />
                        </Center>
                      </Tooltip>
                    ),
                  },
                ]}
              />
              <Select
                data={SORT_OPTIONS}
                value={sortOrder}
                onChange={(v) => {
                  if (v) setStoredSortOrder(v as SortOrder);
                }}
                size="xs"
                w={140}
                allowDeselect={false}
                disabled={isSemanticSearchActive}
              />
            </Group>
          </Group>

          {/* results */}
          {isLoading ? (
            viewMode === "grid" ? (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </SimpleGrid>
            ) : (
              <Stack gap="xs">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <RowSkeleton key={i} />
                ))}
              </Stack>
            )
          ) : items.length === 0 && !isError ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                  <IconBuildingStore size={24} />
                </ThemeIcon>
                <Text c="dimmed" size="sm">
                  {isSearching ? (
                    <Trans>No venues match your filters</Trans>
                  ) : (
                    <Trans>No venues yet — add your first one</Trans>
                  )}
                </Text>
                {isSearching ? (
                  <Button variant="light" color="gray" size="sm" onClick={handleReset}>
                    <Trans>Clear filters</Trans>
                  </Button>
                ) : (
                  <Button
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    size="sm"
                    onClick={openCreate}
                  >
                    <Trans>New venue</Trans>
                  </Button>
                )}
              </Stack>
            </Center>
          ) : viewMode === "grid" ? (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
              {items.map((venue) => (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  selected={selectedIds.has(venue.id)}
                  onToggleSelect={() => handleToggleSelect(venue.id)}
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
          ) : (
            <Stack gap="xs">
              {items.map((venue) => (
                <VenueRow
                  key={venue.id}
                  venue={venue}
                  selected={selectedIds.has(venue.id)}
                  onToggleSelect={() => handleToggleSelect(venue.id)}
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
            </Stack>
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="sm">
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" withEdges />
            </Group>
          )}

          {!isLoading && totalElements > 0 && (
            <Text size="xs" c="dimmed" ta="center">
              <Trans>
                Showing {rangeStart}–{rangeEnd} of {totalElements}
              </Trans>
            </Text>
          )}
        </Stack>
      </Group>

      <CreateMasterVenueModal opened={createOpened} onClose={closeCreate} />
      <EditMasterVenueModal venue={selectedVenue} opened={editOpened} onClose={handleCloseEdit} />
      <DeleteMasterVenueModal
        venue={selectedVenue}
        opened={deleteOpened}
        onClose={handleCloseDelete}
      />
      <BulkDeleteMasterVenuesModal
        ids={[...selectedIds]}
        opened={bulkDeleteOpened}
        onClose={closeBulkDelete}
        onDeleted={handleBulkDeleted}
      />
    </Container>
  );
}
