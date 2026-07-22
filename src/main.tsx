import ReactDOM from "react-dom/client";
import { App } from "@/app";
import { initializeDefaultLocale } from "@/shared/locales";

// Registers Axios auth interceptors (Bearer token injection + silent refresh).
import "@/shared/api";

initializeDefaultLocale();

async function bootstrap() {
  // Start MSW browser worker in development when explicitly enabled.
  if (import.meta.env.VITE_ENABLE_MSW === "true") {
    const { worker } = await import("@/shared/mocks/browser");
    await worker.start({
      onUnhandledRequest: "warn",
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
  }

  // Load addons (registers them in addonRegistry) …
  const { loadAddons } = await import("@/app/addons");
  await loadAddons();

  // … then immediately initialize them so extension points (nav items, widgets)
  // are populated before the first React render. This avoids the race where
  // AdminNav's useMemo runs before addon.initialize() has been called.
  const { addonRegistry, navigationExtension, widgetExtension } = await import("@/app/addons");
  const { httpClient } = await import("@/shared/api");
  const { queryClient } = await import("@/shared/lib");
  const { i18n } = await import("@lingui/core");
  const { useSessionStore, getAccessToken } = await import("@/processes/session");

  await addonRegistry.initializeAll({
    httpClient,
    queryClient,
    session: { useSessionStore, getAccessToken },
    i18n,
    extensions: {
      navigation: navigationExtension,
      widgets: widgetExtension,
    },
  });

  const rootElement = document.getElementById("root")!;
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
  }
}

bootstrap();
