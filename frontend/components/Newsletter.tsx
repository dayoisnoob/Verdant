"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-green py-20 px-20 text-center relative overflow-hidden">
      {/* Decorative */}
      <span className="absolute top-[-2rem] left-[5%] text-[7rem] opacity-10 select-none">
        🌿
      </span>
      <span className="absolute bottom-[-2rem] right-[5%] text-[7rem] opacity-10 select-none">
        🌾
      </span>

      <h2 className="font-playfair font-black text-white text-4xl leading-[1.2] max-w-lg mx-auto mb-3">
        Get the Season&apos;s Best, First.
      </h2>
      <p className="text-white/75 text-[0.95rem] mb-8">
        Weekly harvest updates, recipes &amp; exclusive early-access offers.
      </p>

      {submitted ? (
        <div className="inline-flex items-center gap-3 bg-white/20 text-white px-8 py-4 rounded-full text-sm font-medium">
          ✅ You&apos;re on the list! We&apos;ll be in touch.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex max-w-[400px] mx-auto bg-white rounded-full overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 border-none outline-none px-5 py-4 text-[0.9rem] font-sans bg-transparent text-verdant-dark placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="bg-green text-white px-6 py-4 text-[0.85rem] font-semibold rounded-r-full hover:bg-green-dark transition-colors duration-200 font-sans"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
