import {
  Paper,
  Text,
  Group,
  TextInput,
  Badge,
  ActionIcon,
  Tooltip,
  Stack,
  Button,
  Box,
} from "@mantine/core";
import { IconSearch, IconSparkles, IconX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";

interface MasterVenueSemanticSearchWidgetProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

export function MasterVenueSemanticSearchWidget({
  onSearch,
  onClear,
  isSearching,
}: MasterVenueSemanticSearchWidgetProps) {
  const { t } = useLingui();
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue("");
    onClear();
  };

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      mb="lg"
      style={{
        background: "linear-gradient(to right, #f8f9fa, #ffffff)",
        borderLeft: "4px solid var(--mantine-color-blue-filled)",
        boxShadow: "var(--mantine-shadow-sm)",
      }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <Badge variant="light" color="blue" leftSection={<IconSparkles size={12} />} size="sm">
              <Trans>Beta</Trans>
            </Badge>
            <Text size="sm" fw={500} c="dimmed">
              <Trans>Semantic Search — Ask anything about venues in natural language</Trans>
            </Text>
          </Group>
          {value && (
            <Button
              variant="subtle"
              color="gray"
              size="xs"
              onClick={handleClear}
              leftSection={<IconX size={14} />}
            >
              <Trans>Clear AI search</Trans>
            </Button>
          )}
        </Group>

        <TextInput
          size="md"
          placeholder={t`e.g. "Find luxury hotels in New York with a rooftop bar and capacity for 200 people"`}
          leftSection={<IconSearch size={20} style={{ opacity: 0.5 }} />}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          rightSection={
            <Group gap={4} px="xs">
              <Tooltip label={t`Press Enter to search`} withArrow>
                <ActionIcon
                  variant="filled"
                  color="blue"
                  onClick={() => value.trim() && onSearch(value.trim())}
                  loading={isSearching}
                  disabled={!value.trim()}
                >
                  <IconSearch size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          }
          styles={{
            input: {
              borderRadius: "var(--mantine-radius-md)",
              border: "1px solid var(--mantine-color-gray-3)",
              "&:focus": {
                borderColor: "var(--mantine-color-blue-filled)",
              },
            },
          }}
        />

        <Text size="xs" c="dimmed" fs="italic">
          <Trans>
            Pro tip: You can search by vibe, amenities, capacity, or specific location details.
          </Trans>
        </Text>
      </Stack>
    </Paper>
  );
}
