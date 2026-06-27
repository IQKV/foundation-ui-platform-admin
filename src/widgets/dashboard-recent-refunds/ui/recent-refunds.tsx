import { Link } from "@tanstack/react-router";
import { Group, Text, Skeleton, Alert, Stack, Button, Paper, Badge } from "@mantine/core";
import { IconArrowRight, IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { CardGroup } from "@/widgets/dashboard-card-group";
import { SubCard } from "@/widgets/dashboard-sub-card";
import { getRefundStatusColor } from "@/shared/lib/color-utils";
import type { UseDashboardWidgetsResult } from "@/shared/api";

interface RecentRefundsWidgetProps {
  data: UseDashboardWidgetsResult["recentRefunds"];
}

export function RecentRefundsWidget({ data }: RecentRefundsWidgetProps) {
  return (
    <CardGroup title={<Trans>Recent Refunds</Trans>}>
      <SubCard>
        {data.isLoading && (
          <Stack gap="xs">
            {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={36} radius="sm" />
          ))}
          </Stack>
        )}

        {data.isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
            <Trans>Failed to load recent refunds</Trans>
          </Alert>
        )}

        {!data.isLoading && !data.isError && (
          <>
            {data.refunds.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                <Trans>No refunds recorded yet</Trans>
              </Text>
            ) : (
              <Stack gap={4}>
                {data.refunds.map((refund) => (
                <Paper key={refund.id} px="sm" py={8} withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text size="xs" ff="monospace" truncate>
                        {refund.tenantKey}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {dayjs(refund.occurredAt).format("MMM D, YYYY HH:mm")}
                      </Text>
                    </Stack>
                    <Group gap="xs" style={{ flexShrink: 0 }}>
                      <Badge
                        data-testid={`badge-refund-status-${refund.status.toLowerCase()}`}
                        color={getRefundStatusColor(refund.status)}
                        variant="light"
                        size="xs"
                        radius="sm"
                      >
                        {refund.status}
                      </Badge>
                      <Text size="sm" fw={600}>
                        {(refund.amount / 100).toFixed(2)}{" "}
                        <Text span size="xs" c="dimmed">
                          {refund.currency.toUpperCase()}
                        </Text>
                      </Text>
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
          to="/admin/refunds"
          variant="subtle"
          size="xs"
          mt="md"
          px={0}
          rightSection={<IconArrowRight size={14} />}
        >
          <Trans>All refunds</Trans>
        </Button>
      </SubCard>
    </CardGroup>
  );
}
