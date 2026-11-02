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

function ConfidenceRing({ value, isLoading }: { value: number | null; isLoading: boolean }) {
  if (isLoading) return <Skeleton circle height={64} />;
  if (value === null)
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );

  const pct = Math.round(value * 100);
  const color = pct >= 80 ? "green" : pct >= 50 ? "orange" : "red";

  return (
    <RingProgress
      size={64}
      thickness={6}
      roundCaps
      sections={[{ value: pct, color }]}
      label={
        <Center>
          <Text size="xs" fw={700} c={color}>
            {pct}%
          </Text>
        </Center>
      }
    />
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  isLoading?: boolean;
  "data-testid"?: string;
}

function StatCard({ label, value, isLoading, "data-testid": testId }: StatCardProps) {
  return (
    <Stack gap={4} align="center" py="md" data-testid={testId}>
      {isLoading ? (
        <Skeleton height={28} width={60} radius="sm" />
      ) : (
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
      )}
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} lts={0.5}>
        {label}
      </Text>
    </Stack>
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
          <Skeleton key={i} height={140} radius="sm" />
        ))}
      </SimpleGrid>
    );
  }

  if (photos.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        <Trans>No photos for this venue.</Trans>
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 2, sm: 3, lg: 4 }} spacing="md">
      {photos.map((photo) => (
        <Stack key={photo.id} gap={4}>
          {photo.sourceUrl ? (
            <Image
              src={photo.sourceUrl}
              alt={photo.label ?? photo.fileName ?? ""}
              height={140}
              radius="sm"
              fit="cover"
            />
          ) : (
            <Box
              style={{
                height: 140,
                borderRadius: "var(--mantine-radius-sm)",
                background: "var(--mantine-color-gray-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconPhoto size={24} color="var(--mantine-color-gray-5)" />
            </Box>
          )}
          <Text size="xs" c="dimmed" lineClamp={1}>
            {photo.label ?? photo.fileName ?? photo.id}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  );
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

function AssetsTab({ assets, isLoading }: { assets: MasterVenueAsset[]; isLoading: boolean }) {
  const { t } = useLingui();

  if (isLoading) return <Skeleton height={200} radius="sm" />;

  if (assets.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t`No assets for this venue.`}
      </Text>
    );
  }

  return (
    <Stack gap={0}>
      {/* header row */}
      <Group
        px="sm"
        py={6}
        style={{
          background: "var(--mantine-color-gray-0)",
          borderRadius: "var(--mantine-radius-sm) var(--mantine-radius-sm) 0 0",
          border: "1px solid var(--mantine-color-gray-2)",
          borderBottom: "none",
        }}
      >
        {(
          [
            [t`Type`, "120px"],
            [t`Label / file`, "1fr"],
            [t`Content type`, "160px"],
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
          px="sm"
          py={8}
          style={{
            border: "1px solid var(--mantine-color-gray-2)",
            borderTop: i === 0 ? "1px solid var(--mantine-color-gray-2)" : "none",
            borderRadius:
              i === assets.length - 1 ? "0 0 var(--mantine-radius-sm) var(--mantine-radius-sm)" : 0,
          }}
        >
          <Text size="xs" style={{ width: "120px", flexShrink: 0 }}>
            <Badge variant="dot" size="sm" color="gray">
              {asset.assetType}
            </Badge>
          </Text>
          <Text size="xs" c="dimmed" lineClamp={1} style={{ width: "1fr", flex: 1 }}>
            {asset.label ?? asset.fileName ?? asset.id}
          </Text>
          <Text size="xs" c="dimmed" style={{ width: "160px", flexShrink: 0 }}>
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
    </Stack>
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

  // first photo with a sourceUrl — used as hero thumbnail
  const heroPhoto = photos.find((p) => p.sourceUrl) ?? null;

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
          p="lg"
          radius="md"
          withBorder
          data-testid={TestSelectors.MASTER_VENUE_DETAIL_HERO_CARD}
        >
          <Group gap="lg" wrap="nowrap" align="flex-start">
            {/* thumbnail */}
            {photosLoading ? (
              <Skeleton width={80} height={80} radius="md" style={{ flexShrink: 0 }} />
            ) : heroPhoto?.sourceUrl ? (
              <Image
                src={heroPhoto.sourceUrl}
                alt={heroPhoto.label ?? heroPhoto.fileName ?? ""}
                width={80}
                height={80}
                radius="md"
                fit="cover"
                style={{ flexShrink: 0 }}
              />
            ) : (
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "var(--mantine-radius-md)",
                  background: "var(--mantine-color-gray-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <IconBuildingStore size={32} color="var(--mantine-color-gray-5)" />
              </Box>
            )}

            {/* identity */}
            <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
              {isLoading ? (
                <Skeleton height={24} width={240} radius="sm" />
              ) : (
                <Text size="xl" fw={700} data-testid={TestSelectors.MASTER_VENUE_DETAIL_NAME}>
                  {venue?.name}
                </Text>
              )}

              <Group gap="xs" wrap="wrap">
                {isLoading ? (
                  <Skeleton height={20} width={80} radius="xl" />
                ) : (
                  <Badge
                    variant="light"
                    color="gray"
                    size="sm"
                    data-testid={TestSelectors.MASTER_VENUE_DETAIL_SOURCE}
                  >
                    {venue?.source ?? "—"}
                  </Badge>
                )}

                {!isLoading && venue?.city && (
                  <Text size="sm" c="dimmed" data-testid={TestSelectors.MASTER_VENUE_DETAIL_CITY}>
                    <IconMapPin size={13} style={{ verticalAlign: "middle" }} /> {venue.city}
                  </Text>
                )}

                {!isLoading && venue?.address && (
                  <Text size="sm" c="dimmed" lineClamp={1}>
                    {venue.address}
                  </Text>
                )}
              </Group>

              <Group gap="lg" wrap="wrap">
                <Text size="xs" c="dimmed">
                  <Trans>Created</Trans>:{" "}
                  {isLoading ? "…" : dayjs(venue?.createdAt).format("MMM D, YYYY HH:mm")}
                </Text>
                <Text size="xs" c="dimmed">
                  <Trans>Updated</Trans>:{" "}
                  {isLoading ? "…" : dayjs(venue?.updatedAt).format("MMM D, YYYY HH:mm")}
                </Text>
                {!isLoading && mapUrl && (
                  <Anchor
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="xs"
                    c="blue"
                  >
                    <Group gap={4} wrap="nowrap">
                      <IconExternalLink size={12} />
                      <Trans>Open in Maps</Trans>
                    </Group>
                  </Anchor>
                )}
              </Group>
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

          <Divider my="md" />

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <StatCard
              label={<Trans>Latitude</Trans>}
              value={venue?.locationLat ?? "—"}
              isLoading={isLoading}
            />
            <StatCard
              label={<Trans>Longitude</Trans>}
              value={venue?.locationLng ?? "—"}
              isLoading={isLoading}
            />
          </SimpleGrid>
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
            {isLoading ? (
              <Stack gap="sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={16} width={`${60 - i * 8}%`} radius="sm" />
                ))}
              </Stack>
            ) : (
              <Stack gap="sm">
                {(
                  [
                    [<Trans key="addr">Address</Trans>, venue?.address],
                    [<Trans key="city">City</Trans>, venue?.city],
                    [<Trans key="src">Source</Trans>, venue?.source],
                    [
                      <Trans key="lat">Coordinates</Trans>,
                      venue?.locationLat && venue?.locationLng
                        ? `${venue.locationLat}, ${venue.locationLng}`
                        : null,
                    ],
                  ] as [React.ReactNode, string | number | null | undefined][]
                ).map(([label, val], i) => (
                  <Group key={i} gap="xs" wrap="nowrap">
                    <Text size="sm" fw={600} style={{ width: 140, flexShrink: 0 }}>
                      {label}
                    </Text>
                    <Text size="sm" c="dimmed">
                      {val ?? "—"}
                    </Text>
                  </Group>
                ))}

                <Divider my="xs" />

                <Text size="sm" fw={600}>
                  <Trans>Metadata</Trans>
                </Text>
                <MetadataViewer raw={venue?.metadata ?? null} />
              </Stack>
            )}
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
