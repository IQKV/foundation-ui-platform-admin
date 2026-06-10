import { Group, Title, Breadcrumbs, Anchor, Text, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export interface BreadcrumbItem {
  label: ReactNode;
  /** If omitted the item renders as plain text (current page). */
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  /** Optional toolbar rendered below the title / breadcrumb row. */
  toolbar?: React.ReactNode;
  /** Optional element inlined to the right of the title. */
  rightSection?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, toolbar, rightSection }: PageHeaderProps) {
  return (
    <Stack gap={0} mb="md">
      <Group
        justify="space-between"
        align="center"
        py="sm"
        style={{
          borderBottom: toolbar ? "none" : "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Group align="center" gap="sm">
          <Title order={2} size="h4" fw={600} style={{ letterSpacing: "-0.02em" }}>
            {title}
          </Title>
          {rightSection}
        </Group>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator="/"
            separatorMargin={4}
            styles={{
              separator: {
                color: "var(--mantine-color-gray-4)",
                fontSize: "var(--mantine-font-size-xs)",
              },
            }}
          >
            {breadcrumbs.map((crumb, i) =>
              crumb.to ? (
                <Anchor
                  key={i}
                  component={Link}
                  to={crumb.to}
                  size="xs"
                  c="dimmed"
                  fw={400}
                  style={{ textDecoration: "none" }}
                  styles={{
                    root: { "&:hover": { color: "var(--mantine-color-blue-6)" } },
                  }}
                >
                  {crumb.label}
                </Anchor>
              ) : (
                <Text key={i} size="xs" c="dark" fw={500}>
                  {crumb.label}
                </Text>
              ),
            )}
          </Breadcrumbs>
        )}
      </Group>

      {toolbar && (
        <Group py="xs" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          {toolbar}
        </Group>
      )}
    </Stack>
  );
}
