import {
  Modal,
  Stack,
  Group,
  Text,
  ScrollArea,
  Paper,
  Loader,
  Alert,
  Badge,
} from "@mantine/core";
import { IconAlertCircle, IconRobot, IconUser } from "@tabler/icons-react";
import { useAdminMessages } from "../model";
import { ModelBadge } from "./model-badge";
import type { ChatSession } from "../api/ai-chat-sessions-api";

interface SessionMessagesModalProps {
  session: ChatSession | null;
  onClose: () => void;
}

export function SessionMessagesModal({ session, onClose }: SessionMessagesModalProps) {
  const { data, isLoading, isError } = useAdminMessages(session?.id ?? null);

  return (
    <Modal
      opened={!!session}
      onClose={onClose}
      title={
        <Group gap="sm">
          <Text fw={600} size="sm">
            {session?.title ?? "Untitled session"}
          </Text>
          {session && <ModelBadge model={session.model} />}
        </Group>
      }
      size="xl"
      styles={{ body: { padding: 0 } }}
    >
      {session && (
        <Stack gap={0}>
          {/* Session meta */}
          <Group px="md" py="xs" gap="lg" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <Text size="xs" c="dimmed">
              User:{" "}
              <Text
                component="a"
                href={`/admin/users/${session.userId}`}
                size="xs"
                c="blue"
                style={{ fontFamily: "var(--mantine-font-family-monospace)", textDecoration: "none" }}
                title={session.userId}
              >
                {session.userId.substring(0, 8)}…
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              Created: {new Date(session.createdAt).toLocaleString()}
            </Text>
            <Text size="xs" c="dimmed">
              Updated: {new Date(session.updatedAt).toLocaleString()}
            </Text>
          </Group>

          {/* Messages */}
          <ScrollArea h={500} px="md" py="sm">
            {isLoading && (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">Loading messages…</Text>
              </Group>
            )}

            {isError && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" m="md">
                Failed to load messages.
              </Alert>
            )}

            {data && data.items.length === 0 && (
              <Text c="dimmed" size="sm" ta="center" py="xl">
                No messages in this session.
              </Text>
            )}

            <Stack gap="xs" py="xs">
              {data?.items.map((msg) => {
                if (msg.role === "SYSTEM") {
                  return (
                    <Text key={msg.id} size="xs" c="dimmed" ta="center" py="xs">
                      {msg.content}
                    </Text>
                  );
                }

                const isUser = msg.role === "USER";

                return (
                  <Group
                    key={msg.id}
                    justify={isUser ? "flex-end" : "flex-start"}
                    align="flex-start"
                    gap="xs"
                  >
                    {!isUser && (
                      <Paper
                        radius="xl"
                        p="xs"
                        bg="gray.1"
                        style={{ flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <IconRobot size={14} />
                      </Paper>
                    )}
                    <Stack gap={4} maw="75%">
                      <Paper
                        p="sm"
                        radius="md"
                        bg={isUser ? "blue.6" : "gray.1"}
                        style={{ borderBottomRightRadius: isUser ? 4 : undefined, borderBottomLeftRadius: !isUser ? 4 : undefined }}
                      >
                        <Text size="sm" c={isUser ? "white" : undefined} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                          {msg.content}
                        </Text>
                      </Paper>
                      <Text size="xs" c="dimmed" ta={isUser ? "right" : "left"}>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </Text>
                    </Stack>
                    {isUser && (
                      <Paper
                        radius="xl"
                        p="xs"
                        bg="blue.0"
                        style={{ flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <IconUser size={14} />
                      </Paper>
                    )}
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea>

          {/* Footer */}
          {data && (
            <Group px="md" py="xs" justify="flex-end" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
              <Badge variant="light" color="gray" size="sm">
                {data.totalElements} message{data.totalElements !== 1 ? "s" : ""}
              </Badge>
            </Group>
          )}
        </Stack>
      )}
    </Modal>
  );
}
