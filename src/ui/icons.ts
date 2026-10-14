export type IconName =
  | 'spark'
  | 'temperature'
  | 'density'
  | 'magic'
  | 'heart'
  | 'clock'
  | 'help'
  | 'menu'
  | 'pause'
  | 'play'
  | 'trophy'
  | 'close'
  | 'arrow'
  | 'dragon'
  | 'fairy'
  | 'lotus'
  | 'mandrake'
  | 'acid'
  | 'void';

const iconPaths: Record<IconName, string> = {
  spark: `
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
  `,
  temperature: `
    <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z" />
    <path d="M12 7v10" />
    <circle cx="12" cy="18" r="1.5" />
    <path d="M18 6h2m-2 4h2" />
  `,
  density: `
    <path d="m3 7 9-4 9 4-9 4Z" />
    <path d="m3 12 9 4 9-4M3 17l9 4 9-4" />
  `,
  magic: `
    <path d="m5 21 11-11-2-2L3 19Z" />
    <path d="m17 2 .9 2.1L20 5l-2.1.9L17 8l-.9-2.1L14 5l2.1-.9ZM21 10v3m-1.5-1.5h3M6 5v4M4 7h4" />
    <path d="m10 12 2 2" />
  `,
  heart: `
    <path d="M12 21 3.8 13a5.7 5.7 0 0 1 8.2-7.9A5.7 5.7 0 0 1 20.2 13Z" />
  `,
  clock: `
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  `,
  help: `
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4" />
    <circle cx="12" cy="16.5" r=".6" fill="currentColor" stroke="none" />
  `,
  menu: `
    <path d="M4 6h16M4 12h16M4 18h16" />
  `,
  pause: `
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  `,
  play: `
    <path d="m7 4 13 8-13 8Z" />
  `,
  trophy: `
    <path d="M7 3h10v6a5 5 0 0 1-10 0ZM7 5H4v3a4 4 0 0 0 4 4m9-7h3v3a4 4 0 0 1-4 4M12 14v4m-5 3h10m-8 0v-3h6v3" />
  `,
  close: `
    <path d="m6 6 12 12M18 6 6 18" />
  `,
  arrow: `
    <path d="M4 12h16m-6-6 6 6-6 6" />
  `,
  dragon: `
    <path d="M12 2C9.5 6.8 5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-4.5-8.2-7-13Z" />
    <path d="M9 16a3 3 0 0 0 6 0c0-1.7-2.2-2.3-2-4.5-2.5 1-4 2.3-4 4.5Z" />
  `,
  fairy: `
    <path d="m11 5 2.2 5.8L19 13l-5.8 2.2L11 21l-2.2-5.8L3 13l5.8-2.2Z" />
    <path d="M19 2v4m-2-2h4M4 3v3M2.5 4.5h3M20 18v3m-1.5-1.5h3" />
  `,
  lotus: `
    <path d="M12 19c-5-3.5-5-8.5 0-16 5 7.5 5 12.5 0 16Z" />
    <path d="M12 19C5 19 3.5 13 4 7c3.5 1 5.8 3.2 6.4 5.5M12 19c7 0 8.5-6 8-12-3.5 1-5.8 3.2-6.4 5.5" />
    <path d="M12 20c-5 2-9-.5-10-5 3.5-.6 5.7-.2 7 1M12 20c5 2 9-.5 10-5-3.5-.6-5.7-.2-7 1" />
  `,
  mandrake: `
    <path d="M12 8C8 8 7 10.5 8 14l-2 4 3-1 1 5 2-4 2 4 1-5 3 1-2-4c1-3.5 0-6-4-6Z" />
    <path d="M12 8V4m0 2C8 6 6 4.5 6 2c3 0 5 1 6 4Zm0 0c4 0 6-1.5 6-4-3 0-5 1-6 4Z" />
    <circle cx="10.5" cy="12" r=".5" fill="currentColor" stroke="none" />
    <circle cx="13.5" cy="12" r=".5" fill="currentColor" stroke="none" />
  `,
  acid: `
    <path d="M9 3h6m-5 0v6l-5.4 8.3A2.4 2.4 0 0 0 6.6 21h10.8a2.4 2.4 0 0 0 2-3.7L14 9V3" />
    <path d="M7 15c2-1 3.5 1 5 0s3-1 5 0" />
    <circle cx="10" cy="18" r=".6" />
    <circle cx="13.5" cy="12.5" r=".6" />
  `,
  void: `
    <circle cx="12" cy="12" r="5.5" />
    <path d="M9 3.5a9 9 0 0 1 11.5 11.7M15 20.5A9 9 0 0 1 3.5 8.8" />
    <path d="M4 4v3M2.5 5.5h3M20 17v3m-1.5-1.5h3" />
    <path d="M10 8.5a4 4 0 0 0-1.5 5" />
  `,
};

function escapeAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function icon(name: IconName, className = 'icon'): string {
  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="${escapeAttribute(className)}"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >${iconPaths[name]}</svg>
  `;
}
