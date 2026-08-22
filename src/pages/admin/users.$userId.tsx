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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  IconLink,
  IconUnlink,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { avatarColor, initials, formatName } from "@/shared/lib/user-utils";
import { iamApi } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { useState } from "react";
import type { AdminLinkedOidcIdentity, User } from "@/entities";
import { EditUserModal } from "@/features/edit-user";
import { SetUserPasswordModal } from "@/features/set-user-password";
import { UnlockUserModal } from "@/features/unlock-user";
import {
  GrantPlatformAdminModal,
  RevokePlatformAdminModal,
} from "@/features/manage-platform-authority";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

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
  user: User | undefined;
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
                    data-testid={TestSelectors.BADGE.PLATFORM_ADMIN_STATUS}
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
                      data-testid={TestSelectors.BUTTON.REVOKE_PLATFORM_ADMIN}
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
                      data-testid={TestSelectors.BUTTON.GRANT_PLATFORM_ADMIN}
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
                      data-testid={TestSelectors.BUTTON.PLATFORM_AUTHORITY_REFRESH}
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

// ─── Tab: OIDC Identities (Admin) ─────────────────────────────────────────────

function OidcIdentitiesTab({ userId }: { userId: string }) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const {
    data: identities,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "users", userId, "oidc-identities"],
    queryFn: () => iamApi.listUserOidcIdentities(userId),
  });

  const unmergeMutation = useMutation({
    mutationFn: ({ identityId }: { identityId: string }) =>
      iamApi.unmergeUserOidcIdentity(userId, identityId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "users", userId, "oidc-identities"],
      });
      notifications.show({
        title: t`Success`,
        message: t`Identity unmerged`,
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: t`Error`,
        message: t`Failed to unmerge identity`,
        color: "red",
      });
    },
  });

  const openUnmergeConfirm = (identity: AdminLinkedOidcIdentity) => {
    modals.openConfirmModal({
      title: t`Unmerge linked identity`,
      children: (
        <Stack gap="xs">
          <Text size="sm">
            <Trans>This will force-remove the external sign-in method from the user account.</Trans>
          </Text>
          <Text size="sm">
            <Trans>
              Provider: <b>{identity.provider}</b>
            </Trans>
          </Text>
          {identity.email && (
            <Text size="sm">
              <Trans>
                Email: <b>{identity.email}</b>
              </Trans>
            </Text>
          )}
          <Text size="sm">
            <Trans>
              Subject: <b>{identity.providerSub}</b>
            </Trans>
          </Text>
        </Stack>
      ),
      labels: { confirm: t`Unmerge`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: () => unmergeMutation.mutate({ identityId: identity.id }),
    });
  };

  return (
    <Stack gap="md" pt="md">
      <Paper style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
          <IconLink size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>OIDC Identities</Trans>
          </Text>
          {!isLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
              {identities?.length ?? 0}
            </Badge>
          )}
          <Tooltip label={<Trans>Refresh</Trans>} withArrow>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => void refetch()}>
              <IconRefresh size={13} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {isLoading ? (
          <Stack gap={0} px="md" py="md">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} height={44} radius="sm" />
            ))}
          </Stack>
        ) : isError ? (
          <Alert
            m="md"
            icon={<IconAlertCircle size={16} />}
            title={<Trans>Failed to load identities</Trans>}
            color="red"
            variant="light"
          >
            <Trans>Could not fetch linked identities for this user.</Trans>
          </Alert>
        ) : !identities || identities.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="xl" ta="center">
            <Trans>No linked OIDC identities found.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {identities.map((identity) => (
              <Box
                key={identity.id}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Group gap="sm" align="center" wrap="nowrap">
                    <Avatar
                      size={36}
                      radius="xl"
                      src={identity.avatarUrl ?? undefined}
                      color="blue"
                      variant="light"
                    >
                      {(identity.provider || "?").slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Stack gap={2}>
                      <Group gap="xs" wrap="wrap">
                        <Badge variant="light" color="blue" size="sm" radius="sm">
                          {identity.provider}
                        </Badge>
                        {identity.email && (
                          <Text size="sm" fw={600}>
                            {identity.email}
                          </Text>
                        )}
                        {!identity.email && identity.displayName && (
                          <Text size="sm" fw={600}>
                            {identity.displayName}
                          </Text>
                        )}
                      </Group>

                      <Group gap="xs" wrap="wrap">
                        <Text size="xs" c="dimmed">
                          <Trans>Identity</Trans>
                        </Text>
                        <Code fz={11}>{identity.id}</Code>
                      </Group>

                      <Group gap="xs" wrap="wrap">
                        <Text size="xs" c="dimmed">
                          <Trans>Subject</Trans>
                        </Text>
                        <Code fz={11}>{identity.providerSub}</Code>
                      </Group>

                      <Group gap="lg" wrap="wrap">
                        <Text size="xs" c="dimmed">
                          <Trans>Linked</Trans>{" "}
                          {identity.linkedAt ? dayjs(identity.linkedAt).format("MMM D, YYYY") : "—"}
                        </Text>
                        <Text size="xs" c="dimmed">
                          <Trans>Last used</Trans>{" "}
                          {identity.lastUsedAt
                            ? dayjs(identity.lastUsedAt).format("MMM D, YYYY")
                            : "—"}
                        </Text>
                      </Group>
                    </Stack>
                  </Group>

                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    leftSection={<IconUnlink size={14} />}
                    onClick={() => openUnmergeConfirm(identity)}
                    loading={unmergeMutation.isPending}
                  >
                    <Trans>Unmerge</Trans>
                  </Button>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab({ user, isLoading }: { user: User | undefined; isLoading: boolean }) {
  return (
    <Stack gap="md" pt="md">
      {/* Stats bar */}
      <Paper style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard
            label={<Trans>Organizations</Trans>}
            value={user?.organizations?.length ?? 0}
            isLoading={isLoading}
            data-testid={TestSelectors.STAT.USER_ORG_COUNT}
          />
          <StatCard
            label={<Trans>Email</Trans>}
            value={
              user ? (
                <Badge
                  data-testid={TestSelectors.STAT.USER_EMAIL_VERIFIED_BADGE}
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
            data-testid={TestSelectors.STAT.USER_EMAIL_VERIFIED}
          />
          <StatCard
            label={<Trans>Joined</Trans>}
            value={user ? dayjs(user.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
            data-testid={TestSelectors.STAT.USER_JOINED_AT}
          />
          <StatCard
            label={<Trans>Last updated</Trans>}
            value={user?.updatedAt ? dayjs(user.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
            data-testid={TestSelectors.STAT.USER_UPDATED_AT}
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
              data-testid={TestSelectors.BADGE.OVERVIEW_ORG_COUNT}
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
  const [editTarget, setEditTarget] = useState<User | null>(null);

  const [pwOpened, { open: openPw, close: closePw }] = useDisclosure(false);
  const [unlockOpened, { open: openUnlock, close: closeUnlock }] = useDisclosure(false);

  // Determine if we're viewing the currently logged-in admin's own profile
  const accessToken = useSessionStore((s) => s.accessToken);
  const currentUserId = accessToken ? (decodeJwt(accessToken)?.user_id ?? null) : null;
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
            data-testid={TestSelectors.BUTTON.USER_DETAIL_ERROR_RETRY}
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
      <PageTitle segments={[isLoading ? t`User` : displayName]} />

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
                data-testid={TestSelectors.BUTTON.USER_DETAIL_EDIT}
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
                data-testid={TestSelectors.BUTTON.USER_DETAIL_SET_PASSWORD}
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
                data-testid={TestSelectors.BUTTON.USER_DETAIL_UNLOCK}
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
                data-testid={TestSelectors.BUTTON.USER_DETAIL_REFRESH}
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
      <Paper data-testid={TestSelectors.ORG_DETAIL_HERO_CARD} p="xl" mb="md">
        <Stack align="center" gap="xs">
          {/* Avatar */}
          {isLoading ? (
            <Skeleton circle height={72} width={72} />
          ) : (
            <Avatar
              data-testid={TestSelectors.USER_DETAIL_AVATAR}
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
              <Text data-testid={TestSelectors.USER_DETAIL_DISPLAY_NAME} size="xl" fw={700}>
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
                <Text data-testid={TestSelectors.USER_DETAIL_EMAIL} size="sm" c="dimmed">
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
                  data-testid={TestSelectors.USER_DETAIL_EMAIL_VERIFIED_BADGE}
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
                <Text data-testid={TestSelectors.USER_DETAIL_JOINED_AT} size="sm" c="dimmed">
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
                <Text data-testid={TestSelectors.USER_DETAIL_ORG_COUNT} size="sm" c="dimmed">
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
            data-testid={TestSelectors.TAB.USER_OVERVIEW}
            value="overview"
            leftSection={<IconUser size={14} />}
          >
            <Trans>Overview</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid={TestSelectors.TAB.USER_ORGANIZATIONS}
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
            data-testid={TestSelectors.TAB.USER_PLATFORM_AUTHORITY}
            value="platform-authority"
            leftSection={<IconShield size={14} />}
          >
            <Trans>Platform Authority</Trans>
          </Tabs.Tab>
          <Tabs.Tab
            data-testid={TestSelectors.TAB.USER_OIDC_IDENTITIES}
            value="oidc-identities"
            leftSection={<IconLink size={14} />}
          >
            <Trans>OIDC Identities</Trans>
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
                    data-testid={TestSelectors.BADGE.ORGS_TAB_COUNT}
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

        <Tabs.Panel value="oidc-identities">
          <OidcIdentitiesTab userId={userId} />
        </Tabs.Panel>
      </Tabs>

      <EditUserModal user={editTarget} opened={editOpened} onClose={handleCloseEdit} />
      <SetUserPasswordModal user={user ?? null} opened={pwOpened} onClose={handleClosePw} />
      <UnlockUserModal user={user ?? null} opened={unlockOpened} onClose={closeUnlock} />
    </Container>
  );
}
