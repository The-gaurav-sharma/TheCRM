import { tasksApi } from "./services";

/**
 * Check for upcoming tasks and return notifications
 * Returns tasks due in the next 24 hours or next 1 hour
 */
export const checkUpcomingNotifications = async () => {
  try {
    const response = await tasksApi.list();
    const tasks = response.tasks || [];
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const notifications = [];

    tasks.forEach((task) => {
      if (!task.dueDate) return;

      const dueDate = new Date(task.dueDate);

      // Skip if task is already past due or completed
      if (dueDate < now || task.status === "completed") return;

      // Task due within 1 hour
      if (dueDate <= oneHourLater && dueDate > now) {
        notifications.push({
          id: `${task._id}-1hour`,
          type: "task-urgent",
          title: "Task due soon",
          message: `"${task.title}" is due in less than 1 hour`,
          task,
          timestamp: now,
        });
      }
      // Task due within 24 hours (but not in the 1-hour window already notified)
      else if (dueDate <= oneDayLater && dueDate > oneHourLater) {
        notifications.push({
          id: `${task._id}-24hour`,
          type: "task-reminder",
          title: "Upcoming task",
          message: `"${task.title}" is due in less than 24 hours`,
          task,
          timestamp: now,
        });
      }
    });

    return notifications;
  } catch (err) {
    console.error("Failed to check notifications:", err);
    return [];
  }
};

/**
 * Format time until due date
 */
export const formatTimeUntilDue = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;

  if (diffMs < 0) return "Overdue";

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Due now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};
