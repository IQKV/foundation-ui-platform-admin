import { useRef, useState } from "react";
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
  Divider,
  Anchor,
  RingProgress,
  ScrollArea,
  Center,
  ThemeIcon,
  Collapse,
  Modal,
  Image,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconMapPin,
  IconPhoto,
  IconPaperclip,
  IconExternalLink,
  IconAdjustments,
  IconCheck,
  IconAlertTriangle,
  IconEye,
  IconUpload,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { tenantVenueApi, uploadFileToPresignedUrl } from "@/shared/api";
import type { TenantVenue, TenantVenueAsset, TenantVenuePhoto } from "@/entities";
import { PageHeader } from "@/shared/ui";
import {
  ACCENT_GRADIENT,
  ASSET_ROW_STYLES,
  DeleteTenantVenueModal,
  EditTenantVenueModal,
  SECTION_CARD_STYLES,
  VenueMetadataSections,
} from "@/features/tenant-venue-admin";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/admin/venues/$tenantKey/$venueId")({
  component: TenantVenueDetailPage,
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
  if (isLoading) return <Skeleton circle height={52} />;
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
      size={52}
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

// ─── Section card — mirrors SectionCard from mockup ──────────────────────────
// Read-only; shows: title + completeness indicator + field chips

interface InfoSectionCardProps {
  title: React.ReactNode;
  icon: React.ReactNode;
  /** Number of populated fields out of total — shown as completeness badge. */
  filled?: number;
  total?: number;
  isLoading?: boolean;
  children: React.ReactNode;
}

function InfoSectionCard({
  title,
  icon,
  filled,
  total,
  isLoading,
  children,
}: InfoSectionCardProps) {
  const allFilled = filled != null && total != null && filled === total && total > 0;
  return (
    <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
      <Group justify="space-between" align="flex-start" mb="sm">
        <Group gap={8}>
          <ThemeIcon size={28} radius="sm" variant="light" color="blue">
            {icon}
          </ThemeIcon>
          <Text size="md" fw={700}>
            {title}
          </Text>
        </Group>
        {filled != null && total != null && total > 0 && (
          <Badge
            variant="light"
            color={allFilled ? "teal" : "gray"}
            size="xs"
            leftSection={
              allFilled ? (
                <IconCheck size={10} style={{ marginTop: 1 }} />
              ) : (
                <IconAlertTriangle size={10} style={{ marginTop: 1 }} />
              )
            }
          >
            {filled}/{total}
          </Badge>
        )}
      </Group>
      <Divider mb="sm" />
      {isLoading ? (
        <Stack gap={8}>
          {[75, 55, 65, 45].map((w, i) => (
            <Skeleton key={i} height={13} width={`${w}%`} radius="sm" />
          ))}
        </Stack>
      ) : (
        children
      )}
    </Paper>
  );
}

// ─── Field chip — mirrors FieldSummaryChip from mockup ───────────────────────

function FieldChip({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  const empty = value == null || value === "";
  return (
    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {label}:
      </Text>
      {empty ? (
        <Text size="sm" c="dimmed" fs="italic">
          —
        </Text>
      ) : (
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {value}
        </Text>
      )}
    </Group>
  );
}

// ─── Pretty metadata viewer ───────────────────────────────────────────────────

function MetadataViewer({ raw }: { raw: string | null }) {
  if (!raw) {
    return (
      <Text size="sm" c="dimmed" fs="italic">
        <Trans>No metadata.</Trans>
      </Text>
    );
  }
  let formatted = raw;
  try {
    formatted = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    /* show as-is */
  }
  return (
    <ScrollArea.Autosize mah={340}>
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

function PhotosTab({ photos, isLoading }: { photos: TenantVenuePhoto[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height={130} radius="sm" />
        ))}
      </SimpleGrid>
    );
  }
  if (photos.length === 0) {
    return (
      <Paper
        withBorder
        p="xl"
        radius="md"
        style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
      >
        <Stack align="center" gap="sm">
          <IconPhoto size={40} color="var(--mantine-color-gray-4)" />
          <Text size="sm" c="dimmed">
            <Trans>No photos for this venue.</Trans>
          </Text>
        </Stack>
      </Paper>
    );
  }
  return (
    <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5 }} spacing="sm">
      {photos.map((photo, i) => (
        <Box key={photo.id} style={{ position: "relative" }}>
          {photo.sourceUrl ? (
            <Image
              src={photo.sourceUrl}
              alt={photo.label ?? photo.fileName ?? `Photo ${i + 1}`}
              h={130}
              radius="sm"
              fit="cover"
            />
          ) : (
            <Group
              justify="center"
              align="center"
              style={{
                height: 130,
                background: "var(--mantine-color-gray-1)",
                borderRadius: "var(--mantine-radius-sm)",
              }}
            >
              <IconPhoto size={24} color="var(--mantine-color-gray-4)" />
            </Group>
          )}
          {/* display order overlay — mirrors ExtractionStatusDot position */}
          <Box style={{ position: "absolute", top: 6, right: 6 }}>
            <Badge variant="filled" color="dark" size="xs" radius="sm" style={{ opacity: 0.75 }}>
              #{i + 1}
            </Badge>
          </Box>
          {photo.label && (
            <Text size="xs" c="dimmed" lineClamp={1} mt={4}>
              {photo.label}
            </Text>
          )}
        </Box>
      ))}
    </SimpleGrid>
  );
}

