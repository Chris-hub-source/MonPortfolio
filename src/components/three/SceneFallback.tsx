export default function SceneFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="h-3/5 w-3/5 animate-pulse rounded-full bg-gradient-to-br from-accent to-sky-400 opacity-70 blur-2xl" />
      <div className="absolute h-2/5 w-2/5 rounded-full bg-gradient-to-br from-accent to-sky-400 opacity-90" />
    </div>
  );
}