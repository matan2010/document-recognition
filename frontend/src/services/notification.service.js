class NotificationService {
  static listeners = new Set();

  static subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static notify(message, severity = 'info') {
    this.listeners.forEach(listener => listener({ message, severity }));
  }
}

export default NotificationService;
