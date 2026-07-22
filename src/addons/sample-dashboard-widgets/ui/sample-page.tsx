import { Stack, Text, List } from "@mantine/core";
import { SubCard } from "@/widgets/dashboard-sub-card/ui/sub-card";
import { getSampleTodos } from "../model";

export function SamplePage() {
  const todos = getSampleTodos();

  return (
    <Stack gap="md">
      <Text fw={700} size="xl">
        Sample Addon Page
      </Text>
      <SubCard>
        <Stack gap="md">
          <Text fw={600}>Sample Todo List</Text>
          <List>
            {todos.map((todo) => (
              <List.Item key={todo.id}>
                <Text style={{ textDecoration: todo.completed ? "line-through" : "none" }}>
                  {todo.title}
                  <Text component="span" c="dimmed" size="xs" ml="xs">
                    ({todo.priority})
                  </Text>
                </Text>
              </List.Item>
            ))}
          </List>
        </Stack>
      </SubCard>
    </Stack>
  );
}
