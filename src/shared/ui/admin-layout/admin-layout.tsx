import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "./admin-header";
import { AdminNav } from "./admin-nav";

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
        // Page canvas — off-white / deep navy depending on color scheme
        root: { background: "var(--app-shell-bg)" },
        main: { background: "var(--app-shell-bg)", minHeight: "calc(100vh - 52px)" },
      }}
    >
      <AppShell.Header
        style={{
          background: "var(--app-header-bg)",
          // Border is part of the shadow token so we suppress the default border
          border: "none",
          boxShadow: "var(--app-header-shadow)",
          // Ensure header sits above sidebar shadow
          zIndex: 101,
        }}
      >
        <AdminHeader opened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          background: "var(--app-sidebar-bg)",
          border: "none",
          boxShadow: "var(--app-sidebar-shadow)",
        }}
        data-testid="admin-nav"
      >
        <AppShell.Section grow component={ScrollArea}>
          <AdminNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
