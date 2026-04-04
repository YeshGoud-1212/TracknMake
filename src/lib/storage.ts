export interface Task {
  id: string;
  time: string;
  label: string;
  completed: boolean;
}

export interface DayData {
  tasks: Task[];
  date: string;
}

const STORAGE_KEY = "discipline-tracker";

const DEFAULT_TASKS: Omit<Task, "id" | "completed">[] = [
  { time: "06:00", label: "Wake up & cold shower" },
  { time: "07:00", label: "Morning workout" },
  { time: "08:30", label: "Healthy breakfast" },
  { time: "09:00", label: "Deep work session" },
  { time: "12:00", label: "Lunch & rest" },
  { time: "13:00", label: "Study / learning" },
  { time: "15:00", label: "Review & planning" },
  { time: "17:00", label: "Evening walk" },
  { time: "19:00", label: "Read for 30 mins" },
  { time: "22:00", label: "Journal & sleep" },
];

function createDefaultTasks(): Task[] {
  return DEFAULT_TASKS.map((t, i) => ({
    ...t,
    id: `default-${i}`,
    completed: false,
  }));
}

function getStore(): Record<string, DayData> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(store: Record<string, DayData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getDayData(date: Date): DayData {
  const key = formatDateKey(date);
  const store = getStore();
  if (store[key]) return store[key];
  // Build task list from defaults + additions - removals
  const defaults = createDefaultTasks();
  const additions = getTemplateAdditions();
  const removals = getTemplateRemovals();

  // Apply removals from defaults
  const filtered = defaults.filter(
    (d) => !removals.some((r) => r.time === d.time && r.label === d.label)
  );

  // Apply additions
  for (const a of additions) {
    if (!filtered.some((d) => d.time === a.time && d.label === a.label)) {
      filtered.push({ id: `template-${Date.now()}-${Math.random()}`, time: a.time, label: a.label, completed: false });
    }
  }

  filtered.sort((a, b) => a.time.localeCompare(b.time));
  return { tasks: filtered, date: key };
}

function getTemplateAdditions(): Omit<Task, "id" | "completed">[] {
  try {
    const raw = localStorage.getItem("discipline-template-additions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getTemplateRemovals(): Omit<Task, "id" | "completed">[] {
  try {
    const raw = localStorage.getItem("discipline-template-removals");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addToTemplateRemovals(time: string, label: string) {
  const removals = getTemplateRemovals();
  if (!removals.some((r) => r.time === time && r.label === label)) {
    removals.push({ time, label });
    localStorage.setItem("discipline-template-removals", JSON.stringify(removals));
  }
}

function removeFromTemplateRemovals(time: string, label: string) {
  let removals = getTemplateRemovals();
  removals = removals.filter((r) => !(r.time === time && r.label === label));
  localStorage.setItem("discipline-template-removals", JSON.stringify(removals));
}

export function saveDayData(date: Date, data: DayData) {
  const store = getStore();
  store[formatDateKey(date)] = data;
  setStore(store);
}

export function toggleTask(date: Date, taskId: string): DayData {
  const data = getDayData(date);
  data.tasks = data.tasks.map((t) =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  );
  saveDayData(date, data);
  return data;
}

export function addTask(date: Date, time: string, label: string): DayData {
  const data = getDayData(date);
  const newTask: Task = {
    id: `custom-${Date.now()}`,
    time,
    label,
    completed: false,
  };
  data.tasks.push(newTask);
  data.tasks.sort((a, b) => a.time.localeCompare(b.time));
  saveDayData(date, data);

  // Add to all future days that already exist in store
  const store = getStore();
  for (const [key, dayData] of Object.entries(store)) {
    if (key > formatDateKey(date)) {
      const alreadyHas = dayData.tasks.some((t) => t.time === time && t.label === label);
      if (!alreadyHas) {
        dayData.tasks.push({ ...newTask, id: `custom-${Date.now()}-${key}`, completed: false });
        dayData.tasks.sort((a, b) => a.time.localeCompare(b.time));
        store[key] = dayData;
      }
    }
  }
  setStore(store);

  // Also store as a "template addition" for days not yet created
  addToTemplate(time, label);

  return data;
}


function addToTemplate(time: string, label: string) {
  const additions = getTemplateAdditions();
  if (!additions.some((a) => a.time === time && a.label === label)) {
    additions.push({ time, label });
    localStorage.setItem("discipline-template-additions", JSON.stringify(additions));
  }
}

function removeFromTemplate(time: string, label: string) {
  let additions = getTemplateAdditions();
  additions = additions.filter((a) => !(a.time === time && a.label === label));
  localStorage.setItem("discipline-template-additions", JSON.stringify(additions));
}

export function deleteTask(date: Date, taskId: string): DayData {
  const data = getDayData(date);
  const task = data.tasks.find((t) => t.id === taskId);
  data.tasks = data.tasks.filter((t) => t.id !== taskId);
  saveDayData(date, data);

  if (task) {
    removeFromTemplate(task.time, task.label);
    addToTemplateRemovals(task.time, task.label);
    const store = getStore();
    const dateKey = formatDateKey(date);
    for (const [key, dayData] of Object.entries(store)) {
      if (key > dateKey) {
        const before = dayData.tasks.length;
        dayData.tasks = dayData.tasks.filter((t) => !(t.time === task.time && t.label === task.label));
        if (dayData.tasks.length !== before) {
          store[key] = dayData;
        }
      }
    }
    setStore(store);
  }

  return data;
}

export function editTask(date: Date, taskId: string, time: string, label: string): DayData {
  const data = getDayData(date);
  const oldTask = data.tasks.find((t) => t.id === taskId);
  data.tasks = data.tasks.map((t) =>
    t.id === taskId ? { ...t, time, label } : t
  );
  data.tasks.sort((a, b) => a.time.localeCompare(b.time));
  saveDayData(date, data);

  if (oldTask) {
    // Update template
    removeFromTemplate(oldTask.time, oldTask.label);
    addToTemplate(time, label);
    // If old task was a removed default, update that removal too
    removeFromTemplateRemovals(oldTask.time, oldTask.label);
    // Update all future days in store
    const store = getStore();
    const dateKey = formatDateKey(date);
    for (const [key, dayData] of Object.entries(store)) {
      if (key > dateKey) {
        dayData.tasks = dayData.tasks.map((t) =>
          t.time === oldTask.time && t.label === oldTask.label ? { ...t, time, label } : t
        );
        dayData.tasks.sort((a, b) => a.time.localeCompare(b.time));
        store[key] = dayData;
      }
    }
    setStore(store);
  }

  return data;
}

export function getStreak(): number {
  let streak = 0;
  const today = new Date();
  const d = new Date(today);
  d.setDate(d.getDate() - 1); // start from yesterday

  while (true) {
    const data = getDayData(d);
    const store = getStore();
    const key = formatDateKey(d);
    if (!store[key]) break;
    const completed = data.tasks.filter((t) => t.completed).length;
    const total = data.tasks.length;
    if (total > 0 && completed === total) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  // Check today
  const todayData = getDayData(today);
  const store = getStore();
  if (store[formatDateKey(today)]) {
    const completed = todayData.tasks.filter((t) => t.completed).length;
    if (completed === todayData.tasks.length && todayData.tasks.length > 0) {
      streak++;
    }
  }

  return streak;
}

export function getYearData(year: number): Record<string, number> {
  const store = getStore();
  const result: Record<string, number> = {};
  for (const [key, data] of Object.entries(store)) {
    if (key.startsWith(`${year}-`)) {
      const total = data.tasks.length;
      const completed = data.tasks.filter((t) => t.completed).length;
      result[key] = total > 0 ? completed / total : 0;
    }
  }
  return result;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return formatDateKey(date) === formatDateKey(today);
}

export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d > today;
}

export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}
