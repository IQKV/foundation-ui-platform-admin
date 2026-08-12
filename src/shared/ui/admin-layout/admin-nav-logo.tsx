import { Group, Text, Box, Burger } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { appBrandName, appBrandTagline } from "@/app/config/runtime-env";

interface AdminNavLogoProps {
  opened: boolean;
  onToggle: () => void;
}

/**
 * Logo zone inside the dark sidebar.
 *
 * Sits in a non-scrolling AppShell.Section at the top of the navbar so the
 * sidebar and logo bar read as one unified dark column — the header's brand
 * block has been removed to avoid duplication.
 *
 * The height (52px) deliberately mirrors the AppShell header height so the
 * horizontal rules stay optically aligned across the shell.
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

      {/* Brand mark + name — visible from sm upward */}
      <Group gap={10} visibleFrom="sm" style={{ cursor: "default" }} wrap="nowrap">
        {/* Logo mark: accent square with shield icon */}
        <Box
          style={{
            width: 30,
            height: 30,
            borderRadius: "var(--mantine-radius-sm)",
            background: "var(--mantine-color-blue-6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 6px rgba(59,78,240,0.45)",
          }}
          data-testid="sidebar-logo-mark"
        >
          <IconShieldHalf size={16} color="white" strokeWidth={1.8} />
        </Box>

        {/* App name — two-line layout gives it more presence */}
        <Box style={{ lineHeight: 1 }}>
          <Text
            size="sm"
            fw={700}
            style={{
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {appBrandName}
          </Text>
          <Text
            size="xs"
            style={{
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.625rem",
              lineHeight: 1.4,
            }}
          >
            {appBrandTagline}
          </Text>
        </Box>
      </Group>
    </Group>
  );
}
