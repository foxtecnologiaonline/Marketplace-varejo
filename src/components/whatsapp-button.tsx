export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5500000000000"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600"
    >
      <svg viewBox="0 0 32 32" fill="currentColor" className="h-7 w-7" aria-hidden="true">
        <path d="M16.004 3C9.38 3 4 8.373 4 15c0 2.37.693 4.58 1.995 6.47L4 29l7.73-1.96A11.9 11.9 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm6.98 17.08c-.29.82-1.7 1.56-2.35 1.65-.6.09-1.36.13-2.2-.14-.5-.16-1.15-.38-1.98-.75-3.49-1.51-5.76-5.02-5.94-5.26-.17-.24-1.42-1.89-1.42-3.6 0-1.71.9-2.55 1.22-2.9.32-.35.7-.43.93-.43.23 0 .47.002.67.012.21.01.5-.08.78.6.29.7.98 2.4 1.07 2.57.09.17.14.37.03.6-.11.23-.17.37-.34.57-.17.2-.36.45-.51.6-.17.17-.35.36-.15.7.2.35.9 1.49 1.94 2.42 1.33 1.19 2.45 1.56 2.8 1.73.35.17.56.15.77-.08.2-.23.87-1.01 1.1-1.36.23-.35.46-.29.77-.17.32.11 2.02.95 2.37 1.12.35.17.58.26.66.4.09.15.09.84-.19 1.66Z" />
      </svg>
    </a>
  );
}
