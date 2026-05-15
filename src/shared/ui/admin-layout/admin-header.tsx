import { Group, Text, Burger, Box, Divider, Tooltip, ActionIcon } from "@mantine/core";
import { IconShieldHalf, IconUserCircle } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { SignOutButton } from "@/features/sign-out";
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
      {/* Brand block — same width as sidebar so content aligns */}
      <Group
        h="100%"
        px="md"
        gap="xs"
        style={{
          width: 220,
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
          {/* Logo mark */}
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--mantine-radius-md)",
              background: "var(--mantine-color-dark-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
            data-testid="header-logo"
          >
            <IconShieldHalf size={18} color="white" />
          </Box>

          <Text
            fw={700}
            size="sm"
            c="var(--mantine-color-text)"
            style={{ letterSpacing: "-0.01em" }}
          >
            {APP_NAME}
          </Text>
        </Group>
      </Group>

      <Divider orientation="vertical" />

      {/* Right side actions */}
      <Group gap="xs" px="md" ml="auto">
        <LocaleSwitcher />
        <ColorSchemeToggle />
        <Tooltip label="My Account" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            component={Link}
            to="/admin/account"
            data-testid="header-account-link"
          >
            <IconUserCircle size={18} />
          </ActionIcon>
        </Tooltip>
        <SignOutButton />
      </Group>
    </Group>
  );
}
