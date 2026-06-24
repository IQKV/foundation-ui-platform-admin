import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
  Tabs,
  Code,
  Button,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  IconUser,
  IconAlertCircle,
  IconMail,
  IconCalendar,
  IconRefresh,
  IconBuilding,
  IconEdit,
  IconShieldCheck,
  IconShieldOff,
  IconKey,
  IconLockOpen,
  IconShield,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { avatarColor, initials, formatName } from "@/shared/lib/user-utils";
import { iamApi } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { useState } from "react";
import type { IamUser } from "@/shared/api";
import { EditUserModal } from "@/features/edit-user";
import { SetUserPasswordModal } from "@/features/set-user-password";
import { UnlockUserModal } from "@/features/unlock-user";
import {
  GrantPlatformAdminModal,
  RevokePlatformAdminModal,
} from "@/features/manage-platform-authority";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/users/$userId")({
  component: UserDetailPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Tab: Platform Authority ──────────────────────────────────────────────────

interface PlatformAuthorityTabProps {
  user: IamUser | undefined;
  isLoading: boolean;
  isSelf: boolean;
}

function PlatformAuthorityTab({ user, isLoading, isSelf }: PlatformAuthorityTabProps) {
  const [grantOpened, { open: openGrant, close: closeGrant }] = useDisclosure(false);
  const [revokeOpened, { open: openRevoke, close: closeRevoke }] = useDisclosure(false);

  const {
    data: authoritiesData,
    isLoading: authsLoading,
    refetch: refetchAuths,
  } = useQuery({
    queryKey: ["admin", "users", user?.id, "authorities"],
    queryFn: () => iamApi.getUserPlatformAuthorities(user!.id),
    enabled: !!user?.id,
  });

  const isPlatformAdmin = authoritiesData?.authorities?.includes("PLATFORM_ADMIN") ?? false;
  const loading = isLoading || authsLoading;

  return (
    <>
      <Stack gap="md" pt="md">
        <Paper style={{ overflow: "hidden" }}>
          <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
            <IconShield size={15} color="var(--mantine-color-gray-6)" />
            <Text fw={600} size="sm">
              <Trans>Platform Authority</Trans>
            </Text>
          </Group>

          <Stack gap={0} px="md" py="md">
            {loading ? (
              <Skeleton height={40} radius="sm" />
            ) : (
              <Group justify="space-between" align="center">
                <Group gap="sm">
                  <ThemeIcon
                    size="md"
                    variant="light"
                    color={isPlatformAdmin ? "blue" : "gray"}
                    radius="sm"
                  >
                    {isPlatformAdmin ? <IconShieldCheck size={16} /> : <IconShieldOff size={16} />}
                  </ThemeIcon>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      <Trans>Platform Admin</Trans>
                    </Text>
                    <Text size="xs" c="dimmed">
                      {isPlatformAdmin ? (
                        <Trans>This user has full administrative access to the platform.</Trans>
                      ) : (
                        <Trans>This user does not have platform admin access.</Trans>
                      )}
                    </Text>
                  </Stack>
                </Group>

                <Group gap="xs">
                  <Badge
                    data-testid="badge-platform-admin-status"
                    variant="light"
                    color={isPlatformAdmin ? "blue" : "gray"}
                    size="sm"
                    radius="sm"
                  >
                    {isPlatformAdmin ? <Trans>Active</Trans> : <Trans>Not granted</Trans>}
                  </Badge>

                  {isSelf ? (
                    <Tooltip
                      label={<Trans>You cannot modify your own platform authority</Trans>}
                      withArrow
                    >
                      <Button variant="light" color="gray" size="xs" disabled>
                        {isPlatformAdmin ? <Trans>Revoke</Trans> : <Trans>Grant</Trans>}
                      </Button>
                    </Tooltip>
                  ) : isPlatformAdmin ? (
                    <Button
                      data-testid="button-revoke-platform-admin"
                      variant="light"
                      color="orange"
                      size="xs"
                      leftSection={<IconShieldOff size={13} />}
                      onClick={openRevoke}
                    >
                      <Trans>Revoke</Trans>
                    </Button>
                  ) : (
                    <Button
                      data-testid="button-grant-platform-admin"
                      variant="light"
                      color="blue"
                      size="xs"
                      leftSection={<IconShieldCheck size={13} />}
                      onClick={openGrant}
                    >
                      <Trans>Grant</Trans>
                    </Button>
                  )}

                  <Tooltip label={<Trans>Refresh</Trans>} withArrow>
                    <ActionIcon
                      data-testid="button-platform-authority-refresh"
                      variant="subtle"
                      color="gray"
                      size="sm"
                      onClick={() => void refetchAuths()}
                    >
                      <IconRefresh size={13} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            )}
          </Stack>
        </Paper>
      </Stack>

      <GrantPlatformAdminModal user={user ?? null} opened={grantOpened} onClose={closeGrant} />
      <RevokePlatformAdminModal user={user ?? null} opened={revokeOpened} onClose={closeRevoke} />
    </>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ user, isLoading }: { user: IamUser | undefined; isLoading: boolean }) {
  return (
    <Stack gap="md" pt="md">
      {/* Stats bar */}
      <Paper style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard
            label={<Trans>Organizations</Trans>}
            value={user?.organizations?.length ?? 0}
            isLoading={isLoading}
            data-testid="stat-user-org-count"
          />
          <StatCard
            label={<Trans>Email</Trans>}
            value={
              user ? (
                <Badge
                  data-testid="stat-user-email-verified-badge"
                  variant="light"
                  color={user.emailVerified ? "green" : "orange"}
                  size="sm"
                  radius="sm"
                >
                  {user.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
                </Badge>
              ) : (
                "—"
              )
            }
            isLoading={isLoading}
            data-testid="stat-user-email-verified"
          />
          <StatCard
            label={<Trans>Joined</Trans>}
            value={user ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
            data-testid="stat-user-joined-at"
          />
          <StatCard
            label={<Trans>Last updated</Trans>}
            value={user?.updatedAt ? dayjs(user.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
            data-testid="stat-user-updated-at"
          />
        </SimpleGrid>
      </Paper>

      {/* Organizations list */}
      <Paper style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
          <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Organizations</Trans>
          </Text>
          {!isLoading && (
            <Badge
              data-testid="badge-overview-org-count"
              variant="light"
              color="gray"
              size="sm"
              radius="sm"
              ml="auto"
            >
              {user?.organizations?.length ?? 0}
            </Badge>
          )}
        </Group>

        {isLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton circle height={32} width={32} />
                  <Skeleton height={12} width="40%" radius="sm" />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : !user?.organizations || user.organizations.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>This user is not a member of any organization.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {user.organizations.map((orgName) => (
              <Box
                key={orgName}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--mantine-color-blue-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                  </Box>
                  <Text size="sm" fw={500}>
                    {orgName}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function UserDetailPage() {
  const { t } = useLingui();
  const { userId } = Route.useParams();
  const [activeTab, setActiveTab] = useState<string | null>("overview");

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [editTarget, setEditTarget] = useState<IamUser | null>(null);

  const [pwOpened, { open: openPw, close: closePw }] = useDisclosure(false);
  const [unlockOpened, { open: openUnlock, close: closeUnlock }] = useDisclosure(false);

  // Determine if we're viewing the currently logged-in admin's own profile
  const accessToken = useSessionStore((s) => s.accessToken);
  const currentUserId = accessToken ? (decodeJwt(accessToken)?.userId ?? null) : null;
  const isSelf = !!currentUserId && currentUserId === userId;

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", userId],
    queryFn: () => iamApi.getUser(userId),
  });

  const handleEdit = () => {
    if (user) {
      setEditTarget(user);
      openEdit();
    }
  };

  const handleCloseEdit = () => {
    closeEdit();
    setTimeout(() => setEditTarget(null), 300);
  };

  const handleClosePw = () => {
    closePw();
  };

  const displayName = user ? formatName(user.firstName, user.lastName) || user.email : userId;

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>User</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Users</Trans>, to: "/admin/users" },
            { label: userId },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load user</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch user details.</Trans>{" "}
          <Text
            data-testid="button-user-detail-error-retry"
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(isLoading ? t`User` : displayName)}</title>
      </Helmet>

      <PageHeader
        title={isLoading ? <Skeleton height={24} width={160} radius="sm" /> : <>{displayName}</>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Users</Trans>, to: "/admin/users" },
          { label: isLoading ? userId : displayName },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Edit user`} withArrow>
              <ActionIcon
                data-testid="button-user-detail-edit"
                variant="light"
                color="blue"
                size="md"
                onClick={handleEdit}
                disabled={isLoading}
              >
                <IconEdit size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Set password`} withArrow>
              <ActionIcon
                data-testid="button-user-detail-set-password"
                variant="light"
                color="orange"
                size="md"
                onClick={() => openPw()}
                disabled={isLoading}
              >
                <IconKey size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Unlock user`} withArrow>
              <ActionIcon
                data-testid="button-user-detail-unlock"
                variant="light"
                color="teal"
                size="md"
                onClick={() => openUnlock()}
                disabled={isLoading}
              >
                <IconLockOpen size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                data-testid="button-user-detail-refresh"
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => void refetch()}
                loading={isLoading}
              >
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <Paper data-testid="user-detail-hero-card" p="xl" mb="md">
        <Stack align="center" gap="xs">
          {/* Avatar */}
          {isLoading ? (
            <Skeleton circle height={72} width={72} />
          ) : (
            <Avatar
              data-testid="user-detail-avatar"
              size={72}
              radius="xl"
              color={user ? avatarColor(user.email) : "gray"}
              variant="filled"
              style={{ border: "3px solid var(--mantine-color-blue-3)" }}
            >
              {user ? initials(user.firstName, user.lastName) : "?"}
            </Avatar>
          )}

          {/* Name + status */}
          <Group gap="xs" align="center">
            {isLoading ? (
              <Skeleton height={24} width={180} radius="sm" />
            ) : (
              <Text data-testid="user-detail-display-name" size="xl" fw={700}>
                {displayName}
              </Text>
            )}
            {!isLoading && user && <UserStatusBadge status={user.status} />}
          </Group>

          {/* Meta row */}
          <Group gap="lg" justify="center" wrap="wrap">
            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconMail size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={160} radius="sm" />
              ) : (
                <Text data-testid="user-detail-email" size="sm" c="dimmed">
                  {user?.email}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconShieldCheck size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Badge
                  data-testid="user-detail-email-verified-badge"
                  variant="dot"
                  color={user?.emailVerified ? "green" : "orange"}
                  size="sm"
                >
                  {user?.emailVerified ? (
                    <Trans>Email verified</Trans>
                  ) : (
                    <Trans>Email unverified</Trans>
                  )}
                </Badge>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCalendar size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={100} radius="sm" />
              ) : (
                <Text data-testid="user-detail-joined-at" size="sm" c="dimmed">
                  <Trans>Joined</Trans> {user ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconBuilding size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Text data-testid="user-detail-org-count" size="sm" c="dimmed">
                  {user?.organizations?.length ?? 0} <Trans>organization(s)</Trans>
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        styles={{
          tab: { fontSize: "var(--mantine-font-size-sm)" },
          list: { borderBottom: "1px solid var(--mantine-color-gray-1)" },
        }}
      >
        <Tabs.List>
          <Tabs.Tab
            data-testid="tab-user-overview"
            value="overview"
            leftSection={<IconUser size={14} />}
          >
            <Trans>Overview</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-user-organizations"
            value="organizations"
            leftSection={<IconBuilding size={14} />}
            rightSection={
              !isLoading && (user?.organizations?.length ?? 0) > 0 ? (
                <Badge variant="light" color="gray" size="xs" radius="sm">
                  {user?.organizations?.length}
                </Badge>
              ) : undefined
            }
          >
            <Trans>Organizations</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid="tab-user-platform-authority"
            value="platform-authority"
            leftSection={<IconShield size={14} />}
          >
            <Trans>Platform Authority</Trans>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <OverviewTab user={user} isLoading={isLoading} />
        </Tabs.Panel>

        <Tabs.Panel value="organizations">
          <Stack gap="md" pt="md">
            <Paper style={{ overflow: "hidden" }}>
              <Group
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
                <Text fw={600} size="sm">
                  <Trans>Joined Organizations</Trans>
                </Text>
                {!isLoading && (
                  <Badge
                    data-testid="badge-orgs-tab-count"
                    variant="light"
                    color="gray"
                    size="sm"
                    radius="sm"
                    ml="auto"
                  >
                    {user?.organizations?.length ?? 0}
                  </Badge>
                )}
              </Group>

              {isLoading ? (
                <Stack gap={0}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Box
                      key={i}
                      px="md"
                      py="sm"
                      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                    >
                      <Group gap="sm">
                        <Skeleton circle height={36} width={36} />
                        <Skeleton height={12} width="40%" radius="sm" />
                      </Group>
                    </Box>
                  ))}
                </Stack>
              ) : !user?.organizations || user.organizations.length === 0 ? (
                <Text size="sm" c="dimmed" px="md" py="xl" ta="center">
                  <Trans>This user is not a member of any organization.</Trans>
                </Text>
              ) : (
                <Stack gap={0}>
                  {user.organizations.map((orgName) => (
                    <Box
                      key={orgName}
                      px="md"
                      py="sm"
                      style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                    >
                      <Group gap="sm" justify="space-between">
                        <Group gap="sm">
                          <Box
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              background: "var(--mantine-color-blue-1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <IconBuilding size={18} color="var(--mantine-color-blue-6)" />
                          </Box>
                          <Text size="sm" fw={500}>
                            {orgName}
                          </Text>
                        </Group>
                      </Group>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="platform-authority">
          <PlatformAuthorityTab user={user} isLoading={isLoading} isSelf={isSelf} />
        </Tabs.Panel>
      </Tabs>

      <EditUserModal user={editTarget} opened={editOpened} onClose={handleCloseEdit} />
      <SetUserPasswordModal user={user ?? null} opened={pwOpened} onClose={handleClosePw} />
      <UnlockUserModal user={user ?? null} opened={unlockOpened} onClose={closeUnlock} />
    </Container>
  );
}
