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
import { IconAlertCircle, IconRobot } from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import { useAdminMessages } from "../model";
import { ModelBadge } from "./model-badge";
import type { ChatSession, ChatMessage } from "../api/ai-chat-sessions-api";

// ─── Markdown renderer (mirrors tenant app message-bubble) ────────────────────

function MarkdownContent({ content }: { content: string }) {
  return (
    <div style={{ fontSize: "var(--mantine-font-size-sm)", lineHeight: 1.6 }}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p style={{ margin: "0 0 0.5em 0" }}>{children}</p>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre
                  style={{
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 6,
                    padding: "0.6em 0.8em",
                    overflowX: "auto",
                    fontSize: "0.85em",
                    margin: "0.5em 0",
                  }}
                >
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code
                style={{
                  background: "rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  padding: "0.1em 0.35em",
                  fontSize: "0.88em",
                  fontFamily: "var(--mantine-font-family-monospace)",
                }}
              >
                {children}
              </code>
            );
          },
          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
          ul: ({ children }) => <ul style={{ margin: "0.25em 0", paddingLeft: "1.4em" }}>{children}</ul>,
          ol: ({ children }) => <ol style={{ margin: "0.25em 0", paddingLeft: "1.4em" }}>{children}</ol>,
          li: ({ children }) => <li style={{ marginBottom: "0.2em" }}>{children}</li>,
          h1: ({ children }) => <p style={{ fontWeight: 700, fontSize: "1.05em", margin: "0.4em 0 0.2em" }}>{children}</p>,
          h2: ({ children }) => <p style={{ fontWeight: 600, fontSize: "1em", margin: "0.4em 0 0.2em" }}>{children}</p>,
          h3: ({ children }) => <p style={{ fontWeight: 600, margin: "0.3em 0 0.1em" }}>{children}</p>,
          blockquote: ({ children }) => (
            <blockquote style={{ borderLeft: "3px solid rgba(0,0,0,0.2)", paddingLeft: "0.8em", margin: "0.4em 0", opacity: 0.8 }}>
              {children}
            </blockquote>
          ),
          hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.15)", margin: "0.6em 0" }} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Single message bubble ─────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString();

  if (message.role === "SYSTEM") {
    return (
      <Text size="xs" c="dimmed" ta="center" py="xs">
        {message.content}
      </Text>
    );
  }

  if (message.role === "USER") {
    return (
      <Group justify="flex-end">
        <Paper bg="blue.6" c="white" p="md" radius="md" maw="75%" style={{ borderBottomRightRadius: 4 }}>
          <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {message.content}
          </Text>
          <Text size="xs" c="white" opacity={0.7} ta="right" mt={4}>
            {timeStr}
          </Text>
        </Paper>
      </Group>
    );
  }

  // ASSISTANT — full markdown
  return (
    <Group justify="flex-start" align="flex-start">
      <Paper
        bg="gray.0"
        p="xs"
        radius="xl"
        style={{
          marginTop: 8,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
        }}
      >
        <IconRobot size={16} />
      </Paper>
      <Paper bg="gray.1" p="md" radius="md" maw="75%" style={{ borderBottomLeftRadius: 4 }}>
        <MarkdownContent content={message.content} />
        <Text size="xs" c="dimmed" mt={6}>
          {timeStr}
        </Text>
      </Paper>
    </Group>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────

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
          <Group
            px="md"
            py="xs"
            gap="lg"
            style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
          >
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
                <Text size="sm" c="dimmed">
                  Loading messages…
                </Text>
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
              {data?.items.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </Stack>
          </ScrollArea>

          {/* Footer */}
          {data && (
            <Group
              px="md"
              py="xs"
              justify="flex-end"
              style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
            >
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
