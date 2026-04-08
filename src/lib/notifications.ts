const LAST_MARKED_KEY = "lastMarked";
const NOTIFIED_DATE_KEY = "notifiedDate";

export function updateLastMarked(): void {
  localStorage.setItem(LAST_MARKED_KEY, new Date().toISOString());
}

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hasMarkedToday(): boolean {
  const lastMarked = localStorage.getItem(LAST_MARKED_KEY);
  if (!lastMarked) return false;
  const lastMarkedDate = new Date(lastMarked);
  const y = lastMarkedDate.getFullYear();
  const m = String(lastMarkedDate.getMonth() + 1).padStart(2, "0");
  const d = String(lastMarkedDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` === getTodayKey();
}

function hasNotifiedToday(): boolean {
  return localStorage.getItem(NOTIFIED_DATE_KEY) === getTodayKey();
}

function markNotifiedToday(): void {
  localStorage.setItem(NOTIFIED_DATE_KEY, getTodayKey());
}

async function sendNotification(): Promise<void> {
  const title = "TracknMake Reminder";
  const body = "You haven't marked your tasks today. Stay consistent!";

  if (!("Notification" in window)) {
    alert(`${title}\n${body}`);
    return;
  }

  let permission = Notification.permission;

  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    new Notification(title, {
      body,
      icon: "/logo.png",
    });
  } else {
    // Fallback in-app alert
    alert(`${title}\n${body}`);
  }
}

export function initNotificationScheduler(): () => void {
  // Request permission early on app load
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  const interval = setInterval(async () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Trigger at exactly 9:00 PM (21:00)
    if (hours === 21 && minutes === 0) {
      if (!hasMarkedToday() && !hasNotifiedToday()) {
        await sendNotification();
        markNotifiedToday();
      }
    }
  }, 60 * 1000); // check every minute

  // Cleanup function
  return () => clearInterval(interval);
}