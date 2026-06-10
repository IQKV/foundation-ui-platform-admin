import { createTheme, type MantineThemeOverride } from "@mantine/core";

/**
 * Enterprise design tokens.
 *
 * Goals:
 *  - Replace the default "bootstrap-blue" accent with a deep indigo that reads
 *    as intentional and mature.
 *  - Swap the neutral gray ramp for a cool slate with a subtle blue undertone —
 *    the single biggest driver of "polished vs. generic".
 *  - Tighten radii so surfaces feel structured, not bubbly.
 *  - Lock component defaults (size, radius) globally so individual pages stay
 *    consistent without repeating prop boilerplate.
 */

// ── Slate gray ramp (HSL 215°, low saturation) ───────────────────────────────
// Replaces Mantine's warm gray. Each step is hand-tuned to keep adequate
// contrast in both light and dark contexts.
const slateGray: MantineThemeOverride["colors"] = {
  gray: [
    "#f8f9fb", // 0 — page background
    "#f1f3f6", // 1 — subtle fills
    "#e4e8ef", // 2 — borders (light)
    "#d0d6e2", // 3 — disabled borders
    "#b0bac9", // 4 — placeholder / separator
    "#8896aa", // 5 — muted text
    "#5e6e84", // 6 — secondary text
    "#3d4f63", // 7 — body text
    "#243345", // 8 — dark fills
    "#111c2b", // 9 — darkest (dark mode bg)
  ],
};

// ── Deep indigo accent ────────────────────────────────────────────────────────
// Replaces Mantine's default blue.6 (#228be6) with a saturated indigo that
// signals deliberate brand identity rather than "I left the default".
const indigoAccent: MantineThemeOverride["colors"] = {
  blue: [
    "#eef0ff", // 0
    "#dce0ff", // 1
    "#bac1fd", // 2
    "#95a0fb", // 3
    "#7280f8", // 4
    "#5465f5", // 5 — hover state
    "#3b4ef0", // 6 — primary ← main action color
    "#2c3dd4", // 7 — pressed / focus ring
    "#1e2ea8", // 8 — deep accent
    "#111b7a", // 9 — darkest
  ],
};

