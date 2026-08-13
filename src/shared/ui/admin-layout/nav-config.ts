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
import type { MacroMessageDescriptor } from "@lingui/core/macro";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  /** Tabler icon component (not yet instantiated — callers size it themselves). */
  icon: ComponentType<{ size?: number }>;
  to: string;
}

export interface NavSection {
  /** Stable machine key — used for matching and test selectors. */
  id: string;
  label: string;
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
 * The `t` tagged-template function from Lingui's `useLingui()` hook.
 * Typed to match the exact overloaded signature returned by the macro.
 */
export type LinguiT = {
  (descriptor: MacroMessageDescriptor): string;
  (literals: TemplateStringsArray, ...placeholders: any[]): string;
};

/**
 * Returns the full navigation section tree.
 *
 * Accepts translated labels so callers (which have i18n context) can pass them
 * in. Addon items for the Content section are also injected by the caller so
 * this module stays free of side-effects and React hooks.
 *
 * @param t       Lingui `t` tagged-template function from `useLingui()`
 * @param addonItems  Extra NavItems appended to the Content & Platform section
 */
export function buildNavSections(t: LinguiT, addonItems: NavItem[] = []): NavSection[] {
  return [
    {
      id: "overview",
      label: t`Overview`,
      prefixes: ["/admin/"],
      items: [{ label: t`Dashboard`, icon: IconDashboard, to: "/admin/" }],
    },
    {
      id: "users",
      label: t`User Management`,
      prefixes: ["/admin/users", "/admin/organizations", "/admin/invitations", "/admin/audit-logs"],
      items: [
        { label: t`Users`, icon: IconUsers, to: "/admin/users" },
        { label: t`Organizations`, icon: IconBuilding, to: "/admin/organizations" },
        { label: t`Invitations`, icon: IconMail, to: "/admin/invitations" },
        { label: t`Audit Logs`, icon: IconHistory, to: "/admin/audit-logs" },
      ],
    },
    {
      id: "billing",
      label: t`Billing & Commerce`,
      prefixes: ["/admin/plans", "/admin/subscriptions", "/admin/refunds"],
      items: [
        { label: t`Plans`, icon: IconTags, to: "/admin/plans" },
        { label: t`Subscriptions`, icon: IconCreditCard, to: "/admin/subscriptions" },
        { label: t`Refunds`, icon: IconReceiptRefund, to: "/admin/refunds" },
      ],
    },
    {
      id: "content",
      label: t`Content & Platform`,
      prefixes: [
        "/admin/announcements",
        "/admin/cms-pages",
        "/admin/webhook-logs",
        "/admin/addons",
      ],
      items: [
        { label: t`Announcements`, icon: IconSpeakerphone, to: "/admin/announcements" },
        { label: t`CMS Pages`, icon: IconFileText, to: "/admin/cms-pages" },
        { label: t`Webhook Logs`, icon: IconWebhook, to: "/admin/webhook-logs" },
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
