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
  Anchor,
  Badge,
  Select,
  CloseButton,
  SimpleGrid,
  Card,
  Pagination,
  SegmentedControl,
  Center,
  ThemeIcon,
  Divider,
  Menu,
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
  IconBuilding,
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
import { iamApi, tenantVenueApi } from "@/shared/api";
import type { SemanticSearchFilters } from "@/shared/api";
import type { TenantVenueSummary } from "@/entities";
import { PageHeader } from "@/shared/ui";
import {
  CreateTenantVenueModal,
  EditTenantVenueModal,
  DeleteTenantVenueModal,
} from "@/features/tenant-venue-admin";
import {
  TenantVenueSemanticSearchWidget,
  SemanticSearchFiltersSummary,
} from "@/features/tenant-venue-semantic-search";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/admin/venues/")({
  component: AdminTenantVenuesPage,
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
  url: string | null | undefined;
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
  venue: TenantVenueSummary;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function VenueCard({ venue, onView, onEdit, onDelete }: VenueCardProps) {
  const { t } = useLingui();
  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      style={{ position: "relative" }}
      styles={{
        root: {
          overflow: "hidden",
          transition: "box-shadow 180ms ease, transform 180ms ease, border-color 180ms ease",
          // Gradient border ring — revealed on hover.
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
        },
      }}
    >
      {/* photo strip */}
      <Card.Section onClick={onView} style={{ cursor: "pointer" }}>
        <VenueThumbnail url={venue.primaryPhotoUrl} name={venue.name} height={148} />
      </Card.Section>

      {/* similarity accent — semantic results only */}
      {venue.similarity !== undefined && (
        <Box style={{ position: "absolute", top: 8, left: 8, zIndex: 1 }}>
          <SimilarityBadge value={venue.similarity} />
        </Box>
      )}

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
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_VIEW(venue.id)}
              onClick={onView}
            >
              {t`View record`}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={13} />}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_EDIT(venue.id)}
              onClick={onEdit}
            >
              {t`Edit record`}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={13} />}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DELETE(venue.id)}
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
        {venue.city && (
          <Group gap={4} wrap="nowrap">
            <IconMapPin size={12} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed" lineClamp={1}>
              {venue.city}
            </Text>
          </Group>
        )}
        <Group gap="xs" wrap="wrap">
          <Text size="xs" c="dimmed" ff="monospace" lineClamp={1}>
            {venue.id}
          </Text>
          <Text size="xs" c="dimmed" style={{ marginLeft: "auto" }}>
            {dayjs(venue.updatedAt).format("MMM D, YYYY")}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}

// ── List row — mirrors VenueRow from mockup ────────────────────────────────────

