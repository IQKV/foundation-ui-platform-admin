import {
  Stack,
  Group,
  TextInput,
  Select,
  Table,
  Text,
  ActionIcon,
  Badge,
  Pagination,
  Skeleton,
  Alert,
  Tooltip,
  Menu,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSearch,
  IconAlertCircle,
  IconEdit,
  IconTrash,
  IconDots,
  IconCircleCheck,
  IconArchive,
} from "@tabler/icons-react";
import { useState } from "react";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import {
  useNoteList,
  useDeleteNote,
  usePatchNote,
  SEVERITY_OPTIONS,
  STATUS_OPTIONS,
} from "../model";
import { NoteSeverityBadge } from "./note-severity-badge";
import { NoteStatusBadge } from "./note-status-badge";
import { EditNoteModal } from "./edit-note-modal";
import type { NoteListFilters } from "../types";
import type { PlatformNoteStatus } from "../types";

const PAGE_SIZE = 10;

export function NotesListTab() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<NoteListFilters>({
    search: "",
    severity: "",
    status: "",
  });

  // Debounce search locally — only send non-empty strings
  const [searchInput, setSearchInput] = useState("");

  const [editNoteId, setEditNoteId] = useState<string | null>(null);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const queryParams = {
    page: page - 1,
    size: PAGE_SIZE,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.severity ? { severity: filters.severity as any } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
    sortBy: "createdAt" as const,
    sortDir: "desc" as const,
  };

  const { data, isLoading, isError } = useNoteList(queryParams);

  const deleteMutation = useDeleteNote();
  const patchMutation = usePatchNote();

  function applySearch() {
    setFilters((f) => ({ ...f, search: searchInput }));
    setPage(1);
  }

  function handleStatusTransition(id: string, status: PlatformNoteStatus) {
    patchMutation.mutate({ id, data: { status } });
  }

  function handleEdit(id: string) {
    setEditNoteId(id);
    openEdit();
  }

  function handleDelete(id: string) {
    if (window.confirm("Delete this note? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  }

  const totalPages = data ? Math.ceil(data.totalElements / PAGE_SIZE) : 0;

  return (
    <>
      <Stack gap="md">
        {/* ── Filters ── */}
        <SubCard>
          <Group gap="sm" wrap="nowrap">
            <TextInput
              placeholder="Search title or body…"
              leftSection={<IconSearch size={14} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              onBlur={applySearch}
              style={{ flex: 1 }}
              data-testid="input--search"
            />
            <Select
              placeholder="Severity"
              data={[{ value: "", label: "All severities" }, ...SEVERITY_OPTIONS]}
              value={filters.severity}
              onChange={(v) => {
                setFilters((f) => ({ ...f, severity: v ?? "" }));
                setPage(1);
              }}
              clearable
              style={{ width: 160 }}
              data-testid="select--severity"
            />
            <Select
              placeholder="Status"
              data={[{ value: "", label: "All statuses" }, ...STATUS_OPTIONS]}
              value={filters.status}
              onChange={(v) => {
                setFilters((f) => ({ ...f, status: v ?? "" }));
                setPage(1);
              }}
              clearable
              style={{ width: 160 }}
              data-testid="select--status"
            />
          </Group>
        </SubCard>

        {/* ── Table ── */}
        <SubCard>
          {isError && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
              Failed to load notes. Please refresh.
            </Alert>
          )}

          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Severity</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th style={{ width: 48 }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Table.Tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Table.Td key={j}>
                        <Skeleton height={16} radius="sm" />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              ) : data?.content.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" size="sm" ta="center" py="lg">
                      No notes found. Create one in the "Add note" tab.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                data?.content.map((note) => (
                  <Table.Tr key={note.id}>
                    <Table.Td>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {note.title}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <NoteSeverityBadge severity={note.severity} />
                    </Table.Td>
                    <Table.Td>
                      <NoteStatusBadge status={note.status} />
                    </Table.Td>
                    <Table.Td>
                      <Text size="xs" c="dimmed">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Menu withinPortal position="bottom-end" shadow="sm">
                        <Menu.Target>
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconDots size={14} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={14} />}
                            onClick={() => handleEdit(note.id)}
                          >
                            Edit
                          </Menu.Item>
                          {note.status === "OPEN" && (
                            <Menu.Item
                              leftSection={<IconCircleCheck size={14} />}
                              onClick={() => handleStatusTransition(note.id, "RESOLVED")}
                            >
                              Mark resolved
                            </Menu.Item>
                          )}
                          {note.status !== "ARCHIVED" && (
                            <Menu.Item
                              leftSection={<IconArchive size={14} />}
                              onClick={() => handleStatusTransition(note.id, "ARCHIVED")}
                            >
                              Archive
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(note.id)}
                          >
                            Delete
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>

          {totalPages > 1 && (
            <Group justify="flex-end" mt="md">
              <Pagination value={page} onChange={setPage} total={totalPages} size="sm" />
            </Group>
          )}
        </SubCard>
      </Stack>

      <EditNoteModal noteId={editNoteId} opened={editOpened} onClose={closeEdit} />
    </>
  );
}
