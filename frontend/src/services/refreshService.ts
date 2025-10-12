// Global auto-refresh manager for the frontend
// Loads interval from localStorage (qmanager_config.intervaloAtualizacao)
// and reloads the page accordingly. Provides update method for runtime changes.

class RefreshService {
  private static instance: RefreshService;
  private timerId: number | null = null;
  private seconds: number = 0;

  static getInstance(): RefreshService {
    if (!this.instance) this.instance = new RefreshService();
    return this.instance;
  }

  initFromStorage(): void {
    try {
      const raw = localStorage.getItem('qmanager_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        const secs = Number(cfg?.intervaloAtualizacao);
        if (secs && secs >= 5) {
          this.updateInterval(secs);
        }
      }
    } catch {}

    // Also listen to storage updates (other tabs or settings save)
    window.addEventListener('storage', (e) => {
      if (e.key === 'qmanager_config' && e.newValue) {
        try {
          const cfg = JSON.parse(e.newValue);
          const secs = Number(cfg?.intervaloAtualizacao);
          if (!secs || secs < 5) {
            this.clear();
          } else if (secs !== this.seconds) {
            this.updateInterval(secs);
          }
        } catch {}
      }
    });
  }

  updateInterval(seconds: number): void {
    this.clear();
    const secs = Math.max(5, Math.floor(seconds));
    this.seconds = secs;
    this.timerId = window.setInterval(() => {
      try {
        window.location.reload();
      } catch {}
    }, secs * 1000);
    if (import.meta.env.DEV) console.debug(`[RefreshService] Auto-refresh a cada ${secs}s`);
  }

  clear(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.seconds = 0;
  }
}

export const refreshService = RefreshService.getInstance();

