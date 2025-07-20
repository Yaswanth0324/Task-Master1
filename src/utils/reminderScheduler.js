export function scheduleReminders({ getTasks, onReminder }) {
  // Poll every 30s for due tasks not yet fired
  const firedKey = 'firedReminders';
  const fired = new Set(JSON.parse(localStorage.getItem(firedKey) || '[]'));

  function check() {
    const now = Date.now();
    const tasks = getTasks();
    tasks.forEach((t) => {
      if (!t.completed && t.due && !fired.has(t.id)) {
        const dueTime = new Date(t.due).getTime();
        if (dueTime <= now) {
          fired.add(t.id);
          localStorage.setItem(firedKey, JSON.stringify([...fired]));
          onReminder(t);
        }
      }
    });
  }
  const id = setInterval(check, 30000);
  check(); // initial
  return () => clearInterval(id);
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}