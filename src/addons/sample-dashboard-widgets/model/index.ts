import type { SampleMetric, SampleTodo } from "../types";

export const getSampleMetrics = (): SampleMetric[] => [
  {
    id: "active-users",
    label: "Active Users",
    value: 1234,
    unit: "",
    change: 12.5,
    isPositive: true,
  },
  {
    id: "revenue",
    label: "Revenue",
    value: 45000,
    unit: "$",
    change: -3.2,
    isPositive: false,
  },
  {
    id: "new-signups",
    label: "New Signups",
    value: 89,
    unit: "",
    change: 25,
    isPositive: true,
  },
];

export const getSampleTodos = (): SampleTodo[] => [
  { id: "todo-1", title: "Review analytics report", completed: true, priority: "high" },
  { id: "todo-2", title: "Update documentation", completed: false, priority: "medium" },
  { id: "todo-3", title: "Schedule team sync", completed: false, priority: "low" },
  { id: "todo-4", title: "Test new features", completed: false, priority: "high" },
];
