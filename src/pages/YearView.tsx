import { useMemo, useState } from "react";
import { getYearData, getStreak, getDayData, formatDateKey, isToday, isFuture, isPast } from "@/lib/storage";
import { Flame, TrendingUp, CalendarCheck, Target } from "lucide-react";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_NAMES_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface TooltipData {
  x: number;
  y: number;
  date: Date;
  key: string;
  ratio: number | undefined;
  isFutureDay: boolean;
  isTodayDay: boolean;
  completed: number;
  total: number;
}

export default function YearView() {
  const year = new Date().getFullYear();
  const yearData = useMemo(() => getYearData(year), [year]);
  const streak = getStreak();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const todayData = useMemo(() => {
    const today = new Date();
    const d = getDayData(today);
    const completed = d.tasks.filter((t) => t.completed).length;
    const total = d.tasks.length;
    return { pct: total > 0 ? Math.round((completed / total) * 100) : 0, completed, total };
  }, []);

  const { monthlyAvg, perfectDays } = useMemo(() => {
    const now = new Date();
    const currentMonth = `${year}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let monthTotal = 0;
    let monthCount = 0;
    let perfect = 0;

    for (const [key, ratio] of Object.entries(yearData)) {
      if (ratio === 1) perfect++;
      if (key.startsWith(currentMonth)) {
        monthTotal += ratio;
        monthCount++;
      }
    }

    return {
      monthlyAvg: monthCount > 0 ? Math.round((monthTotal / monthCount) * 100) : 0,
      perfectDays: perfect,
    };
  }, [yearData, year]);

  const months = useMemo(() => {
    return MONTHS.map((name, monthIndex) => {
      const firstDay = new Date(year, monthIndex, 1);
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const startDay = firstDay.getDay();
      const days: { date: Date; key: string; dayNum: number }[] = [];
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, monthIndex, d);
        days.push({ date, key: formatDateKey(date), dayNum: d });
      }
      return { name, monthIndex, startDay, days };
    });
  }, [year]);

  function getCellClasses(date: Date, key: string): string {
    const today = isToday(date);
    const future = isFuture(date);
    const base = "w-5 h-5 sm:w-6 sm:h-6 rounded-full transition-all cursor-pointer";

    if (future) return `${base} bg-white shadow-[0_0_6px_1px_rgba(255,255,255,0.4)]`;

    if (today) {
      const ratio = yearData[key];
      let color = "bg-white shadow-[0_0_10px_3px_rgba(255,255,255,0.6)]";
      if (ratio !== undefined) {
        if (ratio > 0.8) color = "bg-emerald-400 shadow-[0_0_10px_3px_rgba(52,211,153,0.7)]";
        else if (ratio > 0.5) color = "bg-yellow-400 shadow-[0_0_10px_3px_rgba(250,204,21,0.7)]";
        else if (ratio > 0) color = "bg-orange-400 shadow-[0_0_10px_3px_rgba(251,146,60,0.7)]";
        else color = "bg-red-500 shadow-[0_0_10px_3px_rgba(239,68,68,0.7)]";
      }
      return `${base} ${color} ring-[3px] ring-primary ring-offset-2 ring-offset-background`;
    }

    if (yearData[key] !== undefined) {
      const ratio = yearData[key];
      if (ratio > 0.8) return `${base} bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]`;
      if (ratio > 0.5) return `${base} bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]`;
      if (ratio > 0) return `${base} bg-orange-400 shadow-[0_0_8px_2px_rgba(251,146,60,0.6)]`;
      return `${base} bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]`;
    }

    if (isPast(date)) return `${base} bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]`;
    return `${base} bg-white shadow-[0_0_6px_1px_rgba(255,255,255,0.4)]`;
  }

  function getStatusLabel(date: Date, key: string, ratio: number | undefined): { label: string; color: string } {
    if (isFuture(date)) return { label: "Upcoming", color: "bg-white/10 text-white" };
    if (isToday(date)) {
      if (ratio === undefined) return { label: "Today — No data", color: "bg-primary/20 text-primary" };
      if (ratio > 0.8) return { label: "Today — Perfect!", color: "bg-emerald-500/20 text-emerald-400" };
      if (ratio > 0.5) return { label: "Today — Good", color: "bg-yellow-500/20 text-yellow-400" };
      if (ratio > 0) return { label: "Today — Weak", color: "bg-orange-500/20 text-orange-400" };
      return { label: "Today — Missed", color: "bg-red-500/20 text-red-400" };
    }
    if (ratio === undefined) return { label: "Missed Day", color: "bg-red-500/20 text-red-400" };
    if (ratio > 0.8) return { label: "Perfect Day!", color: "bg-emerald-500/20 text-emerald-400" };
    if (ratio > 0.5) return { label: "Good Day", color: "bg-yellow-500/20 text-yellow-400" };
    if (ratio > 0) return { label: "Weak Day", color: "bg-orange-500/20 text-orange-400" };
    return { label: "Missed Day", color: "bg-red-500/20 text-red-400" };
  }

  function handleMouseEnter(e: React.MouseEvent, date: Date, key: string) {
    const future = isFuture(date);
    const ratio = yearData[key];
    const rect = (e.target as HTMLElement).getBoundingClientRect();

    let completed = 0;
    let total = 0;
    if (!future) {
      const d = getDayData(date);
      total = d.tasks.length;
      completed = d.tasks.filter((t) => t.completed).length;
    }

    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top,
      date,
      key,
      ratio,
      isFutureDay: future,
      isTodayDay: isToday(date),
      completed,
      total,
    });
  }

  function formatTooltipDate(date: Date): string {
    return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES_FULL[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  }

  return (
    <div className="animate-fade-in" onMouseLeave={() => setTooltip(null)}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 rounded-full bg-primary" />
        <h1 className="text-xl font-bold text-foreground">Year View</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {year} — color reflects daily task completion
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-card border border-blue-500/20 rounded-lg p-4 shadow-[0_0_15px_2px_rgba(59,130,246,0.15)]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Target className="w-3.5 h-3.5 text-blue-400" /> Today
          </div>
          <div className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">{todayData.pct}%</div>
          <div className="text-xs text-muted-foreground">{todayData.completed}/{todayData.total} tasks</div>
        </div>
        <div className="bg-card border border-orange-500/20 rounded-lg p-4 shadow-[0_0_15px_2px_rgba(249,115,22,0.15)]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" /> Streak
          </div>
          <div className="text-2xl font-bold text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">{streak}</div>
          <div className="text-xs text-muted-foreground">days &gt;80%</div>
        </div>
        <div className="bg-card border border-yellow-500/20 rounded-lg p-4 shadow-[0_0_15px_2px_rgba(234,179,8,0.15)]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-yellow-400" /> Monthly avg
          </div>
          <div className="text-2xl font-bold text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">{monthlyAvg}%</div>
          <div className="text-xs text-muted-foreground">this month</div>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-lg p-4 shadow-[0_0_15px_2px_rgba(52,211,153,0.15)]">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" /> Perfect days
          </div>
          <div className="text-2xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">{perfectDays}</div>
          <div className="text-xs text-muted-foreground">100% complete</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_1px_rgba(239,68,68,0.6)]" /> Missed (0%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-400 shadow-[0_0_6px_1px_rgba(251,146,60,0.6)]" /> Weak (1–50%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_6px_1px_rgba(250,204,21,0.6)]" /> Good (51–80%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.6)]" /> Perfect (81–100%)</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white ring-2 ring-primary ring-offset-1 ring-offset-background shadow-[0_0_8px_1px_rgba(255,255,255,0.5)]" /> Today</div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white shadow-[0_0_6px_1px_rgba(255,255,255,0.4)]" /> Upcoming</div>
      </div>

      {/* Month Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {months.map((month) => (
          <div key={month.name} className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-bold text-foreground mb-3">{month.name}</h3>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAY_HEADERS.map((d, i) => (
                <div key={i} className="text-[9px] text-muted-foreground text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: month.startDay }).map((_, i) => (
                <div key={`empty-${i}`} className="w-5 h-5 sm:w-6 sm:h-6" />
              ))}
              {month.days.map((day) => (
                <div
                  key={day.key}
                  className={getCellClasses(day.date, day.key)}
                  onMouseEnter={(e) => handleMouseEnter(e, day.date, day.key)}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-card border border-border rounded-lg shadow-xl p-3 min-w-[180px]">
            <div className="text-xs font-semibold text-foreground mb-2">
              {formatTooltipDate(tooltip.date)}
            </div>
            {(() => {
              const { label, color } = getStatusLabel(tooltip.date, tooltip.key, tooltip.ratio);
              return (
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${color}`}>
                  {label}
                </span>
              );
            })()}
            <div className="text-xs text-muted-foreground">
              {tooltip.isFutureDay
                ? "No task data yet"
                : tooltip.ratio !== undefined
                ? `${tooltip.completed}/${tooltip.total} tasks · ${Math.round(tooltip.ratio * 100)}%`
                : "No task data"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}