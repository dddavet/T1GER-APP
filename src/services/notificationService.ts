export const scheduleReminder = (label: string, time: string) => {
  console.log(`[Notification] Scheduled reminder for "${label}" at ${time}`);
  
  // In a real PWA/Mobile app, this would use the Web Notifications API or Push API
  if ('Notification' in window && Notification.permission === 'granted') {
    const [hours, minutes] = time.split(':');
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(parseInt(hours), parseInt(minutes), 0);
    
    if (scheduled > now) {
      const delay = scheduled.getTime() - now.getTime();
      setTimeout(() => {
        new Notification('T1GER Protocol', {
          body: `Time to execute: ${label}. No excuses.`,
          icon: '/tiger-icon.png'
        });
      }, delay);
    }
  }
};

export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};
