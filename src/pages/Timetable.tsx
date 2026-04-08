import { useState, useCallback } from "react";
import { getDayData, toggleTask, addTask, deleteTask, editTask, getStreak, isToday } from "@/lib/storage";
import { ChevronLeft, ChevronRight, Flame, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { DayData } from "@/lib/storage";

export default function Timetable() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData>(() => getDayData(currentDate));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTime, setEditTime] = useState("");
  const [editLabel, setEditLabel] = useState("");

  const streak = getStreak();
  const today = isToday(currentDate);
  const completed = dayData.tasks.filter((t) => t.completed).length;
  const total = dayData.tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const navigate = useCallback((dir: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dir);
    setCurrentDate(d);
    setDayData(getDayData(d));
    setEditingId(null);
  }, [currentDate]);

  const handleToggle = useCallback((taskId: string) => {
    if (editingId) return;
    const updated = toggleTask(currentDate, taskId);
    setDayData({ ...updated });
  }, [currentDate, editingId]);

  const handleAdd = useCallback(() => {
    if (!newTime || !newLabel.trim()) return;
    const updated = addTask(currentDate, newTime, newLabel.trim());
    setDayData({ ...updated });
    setNewTime("");
    setNewLabel("");
    setShowAddForm(false);
  }, [currentDate, newTime, newLabel]);

  const handleDelete = useCallback((taskId: string) => {
    const updated = deleteTask(currentDate, taskId);
    setDayData({ ...updated });
  }, [currentDate]);

  const startEdit = useCallback((taskId: string, time: string, label: string) => {
    setEditingId(taskId);
    setEditTime(time);
    setEditLabel(label);
  }, []);

  const handleEdit = useCallback(() => {
    if (!editingId || !editTime || !editLabel.trim()) return;
    const updated = editTask(currentDate, editingId, editTime, editLabel.trim());
    setDayData({ ...updated });
    setEditingId(null);
  }, [currentDate, editingId, editTime, editLabel]);

  const dateStr = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 rounded-full bg-primary" />
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Daily Timetable</h1>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Track your discipline daily</p>

      {/* Date nav — mobile: larger tap targets */}
      <div className="flex items-center justify-between bg-card border border-border rounded px-4 py-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs sm:text-sm font-medium text-foreground">{dateStr}</div>
          {today && <div className="text-xs font-semibold text-primary uppercase tracking-wider">Today</div>}
        </div>
        <button
          onClick={() => navigate(1)}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{completed}/{total} tasks</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{pct}%</span>
          <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs font-medium">
            <Flame className="w-3.5 h-3.5 text-streak" />
            <span>{streak}d</span>
          </div>
        </div>
      </div>
      <div className="w-full h-1 bg-secondary rounded-full mb-4 sm:mb-6 overflow-hidden">
        <div className="h-full bg-success rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      {/* Tasks — mobile: always show edit/delete buttons (no hover needed) */}
      <div className="flex flex-col gap-2">
        {dayData.tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 px-3 sm:px-4 py-3 bg-card border border-border rounded transition-all duration-200 hover:border-primary/30 group ${task.completed ? "opacity-60" : ""}`}
          >
            {editingId === task.id ? (
              /* Edit mode */
              <div className="flex items-center gap-2 flex-1 flex-wrap sm:flex-nowrap">
                <input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="px-2 py-2 bg-background border border-border rounded text-xs text-foreground w-28 min-h-[44px] sm:min-h-0 sm:py-1"
                />
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  className="flex-1 px-2 py-2 bg-background border border-border rounded text-sm text-foreground min-h-[44px] sm:min-h-0 sm:py-1"
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleEdit}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-success hover:text-success/80"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <>
                <button onClick={() => handleToggle(task.id)} className="flex items-center gap-3 flex-1 text-left min-h-[44px]">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${task.completed ? "border-success bg-success" : "border-muted-foreground/30 group-hover:border-primary/50"}`}>
                    {task.completed && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{task.time}</span>
                  <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.label}</span>
                </button>
                {/* Mobile: always visible. Desktop: hover only */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(task.id, task.time, task.label)}
                    className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-1 flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-1 flex items-center justify-center text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add task */}
      {showAddForm ? (
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="px-3 py-3 sm:py-2 bg-card border border-border rounded text-sm text-foreground min-h-[44px]"
          />
          <input
            type="text"
            placeholder="Task name"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-3 py-3 sm:py-2 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground min-h-[44px]"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-3 sm:py-2 bg-primary text-primary-foreground rounded text-sm font-medium min-h-[44px]"
          >
            Add
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full py-3 border border-dashed border-border rounded text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" /> Add task
        </button>
      )}
    </div>
  );
}