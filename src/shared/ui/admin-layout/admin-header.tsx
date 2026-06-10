import { Group, Text, Burger, Box, Tooltip, ActionIcon } from "@mantine/core";
import { IconShieldHalf, IconUserCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { SignOutButton } from "@/features/sign-out";
import { NotificationBell } from "@/features/notification-bell";
import { APP_NAME } from "@/shared/lib/page-title";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";

interface AdminHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function AdminHeader({ opened, onToggle }: AdminHeaderProps) {
  return (
    <Group h="100%" px={0} justify="space-between" gap={0} data-testid="admin-header">
      {/* Brand block — exact same width as the sidebar for pixel-perfect alignment */}
      <Group
        h="100%"
        px="md"
        gap="xs"
        style={{
          width: 216,
          borderRight: "1px solid var(--mantine-color-default-border)",
          flexShrink: 0,
        }}
      >
        <Burger
          opened={opened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
          data-testid="header-mobile-menu-toggle"
        />

        <Group gap={8} visibleFrom="sm" style={{ cursor: "default" }}>
          {/* Logo mark — uses primary accent so it responds to theme primaryColor */}
          <Box
            style={{
              width: 28,
              height: 28,
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-blue-6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            data-testid="header-logo"
          >
            <IconShieldHalf size={15} color="white" />
          </Box>

          <Text fw={600} size="sm" style={{ letterSpacing: "-0.02em" }}>
            {APP_NAME}
          </Text>
        </Group>
      </Group>

      {/* Right-side controls */}
      <Group gap={4} px="md" ml="auto">
        <LocaleSwitcher />
        <ColorSchemeToggle />
        <NotificationBell />
        <Tooltip label="My Account" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            component={Link}
            to="/admin/account"
            data-testid="header-account-link"
          >
            <IconUserCircle size={16} />
          </ActionIcon>
        </Tooltip>
        <SignOutButton />
      </Group>
    </Group>
  );
}
