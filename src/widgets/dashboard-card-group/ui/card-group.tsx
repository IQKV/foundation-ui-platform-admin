import { Card, Text } from "@mantine/core";

export interface CardGroupProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

export function CardGroup({ title, children }: CardGroupProps) {
  return (
    <Card
      p="lg"
      radius="lg"
      style={{
        background: "var(--mantine-color-default)",
        boxShadow: "var(--mantine-shadow-sm)",
      }}
    >
      <Text size="xs" fw={700} tt="uppercase" lts="0.06em" c="dimmed" mb="md">
        {title}
      </Text>
      {children}
    </Card>
  );
}
