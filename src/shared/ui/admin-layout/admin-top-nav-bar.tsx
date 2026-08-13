/**
 * admin-top-nav-bar.tsx
 *
 * Level-1 top navigation bar for the top-nav layout variant.
 *
 * Structure (52px, full-width, dark background):
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ [BrandMark]  [Overview] [Users] [Billing] [Content]  [util] │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Clicking a section tab navigates to the first item in that section and
 * highlights the tab whenever any route in that section is active.
 *
 * The right-side utility strip (LocaleSwitcher, ColorSchemeToggle,
 * NotificationBell, UserMenu) is identical to AdminHeader so the two layouts
 * feel consistent.
 *
 * Mobile: section labels collapse behind a Drawer opened by the Burger.
 */

import { Group, Box, UnstyledButton, Text, Burger, Drawer, Stack, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useLingui } from "@lingui/react/macro";
import { NavBrandMark } from "./nav-brand-mark";
import { NavItemRenderer } from "./nav-item-renderer";
import { buildNavSections, getActiveSection, type NavSection, type NavItem } from "./nav-config";
import { NotificationBell } from "@/features/notification-bell";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";
import { navigationExtension } from "@/app/addons";
import { AdminHeaderUserMenu } from "./admin-header";

// ─── Section tab ─────────────────────────────────────────────────────────────

interface SectionTabProps {
  section: NavSection;
  isActive: boolean;
  onClick: () => void;
}

function SectionTab({ section, isActive, onClick }: SectionTabProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      data-testid={`top-nav-section-${section.id}`}
      style={{
        height: 52,
        paddingInline: 14,
        display: "flex",
        alignItems: "center",
        borderBottom: isActive ? "2px solid var(--mantine-color-blue-4)" : "2px solid transparent",
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
        fontWeight: isActive ? 600 : 400,
        fontSize: "var(--mantine-font-size-sm)",
        transition: "color 120ms ease, border-color 120ms ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
      }}
    >
      <Text inherit>{section.label}</Text>
    </UnstyledButton>
  );
}

// ─── AdminTopNavBar ───────────────────────────────────────────────────────────

export function AdminTopNavBar() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  const addonNavItems: NavItem[] = navigationExtension.getNavItems("workspace").map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
  }));

  const sections = buildNavSections(t, addonNavItems);
  const activeSection = getActiveSection(sections, currentPath);

  const handleSectionClick = (section: NavSection) => {
    // Navigate to the first item in the section
    const firstTo = section.items[0]?.to;
    if (firstTo) void navigate({ to: firstTo });
  };

  return (
    <Box
      component="header"
      data-testid="admin-top-nav-bar"
      style={{
        height: 52,
        background: "var(--app-sidebar-bg)",
        boxShadow: "var(--app-header-shadow)",
        position: "sticky",
        top: 0,
        zIndex: 200,
        flexShrink: 0,
      }}
    >
      <Group h="100%" px="md" gap={0} wrap="nowrap" justify="space-between">
        {/* ── Brand mark ───────────────────────────────────────────── */}
        <Box style={{ flexShrink: 0, marginRight: 16 }}>
          <NavBrandMark />
        </Box>

        {/* ── Section tabs — desktop ────────────────────────────────── */}
        <Group gap={0} visibleFrom="sm" style={{ flex: 1, overflow: "hidden" }} wrap="nowrap">
          {sections.map((section) => (
            <SectionTab
              key={section.id}
              section={section}
              isActive={activeSection?.id === section.id}
              onClick={() => handleSectionClick(section)}
            />
          ))}
        </Group>

        {/* ── Right utility strip ───────────────────────────────────── */}
        <Group gap={4} style={{ flexShrink: 0, marginLeft: "auto" }}>
          <LocaleSwitcher />
          <ColorSchemeToggle />
          <NotificationBell />
          <AdminHeaderUserMenu />
        </Group>

        {/* ── Mobile hamburger ──────────────────────────────────────── */}
        <Burger
          opened={drawerOpened}
          onClick={toggleDrawer}
          hiddenFrom="sm"
          size="sm"
          color="rgba(255,255,255,0.75)"
          ml={8}
          data-testid="top-nav-mobile-menu-toggle"
          aria-label="Toggle navigation"
        />
      </Group>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={<NavBrandMark />}
        styles={{
          header: {
            background: "var(--app-sidebar-bg)",
            borderBottom: "1px solid var(--app-sidebar-border)",
          },
          body: { background: "var(--app-sidebar-bg)", padding: 0 },
          close: { color: "rgba(255,255,255,0.6)" },
        }}
        hiddenFrom="sm"
        size="xs"
      >
        <Stack gap={0} py={6}>
          {sections.map((section, idx) => (
            <Box key={section.id}>
              {idx > 0 && (
                <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />
              )}
              <Text
                size="xs"
                fw={600}
                tt="uppercase"
                lts="0.06em"
                px={14}
                pt={12}
                pb={4}
                style={{
                  color: "var(--app-nav-section-label)",
                  userSelect: "none",
                  fontSize: "0.625rem",
                }}
              >
                {section.label}
              </Text>
              {section.items.map((item) => (
                <NavItemRenderer
                  key={item.to}
                  item={item}
                  currentPath={currentPath}
                  iconSize={15}
                />
              ))}
            </Box>
          ))}
        </Stack>
      </Drawer>
    </Box>
  );
}
