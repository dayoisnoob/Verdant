import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center text-center px-8">
      <div className="text-8xl mb-6">🌿</div>
      <h1 className="font-playfair font-black text-verdant-dark text-5xl mb-4">
        Page Not Found
      </h1>
      <p className="text-verdant-muted text-lg max-w-md mb-10">
        Looks like this page was harvested early. Let&apos;s get you back to the good stuff.
      </p>
      <Link
        href="/"
        className="bg-green text-white px-10 py-4 rounded-full font-medium hover:bg-green-mid transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        Back to Home
      </Link>
    </div>
  );
}
