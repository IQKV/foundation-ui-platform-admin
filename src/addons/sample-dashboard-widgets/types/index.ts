export interface SampleMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  isPositive: boolean;
}

export interface SampleTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
}
