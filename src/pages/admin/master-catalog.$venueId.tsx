import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  Badge,
  Button,
  ActionIcon,
  Tooltip,
  Tabs,
  SimpleGrid,
  Image,
  Divider,
  Anchor,
  RingProgress,
  ScrollArea,
  Center,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconMapPin,
  IconPhoto,
  IconPaperclip,
  IconExternalLink,
  IconAdjustments,
  IconCalendar,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { catalogApi } from "@/shared/api";
import type { MasterVenue, MasterVenueAsset } from "@/entities";
import { PageHeader } from "@/shared/ui";
import { EditMasterVenueModal, DeleteMasterVenueModal } from "@/features/master-venue-admin";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/admin/master-catalog/$venueId")({
  component: MasterVenueDetailPage,
});

// ─── Confidence ring ──────────────────────────────────────────────────────────

function ConfidenceRing({
  value,
  isLoading,
  "data-testid": testId,
}: {
  value: number | null;
  isLoading: boolean;
  "data-testid"?: string;
}) {
  if (isLoading) return <Skeleton circle height={56} />;
  if (value === null) return <Text size="sm" c="dimmed">—</Text>;

  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";

  return (
    <RingProgress
      size={56}
      thickness={5}
      roundCaps
      sections={[{ value: pct, color }]}
      data-testid={testId}
      label={
        <Center>
          <Text size="xs" fw={700} c={color} lh={1}>
            {pct}%
          </Text>
        </Center>
      }
    />
  );
}

// ─── Section sub-card ─────────────────────────────────────────────────────────

interface SubCardProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  skeletonRows?: number;
}

function SubCard({ icon, title, children, isLoading, skeletonRows = 3 }: SubCardProps) {
  return (
    <Paper shadow="xs" radius="md" p="md" withBorder h="100%">
      <Stack gap="sm">
        <Group gap="xs">
          <ThemeIcon size={28} radius="sm" variant="light" color="blue">
            {icon}
          </ThemeIcon>
          <Text size="sm" fw={600}>
            {title}
          </Text>
        </Group>
        <Divider />
        {isLoading ? (
          <Stack gap={8}>
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <Skeleton key={i} height={14} width={`${75 - i * 10}%`} radius="sm" />
            ))}
          </Stack>
        ) : (
          children
        )}
      </Stack>
    </Paper>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start">
      <Text size="xs" c="dimmed" fw={500} style={{ width: 110, flexShrink: 0, paddingTop: 1 }}>
        {label}
      </Text>
      <Text size="sm" style={{ flex: 1, wordBreak: "break-word" }}>
        {value ?? <Text span c="dimmed">—</Text>}
      </Text>
    </Group>
  );
}

// ─── Pretty metadata viewer ───────────────────────────────────────────────────

