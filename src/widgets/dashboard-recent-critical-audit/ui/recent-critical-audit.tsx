import { Link } from "@tanstack/react-router";
import { Group, Text, Skeleton, Alert, Stack, Button, Paper, Badge, Code } from "@mantine/core";
import { IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CardGroup } from "@/widgets/dashboard-card-group";
import { SubCard } from "@/widgets/dashboard-sub-card";
import { getSeverityColor } from "@/shared/lib/color-utils";
import type { UseDashboardWidgetsResult } from "@/shared/api";

dayjs.extend(relativeTime);

interface RecentCriticalAuditWidgetProps {
  data: UseDashboardWidgetsResult["recentCriticalAudit"];
}

export function RecentCriticalAuditWidget({ data }: RecentCriticalAuditWidgetProps) {
  return (
    <CardGroup title={<Trans>Recent Critical Events</Trans>}>
      <SubCard>
        {data.isLoading && (
          <Stack gap="xs">
            {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={40} radius="sm" />
          ))}
          </Stack>
        )}

        {data.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Trans>Failed to load audit events</Trans>
          </Alert>
        )}

        {!data.isLoading && !data.isError && (
          <>
            {data.records.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                <Trans>No critical events — all clear</Trans>
              </Text>
            ) : (
              <Stack gap={4}>
                {data.records.map((record) => (
                <Paper
                  key={record.id}
                  px="sm"
                  py={8}
                  withBorder
                  style={{
                    borderLeft: `3px solid var(--mantine-color-${getSeverityColor(record.severity)}-6)`,
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="xs" fw={500} truncate>
                        {record.action}
                      </Text>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          {record.actorEmail ?? record.actorId ?? "system"}
                        </Text>
                        {record.tenantKey && (
                          <Code
                            style={{
                              fontSize: "var(--mantine-font-size-xs)",
                              padding: "0 4px",
                              lineHeight: 1.4,
                            }}
                          >
                            {record.tenantKey}
                          </Code>
                        )}
                      </Group>
                    </Stack>
                    <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                      <Badge
                        data-testid={`badge-audit-severity-${record.severity.toLowerCase()}`}
                        color={getSeverityColor(record.severity)}
                        variant="light"
                        size="xs"
                        radius="sm"
                      >
                        {record.severity}
                      </Badge>
                      <Text size="xs" c="dimmed">
                        {dayjs(record.occurredAt).fromNow()}
                      </Text>
                    </Stack>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </>
      )}

        <Button
          component={Link}
          to="/admin/audit-logs"
          variant="subtle"
          size="xs"
          mt="md"
          px={0}
          rightSection={<IconArrowRight size={14} />}
        >
          <Trans>View all audit logs</Trans>
        </Button>
      </SubCard>
    </CardGroup>
  );
}
