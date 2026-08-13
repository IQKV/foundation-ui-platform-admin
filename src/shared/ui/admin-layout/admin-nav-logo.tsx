import { Group, Burger, Box } from "@mantine/core";
import { NavBrandMark } from "./nav-brand-mark";

interface AdminNavLogoProps {
  opened: boolean;
  onToggle: () => void;
}

/**
 * Logo zone inside the dark sidebar.
 *
 * Sits in a non-scrolling section at the top of the sidebar so the brand mark
 * and the sidebar read as one unified dark column.
 *
 * Height (52px) mirrors the header bar height so horizontal rules stay
 * optically aligned across the shell.
 */
export function AdminNavLogo({ opened, onToggle }: AdminNavLogoProps) {
  return (
    <Group
      h={52}
      px="md"
      gap="xs"
      style={{
        background: "var(--app-sidebar-logo-bg)",
        borderBottom: "1px solid var(--app-sidebar-border)",
        flexShrink: 0,
      }}
      data-testid="admin-nav-logo"
    >
      {/* Mobile hamburger — only visible below the sm breakpoint */}
      <Burger
        opened={opened}
        onClick={onToggle}
        hiddenFrom="sm"
        size="sm"
        color="rgba(255,255,255,0.75)"
        data-testid="sidebar-mobile-menu-toggle"
      />

      {/* Brand mark — visible from sm upward (mirrors original visibleFrom="sm") */}
      <Box visibleFrom="sm">
        <NavBrandMark />
      </Box>
    </Group>
  );
}
