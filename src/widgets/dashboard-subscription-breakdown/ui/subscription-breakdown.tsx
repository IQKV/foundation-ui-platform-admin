import { Link } from "@tanstack/react-router";
import { Group, Text, Skeleton, Alert, Stack, Button, Box } from "@mantine/core";
import { DonutChart } from "@mantine/charts";
import { IconArrowRight } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { CardGroup } from "@/widgets/dashboard-card-group";
import { SubCard } from "@/widgets/dashboard-sub-card";
import type { UseDashboardWidgetsResult } from "@/shared/api";

interface SubscriptionBreakdownWidgetProps {
  data: UseDashboardWidgetsResult["subscriptionBreakdown"];
}

export function SubscriptionBreakdownWidget({ data }: SubscriptionBreakdownWidgetProps) {
  return (
    <CardGroup title={<Trans>Subscription Breakdown</Trans>}>
      <SubCard>
        {data.isLoading && (
          <Stack gap="xs" align="center" py="xl">
            <Skeleton circle height={140} width={140} />
            <Skeleton height={12} width={200} radius="sm" mt="md" />
          </Stack>
        )}

        {data.isError && (
          <Alert icon={<IconArrowRight size={16} />} color="red" variant="light">
            <Trans>Failed to load subscription breakdown</Trans>
          </Alert>
        )}

        {!data.isLoading && !data.isError && (
          <>
            {data.data.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                <Trans>No subscription data available</Trans>
              </Text>
            ) : (
              <Group gap="xl" justify="center" align="center" wrap="nowrap">
                <DonutChart
                  data={data.data.map((item) => ({
                    name:
                      item.status.charAt(0).toUpperCase() + item.status.slice(1).replace(/_/g, " "),
                    value: item.count,
                    color: item.color,
                  }))}
                  size={160}
                  thickness={28}
                  tooltipDataSource="segment"
                />
                <Stack gap="xs">
                  {data.data.map((item) => (
                    <Group key={item.status} gap="xs" wrap="nowrap">
                      <Box
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 2,
                          backgroundColor: `var(--mantine-color-${item.color}-6)`,
                          flexShrink: 0,
                        }}
                      />
                      <Text size="xs" c="dimmed" style={{ textTransform: "capitalize" }}>
                        {item.status.replace(/_/g, " ")}
                      </Text>
                      <Text size="xs" fw={600} ml="auto">
                        {item.count}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Group>
            )}
          </>
        )}

        <Button
          component={Link}
          to="/admin/subscriptions"
          variant="subtle"
          size="xs"
          mt="md"
          px={0}
          rightSection={<IconArrowRight size={14} />}
        >
          <Trans>All subscriptions</Trans>
        </Button>
      </SubCard>
    </CardGroup>
  );
}
