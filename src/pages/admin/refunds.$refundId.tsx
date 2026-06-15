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
  Code,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { IconAlertCircle, IconArrowLeft, IconRefresh } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { billingApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/refunds/$refundId")({
  component: RefundDetailPage,
});

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "succeeded":
    case "completed":
      return "green";
    case "pending":
      return "blue";
    case "failed":
      return "red";
    default:
      return "gray";
  }
}

function RefundDetailPage() {
  const { t } = useLingui();
  const { refundId: id } = Route.useParams();

  const {
    data: refund,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "refunds", id],
    queryFn: () => billingApi.getRefund(id),
  });

  if (isError) {
    return (
      <Container size="md" py={0}>
        <PageHeader
          title={<Trans>Refund</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/admin/" },
            { label: <Trans>Refunds</Trans>, to: "/admin/refunds" },
            { label: id },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load refund</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch refund details.</Trans>{" "}
          <Text
            data-testid="button-refund-detail-error-retry"
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
      <Helmet>
        <title>{pageTitle(refund ? `Refund ${refund.id}` : t`Loading…`)}</title>
      </Helmet>
      <PageHeader
        title={
          refund ? (
            <Group gap="sm">
              <Trans>Refund</Trans>
              <Badge
                data-testid="badge-refund-detail-status"
                color={getStatusColor(refund.status)}
                variant="light"
                size="lg"
                radius="sm"
              >
                {refund.status}
              </Badge>
            </Group>
          ) : (
            <Trans>Loading…</Trans>
          )
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>Refunds</Trans>, to: "/admin/refunds" },
          { label: refund?.id ?? id },
        ]}
      />

      <Stack gap="lg">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={16} />}
          component={Link}
          to="/admin/refunds"
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
            </Stack>
          ) : (
            <Stack gap="xl">
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TextInput
                  data-testid="input-refund-id"
                  label={<Trans>Refund ID</Trans>}
                  value={refund?.id}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-tenant-key"
                  label={<Trans>Tenant Key</Trans>}
                  value={refund?.tenantKey}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-amount"
                  label={<Trans>Amount</Trans>}
                  value={
                    refund
                      ? `${(refund.amount / 100).toFixed(2)} ${refund.currency.toUpperCase()}`
                      : ""
                  }
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-status"
                  label={<Trans>Status</Trans>}
                  value={refund?.status}
                  readOnly
                  variant="filled"
                />
              </SimpleGrid>

              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                <TextInput
                  data-testid="input-refund-external-refund-id"
                  label={<Trans>External Refund ID</Trans>}
                  value={refund?.externalRefundId}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-external-payment-id"
                  label={<Trans>External Payment ID</Trans>}
                  value={refund?.externalPaymentId}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-external-customer-id"
                  label={<Trans>External Customer ID</Trans>}
                  value={refund?.externalCustomerId}
                  readOnly
                  variant="filled"
                />
                <TextInput
                  data-testid="input-refund-occurred-at"
                  label={<Trans>Occurred At</Trans>}
                  value={refund ? dayjs(refund.occurredAt).format("YYYY-MM-DD HH:mm:ss") : ""}
                  readOnly
                  variant="filled"
                />
              </SimpleGrid>

              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  <Trans>Timestamps</Trans>
                </Text>
                <Group gap="xl">
                  <Text size="xs">
                    <Trans>Created:</Trans>{" "}
                    {refund ? dayjs(refund.createdAt).format("YYYY-MM-DD HH:mm:ss") : ""}
                  </Text>
                  <Text size="xs">
                    <Trans>Updated:</Trans>{" "}
                    {refund ? dayjs(refund.updatedAt).format("YYYY-MM-DD HH:mm:ss") : ""}
                  </Text>
                </Group>
              </Stack>
            </Stack>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