function VenueRow({ venue, onView, onEdit, onDelete }: VenueCardProps) {
  const { t } = useLingui();

  const hasCoordinates = venue.locationLat != null && venue.locationLng != null;
  const coordinates = hasCoordinates ? `${venue.locationLat}, ${venue.locationLng}` : null;
  const mapUrl = hasCoordinates
    ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
    : null;

  return (
    <Card
      padding={0}
      radius="md"
      withBorder
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

      {/* identity — name, city, ingestion identifiers */}
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
            <SimilarityBadge value={venue.similarity} />
          </Group>

          <Group gap={4} wrap="nowrap">
            <IconMapPin size={13} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
            {venue.city ? (
              <Text size="sm" lineClamp={1}>
                {venue.city}
              </Text>
            ) : (
              <Text size="sm" c="dimmed" fs="italic">
                <Trans>No city on record</Trans>
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

        {/* master link */}
        <Divider orientation="vertical" />
        <Stack gap={6} style={{ flexShrink: 0, minWidth: 132 }}>
          <Text size="xs" c="dimmed">
            <Trans>Master venue</Trans>
          </Text>
          {venue.masterVenueId ? (
            <Text size="xs" ff="monospace" lineClamp={1}>
              {venue.masterVenueId}
            </Text>
          ) : (
            <Text size="xs" c="dimmed" fs="italic">
              —
            </Text>
          )}
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
        <Menu shadow="md" width={160} position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" size="md" color="gray">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconEye size={13} />}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_VIEW(venue.id)}
              onClick={onView}
            >
              {t`View record`}
            </Menu.Item>
            <Menu.Item
              leftSection={<IconEdit size={13} />}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_EDIT(venue.id)}
              onClick={onEdit}
            >
              {t`Edit record`}
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={13} />}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DELETE(venue.id)}
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
              data-testid={TestSelectors.BUTTON.TENANT_VENUES_CLEAR_FILTERS}
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
          data-testid={TestSelectors.INPUT.TENANT_VENUES_SEARCH}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          size="xs"
          rightSection={
            search ? (
              <CloseButton
                size="xs"
                data-testid={TestSelectors.BUTTON.TENANT_VENUES_SEARCH_CLEAR}
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
            data-testid={TestSelectors.SELECT.TENANT_VENUES_CITY_FILTER}
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

function AdminTenantVenuesPage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  // ─── Tenant selector ────────────────────────────────────────────────────────
  const [tenantKey, setTenantKey] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [semanticQuery, setSemanticQuery] = useState("");

  const isSemanticSearchActive = semanticQuery.trim().length > 0;

  // Grid/list preference is persisted locally so it survives reloads.
  // Normalize the stored value: anything other than "list" falls back to "grid".
  const [storedViewMode, setStoredViewMode] = useLocalStorage<ViewMode>({
    key: "iqkv_tenant_venues_view_mode",
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
    key: "iqkv_tenant_venues_sort_order",
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
  // The list projection is narrow, so the full venue is fetched before editing it.
  const [editVenueId, setEditVenueId] = useState<string | null>(null);
  const [deleteVenue, setDeleteVenue] = useState<TenantVenueSummary | null>(null);

  const hasActiveFilters = debouncedSearch !== "" || cityFilter !== null;
  // Covers semantic search too, so a zero-result AI query shows "no match" copy
  // rather than the "add your first venue" onboarding state.
  const isSearching = hasActiveFilters || isSemanticSearchActive;
  const offset = (page - 1) * PAGE_SIZE;

  // Load all tenants for the organization dropdown
  const { data: tenantsData, isLoading: tenantsLoading } = useQuery({
    queryKey: ["admin", "tenants", "all"],
    queryFn: () => iamApi.listTenants({ size: 200, sortBy: "name", sortDir: "asc" }),
  });

  const tenantOptions =
    tenantsData?.content.map((tenant) => ({
      value: tenant.tenantKey,
      label: `${tenant.name} (${tenant.tenantKey})`,
    })) ?? [];

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin",
      "tenant-venues",
      tenantKey,
      page,
      debouncedSearch,
      cityFilter,
      semanticQuery,
      sortOrder,
    ],
    queryFn: () => {
      if (isSemanticSearchActive) {
        return tenantVenueApi.semanticSearch(tenantKey!, {
          q: semanticQuery,
          city: cityFilter || undefined,
          limit: PAGE_SIZE,
        });
      }
      return tenantVenueApi.listTenantVenues(tenantKey!, {
        search: debouncedSearch || undefined,
        city: cityFilter || undefined,
        limit: PAGE_SIZE,
        offset,
        ...sortParams,
      });
    },
    enabled: !!tenantKey,
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

  // Full venue (incl. address/source/confidence/metadata) — needed to edit a row, since the
  // list projection omits them. The modal opens once the record resolves.
  const { data: editVenue } = useQuery({
    queryKey: ["admin", "tenant-venues", tenantKey, "venue", editVenueId],
    queryFn: () => tenantVenueApi.getTenantVenue(tenantKey!, editVenueId!),
    enabled: !!tenantKey && !!editVenueId,
  });

  // shortcut: city options come from the loaded page only (no city-list endpoint); upgrade when one exists.
  const cityOptions = useMemo(() => {
    const cities = new Set<string>();
    items.forEach((v) => {
      if (v.city) cities.add(v.city);
    });
    if (cityFilter) cities.add(cityFilter);
    return [...cities].sort().map((c) => ({ value: c, label: c }));
  }, [items, cityFilter]);

  const handleTenantChange = (value: string | null) => {
    setTenantKey(value);
    setPage(1);
    setSearch("");
    setCityFilter(null);
    setSemanticQuery("");
  };

  const handleEdit = (venue: TenantVenueSummary) => {
    setEditVenueId(venue.id);
  };
  const handleDelete = (venue: TenantVenueSummary) => {
    setDeleteVenue(venue);
  };
  const handleCloseEdit = () => {
    setEditVenueId(null);
  };
  const handleCloseDelete = () => {
    setDeleteVenue(null);
  };
  const handleReset = () => {
    setSearch("");
    setCityFilter(null);
    setSemanticQuery("");
    setPage(1);
  };

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Venues`]} />
      <PageHeader
        title={<Trans>Venues</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Catalog</Trans> },
          { label: <Trans>Venues</Trans> },
        ]}
        toolbar={
          /* Split button mirrors the Quick add / Full form menu in the mockup */
          <Menu shadow="md" width={220} position="bottom-end">
            <Group gap={0}>
              <Button
                leftSection={<IconPlus size={14} />}
                size="sm"
                disabled={!tenantKey}
                data-testid={TestSelectors.BUTTON.TENANT_VENUES_CREATE}
                onClick={openCreate}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              >
                <Trans>New venue</Trans>
              </Button>
              <Menu.Target>
                <Button
                  size="sm"
                  px="xs"
                  disabled={!tenantKey}
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

      <Stack gap="md">
        {/* ─── Organization selector ───────────────────────────────────────── */}
        <Paper p="md" withBorder={false} style={{ background: "var(--mantine-color-gray-0)" }}>
          <Group align="flex-end" gap="sm">
            <Select
              label={
                <Group gap={4}>
                  <IconBuilding size={14} />
                  <Text size="sm" fw={500}>
                    <Trans>Organization</Trans>
                  </Text>
                </Group>
              }
              placeholder={t`Select a tenant to view its venues`}
              data={tenantOptions}
              value={tenantKey}
              onChange={handleTenantChange}
              searchable
              clearable
              disabled={tenantsLoading}
              style={{ minWidth: 320 }}
              data-testid={TestSelectors.SELECT.TENANT_VENUES_TENANT}
            />
            {!tenantKey && (
              <Text size="sm" c="dimmed" pb={6}>
                <Trans>Select an organization to manage its venues.</Trans>
              </Text>
            )}
            {tenantKey && !isLoading && items.length > 0 && (
              <Badge
                variant="light"
                color="gray"
                size="sm"
                radius="sm"
                data-testid={TestSelectors.BADGE.TENANT_VENUES_TOTAL_COUNT}
              >
                {totalElements}
              </Badge>
            )}
          </Group>
        </Paper>

        {isError && tenantKey && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load venues</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch venues from the API.</Trans>{" "}
            <Button variant="subtle" color="red" size="xs" onClick={() => void refetch()}>
              <Trans>Retry</Trans>
            </Button>
          </Alert>
        )}

        {tenantKey && (
          <>
            <TenantVenueSemanticSearchWidget
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
                    <Tooltip label={t`Refresh`} withArrow>
                      <ActionIcon
                        data-testid={TestSelectors.BUTTON.TENANT_VENUES_REFRESH}
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
                        onView={() =>
                          void navigate({
                            to: "/admin/venues/$tenantKey/$venueId",
                            params: { tenantKey: tenantKey!, venueId: venue.id },
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
                        onView={() =>
                          void navigate({
                            to: "/admin/venues/$tenantKey/$venueId",
                            params: { tenantKey: tenantKey!, venueId: venue.id },
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
                    <Pagination
                      total={totalPages}
                      value={page}
                      onChange={setPage}
                      size="sm"
                      withEdges
                    />
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
          </>
        )}
      </Stack>

      {tenantKey && (
        <>
          <CreateTenantVenueModal
            tenantKey={tenantKey}
            opened={createOpened}
            onClose={closeCreate}
          />
          <EditTenantVenueModal
            tenantKey={tenantKey}
            venue={editVenue ?? null}
            opened={!!editVenue}
            onClose={handleCloseEdit}
          />
          <DeleteTenantVenueModal
            tenantKey={tenantKey}
            venue={deleteVenue}
            opened={!!deleteVenue}
            onClose={handleCloseDelete}
          />
        </>
      )}
    </Container>
  );
}
