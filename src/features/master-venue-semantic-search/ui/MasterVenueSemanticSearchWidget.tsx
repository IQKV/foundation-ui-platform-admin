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
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: isSearching
          ? [
              "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
              "0 4px 12px rgba(34, 139, 230, 0.15), 0 2px 4px rgba(34, 139, 230, 0.1)",
              "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
            ]
          : "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
      }}
      transition={{
        boxShadow: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        },
        opacity: { duration: 0.4 },
        y: { duration: 0.4 },
      }}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        marginBottom: "var(--mantine-spacing-lg)",
      }}
    >
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          background: "linear-gradient(to right, #f8f9fa, #ffffff)",
          borderLeft: "4px solid transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated border-left accent */}
        <motion.div
          animate={{
            backgroundColor: [
              "var(--mantine-color-blue-filled)",
              "var(--mantine-color-cyan-filled)",
              "var(--mantine-color-blue-filled)",
            ],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 4,
            zIndex: 1,
          }}
        />

        <Stack gap="xs">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <Badge
                variant="light"
                color="blue"
                leftSection={<IconSparkles size={12} />}
                size="sm"
              >
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
    </motion.div>
  );
}
