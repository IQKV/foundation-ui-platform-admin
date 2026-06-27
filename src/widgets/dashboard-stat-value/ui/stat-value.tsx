import { Text, Skeleton, Tooltip } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { DashboardCountResult, WidgetCountResult } from "@/shared/api";

interface StatValueProps {
  count: DashboardCountResult;
  "data-testid"?: string;
}

export function StatValue({ count, "data-testid": testId }: StatValueProps) {
  if (count.isLoading) {
    return <Skeleton height={28} width={60} radius="sm" mb={4} />;
  }
  if (count.isError) {
    return (
      <Tooltip label={<Trans>Failed to load</Trans>} withArrow>
        <Text size="xl" fw={700} c="red" mb={4} style={{ cursor: "default" }} data-testid={testId}>
          <IconAlertCircle size={20} style={{ verticalAlign: "middle" }} />
        </Text>
      </Tooltip>
    );
  }
  return (
    <Text size="xl" fw={700} mb={4} data-testid={testId}>
      {count.value?.toLocaleString() ?? "—"}
    </Text>
  );
}

interface WidgetStatValueProps {
  count: WidgetCountResult;
  "data-testid"?: string;
}

export function WidgetStatValue({ count, "data-testid": testId }: WidgetStatValueProps) {
  if (count.isLoading) {
    return <Skeleton height={28} width={60} radius="sm" mb={4} />;
  }
  if (count.isError) {
    return (
      <Tooltip label={<Trans>Failed to load</Trans>} withArrow>
        <Text size="xl" fw={700} c="red" mb={4} style={{ cursor: "default" }} data-testid={testId}>
          <IconAlertCircle size={20} style={{ verticalAlign: "middle" }} />
        </Text>
      </Tooltip>
    );
  }
  return (
    <Text size="xl" fw={700} mb={4} data-testid={testId}>
      {count.value?.toLocaleString() ?? "—"}
    </Text>
  );
}
