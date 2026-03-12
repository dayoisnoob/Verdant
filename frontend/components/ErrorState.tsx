export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 text-center gap-5">
      <span className="text-5xl">🌧️</span>
      <h2 className="font-playfair font-bold text-verdant-dark text-3xl">
        Something went wrong
      </h2>
      <p className="text-verdant-muted text-sm max-w-sm leading-relaxed">
        {message || "We couldn't load the produce. Try refreshing the page."}
      </p>
      <button
        onClick={onRetry}
        className="bg-green text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-green-mid transition-all"
      >
        Refresh
      </button>
    </div>
  );
}
