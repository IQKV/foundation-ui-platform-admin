import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";

export const Route = createFileRoute("/500")({
  component: InternalServerErrorPage,
});

function InternalServerErrorPage() {
  const { t } = useLingui();
  return (
    <Container size="sm" py="xl" data-testid="page-500">
      <PageTitle segments={[t`Server Error`]} />
      <Stack align="center" gap="md">
        <Title>500</Title>
        <Text c="dimmed">
          <Trans>Internal server error.</Trans>
        </Text>
        <Button component={Link} to="/" data-testid="button--go-home">
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Container>
  );
}
