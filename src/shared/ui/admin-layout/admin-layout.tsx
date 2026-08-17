import { ScrollArea, Box, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "./admin-header";
import { AdminNav } from "./admin-nav";
import { AdminNavLogo } from "./admin-nav-logo";
import { PageTransition } from "../page-transition";
import classes from "./admin-layout.module.css";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Two-column full-viewport layout:
 *
 *  ┌──────────┬──────────────────────────────────┐
 *  │          │  toolbar (AdminHeader)            │
 *  │ sidebar  ├──────────────────────────────────┤
 *  │ (dark,   │                                  │
 *  │  full    │  page content                    │
 *  │  height) │                                  │
 *  └──────────┴──────────────────────────────────┘
 *
 * The sidebar is one continuous dark column spanning the full viewport height.
 * The header toolbar lives only inside the right column — it never spans over
 * the sidebar, matching the Zoho CRM layout pattern.
 *
 * Mobile: sidebar slides in as a fixed overlay with a backdrop.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <Group align="stretch" gap={0} style={{ minHeight: "100vh" }} data-testid="admin-layout">
      {/* ── Left column: full-height dark sidebar ──────────────────────── */}
      <Box
        component="nav"
        data-testid="admin-nav"
        className={`${classes.sidebar} ${opened ? classes.sidebarOpen : ""}`}
        style={{
          width: 216,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--app-sidebar-bg)",
          boxShadow: "var(--app-sidebar-shadow)",
          minHeight: "100vh",
          // Sticky so it stays in view while the right column scrolls
          position: "sticky",
          top: 0,
          zIndex: 200,
          alignSelf: "flex-start",
        }}
      >
        {/* Logo zone — non-scrolling, pinned at the top */}
        <AdminNavLogo opened={opened} onToggle={toggle} />

        {/* Nav items — scrollable when content overflows */}
        <ScrollArea style={{ flex: 1 }} type="scroll">
          <AdminNav />
        </ScrollArea>
      </Box>

      {/* ── Right column: toolbar + scrollable page content ────────────── */}
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--app-shell-bg)",
        }}
      >
        {/* Toolbar — sticks to the top of the right column only */}
        <Box
          component="header"
          data-testid="admin-header-bar"
          style={{
            height: 52,
            flexShrink: 0,
            background: "var(--app-header-bg)",
            boxShadow: "var(--app-header-shadow)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <AdminHeader opened={opened} onToggle={toggle} />
        </Box>

        {/* Page content */}
        <Box component="main" p="md" style={{ flex: 1 }}>
          <PageTransition>{children}</PageTransition>
        </Box>
      </Box>

      {/* Mobile backdrop — tap outside to close sidebar */}
      {opened && <Box onClick={toggle} aria-hidden className={classes.backdrop} />}
    </Group>
  );
}
