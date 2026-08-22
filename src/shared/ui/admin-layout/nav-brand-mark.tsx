/**
 * nav-brand-mark.tsx
 *
 * Reusable brand mark (logo icon + app name + tagline) used in both layouts:
 *   - Sidebar variant  → AdminNavLogo  (dark background, horizontal)
 *   - Top-nav variant  → AdminTopNavBar (dark left section of the top bar)
 *
 * Callers control the container sizing and background; this component only
 * renders the inner content group.
 */

import { Group, Text, Box } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { appBrandName, appBrandTagline } from "@/app/config/runtime-env";

interface NavBrandMarkProps {
  /** Extra style overrides forwarded to the outer Group. */
  style?: React.CSSProperties;
}

export function NavBrandMark({ style }: NavBrandMarkProps) {
  return (
    <Group
      gap={10}
      wrap="nowrap"
      style={{ cursor: "default", ...style }}
      data-testid="nav-brand-mark"
    >
      {/* Logo mark: accent square with shield icon */}
      <Box
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--mantine-radius-sm)",
          background: "var(--mantine-color-blue-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(59,78,240,0.45)",
        }}
        data-testid="nav-brand-logo-mark"
      >
        <IconShieldHalf size={16} color="white" strokeWidth={1.8} />
      </Box>

      {/* App name + tagline */}
      <Box style={{ lineHeight: 1 }}>
        <Text
          size="sm"
          fw={700}
          style={{
            color: "#ffffff",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {appBrandName}
        </Text>
        <Text
          size="xs"
          style={{
            color: "rgba(255,255,255,0.45)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.625rem",
            lineHeight: 1.4,
          }}
        >
          {appBrandTagline}
        </Text>
      </Box>
    </Group>
  );
}
