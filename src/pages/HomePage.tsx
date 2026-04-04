import { getRandomQuote } from "@/lib/quotes";
import { getStreak } from "@/lib/storage";
import { useState } from "react";
import { Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [quote] = useState(getRandomQuote);
  const streak = getStreak();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-8 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 rounded-full bg-primary" />
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground">
          Discipline Tracker
        </span>
        <div className="w-1 h-6 rounded-full bg-primary" />
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary rounded-full border border-primary/30 text-sm font-medium">
          <Flame className="w-4 h-4 text-streak" />
          <span className="text-primary">{streak} day streak</span>
        </div>
      )}

      <blockquote className="max-w-lg">
        <p className="text-2xl sm:text-3xl font-bold text-foreground leading-tight italic">
          &ldquo;{quote.text}&rdquo;
        </p>
        <footer className="mt-3 text-sm text-muted-foreground">— {quote.author}</footer>
      </blockquote>

      <button
        onClick={() => navigate("/timetable")}
        className="mt-4 px-10 py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-[0.15em] uppercase rounded transition-colors"
      >
        Enter Dashboard
      </button>

      <p className="text-xs text-muted-foreground/50 tracking-[0.2em] uppercase">
        No excuses. No shortcuts.
      </p>
    </div>
  );
}
