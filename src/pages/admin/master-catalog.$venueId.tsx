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
  Code,
  Divider,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import {
  IconAlertCircle,
  IconRefresh,
  IconEdit,
  IconTrash,
  IconBuildingStore,
  IconMapPin,
  IconPhoto,
  IconPaperclip,
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

  if (isLoading) {
    return <Skeleton height={200} radius="sm" />;
  }

  return (
    <DataTable
      withTableBorder
      borderRadius="sm"
      highlightOnHover
      records={assets}
      minHeight={160}
      idAccessor="id"
      noRecordsText={t`No assets for this venue`}
      columns={[
        { accessor: "assetType", title: t`Type` },
        {
          accessor: "label",
          title: t`Label`,
          render: (asset) => asset.label ?? asset.fileName ?? "—",
        },
        {
          accessor: "contentType",
          title: t`Content type`,
          render: (asset) => asset.contentType ?? "—",
        },
        {
          accessor: "sizeBytes",
          title: t`Size`,
          render: (asset) => (asset.sizeBytes === null ? "—" : `${asset.sizeBytes} B`),
        },
        {
          accessor: "displayOrder",
          title: t`Order`,
          render: (asset) => asset.displayOrder ?? "—",
        },
        {
          accessor: "provider",
          title: t`Provider`,
          render: (asset) => asset.provider ?? "—",
        },
      ]}
    />
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
        <Paper
          p="lg"
          radius="md"
          withBorder
          data-testid={TestSelectors.MASTER_VENUE_DETAIL_HERO_CARD}
        >
          <Group gap="lg" wrap="nowrap" align="flex-start">
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--mantine-color-gray-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconBuildingStore size={28} color="var(--mantine-color-gray-6)" />
            </Box>

            <Stack gap={6} style={{ flex: 1 }}>
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
              </Group>

              <Group gap="lg">
                <Text size="xs" c="dimmed">
                  <Trans>Created</Trans>:{" "}
                  {isLoading ? "…" : dayjs(venue?.createdAt).format("MMM D, YYYY HH:mm")}
                </Text>
                <Text size="xs" c="dimmed">
                  <Trans>Updated</Trans>:{" "}
                  {isLoading ? "…" : dayjs(venue?.updatedAt).format("MMM D, YYYY HH:mm")}
                </Text>
              </Group>
            </Stack>
          </Group>

          <Divider my="md" />

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <StatCard
              label={<Trans>Confidence</Trans>}
              value={venue?.confidence === null || venue === undefined ? "—" : venue.confidence}
              isLoading={isLoading}
              data-testid={TestSelectors.MASTER_VENUE_DETAIL_CONFIDENCE}
            />
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
            </Tabs.Tab>
            <Tabs.Tab
              value="assets"
              data-testid={TestSelectors.TAB.MASTER_VENUE_ASSETS}
              leftSection={<IconPaperclip size={15} />}
            >
              <Trans>Assets</Trans>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {isLoading ? (
              <Skeleton height={200} radius="sm" />
            ) : (
              <Stack gap="sm">
                <Group gap="xs">
                  <Text size="sm" fw={600} w={140}>
                    <Trans>Address</Trans>
                  </Text>
                  <Text size="sm" c="dimmed">
                    {venue?.address ?? "—"}
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm" fw={600} w={140}>
                    <Trans>City</Trans>
                  </Text>
                  <Text size="sm" c="dimmed">
                    {venue?.city ?? "—"}
                  </Text>
                </Group>
                <Group gap="xs">
                  <Text size="sm" fw={600} w={140}>
                    <Trans>Source</Trans>
                  </Text>
                  <Text size="sm" c="dimmed">
                    {venue?.source ?? "—"}
                  </Text>
                </Group>
                <Stack gap={4}>
                  <Text size="sm" fw={600}>
                    <Trans>Metadata</Trans>
                  </Text>
                  <Code block style={{ maxHeight: 320, overflow: "auto" }}>
                    {venue?.metadata ?? "—"}
                  </Code>
                </Stack>
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
