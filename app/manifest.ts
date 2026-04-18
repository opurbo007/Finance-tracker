import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Identity
    id: "/",
    name: "Finance Tracker",
    short_name: "Finance",
    description:
      "Track daily expenses, income, bank accounts, and wealth — beautifully.",

    // Display
    start_url: "/dashboard?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    orientation: "portrait-primary",

    // Colors — dark theme
    background_color: "#0A0A0F",
    theme_color: "#0A0A0F",

    // Categorisation
    categories: ["finance", "productivity", "utilities"],
    lang: "en",
    dir: "ltr",

    // Shortcuts — deep links from long-press on icon
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Home",
        url: "/dashboard",
        description: "View your financial summary",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Add Expense",
        short_name: "Expense",
        url: "/expenses",
        description: "Log a new expense",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Wealth",
        short_name: "Wealth",
        url: "/wealth",
        description: "View net worth and accounts",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],

    // Icons — both maskable (safe zone) and any (full-bleed)
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],

    // Screenshots (optional — shown in app store / install dialog)
    // Add your own at public/screenshots/ if desired
    screenshots: [],
  };
}