export const theme = createTheme({
  // ── Colors ─────────────────────────────────────────────────────────────────
  colors: {
    ...slateGray,
    ...indigoAccent,
  },
  primaryColor: "blue",
  primaryShade: { light: 6, dark: 5 },

  // ── Typography ──────────────────────────────────────────────────────────────
  // Inter is already loaded by most modern OS / browsers; fall back cleanly.
  fontFamily: "Inter, 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Roboto Mono', monospace",

  fontSizes: {
    xs: "0.6875rem", // 11px
    sm: "0.8125rem", // 13px  ← default body
    md: "0.9375rem", // 15px
    lg: "1.0625rem", // 17px
    xl: "1.25rem", // 20px
  },

  lineHeights: {
    xs: "1.4",
    sm: "1.5",
    md: "1.6",
    lg: "1.7",
    xl: "1.8",
  },

  // ── Radii — tighter for a structured, professional feel ───────────────────
  radius: {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
  },
  defaultRadius: "sm", // 4px everywhere unless overridden

  // ── Spacing — slightly tighter than Mantine defaults ──────────────────────
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
  },

  // ── Shadows — subtle, enterprise-style (no heavy drop-shadows) ───────────
  shadows: {
    xs: "0 1px 2px rgba(17, 28, 43, 0.06)",
    sm: "0 1px 4px rgba(17, 28, 43, 0.08), 0 1px 2px rgba(17, 28, 43, 0.04)",
    md: "0 4px 8px rgba(17, 28, 43, 0.08), 0 2px 4px rgba(17, 28, 43, 0.04)",
    lg: "0 8px 24px rgba(17, 28, 43, 0.10), 0 2px 8px rgba(17, 28, 43, 0.06)",
    xl: "0 16px 40px rgba(17, 28, 43, 0.12), 0 4px 12px rgba(17, 28, 43, 0.06)",
  },

  // ── Global component defaults ─────────────────────────────────────────────
  // Setting defaults here means pages don't need to repeat size="sm" on
  // every TextInput, Select, Button, etc. — and the whole app stays in sync.
  components: {
    // ── Inputs ───────────────────────────────────────────────────────────────
    TextInput: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    PasswordInput: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    Select: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    MultiSelect: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    Textarea: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    NumberInput: {
      defaultProps: { size: "sm", radius: "sm" },
    },
    DatePickerInput: {
      defaultProps: { size: "sm", radius: "sm" },
    },

    // ── Actions & buttons ────────────────────────────────────────────────────
    Button: {
      defaultProps: { size: "sm", radius: "sm" },
      styles: {
        root: { fontWeight: 500, letterSpacing: "0.01em" },
      },
    },
    ActionIcon: {
      defaultProps: { radius: "sm" },
    },

    // ── Overlays ─────────────────────────────────────────────────────────────
    Modal: {
      defaultProps: { radius: "md", shadow: "lg" },
      styles: {
        header: { fontWeight: 600 },
      },
    },
    Drawer: {
      defaultProps: { radius: 0, shadow: "lg" },
    },
    Menu: {
      defaultProps: { radius: "sm", shadow: "md" },
      styles: {
        dropdown: { padding: "4px" },
        item: { borderRadius: "var(--mantine-radius-xs)", fontSize: "var(--mantine-font-size-sm)" },
        label: {
          fontSize: "var(--mantine-font-size-xs)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--mantine-color-gray-5)",
          paddingBlock: "6px",
        },
        divider: { marginBlock: "4px" },
      },
    },
    Tooltip: {
      defaultProps: { radius: "xs" },
      styles: {
        tooltip: { fontSize: "var(--mantine-font-size-xs)", fontWeight: 500 },
      },
    },
    Popover: {
      defaultProps: { radius: "sm", shadow: "md" },
    },

    // ── Data display ─────────────────────────────────────────────────────────
    Badge: {
      defaultProps: { radius: "xs", size: "sm" },
      styles: {
        root: { fontWeight: 600, letterSpacing: "0.03em", textTransform: "uppercase" },
      },
    },
    Avatar: {
      defaultProps: { radius: "sm" },
    },
    Paper: {
      defaultProps: { radius: "sm", shadow: "xs" },
    },
    Card: {
      defaultProps: { radius: "sm", shadow: "xs" },
    },
    Table: {
      styles: {
        th: {
          fontSize: "var(--mantine-font-size-xs)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--mantine-color-gray-5)",
          padding: "8px 12px",
        },
        td: { padding: "8px 12px", fontSize: "var(--mantine-font-size-sm)" },
      },
    },

    // ── Navigation ───────────────────────────────────────────────────────────
    NavLink: {
      styles: {
        root: {
          borderRadius: "var(--mantine-radius-xs)",
          padding: "6px 10px",
          fontSize: "var(--mantine-font-size-sm)",
        },
        label: { fontWeight: 500 },
      },
    },
    Tabs: {
      defaultProps: { radius: "xs" },
      styles: {
        tab: { fontSize: "var(--mantine-font-size-sm)", fontWeight: 500 },
      },
    },

    // ── Alerts & notifications ────────────────────────────────────────────────
    Alert: {
      defaultProps: { radius: "sm" },
      styles: {
        title: { fontWeight: 600 },
      },
    },
    Notification: {
      defaultProps: { radius: "sm" },
    },

    // ── Misc ─────────────────────────────────────────────────────────────────
    Divider: {
      styles: {
        root: { borderColor: "var(--mantine-color-gray-2)" },
      },
    },
    Anchor: {
      styles: {
        root: { fontWeight: 500 },
      },
    },
    Title: {
      styles: {
        root: { letterSpacing: "-0.02em" },
      },
    },
    Code: {
      defaultProps: { radius: "xs" },
    },
  },
});
