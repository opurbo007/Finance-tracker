// Middleware in middleware.ts handles / → /dashboard or /auth redirect.
// This component is a safety fallback — it should never normally render.
export default function RootPage() {
  return null
}

