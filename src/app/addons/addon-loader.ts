import { addonRegistry } from "./addon-registry";
import type { Addon } from "./types";
import { getAddonConfig } from "@/app/config";

// Static addon imports map - add your addons here
const availableAddons: Record<string, () => Promise<{ default: Addon }>> = {
  // Example:
  // "example-addon": () => import("@/addons/example-addon"),
};

export async function loadAddons(): Promise<void> {
  const config = getAddonConfig();

  for (const addonId of config.enabled) {
    const loader = availableAddons[addonId];
    if (loader) {
      try {
        const { default: addon } = await loader();
        addonRegistry.register(addon);
      } catch (error) {
        console.error(`Failed to load addon ${addonId}:`, error);
      }
    } else {
      console.warn(`Addon ${addonId} not found in available addons`);
    }
  }
}