function MetadataViewer({ raw }: { raw: string | null }) {
  if (!raw) {
    return (
      <Text size="sm" c="dimmed">
        <Trans>No metadata.</Trans>
      </Text>
    );
  }

  let formatted = raw;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    // not valid JSON — show as-is
  }

  return (
    <ScrollArea.Autosize mah={360}>
      <Box
        component="pre"
        style={{
          margin: 0,
          padding: "var(--mantine-spacing-sm)",
          background: "var(--mantine-color-gray-0)",
          borderRadius: "var(--mantine-radius-sm)",
          border: "1px solid var(--mantine-color-gray-2)",
          fontFamily: "var(--mantine-font-family-monospace)",
          fontSize: "var(--mantine-font-size-xs)",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {formatted}
      </Box>
    </ScrollArea.Autosize>
  );
}

// ─── Photos tab ───────────────────────────────────────────────────────────────

function PhotosTab({ photos, isLoading }: { photos: MasterVenueAsset[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={160} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (photos.length === 0) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <IconPhoto size={24} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">
          <Trans>No photos for this venue.</Trans>
        </Text>
      </Stack>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
      {photos.map((photo, i) => (
        <Paper key={photo.id} shadow="xs" radius="md" withBorder style={{ overflow: "hidden" }}>
          {photo.sourceUrl ? (
            <Box style={{ height: 160, overflow: "hidden" }}>
              <Image
                src={photo.sourceUrl}
                alt={photo.label ?? photo.fileName ?? ""}
                w="100%"
                h={160}
                style={{ objectFit: "cover", display: "block" }}
              />
            </Box>
          ) : (
            <Box
              style={{
                height: 160,
                background: "var(--mantine-color-gray-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPhoto size={28} color="var(--mantine-color-gray-4)" />
            </Box>
          )}
          <Group gap="xs" px="xs" py={6} justify="space-between">
            <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
              {photo.label ?? photo.fileName ?? photo.id}
            </Text>
            <Badge variant="outline" color="gray" size="xs" radius="sm">
              #{i + 1}
            </Badge>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

function AssetsTab({ assets, isLoading }: { assets: MasterVenueAsset[]; isLoading: boolean }) {
  const { t } = useLingui();

  if (isLoading) return <Skeleton height={200} radius="md" />;

  if (assets.length === 0) {
    return (
      <Stack align="center" py="xl" gap="xs">
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          <IconPaperclip size={24} />
        </ThemeIcon>
        <Text size="sm" c="dimmed">
          {t`No assets for this venue.`}
        </Text>
      </Stack>
    );
  }

  return (
    <Paper shadow="xs" radius="md" withBorder style={{ overflow: "hidden" }}>
      {/* header */}
      <Group
        px="md"
        py={8}
        style={{ background: "var(--mantine-color-gray-0)", borderBottom: "1px solid var(--mantine-color-gray-2)" }}
      >
        {(
          [
            [t`Type`, "100px"],
            [t`Label / file`, "1fr"],
            [t`Content type`, "150px"],
            [t`Size`, "80px"],
            [t`Provider`, "100px"],
          ] as [string, string][]
        ).map(([col, w]) => (
          <Text
            key={col}
            size="xs"
            fw={600}
            c="dimmed"
            tt="uppercase"
            lts={0.4}
            style={{ width: w, flexShrink: 0 }}
          >
            {col}
          </Text>
        ))}
      </Group>
      {assets.map((asset, i) => (
        <Group
          key={asset.id}
          px="md"
          py={10}
          style={{
            borderBottom:
              i < assets.length - 1 ? "1px solid var(--mantine-color-gray-1)" : "none",
          }}
        >
          <Box style={{ width: "100px", flexShrink: 0 }}>
            <Badge variant="dot" size="sm" color="blue">
              {asset.assetType}
            </Badge>
          </Box>
          <Text size="xs" c="dimmed" lineClamp={1} style={{ flex: 1 }}>
            {asset.label ?? asset.fileName ?? asset.id}
          </Text>
          <Text size="xs" c="dimmed" style={{ width: "150px", flexShrink: 0 }}>
            {asset.contentType ?? "—"}
          </Text>
          <Text size="xs" c="dimmed" style={{ width: "80px", flexShrink: 0 }}>
            {asset.sizeBytes === null ? "—" : `${Math.round(asset.sizeBytes / 1024)} KB`}
          </Text>
          <Text size="xs" c="dimmed" style={{ width: "100px", flexShrink: 0 }}>
            {asset.provider ?? "—"}
          </Text>
        </Group>
      ))}
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MasterVenueDetailPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { venueId } = Route.useParams();

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [deletedVenue, setDeletedVenue] = useState<MasterVenue | null>(null);

  const {
    data: venue,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "master-venue", venueId],
    queryFn: () => catalogApi.getMasterVenue(venueId),
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["admin", "master-venue", venueId, "assets"],
    queryFn: () => catalogApi.listMasterVenueAssets(venueId),
  });

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["admin", "master-venue", venueId, "photos"],
    queryFn: () => catalogApi.listMasterVenuePhotos(venueId),
  });

  const assets = assetsData?.items ?? [];
  const photos = photosData?.items ?? [];

  const mapUrl =
    venue?.locationLat && venue?.locationLng
      ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
      : null;

  const handleDeleteSuccess = () => {
    void navigate({ to: "/admin/master-catalog" });
  };

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageTitle segments={[t`Master Catalog`, t`Venue`]} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load the master venue</Trans>}
          color="red"
          variant="light"
          mt="md"
        >
          <Trans>The venue could not be found or the API is unavailable.</Trans>
          <Group mt="sm">
            <Button
              variant="light"
              color="red"
              size="xs"
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DETAIL_ERROR_RETRY}
              onClick={() => void refetch()}
            >
              <Trans>Retry</Trans>
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => void navigate({ to: "/admin/master-catalog" })}
            >
              <Trans>Back to list</Trans>
            </Button>
          </Group>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Master Catalog`, venue?.name ?? t`Venue`]} />
      <PageHeader
        title={<Trans>Master Venue</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Catalog</Trans> },
          { label: <Trans>Master Catalog</Trans>, to: "/admin/master-catalog" },
          { label: venue?.name ?? t`Venue` },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                data-testid={TestSelectors.BUTTON.MASTER_VENUE_DETAIL_REFRESH}
                variant="subtle"
                color="gray"
                size="sm"
                onClick={() => void refetch()}
                loading={isFetching}
              >
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconEdit size={15} />}
              disabled={!venue}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DETAIL_EDIT}
              onClick={openEdit}
            >
              <Trans>Edit</Trans>
            </Button>
            <Button
              variant="light"
              color="red"
              size="sm"
              leftSection={<IconTrash size={15} />}
              disabled={!venue}
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_DETAIL_DELETE}
              onClick={() => {
                setDeletedVenue(venue ?? null);
                openDelete();
              }}
            >
              <Trans>Delete</Trans>
            </Button>
          </Group>
        }
      />

      <Stack gap="md">
        {/* ── Hero card ─────────────────────────────────────────────────── */}
        <Paper
          shadow="sm"
          radius="md"
          withBorder
          style={{ overflow: "hidden" }}
          data-testid={TestSelectors.MASTER_VENUE_DETAIL_HERO_CARD}
        >
          {/* photo banner */}
          {!isLoading && venue?.primaryPhotoUrl && (
            <Box style={{ height: 180, overflow: "hidden", position: "relative" }}>
              <Image
                src={venue.primaryPhotoUrl}
                alt={venue.name}
                w="100%"
                h={180}
                style={{ objectFit: "cover", display: "block" }}
              />
              {/* subtle dark gradient so text below reads cleanly */}
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)",
                }}
              />
            </Box>
          )}

          <Box p="lg">
            <Group gap="lg" wrap="nowrap" align="flex-start">
              {/* avatar — shown when no banner photo */}
              {!venue?.primaryPhotoUrl && (
                isLoading ? (
                  <Skeleton w={64} h={64} radius="md" style={{ flexShrink: 0 }} />
                ) : (
                  <ThemeIcon
                    size={64}
                    radius="md"
                    variant="light"
                    color="blue"
                    style={{ flexShrink: 0 }}
                  >
                    <IconBuildingStore size={32} />
                  </ThemeIcon>
                )
              )}

              {/* identity */}
              <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
                {isLoading ? (
                  <>
                    <Skeleton height={26} width={280} radius="sm" />
                    <Skeleton height={18} width={140} radius="sm" />
                  </>
                ) : (
                  <>
                    <Text
                      size="xl"
                      fw={700}
                      lh={1.2}
                      data-testid={TestSelectors.MASTER_VENUE_DETAIL_NAME}
                    >
                      {venue?.name}
                    </Text>

                    <Group gap="xs" wrap="wrap">
                      <Badge
                        variant="light"
                        color="blue"
                        size="sm"
                        tt="uppercase"
                        style={{ letterSpacing: "0.03em" }}
                        data-testid={TestSelectors.MASTER_VENUE_DETAIL_SOURCE}
                      >
                        {venue?.source ?? "—"}
                      </Badge>

                      {venue?.city && (
                        <Group gap={4} wrap="nowrap">
                          <IconMapPin size={13} color="var(--mantine-color-gray-5)" />
                          <Text
                            size="sm"
                            c="dimmed"
                            data-testid={TestSelectors.MASTER_VENUE_DETAIL_CITY}
                          >
                            {venue.city}
                          </Text>
                        </Group>
                      )}

                      {venue?.address && (
                        <Text size="sm" c="dimmed" lineClamp={1}>
                          {venue.address}
                        </Text>
                      )}
                    </Group>

                    <Group gap="md" wrap="wrap" mt={2}>
                      <Group gap={4}>
                        <IconCalendar size={12} color="var(--mantine-color-gray-4)" />
                        <Text size="xs" c="dimmed">
                          {dayjs(venue?.createdAt).format("MMM D, YYYY HH:mm")}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed">
                        <Trans>Updated</Trans>{" "}
                        {dayjs(venue?.updatedAt).format("MMM D, YYYY HH:mm")}
                      </Text>
                    </Group>
                  </>
                )}
              </Stack>

              {/* confidence ring */}
              <Stack gap={4} align="center" style={{ flexShrink: 0 }}>
                <ConfidenceRing
                  value={venue?.confidence ?? null}
                  isLoading={isLoading}
                  data-testid={TestSelectors.MASTER_VENUE_DETAIL_CONFIDENCE}
                />
                <Text size="xs" c="dimmed" tt="uppercase" fw={500} lts={0.4}>
                  <Trans>Confidence</Trans>
                </Text>
              </Stack>
            </Group>
          </Box>
        </Paper>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab
              value="overview"
              data-testid={TestSelectors.TAB.MASTER_VENUE_OVERVIEW}
              leftSection={<IconBuildingStore size={15} />}
            >
              <Trans>Overview</Trans>
            </Tabs.Tab>
            <Tabs.Tab
              value="photos"
              data-testid={TestSelectors.TAB.MASTER_VENUE_PHOTOS}
              leftSection={<IconPhoto size={15} />}
            >
              <Trans>Photos</Trans>
              {!photosLoading && photos.length > 0 && (
                <Badge variant="light" color="gray" size="xs" ml={6}>
                  {photos.length}
                </Badge>
              )}
            </Tabs.Tab>
            <Tabs.Tab
              value="assets"
              data-testid={TestSelectors.TAB.MASTER_VENUE_ASSETS}
              leftSection={<IconPaperclip size={15} />}
            >
              <Trans>Assets</Trans>
              {!assetsLoading && assets.length > 0 && (
                <Badge variant="light" color="gray" size="xs" ml={6}>
                  {assets.length}
                </Badge>
              )}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              {/* location + curation side by side */}
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <SubCard
                  icon={<IconMapPin size={16} />}
                  title={<Trans>Location</Trans>}
                  isLoading={isLoading}
                  skeletonRows={4}
                >
                  <Stack gap={10}>
                    <FieldRow label={<Trans>Address</Trans>} value={venue?.address} />
                    <FieldRow label={<Trans>City</Trans>} value={venue?.city} />
                    <FieldRow
                      label={<Trans>Coordinates</Trans>}
                      value={
                        venue?.locationLat && venue?.locationLng ? (
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm">
                              {String(venue.locationLat)}, {String(venue.locationLng)}
                            </Text>
                            {mapUrl && (
                              <Anchor
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="xs"
                              >
                                <Group gap={3} wrap="nowrap">
                                  <IconExternalLink size={11} />
                                  <Trans>Maps</Trans>
                                </Group>
                              </Anchor>
                            )}
                          </Group>
                        ) : null
                      }
                    />
                  </Stack>
                </SubCard>

                <SubCard
                  icon={<IconAdjustments size={16} />}
                  title={<Trans>Curation</Trans>}
                  isLoading={isLoading}
                  skeletonRows={3}
                >
                  <Stack gap={10}>
                    <FieldRow label={<Trans>Source</Trans>} value={
                      venue?.source ? (
                        <Badge variant="light" color="blue" size="sm" tt="uppercase" style={{ letterSpacing: "0.03em" }}>
                          {venue.source}
                        </Badge>
                      ) : null
                    } />
                    <FieldRow
                      label={<Trans>Confidence</Trans>}
                      value={
                        venue?.confidence != null ? (
                          <Group gap={8} wrap="nowrap">
                            <ConfidenceRing value={venue.confidence} isLoading={false} />
                            <Stack gap={2}>
                              <Text size="xs" c="dimmed">
                                <Trans>Quality score assigned by the ingestion pipeline.</Trans>
                              </Text>
                              <Text size="xs" c="dimmed">
                                {venue.confidence.toFixed(4)}
                              </Text>
                            </Stack>
                          </Group>
                        ) : null
                      }
                    />
                    <FieldRow
                      label={<Trans>Created</Trans>}
                      value={venue?.createdAt ? dayjs(venue.createdAt).format("MMM D, YYYY HH:mm") : null}
                    />
                    <FieldRow
                      label={<Trans>Updated</Trans>}
                      value={venue?.updatedAt ? dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm") : null}
                    />
                  </Stack>
                </SubCard>
              </SimpleGrid>

              {/* metadata */}
              <Paper shadow="xs" radius="md" p="md" withBorder>
                <Stack gap="sm">
                  <Group gap="xs">
                    <ThemeIcon size={28} radius="sm" variant="light" color="gray">
                      <IconPaperclip size={14} />
                    </ThemeIcon>
                    <Stack gap={1}>
                      <Text size="sm" fw={600}>
                        <Trans>Metadata</Trans>
                      </Text>
                      <Text size="xs" c="dimmed">
                        <Trans>Raw JSONB document managed by the ingestion worker.</Trans>
                      </Text>
                    </Stack>
                  </Group>
                  <Divider />
                  {isLoading ? (
                    <Skeleton height={120} radius="sm" />
                  ) : (
                    <MetadataViewer raw={venue?.metadata ?? null} />
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="photos" pt="md">
            <PhotosTab photos={photos} isLoading={photosLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="assets" pt="md">
            <AssetsTab assets={assets} isLoading={assetsLoading} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <EditMasterVenueModal venue={venue ?? null} opened={editOpened} onClose={closeEdit} />
      <DeleteMasterVenueModal
        venue={deletedVenue}
        opened={deleteOpened}
        onClose={closeDelete}
        onDeleted={handleDeleteSuccess}
      />
    </Container>
  );
}
