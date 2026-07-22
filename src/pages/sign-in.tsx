import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { SignInForm } from "@/features/sign-in";
import { decodeJwt, hasPlatformAdmin } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Search params schema ─────────────────────────────────────────────────────

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
  reason: z.enum(["timeout", "forbidden"]).optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/sign-in")({
  validateSearch: signInSearchSchema,

  /**
   * If the admin is already authenticated with PLATFORM_ADMIN authority,
   * skip the sign-in page and go straight to /admin (Requirement 1.14).
   */
  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && hasPlatformAdmin(payload)) {
        throw redirect({ to: "/admin" });
      }
    }
  },

  component: SignInPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function SignInPage() {
  const { t } = useLingui();
  const { redirect: redirectTo, reason } = Route.useSearch();

  return (
    <AuthLayout data-testid="page-sign-in">
      <PageTitle segments={[t`Sign In`]} />

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6} data-testid="sign-in-welcome-heading">
          <Trans>Welcome back</Trans>
        </Title>
        <Text c="dimmed" size="sm" data-testid="sign-in-subheading">
          <Trans>Platform administration</Trans>
        </Text>
      </Box>

      {/* Reason-based contextual messages — Requirements 1.16, 1.17 */}
      {reason === "timeout" && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          aria-live="polite"
          aria-atomic="true"
          data-testid="alert--session-timeout"
        >
          <Trans>Your session expired due to inactivity.</Trans>
        </Alert>
      )}

      {reason === "forbidden" && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
          aria-live="polite"
          aria-atomic="true"
          data-testid="alert--access-forbidden"
        >
          <Trans>You do not have permission to access the admin area.</Trans>
        </Alert>
      )}

      {/* Sign-in form — Requirement 1.1 */}
      <SignInForm redirectTo={redirectTo} />
    </AuthLayout>
  );
}
