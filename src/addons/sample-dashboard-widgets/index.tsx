import type { Addon } from "@/app/addons/types";
import { IconStar } from "@tabler/icons-react";
import { SampleMetricsWidget } from "./ui/sample-metrics-widget";
import { SamplePage } from "./ui/sample-page";

export default {
  manifest: {
    id: "sample-dashboard-widgets",
    name: "Sample Dashboard Widgets",
    version: "1.0.0",
    description:
      "A sample addon demonstrating how to create dashboard widgets and navigation items.",
  },
  initialize: ({ extensions }) => {
    // Register navigation item
    extensions.navigation.registerNavItem({
      id: "sample-addon-nav-item",
      label: "Sample Addon",
      to: "/admin/addons/sample",
      icon: ({ size }) => <IconStar size={size} />,
      section: "workspace",
      order: 50,
    });

    // Register dashboard widget
    extensions.widgets.registerWidget({
      id: "sample-metrics-widget",
      component: SampleMetricsWidget,
      location: "dashboard",
      order: 30,
    });
  },
  routes: [
    {
      path: "/admin/addons/sample",
      component: async () => ({ default: SamplePage }),
      auth: true,
    },
  ],
} satisfies Addon;
