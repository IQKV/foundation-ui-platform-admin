/**
 * nav-item-renderer.tsx
 *
 * Shared NavLink rendering logic used by both layout variants:
 *   - Sidebar variant  → AdminNav
 *   - Top-nav variant  → AdminSubNavBar
 *
 * Keeps active-state styling and test-selector derivation in one place.
 */

import { NavLink } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { NavItem } from "./nav-config";
import { isNavItemActive, navSlug } from "./nav-config";
import { TestSelectors } from "@/shared/lib/test-selectors";

export interface NavItemRendererProps {
  item: NavItem;
  currentPath: string;
  /** Icon size passed to the Tabler icon component. Defaults to 15. */
  iconSize?: number;
}

/**
 * Renders a single Mantine NavLink wired to TanStack Router.
 *
 * Styling uses CSS variables so both the dark sidebar and the light sub-nav bar
 * can apply the same component with their own variable values.
 */
export function NavItemRenderer({ item, currentPath, iconSize = 15 }: NavItemRendererProps) {
  const isActive = isNavItemActive(item, currentPath);
  const slug = navSlug(item.to);
  const IconComponent = item.icon;

  return (
    <NavLink
      key={item.to}
      label={item.label}
      leftSection={<IconComponent size={iconSize} />}
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
}
