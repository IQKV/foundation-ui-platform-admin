import { Paper } from "@mantine/core";

export interface SubCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function SubCard({ children, style }: SubCardProps) {
  return (
    <Paper
      p="md"
      radius="md"
      style={{
        background: "var(--app-surface-bg)",
        boxShadow: "0 1px 4px rgba(17,28,43,0.07), 0 0 0 1px rgba(17,28,43,0.05)",
        ...style,
      }}
    >
      {children}
    </Paper>
  );
}
