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

type PixelIconName = 'temperature' | 'density' | 'magic';

const pixelIconPaths: Record<PixelIconName, string> = {
  temperature: `
    <path d="M5 1h3v1H5z M4 2h1v7H4z M8 2h1v7H8z M6 3h1v8H6z
      M11 3h3v1h-3z M11 6h2v1h-2z M11 9h3v1h-3z
      M3 9h2v1H3z M8 9h2v1H8z M2 10h1v3H2z M10 10h1v3h-1z
      M4 11h5v2H4z M3 13h1v1H3z M5 13h3v1H5z M9 13h1v1H9z M4 14h5v1H4z" />
  `,
  density: `
    <path d="M6 1h4v1H6z M4 2h8v1H4z M2 3h12v1H2z M1 4h14v1H1z
      M3 5h10v1H3z M5 6h6v1H5z M1 7h2v1H1z M7 7h2v1H7z M13 7h2v1h-2z
      M2 8h3v1H2z M11 8h3v1h-3z M4 9h3v1H4z M9 9h3v1H9z
      M1 10h2v1H1z M6 10h4v1H6z M13 10h2v1h-2z
      M2 11h3v1H2z M11 11h3v1h-3z M4 12h3v1H4z M9 12h3v1H9z M6 13h4v1H6z" />
  `,
  magic: `
    <path d="M11 1h1v1h-1z M10 2h3v1h-3z M3 3h1v1H3z M9 3h5v1H9z
      M2 4h3v1H2z M10 4h3v1h-3z M3 5h1v1H3z M11 5h1v1h-1z
      M9 6h2v1H9z M8 7h3v1H8z M7 8h3v1H7z M6 9h3v1H6z M13 9h1v1h-1z
      M5 10h3v1H5z M12 10h3v1h-3z M4 11h3v1H4z M13 11h1v1h-1z
      M3 12h3v1H3z M2 13h3v1H2z M2 14h2v1H2z" />
  `,
};

const iconPaths: Record<Exclude<IconName, PixelIconName>, string> = {
  spark: `
    <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z" />
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
  if (name === 'temperature' || name === 'density' || name === 'magic') {
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="${escapeAttribute(className)} icon-pixel"
        width="24"
        height="24"
        viewBox="0 0 16 16"
        shape-rendering="crispEdges"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >${pixelIconPaths[name]}</svg>
    `;
  }

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
