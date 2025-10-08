// Polyfills mínimos para ambiente browser
// Evita erros de libs que esperam variáveis de ambiente Node (ex.: sockjs-client)

// global -> window
// @ts-ignore
if (typeof (window as any).global === 'undefined') {
  // @ts-ignore
  (window as any).global = window;
}

// process.env básico
// @ts-ignore
if (typeof (window as any).process === 'undefined') {
  // @ts-ignore
  (window as any).process = { env: {} };
}
