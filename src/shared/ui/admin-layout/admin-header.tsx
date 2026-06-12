import { Group, Burger } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { Tooltip, ActionIcon } from "@mantine/core";
import { IconUserCircle } from "@tabler/icons-react";
import { SignOutButton } from "@/features/sign-out";
import { NotificationBell } from "@/features/notification-bell";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";

interface AdminHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

/**
 * Top action bar.
 *
 * The brand / logo has moved into AdminNavLogo (inside the dark sidebar) so the
 * sidebar + logo read as one unified column. This header now owns only the
 * right-side utility controls and, on mobile, the hamburger toggle.
 */
export function AdminHeader({ opened, onToggle }: AdminHeaderProps) {
  return (
    <Group h="100%" px="md" justify="space-between" gap={0} data-testid="admin-header">
      {/* Mobile-only hamburger — on desktop the sidebar is always visible */}
      <Burger
        opened={opened}
        onClick={onToggle}
        hiddenFrom="sm"
        size="sm"
        data-testid="header-mobile-menu-toggle"
        aria-label="Toggle navigation"
      />

      {/* Right-side utility strip — always visible */}
      <Group gap={4} ml="auto">
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
