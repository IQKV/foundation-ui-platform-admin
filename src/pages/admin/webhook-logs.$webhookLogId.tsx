import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Paper,
  Skeleton,
  Alert,
  TextInput,
  Button,
  SimpleGrid,
  Badge,
  Textarea,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconAlertCircle, IconArrowLeft, IconWebhook } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/webhook-logs/$webhookLogId")({
  component: WebhookLogDetailPage,
});

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case "PROCESSED":
      return "green";
    case "PENDING":
      return "blue";
    case "FAILED":
      return "red";
    case "IGNORED":
      return "gray";
    default:
      return "gray";
  }
}

function WebhookLogDetailPage() {
  const { t } = useLingui();
  const { webhookLogId: id } = Route.useParams();

  const {
    data: log,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "webhook-logs", id],
    queryFn: () => billingApi.getWebhookLog(id),
  });

  if (isError) {
    return (
      <Container size="md" py={0}>
        <PageHeader
          title={
            <Group gap="xs">
              <IconWebhook size={20} />
              <Trans>Webhook Log</Trans>
            </Group>
          }
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Webhook Logs</Trans>, to: "/admin/webhook-logs" },
            { label: id },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load webhook log</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch webhook log details.</Trans>{" "}
          <Text
            data-testid="button-webhook-log-detail-error-retry"
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="md" py={0}>
      <PageTitle segments={[log ? `Webhook Log ${log.eventType}` : t`Loading…`]} />
      <PageHeader
        title={
          log ? (
            <Group gap="sm">
              <IconWebhook size={20} />
              <Trans>Webhook Log</Trans>
              <Badge
                data-testid="badge-webhook-log-detail-status"
                color={getStatusColor(log.status)}
                variant="light"
                size="lg"
                radius="sm"
              >
                {log.status}
              </Badge>
            </Group>
          ) : (
            <Group gap="xs">
              <IconWebhook size={20} />
              <Trans>Loading…</Trans>
            </Group>
          )
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Webhook Logs</Trans>, to: "/admin/webhook-logs" },
          { label: log?.eventType ?? id },
        ]}
      />

      <Stack gap="lg">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          to="/admin/webhook-logs"
          size="xs"
          w="fit-content"
        >
          <Trans>Back to list</Trans>
        </Button>

        <Paper p="xl">
          {isLoading ? (
            <Stack>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Stack>
          ) : (
            <Stack gap="xl">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TextInput
                  data-testid="input-webhook-log-id"
                  label={<Trans>Log ID</Trans>}
                  value={log?.id ?? ""}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-webhook-log-tenant-key"
                  label={<Trans>Tenant Key</Trans>}
                  value={log?.tenantKey ?? ""}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-webhook-log-event-type"
                  label={<Trans>Event Type</Trans>}
                  value={log?.eventType ?? ""}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-webhook-log-status"
                  label={<Trans>Status</Trans>}
                  value={log?.status ?? ""}
                  readOnly
                  variant="filled"
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TextInput
                  data-testid="input-webhook-log-external-event-id"
                  label={<Trans>External Event ID</Trans>}
                  value={log?.externalEventId ?? ""}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-webhook-log-received-at"
                  label={<Trans>Received At</Trans>}
                  value={log ? dayjs(log.receivedAt).format("YYYY-MM-DD HH:mm:ss") : ""}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-webhook-log-processed-at"
                  label={<Trans>Processed At</Trans>}
                  value={
                    log?.processedAt ? dayjs(log.processedAt).format("YYYY-MM-DD HH:mm:ss") : "—"
                  }
                  readOnly
                  variant="filled"
                />
              </SimpleGrid>

              {log?.errorMessage && (
                <Textarea
                  data-testid="input-webhook-log-error-message"
                  label={<Trans>Error Message</Trans>}
                  value={log.errorMessage}
                  readOnly
                  variant="filled"
                  autosize
                  minRows={2}
                  maxRows={8}
                  styles={{
                    input: {
                      fontFamily: "var(--mantine-font-family-monospace)",
                      fontSize: "var(--mantine-font-size-xs)",
                      color: "var(--mantine-color-red-7)",
                    },
                  }}
                />
              )}
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
