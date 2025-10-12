import './polyfills';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { themeService } from '@/services/themeService';
import { localeService } from '@/services/localeService';
import { audioService } from '@/services/audioService';

// Aplicar preferências persistidas logo no boot
try { themeService.initFromStorage(); } catch {}
try { localeService.initFromStorage(); } catch {}
try { audioService.initFromStorage(); } catch {}

createRoot(document.getElementById("root")!).render(<App />);