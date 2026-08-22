import { Group, Burger, Avatar, Menu, UnstyledButton } from "@mantine/core";
import { IconLogout, IconUser, IconBell, IconShieldCheck } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useSignOut } from "@/features/sign-out";
import { NotificationBell } from "@/features/notification-bell";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";
import { adminAccountApi } from "@/shared/api";
import { useSessionStore } from "@/processes/session";
import { avatarColor, initials, formatName } from "@/shared/lib/user-utils";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface AdminHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function AdminHeaderUserMenu() {
  const { t } = useLingui();
  const { isLoading, signOut } = useSignOut();
  const navigate = useNavigate();
  const accessToken = useSessionStore((s) => s.accessToken);

  const { data: account } = useQuery({
    queryKey: ["admin-account"],
    queryFn: () => adminAccountApi.getAccount(),
    enabled: !!accessToken,
  });

  const userInitials = account ? initials(account.firstName, account.lastName) : "?";

  const displayName = account ? formatName(account.firstName, account.lastName) : "";
  const color = account ? avatarColor(account.userId) : "blue";

  return (
    <Menu shadow="md" width={220} position="bottom-end">
      <Menu.Target>
        <UnstyledButton
          style={{ cursor: "pointer", borderRadius: "50%", lineHeight: 0 }}
          data-testid={TestSelectors.HEADER_USER_MENU_BUTTON}
          aria-label={displayName || t`User menu`}
        >
          <Avatar size={32} radius="xl" color={color} variant="filled">
            {userInitials}
          </Avatar>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown data-testid={TestSelectors.HEADER_USER_MENU}>
        {displayName && (
          <>
            <Menu.Label>{displayName}</Menu.Label>
            <Menu.Label style={{ fontSize: "var(--mantine-font-size-xs)", opacity: 0.7 }}>
              {account?.email}
            </Menu.Label>
            <Menu.Divider />
          </>
        )}

        <Menu.Item
          leftSection={<IconUser size={14} />}
          component={Link}
          to="/admin/account"
          data-testid={TestSelectors.HEADER_USER_MENU_PROFILE_BUTTON}
        >
          <Trans>My Account</Trans>
        </Menu.Item>

        <Menu.Item
          leftSection={<IconBell size={14} />}
          component={Link}
          to="/admin/notifications"
          data-testid={TestSelectors.HEADER_USER_MENU_NOTIFICATIONS_BUTTON}
        >
          <Trans>Notifications</Trans>
        </Menu.Item>

        <Menu.Item
          leftSection={<IconShieldCheck size={14} />}
          component={Link}
          to="/admin/account"
          data-testid={TestSelectors.HEADER_USER_MENU_SECURITY_BUTTON}
        >
          <Trans>Security</Trans>
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          color="red"
          leftSection={<IconLogout size={14} />}
          disabled={isLoading}
          onClick={() => void signOut()}
          data-testid={TestSelectors.BUTTON.SIGN_OUT}
        >
          <Trans>Sign out</Trans>
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

/**
 * Top action bar.
 *
 * The brand / logo has moved into AdminNavLogo (inside the dark sidebar) so the
 * sidebar + logo read as one unified column. This header now owns only the
 * right-side utility controls and, on mobile, the hamburger toggle.
 *
 * The My Account / Sign out actions are grouped into a UserMenu dropdown.
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
        <AdminHeaderUserMenu />
      </Group>
    </Group>
  );
}
