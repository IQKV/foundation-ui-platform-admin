import {
  Stack,
  Group,
  TextInput,
  Select,
  Table,
  Text,
  Pagination,
  Skeleton,
  Alert,
} from "@mantine/core";
import { IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { useSessionList, MODEL_OPTIONS } from "../model";
import { ModelBadge } from "./model-badge";
import type { SessionListFilters } from "../types";

const PAGE_SIZE = 20;

export function SessionsList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SessionListFilters>({ search: "", model: "" });
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, isError } = useSessionList({
    limit: PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  function applySearch() {
    setFilters((f) => ({ ...f, search: searchInput }));
    setPage(1);
  }

  // Client-side title filter (backend has no search param)
  const filtered = data?.items.filter((s) => {
    const matchesSearch =
      !filters.search || (s.title ?? "").toLowerCase().includes(filters.search.toLowerCase());
    const matchesModel = !filters.model || s.model === filters.model;
    return matchesSearch && matchesModel;
  });

  const totalPages = data ? Math.ceil(data.totalElements / PAGE_SIZE) : 0;

  return (
    <Stack gap="md">
      {/* Filters */}
      <SubCard>
        <Group gap="sm" wrap="nowrap">
          <TextInput
            placeholder="Search by title…"
            leftSection={<IconSearch size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            onBlur={applySearch}
            style={{ flex: 1 }}
            data-testid="input--search"
          />
          <Select
            placeholder="Model"
            data={MODEL_OPTIONS}
            value={filters.model}
            onChange={(v) => {
              setFilters((f) => ({ ...f, model: v ?? "" }));
              setPage(1);
            }}
            clearable
            style={{ width: 180 }}
            data-testid="select--model"
          />
        </Group>
      </SubCard>

      {/* Table */}
      <SubCard>
        {isError && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="md">
            Failed to load sessions. Please refresh.
          </Alert>
        )}

        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>User ID</Table.Th>
              <Table.Th>Model</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Updated</Table.Th>
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
            ) : filtered?.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text c="dimmed" size="sm" ta="center" py="lg">
                    No sessions found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filtered?.map((session) => (
                <Table.Tr key={session.id}>
                  <Table.Td>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {session.title ?? (
                        <Text component="span" c="dimmed" fs="italic">
                          Untitled
                        </Text>
                      )}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text
                      component="a"
                      href={`/admin/users/${session.userId}`}
                      size="xs"
                      c="blue"
                      style={{ fontFamily: "var(--mantine-font-family-monospace)", textDecoration: "none" }}
                      title={session.userId}
                    >
                      {session.userId.substring(0, 8)}…
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <ModelBadge model={session.model} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(session.createdAt).toLocaleString()}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(session.updatedAt).toLocaleString()}
                    </Text>
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
  );
}