// ─── Assets tab ───────────────────────────────────────────────────────────────

function AssetsTab({
  assets,
  isLoading,
  previewUrls,
}: {
  assets: TenantVenueAsset[];
  isLoading: boolean;
  /** Presigned image URL per asset id — only photos have one. */
  previewUrls: Map<string, string>;
}) {
  const { t } = useLingui();
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(null);

  return (
    <>
      {isLoading ? (
        <Skeleton height={200} radius="md" />
      ) : assets.length === 0 ? (
        <Paper
          withBorder
          p="xl"
          radius="md"
          style={{ textAlign: "center", background: "var(--mantine-color-gray-0)" }}
        >
          <Stack align="center" gap="sm">
            <IconPaperclip size={40} color="var(--mantine-color-gray-4)" />
            <Text size="sm" c="dimmed">{t`No assets for this venue.`}</Text>
          </Stack>
        </Paper>
      ) : (
        <Stack gap={6}>
          {assets.map((asset) => {
            const previewUrl = previewUrls.get(asset.id);
            const name = asset.label ?? asset.fileName ?? asset.id;
            return (
              <Paper key={asset.id} withBorder p="sm" radius="md" styles={ASSET_ROW_STYLES}>
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon
                      size={32}
                      radius="sm"
                      variant="light"
                      color="gray"
                      style={{ flexShrink: 0 }}
                    >
                      <IconPaperclip size={16} />
                    </ThemeIcon>
                    <Stack gap={0} style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {asset.assetType}
                        {asset.contentType ? ` · ${asset.contentType}` : ""}
                        {asset.sizeBytes != null
                          ? ` · ${Math.round(asset.sizeBytes / 1024)} KB`
                          : ""}
                      </Text>
                    </Stack>
                  </Group>
                  {previewUrl && (
                    <Button
                      size="compact-sm"
                      variant="subtle"
                      leftSection={<IconEye size={14} />}
                      style={{ flexShrink: 0 }}
                      onClick={() => setPreview({ url: previewUrl, title: name })}
                    >
                      <Trans>Preview</Trans>
                    </Button>
                  )}
                </Group>
              </Paper>
            );
          })}
        </Stack>
      )}

      <Modal
        opened={preview !== null}
        onClose={() => setPreview(null)}
        size="xl"
        centered
        title={preview?.title}
      >
        {preview && (
          <img
            src={preview.url}
            alt={preview.title}
            style={{
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
              display: "block",
              borderRadius: "var(--mantine-radius-sm)",
            }}
          />
        )}
      </Modal>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const bigTabStyles = {
  tab: {
    fontSize: "var(--mantine-font-size-lg)",
    fontWeight: 600,
    padding: "var(--mantine-spacing-md) var(--mantine-spacing-xl)",
  },
};

function TenantVenueDetailPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { tenantKey, venueId } = Route.useParams();

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [advancedOpened, { toggle: toggleAdvanced }] = useDisclosure(false);
  const [deletedVenue, setDeletedVenue] = useState<TenantVenue | null>(null);

  const queryClient = useQueryClient();
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: venue,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["admin", "tenant-venues", tenantKey, "venue", venueId],
    queryFn: () => tenantVenueApi.getTenantVenue(tenantKey, venueId),
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ["admin", "tenant-venues", tenantKey, "venue", venueId, "assets"],
    queryFn: () => tenantVenueApi.listTenantVenueAssets(tenantKey, venueId),
  });

  const { data: photosData, isLoading: photosLoading } = useQuery({
    queryKey: ["admin", "tenant-venues", tenantKey, "venue", venueId, "photos"],
    queryFn: () => tenantVenueApi.listTenantVenuePhotos(tenantKey, venueId),
  });

  const assets = assetsData?.items ?? [];
  const photos = photosData?.items ?? [];

  // Presigned image URL per photo asset — drives the Assets tab preview modal.
  const photoUrlById = new Map<string, string>();
  for (const photo of photos) {
    if (photo.sourceUrl) photoUrlById.set(photo.id, photo.sourceUrl);
  }

  // The full venue projection carries no photo URL — photos come from the assets endpoint.
  const hasPhoto = false;

  const mapUrl =
    venue?.locationLat && venue?.locationLng
      ? `https://maps.google.com/?q=${venue.locationLat},${venue.locationLng}`
      : null;

  const handleDeleteSuccess = () => void navigate({ to: "/admin/venues" });

  /** Initiate → PUT to MinIO → confirm, then refresh the venue's asset queries. */
  const handleUploadAsset = async (file: File) => {
    setUploadingAsset(true);
    try {
      const init = await tenantVenueApi.initiateAssetUpload(tenantKey, venueId, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      await uploadFileToPresignedUrl(init.presignedUploadUrl, file, () => {});
      await tenantVenueApi.confirmAssetUpload(tenantKey, venueId, init.assetId, {
        objectKey: init.objectKey,
        fileName: file.name,
        assetType: file.type.startsWith("image/") ? "PHOTO" : "DOCUMENT",
      });
      await queryClient.invalidateQueries({
        queryKey: ["admin", "tenant-venues", tenantKey, "venue", venueId],
      });
      notifications.show({
        message: t`Asset uploaded.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        message:
          err instanceof Error ? err.message : t`Could not upload the asset. Please try again.`,
        color: "red",
        icon: <IconAlertTriangle size={16} />,
      });
    } finally {
      setUploadingAsset(false);
      if (assetFileInputRef.current) assetFileInputRef.current.value = "";
    }
  };

  // Completeness counts for section cards
  const locationFilled = [venue?.address, venue?.city, venue?.locationLat].filter(Boolean).length;
  const curationFilled = [venue?.source, venue?.confidence].filter((v) => v != null).length;

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageTitle segments={[t`Venues`, t`Venue`]} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load the venue</Trans>}
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
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_ERROR_RETRY}
              onClick={() => void refetch()}
            >
              <Trans>Retry</Trans>
            </Button>
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={() => void navigate({ to: "/admin/venues" })}
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
      <PageTitle
        segments={[
          t`Venues`,
          venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue`,
        ]}
      />
      <PageHeader
        title={<Trans>Venue</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Catalog</Trans> },
          { label: <Trans>Venues</Trans>, to: "/admin/venues" },
          { label: venue ? [venue.name, venue.city].filter(Boolean).join(", ") : t`Venue` },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Back to search`} withArrow>
              <ActionIcon
                data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_BACK}
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={t`Back to search`}
                onClick={() => void navigate({ to: "/admin/venues" })}
              >
                <IconArrowLeft size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_REFRESH}
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
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_EDIT}
              onClick={openEdit}
            >
              <Trans>Edit</Trans>
            </Button>
            <Button
              variant="light"
              size="sm"
              leftSection={<IconUpload size={15} />}
              disabled={!venue}
              loading={uploadingAsset}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_ASSET_UPLOAD}
              onClick={() => assetFileInputRef.current?.click()}
            >
              <Trans>Upload asset</Trans>
            </Button>
            <input
              ref={assetFileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) void handleUploadAsset(file);
              }}
            />
            <Button
              variant="light"
              color="red"
              size="sm"
              leftSection={<IconTrash size={15} />}
              disabled={!venue}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_DETAIL_DELETE}
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
        {/* ── Hero — mirrors VenueProfileHeader ───────────────────────── */}
        <Box
          style={{
            position: "relative",
            borderRadius: "var(--mantine-radius-lg)",
            overflow: "hidden",
          }}
          data-testid={TestSelectors.TENANT_VENUE_DETAIL_HERO_CARD}
        >
          {/* placeholder — 300px, mirrors the mockup exactly */}
          <Box
            style={{
              height: 300,
              background:
                "linear-gradient(135deg, var(--mantine-color-gray-2) 0%, var(--mantine-color-gray-4) 100%)",
              position: "relative",
            }}
          >
            {isLoading && <Skeleton height={300} radius={0} />}

            {!isLoading && !hasPhoto && (
              <Group justify="center" align="center" style={{ height: "100%", opacity: 0.2 }}>
                <IconBuildingStore size={96} color="var(--mantine-color-gray-7)" />
              </Group>
            )}

            {/* gradient overlay — mirrors the mockup gradient */}
            {!isLoading && (
              <Box
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.08) 0%, transparent 60%)",
                }}
              />
            )}

            {/* title block pinned bottom-left — mirrors mockup */}
            {!isLoading && (
              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding:
                    "var(--mantine-spacing-xl) var(--mantine-spacing-xl) var(--mantine-spacing-lg)",
                }}
              >
                <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
                  <Stack gap={6}>
                    {/* source badge — mirrors VenueStageBadge position */}
                    <Box>
                      <Badge
                        variant="filled"
                        color="dark"
                        size="sm"
                        tt="uppercase"
                        style={{ letterSpacing: "0.05em" }}
                        data-testid={TestSelectors.TENANT_VENUE_DETAIL_SOURCE}
                      >
                        {venue?.source ?? "—"}
                      </Badge>
                    </Box>

                    <Text
                      fw={800}
                      style={{
                        color: "var(--mantine-color-dark-9)",
                        lineHeight: 1.15,
                        letterSpacing: "-0.02em",
                        fontSize: "clamp(1.4rem, 2.5vw, 2rem)",
                      }}
                      data-testid={TestSelectors.TENANT_VENUE_DETAIL_NAME}
                    >
                      {venue?.name}
                    </Text>

                    {venue?.city && (
                      <Group gap={5} wrap="nowrap">
                        <IconMapPin size={13} color="var(--mantine-color-gray-6)" />
                        <Text
                          size="sm"
                          style={{ color: "var(--mantine-color-gray-7)" }}
                          data-testid={TestSelectors.TENANT_VENUE_DETAIL_CITY}
                        >
                          {[venue.address, venue.city].filter(Boolean).join(", ")}
                        </Text>
                      </Group>
                    )}
                  </Stack>

                  {/* confidence chip — mirrors google_rating chip position */}
                  {venue?.confidence != null && (
                    <Paper
                      px="sm"
                      py={6}
                      radius="md"
                      style={{
                        background: "var(--mantine-color-gray-0)",
                        border: "1px solid var(--mantine-color-default-border)",
                        flexShrink: 0,
                      }}
                    >
                      <Group gap={8} wrap="nowrap">
                        <ConfidenceRing
                          value={venue.confidence}
                          isLoading={false}
                          data-testid={TestSelectors.TENANT_VENUE_DETAIL_CONFIDENCE}
                        />
                        <Stack gap={0}>
                          <Text size="xs" fw={600}>
                            <Trans>Confidence</Trans>
                          </Text>
                          <Text size="xs" c="dimmed">
                            {venue.confidence.toFixed(4)}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  )}
                </Group>
              </Box>
            )}
          </Box>

          {/* soft gradient rim — replaces the hard border on the hero edge */}
          <Box
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "var(--mantine-radius-lg)",
              padding: 1,
              background: ACCENT_GRADIENT,
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              opacity: 0.75,
              pointerEvents: "none",
            }}
          />
        </Box>

        {/* ── Tabs — mirrors VenueProfileWidget tab structure ─────────── */}
        <Tabs defaultValue="details" keepMounted={false}>
          <Tabs.List
            styles={{
              list: {
                gap: 8,
                borderBottomWidth: 2,
              },
            }}
          >
            <Tabs.Tab
              value="details"
              leftSection={<IconAdjustments size={20} />}
              styles={bigTabStyles}
            >
              <Trans>Details</Trans>
            </Tabs.Tab>
            <Tabs.Tab
              value="photos"
              data-testid={TestSelectors.TAB.TENANT_VENUE_PHOTOS}
              leftSection={<IconPhoto size={20} />}
              styles={bigTabStyles}
              rightSection={
                !photosLoading && photos.length > 0 ? (
                  <Badge size="xl" variant="filled" color="blue" circle>
                    {photos.length}
                  </Badge>
                ) : undefined
              }
            >
              <Trans>Photos</Trans>
            </Tabs.Tab>
            <Tabs.Tab
              value="assets"
              data-testid={TestSelectors.TAB.TENANT_VENUE_ASSETS}
              leftSection={<IconPaperclip size={20} />}
              styles={bigTabStyles}
              rightSection={
                !assetsLoading && assets.length > 0 ? (
                  <Badge size="xl" variant="filled" color="blue" circle>
                    {assets.length}
                  </Badge>
                ) : undefined
              }
            >
              <Trans>Assets</Trans>
            </Tabs.Tab>
          </Tabs.List>

          {/* ── Details tab — mirrors DetailsTab section cards ─────────── */}
          <Tabs.Panel value="details" data-testid={TestSelectors.TAB.TENANT_VENUE_OVERVIEW}>
            <Stack gap="xs" pt="sm">
              {/* "LOCATION" section divider — mirrors the tab-group Divider label */}
              <Divider
                label={
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c="dimmed"
                    style={{ letterSpacing: "0.07em" }}
                  >
                    <Trans>Location</Trans>
                  </Text>
                }
                labelPosition="left"
                my="sm"
              />

              {/* Location section card */}
              <InfoSectionCard
                title={<Trans>Address & coordinates</Trans>}
                icon={<IconMapPin size={14} />}
                filled={locationFilled}
                total={3}
                isLoading={isLoading}
              >
                <Stack gap={6}>
                  <FieldChip label={<Trans>Address</Trans>} value={venue?.address} />
                  <FieldChip label={<Trans>City</Trans>} value={venue?.city} />
                  <FieldChip
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
                              size="sm"
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
              </InfoSectionCard>

              {/* "CURATION" section divider */}
              <Divider
                label={
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c="dimmed"
                    style={{ letterSpacing: "0.07em" }}
                  >
                    <Trans>Curation</Trans>
                  </Text>
                }
                labelPosition="left"
                my="sm"
              />

              {/* Curation section card */}
              <InfoSectionCard
                title={<Trans>Ingestion & quality</Trans>}
                icon={<IconAdjustments size={14} />}
                filled={curationFilled}
                total={2}
                isLoading={isLoading}
              >
                <Stack gap={6}>
                  <FieldChip label={<Trans>Source</Trans>} value={venue?.source} />
                  <FieldChip
                    label={<Trans>Confidence</Trans>}
                    value={venue?.confidence != null ? venue.confidence.toFixed(4) : null}
                  />
                  <FieldChip label={<Trans>Master venue</Trans>} value={venue?.masterVenueId} />
                  <FieldChip
                    label={<Trans>Created</Trans>}
                    value={
                      venue?.createdAt ? dayjs(venue.createdAt).format("MMM D, YYYY HH:mm") : null
                    }
                  />
                  <FieldChip
                    label={<Trans>Updated</Trans>}
                    value={
                      venue?.updatedAt ? dayjs(venue.updatedAt).format("MMM D, YYYY HH:mm") : null
                    }
                  />
                </Stack>
              </InfoSectionCard>

              {/* "METADATA" section divider */}
              <Divider
                label={
                  <Text
                    size="xs"
                    fw={700}
                    tt="uppercase"
                    c="dimmed"
                    style={{ letterSpacing: "0.07em" }}
                  >
                    <Trans>Metadata</Trans>
                  </Text>
                }
                labelPosition="left"
                my="sm"
              />

              {/* Metadata section cards — mirrors SectionCard pattern from the mockup */}
              <VenueMetadataSections
                tenantKey={tenantKey}
                venueId={venueId}
                metadata={venue?.metadata ?? null}
                isLoading={isLoading}
              />

              {/* Advanced: raw JSON document */}
              <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
                  <Group gap={8}>
                    <ThemeIcon size={28} radius="sm" variant="light" color="gray">
                      <IconPaperclip size={14} />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Text size="md" fw={700}>
                        <Trans>Raw JSON document</Trans>
                      </Text>
                      <Text size="xs" c="dimmed">
                        <Trans>Managed by the ingestion worker — edit with care.</Trans>
                      </Text>
                    </Stack>
                  </Group>
                  <Button
                    variant="subtle"
                    color="gray"
                    size="compact-sm"
                    style={{ flexShrink: 0 }}
                    onClick={toggleAdvanced}
                  >
                    {advancedOpened ? t`Hide raw JSON` : t`Show raw JSON`}
                  </Button>
                </Group>
                <Collapse expanded={advancedOpened}>
                  <Divider my="sm" />
                  {isLoading ? (
                    <Skeleton height={120} radius="sm" />
                  ) : (
                    <MetadataViewer raw={venue?.metadata ?? null} />
                  )}
                </Collapse>
              </Paper>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="photos" pt="sm">
            <PhotosTab photos={photos} isLoading={photosLoading} />
          </Tabs.Panel>

          <Tabs.Panel value="assets" pt="sm">
            <AssetsTab assets={assets} isLoading={assetsLoading} previewUrls={photoUrlById} />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <EditTenantVenueModal
        tenantKey={tenantKey}
        venue={venue ?? null}
        opened={editOpened}
        onClose={closeEdit}
      />
      <DeleteTenantVenueModal
        tenantKey={tenantKey}
        venue={deletedVenue}
        opened={deleteOpened}
        onClose={closeDelete}
        onDeleted={handleDeleteSuccess}
      />
    </Container>
  );
}
