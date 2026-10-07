import { Stack, Text, Group } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { SessionsList } from "./sessions-list";

export function AiChatSessionsPage() {
  return (
    <Stack gap="md">
      <Text fw={700} size="xl">
        AI Chat Sessions
      </Text>

      <SubCard>
        <Group gap="xs" align="flex-start">
          <IconInfoCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <Text size="sm" c="dimmed">
            Read-only overview of all AI chat sessions across all users. Sessions are stored in the
            system schema — users are global, not tenant-scoped. This view is restricted to{" "}
            <strong>PLATFORM_ADMIN</strong> authority.
          </Text>
        </Group>
      </SubCard>

      <SessionsList />
    </Stack>
  );
}
