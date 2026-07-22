import { Stack, Text, Badge, Group } from "@mantine/core";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { getSampleMetrics } from "../model";

export function SampleMetricsWidget() {
  const metrics = getSampleMetrics();

  return (
    <SubCard>
      <Stack gap="md">
        <Text fw={600} size="sm">
          Sample Metrics
        </Text>
        {metrics.map((metric) => (
          <Stack key={metric.id} gap="xs">
            <Text size="xs" c="dimmed">
              {metric.label}
            </Text>
            <Group align="center" gap={4}>
              <Text fw={700} size="xl">
                {metric.unit}
                {metric.value.toLocaleString()}
              </Text>
              <Badge color={metric.isPositive ? "green" : "red"} size="sm">
                {metric.isPositive ? "+" : ""}
                {metric.change}%
              </Badge>
            </Group>
          </Stack>
        ))}
      </Stack>
    </SubCard>
  );
}
