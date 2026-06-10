import { NavLink, Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconSearch,
  IconTags,
  IconMail,
  IconUserCircle,
  IconReceiptRefund,
  IconSpeakerphone,
  IconHistory,
} from "@tabler/icons-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  to: string;
}

/** Section label above a group of nav items */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={600}
      c="dimmed"
      tt="uppercase"
      lts="0.06em"
      px={12}
      pt={8}
      pb={4}
      style={{ userSelect: "none" }}
    >
      {children}
    </Text>
  );
}

export function AdminNav() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");

  const navItems: NavItem[] = [
    { label: t`Dashboard`, icon: <IconDashboard size={15} />, to: "/admin/" },
    { label: t`Users`, icon: <IconUsers size={15} />, to: "/admin/users" },
    { label: t`Organizations`, icon: <IconBuilding size={15} />, to: "/admin/organizations" },
    { label: t`Audit Logs`, icon: <IconHistory size={15} />, to: "/admin/audit-logs" },
    { label: t`Invitations`, icon: <IconMail size={15} />, to: "/admin/invitations" },
    { label: t`Subscriptions`, icon: <IconCreditCard size={15} />, to: "/admin/subscriptions" },
    { label: t`Refunds`, icon: <IconReceiptRefund size={15} />, to: "/admin/refunds" },
    { label: t`Plans`, icon: <IconTags size={15} />, to: "/admin/plans" },
    { label: t`Announcements`, icon: <IconSpeakerphone size={15} />, to: "/admin/announcements" },
  ];

  const accountItem: NavItem = {
    label: t`My Account`,
    icon: <IconUserCircle size={15} />,
    to: "/admin/account",
  };

  const filtered = search.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const renderItem = (item: NavItem) => {
    const isActive =
      currentPath === item.to ||
      (item.to !== "/admin/" && item.to !== "/admin" && currentPath.startsWith(item.to));

    return (
      <NavLink
        key={item.to}
        label={item.label}
        leftSection={item.icon}
        active={isActive}
        component={Link}
        to={item.to}
        styles={{
          root: {
            borderRadius: "var(--mantine-radius-xs)",
            marginInline: "6px",
            paddingBlock: "6px",
            paddingInline: "10px",
          },
          label: {
            fontSize: "var(--mantine-font-size-sm)",
            fontWeight: isActive ? 600 : 400,
          },
          section: {
            // icon column — fixed width keeps labels aligned
            width: 20,
            marginRight: 8,
          },
        }}
      />
    );
  };

  return (
    <Stack gap={0} py="xs">
      {/* Search */}
      <Box px="sm" pb="xs">
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          radius="xs"
          leftSection={<IconSearch size={12} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{
            input: {
              background: "var(--mantine-color-default)",
              fontSize: "var(--mantine-font-size-xs)",
            },
          }}
        />
      </Box>

      {/* Results / full nav */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map(renderItem)
        ) : (
          <Text size="xs" c="dimmed" px="md" py="xs">
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          <SectionLabel>
            <Trans>Platform</Trans>
          </SectionLabel>

          {navItems.map(renderItem)}

          <Divider mx="sm" my={6} />

          <SectionLabel>
            <Trans>Account</Trans>
          </SectionLabel>

          {renderItem(accountItem)}
        </>
      )}
    </Stack>
  );
}
