/**
 * admin-sub-nav-bar.tsx
 *
 * Level-2 sub-navigation bar for the top-nav layout variant.
 *
 * Renders the items belonging to the currently active L1 section as a
 * horizontal strip directly below AdminTopNavBar.
 *
 * Structure (44px, full-width, light surface that respects color scheme):
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  [Dashboard]                                                │  ← Overview
 *   │  [Users]  [Organizations]  [Invitations]  [Audit Logs]     │  ← User Mgmt
 *   └─────────────────────────────────────────────────────────────┘
 *
 * When no section is active (e.g. on /admin/404) the bar renders nothing
 * so it doesn't take up space.
 *
 * The bar uses the same --app-nav-* CSS variables as the sidebar NavLinks
 * so active/hover styling is consistent across both variants.
 */

import { Group, Box } from "@mantine/core";
import { useRouterState } from "@tanstack/react-router";
import { buildNavSections, getActiveSection, type NavItem } from "./nav-config";
import { NavItemRenderer } from "./nav-item-renderer";
import { navigationExtension } from "@/app/addons";

export function AdminSubNavBar() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const addonNavItems: NavItem[] = navigationExtension.getNavItems("workspace").map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
  }));

  const sections = buildNavSections(addonNavItems);
  const activeSection = getActiveSection(sections, currentPath);

  // Nothing to show — don't reserve space
  if (!activeSection || activeSection.items.length === 0) return null;

  // Single-item sections (e.g. Overview / Dashboard) skip the sub-bar — the
  // L1 tab already acts as the direct link, so showing one lonely item below
  // it is redundant.
  if (activeSection.items.length === 1) return null;

  return (
    <Box
      component="nav"
      data-testid="admin-sub-nav-bar"
      style={{
        height: 44,
        background: "var(--app-subnav-bg)",
        borderBottom: "1px solid var(--app-subnav-border)",
        position: "sticky",
        // Sticks immediately below the top nav bar (52px)
        top: 52,
        zIndex: 100,
        flexShrink: 0,
        // Override nav-item CSS vars so they flip to dark text in light mode
        // while keeping white text in dark mode. light-dark() resolves based
        // on the Mantine-set color-scheme on the root element.
        "--app-nav-text": "light-dark(rgba(27,35,50,0.70), rgba(255,255,255,0.65))",
        "--app-nav-text-active": "light-dark(#1b2332, #ffffff)",
        "--app-nav-icon": "light-dark(rgba(27,35,50,0.50), rgba(255,255,255,0.45))",
        "--app-nav-icon-active": "light-dark(#1b2332, #ffffff)",
        "--app-nav-hover-bg": "light-dark(rgba(27,35,50,0.07), rgba(255,255,255,0.07))",
        "--app-nav-active-bg": "light-dark(rgba(59,78,240,0.12), rgba(59,78,240,0.75))",
      } as React.CSSProperties}
    >
      <Group
        h="100%"
        px={4}
        gap={0}
        wrap="nowrap"
        style={{ overflowX: "auto", overflowY: "hidden" }}
      >
        {activeSection.items.map((item) => (
          <NavItemRenderer key={item.to} item={item} currentPath={currentPath} iconSize={14} />
        ))}
      </Group>
    </Box>
  );
}
