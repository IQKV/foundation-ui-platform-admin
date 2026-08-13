import { Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { navigationExtension } from "@/app/addons";
import { buildNavSections, type NavItem } from "./nav-config";
import { NavItemRenderer } from "./nav-item-renderer";

/** Uppercase section label styled for the dark sidebar */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </Text>
  );
}

export function AdminNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");
  const { t } = useLingui();

  // Resolve addon items (registered before first render in main.tsx bootstrap)
  const addonNavItems: NavItem[] = navigationExtension.getNavItems("workspace").map((item) => ({
    label: item.label,
    icon: item.icon,
    to: item.to,
  }));

  const sections = buildNavSections(addonNavItems);

  // All items flattened for the search filter
  const allNavItems = sections.flatMap((s) => s.items);

  const filtered = search.trim()
    ? allNavItems.filter((item) => {
        // Convert ReactNode label to string for searching
        const labelText = typeof item.label === "string" ? item.label : String(item.label);
        return labelText.toLowerCase().includes(search.toLowerCase());
      })
    : null;

  return (
    <Stack gap={0} py={6}>
      {/* Search */}
      <Box px={10} pb={6}>
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          radius="xs"
          leftSection={<IconSearch size={12} color="var(--app-nav-search-placeholder)" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          data-testid={TestSelectors.NAV_SEARCH_INPUT}
          styles={{
            input: {
              background: "var(--app-nav-search-bg)",
              border: "1px solid var(--app-nav-search-border)",
              color: "var(--app-nav-search-text)",
              fontSize: "var(--mantine-font-size-xs)",
              "&::placeholder": {
                color: "var(--app-nav-search-placeholder)",
              },
            },
          }}
        />
      </Box>

      {/* Search results or full sectioned nav */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map((item) => (
            <NavItemRenderer key={item.to} item={item} currentPath={currentPath} />
          ))
        ) : (
          <Text size="xs" px="md" py="xs" style={{ color: "var(--app-nav-section-label)" }}>
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          {sections.map((section, idx) => (
            <Box key={section.id}>
              {idx > 0 && (
                <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />
              )}
              <SectionLabel>{section.label}</SectionLabel>
              {section.items.map((item) => (
                <NavItemRenderer key={item.to} item={item} currentPath={currentPath} />
              ))}
            </Box>
          ))}
        </>
      )}
    </Stack>
  );
}
