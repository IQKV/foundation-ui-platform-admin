import { Stack, Text, Tabs, Group } from "@mantine/core";
import { IconList, IconPlus, IconInfoCircle } from "@tabler/icons-react";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { NotesListTab } from "./notes-list-tab";
import { CreateNoteForm } from "./create-note-form";
import { useNoteCount } from "../model";
import { useState } from "react";

/**
 * HealthNotesPage — the addon's full-page route at /admin/addons/health-notes.
 *
 * Demonstrates all key React + addon patterns in one place:
 *   - routing  : registered as a lazy route in the addon manifest
 *   - tabs     : Mantine Tabs driven by local state (no router sub-routes needed
 *                for a self-contained addon page)
 *   - data     : useQuery via useNoteCount (live count badge in tab label)
 *   - form     : Mantine useForm + Zod validation in CreateNoteForm
 *   - mutation : useMutation + cache invalidation + toast in CreateNoteForm
 *   - list     : paginated table with filters, skeleton loading, empty state
 *   - edit     : modal with pre-populated form + full PUT via EditNoteModal
 *   - delete   : confirm dialog + useMutation in NotesListTab
 *   - security : all calls go to /api/v1/iam/admin/platform-notes which
 *                requires PLATFORM_ADMIN — the httpClient auth-interceptor
 *                attaches the JWT automatically
 */
export function HealthNotesPage() {
  const [activeTab, setActiveTab] = useState<string | null>("list");

  // Live count of OPEN notes — drives the badge in the list tab label
  const { data: openCount } = useNoteCount({ status: "OPEN" });

  function handleNoteCreated() {
    // Switch to the list tab so the user sees their new note immediately
    setActiveTab("list");
  }

  return (
    <Stack gap="md">
      <Text fw={700} size="xl">
        Platform Health Notes
      </Text>

      {/* ── About card ── */}
      <SubCard>
        <Group gap="xs" align="flex-start">
          <IconInfoCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <Text size="sm" c="dimmed">
            This page is part of the <strong>platform-health-notes</strong> addon — a reference
            implementation that shows end-users how to build an addon covering routing, tabs, forms,
            validation, data fetching, mutations, and a real secured backend API ({" "}
            <code>/api/v1/iam/admin/platform-notes</code>). Notes are operator-only and never
            visible to tenants.
          </Text>
        </Group>
      </SubCard>

      {/* ── Tabbed content ── */}
      <Tabs value={activeTab} onChange={setActiveTab} variant="outline">
        <Tabs.List>
          <Tabs.Tab
            value="list"
            leftSection={<IconList size={14} />}
            rightSection={
              openCount?.total != null && openCount.total > 0 ? (
                <Text
                  component="span"
                  size="xs"
                  fw={600}
                  c="green"
                  style={{
                    background: "var(--mantine-color-green-light)",
                    borderRadius: 99,
                    padding: "0 6px",
                  }}
                >
                  {openCount.total}
                </Text>
              ) : undefined
            }
          >
            Notes
          </Tabs.Tab>
          <Tabs.Tab value="create" leftSection={<IconPlus size={14} />}>
            Add note
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="list" pt="md">
          <NotesListTab />
        </Tabs.Panel>

        <Tabs.Panel value="create" pt="md">
          <SubCard>
            <Stack gap="xs" mb="md">
              <Text fw={600} size="sm">
                New platform health note
              </Text>
              <Text size="xs" c="dimmed">
                Notes start with status <strong>OPEN</strong>. You can change the status or archive
                them later from the Notes tab.
              </Text>
            </Stack>
            <CreateNoteForm onSuccess={handleNoteCreated} />
          </SubCard>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
