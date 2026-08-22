import { Link } from "@tanstack/react-router";
import { Group, Text, Skeleton, Alert, Stack, Button, Paper, Badge, Code } from "@mantine/core";
import { IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { CardGroup } from "@/widgets/dashboard-card-group";
import { SubCard } from "@/widgets/dashboard-sub-card";
import type { UseDashboardWidgetsResult } from "@/shared/api";

interface SuspendedTenantsWidgetProps {
  data: UseDashboardWidgetsResult["failedTenants"];
}

export function SuspendedTenantsWidget({ data }: SuspendedTenantsWidgetProps) {
  return (
    <CardGroup title={<Trans>Suspended Organizations</Trans>}>
      <SubCard>
        {data.isLoading && (
          <Stack gap="xs">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={44} radius="sm" />
            ))}
          </Stack>
        )}

        {data.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Trans>Failed to load organization data</Trans>
          </Alert>
        )}

        {!data.isLoading && !data.isError && (
          <>
            {data.tenants.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                <Trans>All organizations are in good standing</Trans>
              </Text>
            ) : (
              <Stack gap={4}>
                {data.tenants.map((tenant) => (
                  <Paper key={tenant.id} px="sm" py={8} withBorder>
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text size="xs" fw={500} truncate>
                          {tenant.name}
                        </Text>
                        <Code
                          style={{
                            fontSize: "var(--mantine-font-size-xs)",
                            padding: "0 4px",
                            lineHeight: 1.4,
                            display: "inline-block",
                          }}
                        >
                          {tenant.tenantKey}
                        </Code>
                      </Stack>
                      <Group gap="xs" style={{ flexShrink: 0 }}>
                        <Badge
                          data-testid={`badge-suspended-org-status-${tenant.tenantKey}`}
                          color="orange"
                          variant="light"
                          size="xs"
                          radius="sm"
                        >
                          {tenant.status}
                        </Badge>
                        <Button
                          component={Link}
                          to="/admin/organizations/$tenantKey"
                          params={{ tenantKey: tenant.tenantKey } as never}
                          variant="subtle"
                          color="orange"
                          size="xs"
                          px={4}
                          rightSection={<IconArrowRight size={12} />}
                        >
                          <Trans>View</Trans>
                        </Button>
                      </Group>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}

        <Button
          component={Link}
          to="/admin/organizations"
          variant="subtle"
          size="xs"
          mt="md"
          px={0}
          rightSection={<IconArrowRight size={14} />}
        >
          <Trans>All organizations</Trans>
        </Button>
      </SubCard>
    </CardGroup>
  );
}
