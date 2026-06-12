import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "./admin-header";
import { AdminNav } from "./admin-nav";
import { AdminNavLogo } from "./admin-nav-logo";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 52 }}
      navbar={{
        width: 216,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      data-testid="admin-layout"
      styles={{
        root: { background: "var(--app-shell-bg)" },
        main: { background: "var(--app-shell-bg)", minHeight: "calc(100vh - 52px)" },
      }}
    >
      <AppShell.Header
        style={{
          background: "var(--app-header-bg)",
          border: "none",
          boxShadow: "var(--app-header-shadow)",
          zIndex: 101,
        }}
      >
        <AdminHeader opened={opened} onToggle={toggle} />
      </AppShell.Header>

      {/*
       * The navbar is always dark — sidebar + logo are one unified visual column.
       * The logo zone sits in a non-scrolling AppShell.Section at the top,
       * followed by the scrollable nav list below.
       */}
      <AppShell.Navbar
        style={{
          background: "var(--app-sidebar-bg)",
          border: "none",
          boxShadow: "var(--app-sidebar-shadow)",
        }}
        data-testid="admin-nav"
      >
        {/* Logo zone — matches the header height so it feels like the same stripe */}
        <AppShell.Section>
          <AdminNavLogo opened={opened} onToggle={toggle} />
        </AppShell.Section>

        {/* Scrollable nav items */}
        <AppShell.Section grow component={ScrollArea}>
          <AdminNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
