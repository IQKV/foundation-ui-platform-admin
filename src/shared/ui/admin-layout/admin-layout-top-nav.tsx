/**
 * admin-layout-top-nav.tsx
 *
 * Single-column full-viewport layout for the top-nav variant.
 *
 * Structure:
 *
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │  AdminTopNavBar  (52px, sticky top:0, dark)  ← L1 sections │
 *   ├─────────────────────────────────────────────────────────────┤
 *   │  AdminSubNavBar  (44px, sticky top:52, light) ← L2 items   │
 *   │  (hidden when active section has ≤ 1 item)                 │
 *   ├─────────────────────────────────────────────────────────────┤
 *   │  <main>  full-width page content                           │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * No left sidebar — the full viewport width is available to page content.
 * The original AdminLayout (sidebar variant) is completely untouched.
 */

import { Box } from "@mantine/core";
import { AdminTopNavBar } from "./admin-top-nav-bar";
import { AdminSubNavBar } from "./admin-sub-nav-bar";
import { PageTransition } from "../page-transition";

interface AdminLayoutTopNavProps {
  children: React.ReactNode;
}

export function AdminLayoutTopNav({ children }: AdminLayoutTopNavProps) {
  return (
    <Box
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      data-testid="admin-layout-top-nav"
    >
      {/* L1 — primary section tabs */}
      <AdminTopNavBar />

      {/* L2 — context-sensitive item strip (renders nothing for single-item sections) */}
      <AdminSubNavBar />

      {/* Page content */}
      <Box
        component="main"
        p="md"
        style={{ flex: 1, background: "var(--app-shell-bg)" }}
        data-testid="admin-top-nav-main"
      >
        <PageTransition>{children}</PageTransition>
      </Box>
    </Box>
  );
}
