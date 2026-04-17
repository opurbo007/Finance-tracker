export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4 animate-fade-in">
        <p className="text-7xl">🔍</p>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-lg text-muted-foreground">Page not found</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
    </div>
  );
}
