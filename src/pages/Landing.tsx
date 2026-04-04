import { useNavigate } from "react-router-dom";
import { getRandomQuote } from "@/lib/quotes";
import { useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [quote] = useState(getRandomQuote);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 59px, hsl(var(--border)) 59px, hsl(var(--border)) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, hsl(var(--border)) 59px, hsl(var(--border)) 60px)`,
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "hsl(var(--primary))" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 max-w-2xl text-center">
        {/* Title */}
        <div className="flex items-center gap-2 mb-1 animate-fade-in-up">
          <div className="w-1 h-6 rounded-full bg-primary" />
          <span className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground">
            Discipline Tracker
          </span>
          <div className="w-1 h-6 rounded-full bg-primary" />
        </div>

        {/* Quote */}
        <blockquote className="opacity-0 animate-fade-in-up-delay">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
            "{quote.text}"
          </p>
          <footer className="mt-3 text-sm text-muted-foreground">— {quote.author}</footer>
        </blockquote>

        {/* CTA */}
        <button
          onClick={() => navigate("/timetable")}
          className="mt-4 px-8 py-3 bg-primary text-primary-foreground font-semibold text-sm tracking-widest uppercase rounded-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200 opacity-0 animate-fade-in-up-delay2"
        >
          Enter Dashboard
        </button>

        <p className="text-xs text-muted-foreground/50 tracking-wider uppercase">
          No excuses. No shortcuts.
        </p>
      </div>
    </div>
  );
}
