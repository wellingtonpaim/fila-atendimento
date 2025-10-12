// Theme management: apply dark mode class and persist via qmanager_config
class ThemeService {
  private static instance: ThemeService;
  private isDark = false;

  static getInstance(): ThemeService {
    if (!this.instance) this.instance = new ThemeService();
    return this.instance;
  }

  initFromStorage(): void {
    try {
      const raw = localStorage.getItem('qmanager_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        this.setDarkMode(!!cfg?.modoEscuro, false);
      } else {
        this.apply();
      }
    } catch {
      this.apply();
    }
  }

  setDarkMode(enabled: boolean, persist: boolean = true): void {
    this.isDark = !!enabled;
    this.apply();
    if (persist) {
      try {
        const raw = localStorage.getItem('qmanager_config');
        const cfg = raw ? JSON.parse(raw) : {};
        cfg.modoEscuro = this.isDark;
        localStorage.setItem('qmanager_config', JSON.stringify(cfg));
      } catch {}
    }
  }

  getDarkMode(): boolean { return this.isDark; }

  private apply(): void {
    const root = document.documentElement;
    if (this.isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }
}

export const themeService = ThemeService.getInstance();

