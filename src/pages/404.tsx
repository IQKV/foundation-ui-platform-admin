import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

export function NotFoundPage() {
  const { t } = useLingui();
  return (
    <Container size="sm" py="xl" data-testid="page-404">
      <PageTitle segments={[t`Page Not Found`]} appTitle="Key Value Admin" />
      <Stack align="center" gap="md">
        <Title>404</Title>
        <Text c="dimmed">
          <Trans>Page not found.</Trans>
        </Text>
        <Button component={Link} to="/" data-testid="button--go-home">
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Container>
  );
}
