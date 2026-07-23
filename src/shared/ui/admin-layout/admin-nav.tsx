import { NavLink, Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconSearch,
  IconTags,
  IconMail,
  IconReceiptRefund,
  IconSpeakerphone,
  IconHistory,
  IconFileText,
  IconWebhook,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { navigationExtension } from "@/app/addons";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

/** Uppercase section label styled for the dark sidebar */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={600}
      tt="uppercase"
      lts="0.06em"
      px={14}
      pt={12}
      pb={4}
      style={{
        color: "var(--app-nav-section-label)",
        userSelect: "none",
        fontSize: "0.625rem",
      }}
    >
      {children}
    </Text>
  );
}

export function AdminNav() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");

  // ── Section: Overview ────────────────────────────────────────────────────
  const overviewItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={15} />, to: "/admin/" },
  ];

  // ── Section: User Management ─────────────────────────────────────────────
  const userMgmtItems: NavItem[] = [
    { label: t`Users`, icon: <IconUsers size={15} />, to: "/admin/users" },
    { label: t`Organizations`, icon: <IconBuilding size={15} />, to: "/admin/organizations" },
    { label: t`Invitations`, icon: <IconMail size={15} />, to: "/admin/invitations" },
    { label: t`Audit Logs`, icon: <IconHistory size={15} />, to: "/admin/audit-logs" },
  ];

  // ── Section: Billing & Commerce ──────────────────────────────────────────
  const billingItems: NavItem[] = [
    { label: t`Plans`, icon: <IconTags size={15} />, to: "/admin/plans" },
    { label: t`Subscriptions`, icon: <IconCreditCard size={15} />, to: "/admin/subscriptions" },
    { label: t`Refunds`, icon: <IconReceiptRefund size={15} />, to: "/admin/refunds" },
  ];

  // ── Section: Content & Platform ──────────────────────────────────────────
  const addonNavItems: NavItem[] = navigationExtension.getNavItems("workspace").map((item) => {
    const IconComponent = item.icon;
    return {
      label: item.label,
      icon: <IconComponent size={15} />,
      to: item.to,
    };
  });

  const contentItems: NavItem[] = [
    { label: t`Announcements`, icon: <IconSpeakerphone size={15} />, to: "/admin/announcements" },
    { label: t`CMS Pages`, icon: <IconFileText size={15} />, to: "/admin/cms-pages" },
    { label: t`Webhook Logs`, icon: <IconWebhook size={15} />, to: "/admin/webhook-logs" },
    ...addonNavItems,
  ];

  // All nav items flattened for search
  const allNavItems = [...overviewItems, ...userMgmtItems, ...billingItems, ...contentItems];

  const filtered = search.trim()
    ? allNavItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const renderItem = (item: NavItem) => {
    const isActive =
      currentPath === item.to ||
      (item.to !== "/admin/" && item.to !== "/admin" && currentPath.startsWith(item.to));

    // Derive a stable slug from the route, e.g. "/admin/users" → "users"
    const slug = item.to
      .replace(/^\/admin\/?/, "")
      .replace(/\//g, "-")
      .replace(/^$/, "dashboard");

    return (
      <NavLink
        key={item.to}
        label={item.label}
        leftSection={item.icon}
        active={isActive}
        component={Link}
        to={item.to}
        data-testid={TestSelectors.NAV_ITEM(slug)}
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-xs)",
            marginInline: "8px",
            paddingBlock: "7px",
            paddingInline: "10px",
            background: isActive ? "var(--app-nav-active-bg)" : "transparent",
            "&:hover": {
              background: isActive ? "var(--app-nav-active-bg)" : "var(--app-nav-hover-bg)",
            },
          },
          label: {
            fontSize: "var(--mantine-font-size-sm)",
            fontWeight: isActive ? 600 : 400,
            color: isActive ? "var(--app-nav-text-active)" : "var(--app-nav-text)",
          },
          section: {
            width: 20,
            marginRight: 8,
            color: isActive ? "var(--app-nav-icon-active)" : "var(--app-nav-icon)",
          },
        }}
      />
    );
  };

  return (
    <Stack gap={0} py={6}>
      {/* Search */}
      <Box px={10} pb={6}>
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          radius="xs"
          leftSection={<IconSearch size={12} color="var(--app-nav-search-placeholder)" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          data-testid={TestSelectors.NAV_SEARCH_INPUT}
          styles={{
            input: {
              background: "var(--app-nav-search-bg)",
              border: "1px solid var(--app-nav-search-border)",
              color: "var(--app-nav-search-text)",
              fontSize: "var(--mantine-font-size-xs)",
              "&::placeholder": {
                color: "var(--app-nav-search-placeholder)",
              },
            },
          }}
        />
      </Box>

      {/* Results / full nav */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map(renderItem)
        ) : (
          <Text size="xs" px="md" py="xs" style={{ color: "var(--app-nav-section-label)" }}>
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          {/* ── Overview ─────────────────────────────────────────────────── */}
          <SectionLabel>
            <Trans>Overview</Trans>
          </SectionLabel>
          {overviewItems.map(renderItem)}

          <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />

          {/* ── User Management ──────────────────────────────────────────── */}
          <SectionLabel>
            <Trans>User Management</Trans>
          </SectionLabel>
          {userMgmtItems.map(renderItem)}

          <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />

          {/* ── Billing & Commerce ────────────────────────────────────────── */}
          <SectionLabel>
            <Trans>Billing & Commerce</Trans>
          </SectionLabel>
          {billingItems.map(renderItem)}

          <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />

          {/* ── Content & Platform ────────────────────────────────────────── */}
          <SectionLabel>
            <Trans>Content & Platform</Trans>
          </SectionLabel>
          {contentItems.map(renderItem)}
        </>
      )}
    </Stack>
  );
}
