// Locale management for basic i18n aspects (document lang, date/number formatting base)
// Stores selected locale in qmanager_config.idiomaInterface; defaults to 'pt-BR'

class LocaleService {
  private static instance: LocaleService;
  private locale: string = 'pt-BR';

  static getInstance(): LocaleService {
    if (!this.instance) this.instance = new LocaleService();
    return this.instance;
  }

  initFromStorage(): void {
    try {
      const raw = localStorage.getItem('qmanager_config');
      if (raw) {
        const cfg = JSON.parse(raw);
        const code = cfg?.idiomaInterface || 'pt-BR';
        this.setLocale(code, false);
      } else {
        this.apply();
      }
    } catch {
      this.apply();
    }
  }

  setLocale(code: string, persist: boolean = true): void {
    const ok = ['pt-BR', 'en-US', 'es-ES'];
    this.locale = ok.includes(code) ? code : 'pt-BR';
    this.apply();
    if (persist) {
      try {
        const raw = localStorage.getItem('qmanager_config');
        const cfg = raw ? JSON.parse(raw) : {};
        cfg.idiomaInterface = this.locale;
        localStorage.setItem('qmanager_config', JSON.stringify(cfg));
      } catch {}
    }
  }

  getLocale(): string { return this.locale; }

  private apply(): void {
    try { document.documentElement.setAttribute('lang', this.locale); } catch {}
  }
}

export const localeService = LocaleService.getInstance();

