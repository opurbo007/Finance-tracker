"use client";

import { useEffect, useState, useRef } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

export function PwaRegister() {
  const [showBanner, setShowBanner] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // ONLY capture install prompt
  useEffect(() => {
    if (sessionStorage.getItem("pwa-install-dismissed")) return;

    const handler = (e: Event) => {
      if (sessionStorage.getItem("pwa-install-dismissed")) return;

      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();

      promptRef.current = event;
      window.__pwaInstallPrompt = event;

      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Hide when installed
  useEffect(() => {
    const handler = () => {
      setShowBanner(false);
      promptRef.current = null;
    };

    window.addEventListener("appinstalled", handler);
    return () => window.removeEventListener("appinstalled", handler);
  }, []);

  async function installApp() {
    const prompt = promptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const result = await prompt.userChoice;

    if (result.outcome === "accepted") {
      sessionStorage.setItem("pwa-install-dismissed", "1");
    }
    setShowBanner(false);
    promptRef.current = null;
  }

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#111",
        color: "#fff",
        padding: 12,
        borderRadius: 12,
        zIndex: 9999,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <span>Install Finance App</span>

      <button onClick={installApp}>Install</button>

      <button onClick={() => { sessionStorage.setItem("pwa-install-dismissed", "1"); setShowBanner(false); }}>✕</button>
    </div>
  );
}
