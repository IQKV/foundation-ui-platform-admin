import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Group,
  Button,
  TextInput,
  Select,
  Alert,
  Paper,
  Divider,
  Text,
  Badge,
  SimpleGrid,
  Box,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useQuery } from "@tanstack/react-query";
import { IconAlertCircle, IconArrowLeft, IconPlus, IconFileText } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { PageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { cmsApi, localesApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import {
  PageTranslationFields,
  buildPageSchema,
  getEditablePageStatusOptions,
  useCreatePage,
  EMPTY_TRANSLATION,
} from "@/features/page-admin";
import type { PageFormValues } from "@/features/page-admin";

export const Route = createFileRoute("/admin/cms-pages/$tenantKey/create")({
  component: CreateCmsPagePage,
});

function CreateCmsPagePage() {
  const { t } = useLingui();
  const { tenantKey } = Route.useParams();
  const navigate = useNavigate();

  // ─── Remote data ────────────────────────────────────────────────────────────
  const { data: iamLocales = [] } = useQuery({
    queryKey: ["locales"],
    queryFn: () => localesApi.list(),
    staleTime: Infinity,
  });

  const { data: hierarchyItems = [] } = useQuery({
    queryKey: ["admin", "cms-pages", tenantKey, "hierarchy"],
    queryFn: () => cmsApi.listPageHierarchy(tenantKey),
    staleTime: 30_000,
  });

  // ─── Derived values ─────────────────────────────────────────────────────────
  const defaultLocale = iamLocales.find((loc) => loc.isDefault)?.code;

  const localeOptions = iamLocales.map((loc) => ({
    value: loc.code,
    label: loc.nativeName ? `${loc.nativeName} (${loc.code})` : `${loc.name} (${loc.code})`,
  }));

  const parentOptions = hierarchyItems.map((p) => ({
    value: p.id,
    label: p.title ? `${p.title} — /${p.slug}` : `/${p.slug}`,
  }));

  // ─── Form ────────────────────────────────────────────────────────────────────
  // NOTE: defaultLocale is declared before useForm so the validate closure captures it correctly.
  const form = useForm<PageFormValues>({
    initialValues: {
      slug: "",
      parentId: null,
      template: null,
      status: "DRAFT",
      translations: [{ ...EMPTY_TRANSLATION, locale: defaultLocale ?? "en-US" }],
    },
    validate: (values) => validateWithZod(buildPageSchema(defaultLocale), values),
  });

  const mutation = useCreatePage({
    tenantKey,
    onSuccess: () => void navigate({ to: "/admin/cms-pages" }),
  });

  const hasDefaultLocale = defaultLocale
    ? form.values.translations.some((tr) => tr.locale.toLowerCase() === defaultLocale.toLowerCase())
    : form.values.translations.length > 0;

  const handleSubmit = form.onSubmit((values) => mutation.mutate(values));

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`New CMS Page — ${tenantKey}`]} appTitle="Key Value Admin" />

      <PageHeader
        title={
          <Group gap="sm" align="center">
            <ThemeIcon variant="light" color="indigo" size="md" radius="sm">
              <IconFileText size={16} />
            </ThemeIcon>
            <Trans>New Page</Trans>
          </Group>
        }
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/admin/" },
          { label: <Trans>CMS Pages</Trans>, to: "/admin/cms-pages/" },
          {
            label: (
              <Group gap={4} align="center">
                <Text size="xs" c="dimmed" ff="monospace">
                  {tenantKey}
                </Text>
              </Group>
            ),
          },
          { label: <Trans>New</Trans> },
        ]}
        toolbar={
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconArrowLeft size={14} />}
            component={Link}
            to="/admin/cms-pages"
          >
            <Trans>Back to list</Trans>
          </Button>
        }
      />

      <form onSubmit={handleSubmit} data-testid={TestSelectors.FORM.CMS_PAGE_CREATE}>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md" style={{ alignItems: "start" }}>
          {/* ─── Main: translations ─────────────────────────────────────── */}
          <Box style={{ gridColumn: "span 2" }}>
            <Paper p="lg" withBorder={false} shadow="xs">
              {mutation.isError && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  color="red"
                  variant="light"
                  title={<Trans>Creation failed</Trans>}
                  mb="md"
                >
                  <Trans>Could not create the page. Please check the form and try again.</Trans>
                </Alert>
              )}

              {!hasDefaultLocale && (
                <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" mb="md">
                  <Trans>
                    A translation for the default locale ({defaultLocale ?? "default"}) is required.
                  </Trans>
                </Alert>
              )}

              <PageTranslationFields
                form={form}
                locales={localeOptions}
                defaultLocale={defaultLocale}
              />
            </Paper>
          </Box>

          {/* ─── Sidebar: meta + actions ─────────────────────────────────── */}
          <Stack gap="sm">
            {/* Tenant badge */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="xs">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Tenant</Trans>
                </Text>
                <Badge variant="outline" color="indigo" size="md" ff="monospace" radius="sm">
                  {tenantKey}
                </Badge>
              </Stack>
            </Paper>

            {/* Page settings */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Page settings</Trans>
                </Text>

                <TextInput
                  label={t`Slug`}
                  placeholder="about-us"
                  description={t`URL path, e.g. about-us or blog/post`}
                  required
                  size="sm"
                  data-testid={TestSelectors.INPUT.CMS_PAGE_CREATE_SLUG}
                  {...form.getInputProps("slug")}
                />

                <Select
                  label={t`Status`}
                  data={getEditablePageStatusOptions()}
                  size="sm"
                  data-testid={TestSelectors.INPUT.CMS_PAGE_CREATE_STATUS}
                  {...form.getInputProps("status")}
                />

                <TextInput
                  label={t`Template`}
                  placeholder={t`e.g. default, landing`}
                  description={t`Optional layout key`}
                  size="sm"
                  data-testid={TestSelectors.INPUT.CMS_PAGE_CREATE_TEMPLATE}
                  {...form.getInputProps("template")}
                />
              </Stack>
            </Paper>

            {/* Parent page picker */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.05em">
                  <Trans>Hierarchy</Trans>
                </Text>

                <Select
                  label={t`Parent page`}
                  placeholder={t`None (top-level)`}
                  description={t`Optional — makes this a child page`}
                  data={parentOptions}
                  value={form.values.parentId ?? null}
                  onChange={(val) => form.setFieldValue("parentId", val ?? null)}
                  searchable
                  clearable
                  size="sm"
                  disabled={parentOptions.length === 0}
                  data-testid={TestSelectors.INPUT.CMS_PAGE_CREATE_PARENT_ID}
                />
              </Stack>
            </Paper>

            {/* Actions */}
            <Paper p="md" withBorder={false} shadow="xs">
              <Stack gap="sm">
                <Button
                  type="submit"
                  leftSection={<IconPlus size={15} />}
                  loading={mutation.isPending}
                  disabled={!hasDefaultLocale}
                  fullWidth
                  data-testid={TestSelectors.BUTTON.CMS_PAGE_CREATE_SUBMIT}
                >
                  <Trans>Create page</Trans>
                </Button>
                <Button
                  variant="subtle"
                  color="gray"
                  component={Link}
                  to="/admin/cms-pages"
                  disabled={mutation.isPending}
                  fullWidth
                  data-testid={TestSelectors.BUTTON.CMS_PAGE_CREATE_CANCEL}
                >
                  <Trans>Cancel</Trans>
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </SimpleGrid>
      </form>
    </Container>
  );
}
