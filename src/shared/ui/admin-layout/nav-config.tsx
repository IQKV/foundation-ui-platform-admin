/**
 * nav-config.ts
 *
 * Single source of truth for admin navigation sections and items.
 * Consumed by both the sidebar variant (AdminNav) and the top-nav variant
 * (AdminTopNavBar / AdminSubNavBar) so adding a route only needs one edit here.
 *
 * Each NavSection groups a label with its child NavItems.
 * The `id` field is a stable machine key used for active-section detection
 * (prefix-based route matching) and data-testid generation.
 */

import type { ComponentType } from "react";
import { Trans } from "@lingui/react/macro";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: React.ReactNode;
  /** Tabler icon component (not yet instantiated — callers size it themselves). */
  icon: ComponentType<{ size?: number }>;
  to: string;
}

export interface NavSection {
  /** Stable machine key — used for matching and test selectors. */
  id: string;
  label: React.ReactNode;
  /** Route prefixes that mark this section as "active". */
  prefixes: string[];
  items: NavItem[];
}

// ─── Icons (imported once, shared) ───────────────────────────────────────────

import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconTags,
  IconMail,
  IconReceiptRefund,
  IconSpeakerphone,
  IconHistory,
  IconFileText,
  IconWebhook,
} from "@tabler/icons-react";

// ─── Sections ─────────────────────────────────────────────────────────────────

/**
 * Returns the full navigation section tree.
 *
 * Addon items for the Content section are injected by the caller so
 * this module stays free of side-effects and React hooks.
 *
 * @param addonItems  Extra NavItems appended to the Content & Platform section
 */
export function buildNavSections(addonItems: NavItem[] = []): NavSection[] {
  return [
    {
      id: "overview",
      label: <Trans>Overview</Trans>,
      prefixes: ["/admin/"],
      items: [{ label: <Trans>Dashboard</Trans>, icon: IconDashboard, to: "/admin/" }],
    },
    {
      id: "users",
      label: <Trans>User Management</Trans>,
      prefixes: ["/admin/users", "/admin/organizations", "/admin/invitations", "/admin/audit-logs"],
      items: [
        { label: <Trans>Users</Trans>, icon: IconUsers, to: "/admin/users" },
        { label: <Trans>Organizations</Trans>, icon: IconBuilding, to: "/admin/organizations" },
        { label: <Trans>Invitations</Trans>, icon: IconMail, to: "/admin/invitations" },
        { label: <Trans>Audit Logs</Trans>, icon: IconHistory, to: "/admin/audit-logs" },
      ],
    },
    {
      id: "billing",
      label: <Trans>Billing & Commerce</Trans>,
      prefixes: ["/admin/plans", "/admin/subscriptions", "/admin/refunds"],
      items: [
        { label: <Trans>Plans</Trans>, icon: IconTags, to: "/admin/plans" },
        { label: <Trans>Subscriptions</Trans>, icon: IconCreditCard, to: "/admin/subscriptions" },
        { label: <Trans>Refunds</Trans>, icon: IconReceiptRefund, to: "/admin/refunds" },
      ],
    },
    {
      id: "content",
      label: <Trans>Content & Platform</Trans>,
      prefixes: [
        "/admin/announcements",
        "/admin/cms-pages",
        "/admin/webhook-logs",
        "/admin/addons",
      ],
      items: [
        { label: <Trans>Announcements</Trans>, icon: IconSpeakerphone, to: "/admin/announcements" },
        { label: <Trans>CMS Pages</Trans>, icon: IconFileText, to: "/admin/cms-pages" },
        { label: <Trans>Webhook Logs</Trans>, icon: IconWebhook, to: "/admin/webhook-logs" },
        ...addonItems,
      ],
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the section whose prefixes match the current pathname, or undefined. */
export function getActiveSection(sections: NavSection[], pathname: string): NavSection | undefined {
  return sections.find((section) =>
    section.prefixes.some((prefix) =>
      // exact match for the root dashboard ("/admin/"), prefix match otherwise
      prefix === "/admin/"
        ? pathname === "/admin/" || pathname === "/admin"
        : pathname.startsWith(prefix),
    ),
  );
}

/** Returns true when a nav item's route is the active one. */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.to ||
    (item.to !== "/admin/" && item.to !== "/admin" && pathname.startsWith(item.to))
  );
}

/** Derives a stable slug from a route path, e.g. "/admin/users" → "users". */
export function navSlug(to: string): string {
  return to
    .replace(/^\/admin\/?/, "")
    .replace(/\//g, "-")
    .replace(/^$/, "dashboard");
}
