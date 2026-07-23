import { Stack, Text, Group, Badge, Skeleton, Anchor, Divider, ThemeIcon } from "@mantine/core";
import { IconNotes, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { useNoteCount, useNoteList, SEVERITY_COLORS } from "../model";

/**
 * HealthNotesMetricsWidget — dashboard widget registered by the sample addon.
 *
 * Shows:
 *   1. Live count of OPEN platform health notes (from /platform-notes/count?status=OPEN)
 *   2. Up to 3 most recent CRITICAL open notes (from /platform-notes?status=OPEN&severity=CRITICAL)
 *
 * Demonstrates: useQuery inside a widget, independent loading/error states,
 * linking to the addon full-page route.
 */
export function HealthNotesMetricsWidget() {
  const { data: openCount, isLoading: countLoading } = useNoteCount({ status: "OPEN" });
  const { data: criticalNotes, isLoading: listLoading } = useNoteList({
    status: "OPEN",
    severity: "CRITICAL",
    size: 3,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const total = openCount?.total ?? 0;
  const critical = criticalNotes?.content ?? [];

  return (
    <SubCard>
      <Stack gap="sm">
        {/* ── Header ── */}
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon variant="light" color="blue" size="sm" radius="sm">
              <IconNotes size={14} />
            </ThemeIcon>
            <Text fw={600} size="sm">
              Platform Health Notes
            </Text>
          </Group>
          <Anchor href="/admin/addons/health-notes" size="xs" c="dimmed">
            View all →
          </Anchor>
        </Group>

        <Divider />

        {/* ── Open notes count ── */}
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Open notes
          </Text>
          {countLoading ? (
            <Skeleton height={20} width={32} radius="sm" />
          ) : (
            <Badge color={total > 0 ? "green" : "gray"} variant="light" size="md">
              {total}
            </Badge>
          )}
        </Group>

        {/* ── Critical open notes ── */}
        <Stack gap={6}>
          <Group gap="xs">
            <IconAlertTriangle size={13} color="var(--mantine-color-red-6)" />
            <Text size="xs" fw={500}>
              Recent critical
            </Text>
          </Group>

          {listLoading ? (
            <>
              <Skeleton height={14} radius="sm" />
              <Skeleton height={14} radius="sm" width="80%" />
            </>
          ) : critical.length === 0 ? (
            <Group gap="xs">
              <IconCircleCheck size={13} color="var(--mantine-color-green-6)" />
              <Text size="xs" c="dimmed">
                No critical open notes
              </Text>
            </Group>
          ) : (
            critical.map((note) => (
              <Group key={note.id} justify="space-between" gap="xs" wrap="nowrap">
                <Text size="xs" lineClamp={1} style={{ flex: 1 }}>
                  {note.title}
                </Text>
                <Badge
                  color={SEVERITY_COLORS[note.severity] ?? "gray"}
                  variant="light"
                  size="xs"
                  style={{ flexShrink: 0 }}
                >
                  {note.severity}
                </Badge>
              </Group>
            ))
          )}
        </Stack>
      </Stack>
    </SubCard>
  );
}
