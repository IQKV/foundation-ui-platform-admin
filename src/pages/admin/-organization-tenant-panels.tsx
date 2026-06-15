import { useState, useEffect } from "react";
import {
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  Badge,
  TextInput,
  CloseButton,
  ActionIcon,
  Tooltip,
  SimpleGrid,
  Avatar,
  Modal,
  Button,
  Checkbox,
} from "@mantine/core";
import { useDebouncedValue, useDisclosure } from "@mantine/hooks";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import {
  IconCreditCard,
  IconAlertCircle,
  IconSearch,
  IconRefresh,
  IconEdit,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { iamApi } from "@/shared/api";
import type {
  IamTenant,
  IamUser,
  PagedResponse,
  Subscription,
  TenantMemberAuthoritiesResponse,
  AdminUpdateMemberAuthoritiesRequest,
} from "@/shared/api";

export const ORG_MEMBERS_PAGE_SIZE = 20;

export function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

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

export interface OverviewTabProps {
  subsLoading: boolean;
  subscriptionsPage: PagedResponse<Subscription> | undefined;
  subscriptionCount: number;
  memberCount: number;
  membersLoading: boolean;
  isLoading: boolean;
  tenant: IamTenant | undefined;
}

export function OverviewTab({
  subsLoading,
  subscriptionsPage,
  subscriptionCount,
  memberCount,
  membersLoading,
  isLoading,
  tenant,
}: OverviewTabProps) {
  return (
    <Stack gap="md" pt="md">
      <Paper style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard
            data-testid="stat-org-member-count"
            label={<Trans>Members</Trans>}
            value={memberCount}
            isLoading={membersLoading}
          />
          <StatCard
            data-testid="stat-org-subscription-count"
            label={<Trans>Subscriptions</Trans>}
            value={subscriptionCount}
            isLoading={subsLoading}
          />
          <StatCard
            data-testid="stat-org-created-at"
            label={<Trans>Created</Trans>}
            value={tenant ? dayjs(tenant.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
          <StatCard
            data-testid="stat-org-updated-at"
            label={<Trans>Last updated</Trans>}
            value={tenant?.updatedAt ? dayjs(tenant.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
        </SimpleGrid>
      </Paper>

      <Paper style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}>
          <IconCreditCard size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Subscriptions</Trans>
          </Text>
          {!subsLoading && (
            <Badge
              data-testid="badge-overview-subscription-count"
              variant="light"
              color="gray"
              size="sm"
              radius="sm"
              ml="auto"
            >
              {subscriptionCount}
            </Badge>
          )}
        </Group>

        {subsLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton height={12} width="25%" radius="sm" />
                  <Skeleton height={12} width="15%" radius="sm" />
                  <Skeleton height={18} width={60} radius="xl" ml="auto" />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : subscriptionsPage?.content.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>No subscriptions found for this organization.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {subscriptionsPage?.content.map((sub) => (
              <Box
                key={sub.id}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {sub.planId}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {sub.externalSubscriptionId}
                    </Text>
                  </Stack>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">
                      <Trans>Renews</Trans> {dayjs(sub.currentPeriodEnd).format("MMM D, YYYY")}
                    </Text>
                    <Badge
                      data-testid={`badge-overview-sub-status--${sub.id}`}
                      variant="light"
                      size="sm"
                      radius="sm"
                      color={
                        sub.status === "active"
                          ? "green"
                          : sub.status === "trialing"
                            ? "blue"
                            : sub.status === "past_due"
                              ? "orange"
                              : "gray"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </Group>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}

function EditMemberAuthoritiesModal({
  tenantKey,
  user,
  opened,
  onClose,
}: {
  tenantKey: string;
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();

  const { data: authoritiesData } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", user?.id, "authorities"],
    queryFn: () => (user ? iamApi.getTenantMemberAuthorities(tenantKey, user.id) : null),
    enabled: opened && !!user,
  });

  const [selectedAuthorities, setSelectedAuthorities] = useState<string[]>([]);

  const mutation = useMutation({
    mutationFn: (data: AdminUpdateMemberAuthoritiesRequest) =>
      iamApi.updateTenantMemberAuthorities(tenantKey, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "tenants", tenantKey, "members"],
      });
      onClose();
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ authorities: selectedAuthorities });
  };

  const handleClose = () => {
    mutation.reset();
    onClose();
  };

  // Update selected authorities when data is loaded
  useEffect(() => {
    if (authoritiesData) {
      setSelectedAuthorities(authoritiesData.authorities);
    }
  }, [authoritiesData]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Edit Member Authorities</Trans>
          </Text>
          {user && (
            <Text size="xs" c="dimmed">
              {user.firstName} {user.lastName} ({user.email})
            </Text>
          )}
        </Stack>
      }
      size="sm"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          <Trans>Select the authorities you want to assign to this member.</Trans>
        </Text>
        <Stack gap="sm">
          <Checkbox
            label="TENANT_OWNER"
            checked={selectedAuthorities.includes("TENANT_OWNER")}
            onChange={(e) => {
              if (e.currentTarget.checked) {
                setSelectedAuthorities(["TENANT_OWNER"]);
              } else {
                setSelectedAuthorities((prev) => prev.filter((a) => a !== "TENANT_OWNER"));
              }
            }}
          />
          <Checkbox
            label="ADMIN"
            checked={selectedAuthorities.includes("ADMIN")}
            onChange={(e) => {
              if (selectedAuthorities.includes("TENANT_OWNER")) {
                return;
              }
              if (e.currentTarget.checked) {
                setSelectedAuthorities([...selectedAuthorities, "ADMIN"]);
              } else {
                setSelectedAuthorities((prev) => prev.filter((a) => a !== "ADMIN"));
              }
            }}
            disabled={selectedAuthorities.includes("TENANT_OWNER")}
          />
          <Checkbox
            label="MEMBER"
            checked={selectedAuthorities.includes("MEMBER")}
            onChange={(e) => {
              if (selectedAuthorities.includes("TENANT_OWNER")) {
                return;
              }
              if (e.currentTarget.checked) {
                setSelectedAuthorities([...selectedAuthorities, "MEMBER"]);
              } else {
                setSelectedAuthorities((prev) => prev.filter((a) => a !== "MEMBER"));
              }
            }}
            disabled={selectedAuthorities.includes("TENANT_OWNER")}
          />
        </Stack>
        <Group justify="flex-end" gap="sm" mt="md">
          <Button
            data-testid="button-edit-authorities-cancel"
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={mutation.isPending}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            data-testid="button-edit-authorities-save"
            onClick={handleSubmit}
            loading={mutation.isPending}
          >
            <Trans>Save Changes</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export function MembersTab({ tenantKey }: { tenantKey: string }) {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [editingUser, setEditingUser] = useState<IamUser | null>(null);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin", "tenants", tenantKey, "members", page, debouncedSearch],
    queryFn: () =>
      iamApi.listTenantMembers(tenantKey, {
        page: page - 1,
        size: ORG_MEMBERS_PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "desc",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      }),
  });

  const totalElements = data?.totalElements ?? 0;

  const handleEditMember = (user: IamUser) => {
    setEditingUser(user);
    openEditModal();
  };

  return (
    <Stack gap="md" pt="md">
      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          <Trans>Could not fetch members.</Trans>{" "}
          <Text
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
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
              <Trans>Members</Trans>
            </Text>
            {!isLoading && (
              <Badge
                data-testid="badge-members-total-count"
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
            <TextInput
              data-testid="input-members-search"
              placeholder={t`Search by name or email…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => {
                setSearch(e.currentTarget.value);
                setPage(1);
              }}
              size="xs"
              style={{ width: 220 }}
              rightSection={
                search ? (
                  <CloseButton
                    data-testid="button-members-search-clear"
                    size="xs"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  />
                ) : null
              }
            />
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                data-testid="button-members-refresh"
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
            {Array.from({ length: 6 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton circle height={36} width={36} />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={12} width="30%" radius="sm" />
                    <Skeleton height={10} width="20%" radius="sm" />
                  </Stack>
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
            records={data?.content ?? []}
            totalRecords={totalElements}
            recordsPerPage={ORG_MEMBERS_PAGE_SIZE}
            page={page}
            onPageChange={setPage}
            fetching={isFetching && !isLoading}
            minHeight={200}
            noRecordsText={debouncedSearch ? t`No members match the search` : t`No members found`}
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
                accessor: "firstName",
                title: t`Member`,
                render: (user) => (
                  <Group gap="sm" wrap="nowrap">
                    <Avatar size={36} radius="xl" color={avatarColor(user.email)} variant="filled">
                      {initials(user.firstName, user.lastName)}
                    </Avatar>
                    <Stack gap={1}>
                      <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text size="xs" c="dimmed" style={{ lineHeight: 1.3 }}>
                        {user.email}
                      </Text>
                    </Stack>
                  </Group>
                ),
              },
              {
                accessor: "tenantAuthorities",
                title: t`Authorities`,
                render: (user) => (
                  <Group gap="xs">
                    {user.tenantAuthorities?.map((auth) => (
                      <Badge
                        data-testid={`badge-member-authority--${user.id}--${auth}`}
                        key={auth}
                        variant="light"
                        color="blue"
                        size="sm"
                      >
                        {auth}
                      </Badge>
                    ))}
                  </Group>
                ),
              },
              {
                accessor: "status",
                title: t`Status`,
                render: (user) => (
                  <Badge
                    data-testid={`badge-member-status--${user.id}`}
                    variant="light"
                    size="sm"
                    color={
                      user.status === "ACTIVE"
                        ? "green"
                        : user.status === "LOCKED"
                          ? "orange"
                          : user.status === "SUSPENDED"
                            ? "red"
                            : "gray"
                    }
                  >
                    {user.status}
                  </Badge>
                ),
              },
              {
                accessor: "emailVerified",
                title: t`Email`,
                render: (user) => (
                  <Badge
                    data-testid={`badge-member-email-verified--${user.id}`}
                    variant="dot"
                    color={user.emailVerified ? "green" : "orange"}
                    size="sm"
                  >
                    {user.emailVerified ? t`Verified` : t`Unverified`}
                  </Badge>
                ),
              },
              {
                accessor: "createdAt",
                title: t`Joined`,
                render: (user) => (
                  <Text size="sm" c="dimmed">
                    {dayjs(user.createdAt).format("MMM D, YYYY")}
                  </Text>
                ),
              },
              {
                accessor: "actions",
                title: t`Actions`,
                render: (user) => (
                  <Tooltip label={t`Edit member authorities`} withArrow>
                    <ActionIcon
                      data-testid={`button-member-edit-authorities--${user.id}`}
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={() => handleEditMember(user)}
                    >
                      <IconEdit size={15} />
                    </ActionIcon>
                  </Tooltip>
                ),
              },
            ]}
          />
        )}
      </Paper>

      {!isLoading && totalElements > 0 && (
        <Text size="xs" c="dimmed">
          <Trans>
            Showing {Math.min((page - 1) * ORG_MEMBERS_PAGE_SIZE + 1, totalElements)}–
            {Math.min(page * ORG_MEMBERS_PAGE_SIZE, totalElements)} of {totalElements} members
          </Trans>
        </Text>
      )}

      <EditMemberAuthoritiesModal
        tenantKey={tenantKey}
        user={editingUser}
        opened={editModalOpened}
        onClose={() => {
          closeEditModal();
          setEditingUser(null);
        }}
      />
    </Stack>
  );
}
