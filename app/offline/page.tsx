"use client";

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "#0A0A0F",
        color: "#F1F1F5",
        fontFamily: "'Outfit', system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 300,
          height: 300,
          background:
            "radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          marginBottom: 24,
        }}
      >
        📡
      </div>

      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          marginBottom: 8,
          fontFamily: "'Syne', sans-serif",
        }}
      >
        You&apos;re offline
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "rgba(241,241,245,0.45)",
          maxWidth: 260,
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        No internet connection. Previously visited pages are still available.
        Your data will sync when you reconnect.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "12px 28px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #6C63FF, #8B5CF6)",
          color: "white",
          border: "none",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 4px 20px rgba(108,99,255,0.4)",
        }}
      >
        Try again
      </button>
    </div>
  );
}
