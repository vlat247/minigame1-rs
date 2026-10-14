import { icon } from './icons';
import type { IconName } from './icons';

let illustrationSequence = 0;

function illustrationPrefix(subject: string): string {
  illustrationSequence += 1;
  return `alchemy-${subject}-${illustrationSequence}`;
}

export function cauldronIllustration(filled = false): string {
  const prefix = illustrationPrefix('cauldron');
  const title = filled ? 'Potion cauldron' : 'Empty cauldron';
  const liquid = filled
    ? `
      <ellipse cx="300" cy="163" rx="149" ry="30" fill="url(#${prefix}-potion)" stroke="#b9dc72" stroke-width="1.5" />
      <path d="M166 162c37-24 180-32 263-5" fill="none" stroke="#f0ffc0" stroke-width="2.5" opacity=".55" />
      <path d="M206 176c48 12 116 13 166 3m-130-30c28-5 67-5 91-1" fill="none" stroke="#517a27" stroke-width="2" opacity=".48" />
      <g fill="url(#${prefix}-bubble)" stroke="#d3ed9c" stroke-width="1">
        <circle class="potion-bubble" cx="219" cy="161" r="7" />
        <circle class="potion-bubble" cx="337" cy="157" r="5" />
        <circle class="potion-bubble" cx="382" cy="165" r="8" />
        <circle class="potion-bubble" cx="260" cy="125" r="10" />
        <circle class="potion-bubble" cx="355" cy="112" r="6" />
      </g>
      <g class="potion-steam" fill="none" stroke-linecap="round">
        <path d="M242 132c-26-30 26-42 4-77" stroke="url(#${prefix}-steam)" stroke-width="7" opacity=".38" />
        <path d="M300 124c-25-29 26-53 4-91" stroke="url(#${prefix}-steam)" stroke-width="9" opacity=".3" />
        <path d="M366 140c24-27-20-43-3-69" stroke="url(#${prefix}-steam)" stroke-width="6" opacity=".32" />
        <path d="M276 103c-12-15 11-26 4-43" stroke="#dcebb2" stroke-width="2" opacity=".22" />
      </g>
    `
    : `
      <ellipse cx="300" cy="164" rx="150" ry="31" fill="url(#${prefix}-inside)" />
      <path d="M164 166c42 23 224 23 272 0" fill="none" stroke="#485342" stroke-width="2" opacity=".5" />
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="cauldron-illustration" width="600" height="480" viewBox="0 0 600 480" role="img" aria-label="${title}" focusable="false">
      <title>${title}</title>
      <defs>
        <radialGradient id="${prefix}-iron" cx=".29" cy=".18" r=".9">
          <stop stop-color="#778074" />
          <stop offset=".18" stop-color="#414d43" />
          <stop offset=".48" stop-color="#202a24" />
          <stop offset=".79" stop-color="#101814" />
          <stop offset="1" stop-color="#070c09" />
        </radialGradient>
        <linearGradient id="${prefix}-rim" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#d2c39b" />
          <stop offset=".2" stop-color="#8d947d" />
          <stop offset=".45" stop-color="#3e493a" />
          <stop offset=".7" stop-color="#89947a" />
          <stop offset="1" stop-color="#263025" />
        </linearGradient>
        <linearGradient id="${prefix}-brass" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#635033" />
          <stop offset=".25" stop-color="#e3c58b" />
          <stop offset=".49" stop-color="#ab8952" />
          <stop offset=".72" stop-color="#5b4328" />
          <stop offset="1" stop-color="#bc9b62" />
        </linearGradient>
        <linearGradient id="${prefix}-stone" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#72745e" />
          <stop offset=".3" stop-color="#4e5342" />
          <stop offset="1" stop-color="#242b23" />
        </linearGradient>
        <radialGradient id="${prefix}-hearth">
          <stop stop-color="#b9d353" stop-opacity="${filled ? '.55' : '.38'}" />
          <stop offset=".48" stop-color="#7a9d32" stop-opacity="${filled ? '.3' : '.12'}" />
          <stop offset="1" stop-color="#5c8c2c" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="${prefix}-inside" cx=".5" cy=".85" r=".8">
          <stop stop-color="#222b1e" />
          <stop offset=".6" stop-color="#10180f" />
          <stop offset="1" stop-color="#050a06" />
        </radialGradient>
        <radialGradient id="${prefix}-potion" cx=".44" cy=".35" r=".75">
          <stop stop-color="#efffa5" />
          <stop offset=".32" stop-color="#c7e26c" />
          <stop offset=".68" stop-color="#8db53e" />
          <stop offset="1" stop-color="#406d25" />
        </radialGradient>
        <radialGradient id="${prefix}-bubble" cx=".3" cy=".25" r=".8">
          <stop stop-color="#f4ffd0" stop-opacity=".9" />
          <stop offset=".4" stop-color="#c2df72" stop-opacity=".45" />
          <stop offset="1" stop-color="#5e8a32" stop-opacity=".8" />
        </radialGradient>
        <linearGradient id="${prefix}-steam" x1="0" y1="1" x2="0" y2="0">
          <stop stop-color="#c3df89" stop-opacity=".8" />
          <stop offset="1" stop-color="#dfe9be" stop-opacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="300" cy="415" rx="245" ry="62" fill="url(#${prefix}-hearth)" />
      <ellipse cx="300" cy="426" rx="210" ry="34" fill="#060b07" opacity=".68" />
      <path d="m132 396 29-21 47-9 45 7 47-6 43 5 48-6 47 16 30 22-2 26-50 16H181l-47-20Z" fill="#242b20" stroke="#151d14" stroke-width="3" />
      <g fill="url(#${prefix}-stone)" stroke="#1c251a" stroke-width="2" stroke-linejoin="round">
        <path d="m136 395 32-17 42-5 6 22-40 12-39 4Z" />
        <path d="m216 373 43-3 37 8-4 21-41-1-34-5Z" />
        <path d="m303 377 43-5 41 1 4 23-44 4-42-2Z" />
        <path d="m394 374 40 10 28 15-2 14-40-5-27-13Z" />
      </g>
      <ellipse cx="300" cy="402" rx="159" ry="25" fill="url(#${prefix}-hearth)" />

      <g stroke="#101810" stroke-width="4" stroke-linejoin="round">
        <path d="m190 359-15 48c-1 5 2 9 7 9h35c5 0 8-4 7-9l-9-38Z" fill="url(#${prefix}-iron)" />
        <path d="m410 359 15 48c1 5-2 9-7 9h-35c-5 0-8-4-7-9l9-38Z" fill="url(#${prefix}-iron)" />
      </g>
      <path d="M183 408h32m170 0h32" fill="none" stroke="#8e8054" stroke-width="3" opacity=".6" />

      <g fill="none" stroke-linecap="round">
        <path d="M148 204c-34-32-69-9-66 22 3 32 39 49 66 29m304-51c34-32 69-9 66 22-3 32-39 49-66 29" stroke="#0a100c" stroke-width="22" />
        <path d="M148 204c-34-32-69-9-66 22 3 32 39 49 66 29m304-51c34-32 69-9 66 22-3 32-39 49-66 29" stroke="url(#${prefix}-brass)" stroke-width="14" />
        <path d="M131 200c-24-12-44 3-43 23m381-23c24-12 44 3 43 23" stroke="#e0c087" stroke-width="2" opacity=".8" />
      </g>

      <path d="M145 167c-20 46-20 111 1 158 24 52 77 74 154 74s130-22 154-74c21-47 21-112 1-158Z" fill="url(#${prefix}-iron)" stroke="#10180f" stroke-width="4" />
      <path d="M153 206c-11 46-3 101 23 129 20 22 43 35 66 40-32-33-45-76-43-120 1-21 5-39 10-54Z" fill="#abb59d" opacity=".09" />
      <path d="M158 215c-8 33-3 66 7 91" fill="none" stroke="#c1cdb0" stroke-width="4" stroke-linecap="round" opacity=".2" />
      <path d="M448 211c11 37 7 83-10 113-16 28-45 48-69 54 28-34 42-75 44-114 1-23-1-41-7-57Z" fill="#040a06" opacity=".37" />
      <path d="M454 223c9 37 2 77-16 104" fill="none" stroke="#8daa6c" stroke-width="2.5" opacity=".2" />
      <path d="M188 357c59 35 166 39 226 0" fill="none" stroke="#9fa88c" stroke-width="2" opacity=".15" />
      <path d="m207 226 7-3m-41 46 5-2m239-33 6 3m-17 99 6-4m-176 34 9 1" fill="none" stroke="#a1ac93" stroke-width="1.5" stroke-linecap="round" opacity=".25" />

      <g fill="url(#${prefix}-brass)" stroke="#2a2a1c" stroke-width="2.5">
        <path d="m138 210 13-5 9 15-2 26-16 4-7-15Z" />
        <path d="m462 210-13-5-9 15 2 26 16 4 7-15Z" />
        <circle cx="148" cy="223" r="4" />
        <circle cx="452" cy="223" r="4" />
      </g>
      <path d="M147 217v10m306-10v10" stroke="#f1d29a" stroke-width="1.5" opacity=".6" />

      <ellipse cx="300" cy="172" rx="171" ry="47" fill="url(#${prefix}-rim)" stroke="#172113" stroke-width="4" />
      <ellipse cx="300" cy="164" rx="154" ry="34" fill="#080f08" stroke="#b5bb93" stroke-width="1.5" />
      ${liquid}
      <path d="M136 169c17 24 86 41 164 41s147-17 164-41" fill="none" stroke="#c0c7a4" stroke-width="2" opacity=".6" />
      <path d="M145 150c27-15 86-24 155-24s128 9 155 24" fill="none" stroke="#d5d6b3" stroke-width="2.5" opacity=".75" />
      <path d="M151 184c35 19 92 28 149 28s114-9 149-28" fill="none" stroke="#1c2918" stroke-width="4" opacity=".68" />

      <g fill="none" stroke="url(#${prefix}-brass)" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="300" cy="294" r="49" stroke-width="2.5" opacity=".7" />
        <circle cx="300" cy="294" r="43" stroke-width="1" opacity=".45" />
        <path d="M300 237v7m0 100v7m-57-57h7m100 0h7" stroke-width="2" />
      </g>
      <g fill="none" stroke="#bfe574" stroke-linecap="round" stroke-linejoin="round">
        <g stroke-width="9" opacity=".14">
          <path d="m300 259-30 53h60Z" />
          <path d="M280 294h40" />
          <circle cx="300" cy="294" r="4" />
        </g>
        <path d="m300 259-30 53h60Z" stroke-width="2.5" />
        <path d="M280 294h40" stroke-width="2" />
        <circle cx="300" cy="294" r="4" stroke-width="1.5" />
      </g>
      <path d="m300 261-27 49" fill="none" stroke="#e8ffb0" stroke-width=".8" opacity=".55" />

      <g fill="url(#${prefix}-stone)" stroke="#20291d" stroke-width="2" stroke-linejoin="round">
        <path d="m132 414 43-8 35 10-5 22-30 8-39-15Z" />
        <path d="m212 418 39-10 44 8 1 25-44 8-42-8Z" />
        <path d="m301 417 44-9 39 10 5 23-43 8-45-8Z" />
        <path d="m391 416 34-10 43 8-4 17-40 15-29-8Z" />
      </g>
      <path d="m145 416 27-3 20 6m30 2 28-6 30 6m34 0 30-6 27 6m29-1 22-7 31 5" fill="none" stroke="#b3b49a" stroke-width="1.5" stroke-linecap="round" opacity=".33" />
      <path d="m168 414 6 10-5 8m82-16 5 10-5 8m93-18-6 10 4 9m82-21-5 10 6 8" fill="none" stroke="#283424" stroke-width="1.5" />
    </svg>
  `;
}

type IngredientName = 'dragon' | 'fairy' | 'lotus' | 'mandrake' | 'acid' | 'void';

interface IngredientPalette {
  light: string;
  medium: string;
  dark: string;
}

const ingredientPalettes: Record<IngredientName, IngredientPalette> = {
  dragon: { light: '#b5f5f1', medium: '#4bafbd', dark: '#153c47' },
  fairy: { light: '#edd0ff', medium: '#ad79cf', dark: '#3c2655' },
  lotus: { light: '#e1f6ff', medium: '#85bad8', dark: '#25465e' },
  mandrake: { light: '#d2cf9b', medium: '#91905b', dark: '#3e4828' },
  acid: { light: '#eef9af', medium: '#b6d354', dark: '#445c27' },
  void: { light: '#d8bbff', medium: '#9370c4', dark: '#2c2048' },
};

const bottlePaths: Record<IngredientName, string> = {
  dragon: 'M24 17h16v11c0 4 12 6 13 18l-1 12c-1 7-8 10-20 10S13 65 12 58l-1-12c1-12 13-14 13-18Z',
  fairy: 'M24 17h16v10l11 10 3 16-5 12H15l-5-12 3-16 11-10Z',
  lotus: 'M23 17h18v9c0 3 9 5 10 10v24c0 5-6 8-19 8s-19-3-19-8V36c1-5 10-7 10-10Z',
  mandrake: 'M23 17h18v10l9 6 2 8v19c0 5-7 8-20 8s-20-3-20-8V41l2-8 9-6Z',
  acid: 'M25 17h14v13l16 28c3 6-3 10-23 10S6 64 9 58l16-28Z',
  void: 'M24 17h16v11c0 4 14 9 14 22 0 12-9 18-22 18s-22-6-22-18c0-13 14-18 14-22Z',
};

function ingredientMaterial(name: IngredientName, prefix: string): string {
  switch (name) {
    case 'dragon':
      return `
        <ellipse cx="32" cy="59" rx="17" ry="5" fill="url(#${prefix}-material)" opacity=".8" />
        <path d="M33 29c-4 7-13 13-13 21a12 12 0 0 0 24 0c0-8-7-14-11-21Z" fill="url(#${prefix}-material)" stroke="#abeee8" stroke-width=".8" />
        <path d="M29 39c-3 4-6 7-6 11 0 3 1 5 3 6" fill="none" stroke="#e2fff5" stroke-width="2.5" stroke-linecap="round" opacity=".75" />
        <circle cx="41" cy="39" r="1.4" fill="#c8fff1" />
      `;
    case 'fairy':
      return `
        <path d="M13 48c13-7 26-3 38-1l-3 15H17Z" fill="url(#${prefix}-material)" opacity=".78" />
        <g fill="#e2b7f9">
          <circle cx="22" cy="53" r="1.3" /><circle cx="36" cy="58" r="1.5" />
          <circle cx="43" cy="51" r="1" /><circle cx="29" cy="61" r=".9" />
          <circle cx="20" cy="60" r=".8" /><circle cx="41" cy="62" r=".7" />
          <circle cx="29" cy="44" r="1" /><circle cx="38" cy="36" r=".9" />
        </g>
        <path d="m31 32 2.2 6.4L39 41l-5.8 2.6L31 50l-2.2-6.4L23 41l5.8-2.6Z" fill="#f4d8ff" />
        <path d="m43 40 .9 2.6 2.6.9-2.6.9L43 47l-.9-2.6-2.6-.9 2.6-.9Z" fill="#ffedca" />
      `;
    case 'lotus':
      return `
        <path d="M32 47v17m0-6c-8 1-13-1-15-6 6-1 11 1 15 6Zm0 3c8 0 12-3 15-8-7-1-12 2-15 8Z" fill="#658f86" stroke="#a2c0ac" stroke-width=".6" />
        <path d="M32 52c-10-5-12-14 0-25 12 11 10 20 0 25Z" fill="url(#${prefix}-material)" stroke="#e1f9ff" stroke-width=".7" />
        <path d="M32 52c-12 0-18-8-17-18 10 1 16 8 17 18Z" fill="#79a6c8" stroke="#d9f4ff" stroke-width=".7" />
        <path d="M32 52c12 0 18-8 17-18-10 1-16 8-17 18Z" fill="#a9d4e9" stroke="#effaff" stroke-width=".7" />
        <path d="M32 53c-10 6-19 1-22-8 10-2 17 1 22 8Z" fill="#98bfd8" stroke="#d6effd" stroke-width=".7" />
        <path d="M32 53c10 6 19 1 22-8-10-2-17 1-22 8Z" fill="#bfdced" stroke="#eafaff" stroke-width=".7" />
        <path d="M32 32v18" fill="none" stroke="#fff" stroke-width="1" opacity=".55" />
      `;
    case 'mandrake':
      return `
        <path d="M31 35c-9-2-13 3-11 12l-4 8 6-2 1 11 7-9 2 11 5-11 6 7-1-12 6 1-7-10c0-7-4-9-10-6Z" fill="url(#${prefix}-material)" stroke="#c4bc81" stroke-width=".8" />
        <path d="M31 36c-2-9-10-12-15-10 2 8 8 11 15 10Zm1-1c7 0 13-4 14-11-8 1-12 4-14 11Z" fill="#8e9d55" stroke="#c5cf8a" stroke-width=".6" />
        <path d="m29 39-2 11 2 4m8-15-2 10 3 3m-13 8-3 6m15-5 4 5" fill="none" stroke="#615c36" stroke-width="1.2" stroke-linecap="round" />
        <path d="m26 43 3 1m5 0 3-1m-7 6 3 1" stroke="#3b3a22" stroke-width="1.3" stroke-linecap="round" />
      `;
    case 'acid':
      return `
        <path d="M16 47c10-5 23 4 32 0l9 15c-10 7-40 7-50 0Z" fill="url(#${prefix}-material)" />
        <path d="M16 47c11-4 23 4 32 0" fill="none" stroke="#edf8b6" stroke-width="1.5" />
        <g fill="none" stroke="#eefdb4" stroke-width="1">
          <circle cx="25" cy="55" r="2.4" /><circle cx="39" cy="58" r="3" />
          <circle cx="33" cy="42" r="1.8" />
        </g>
        <path d="m33 23-2 8h5l-3 7" fill="none" stroke="#ccd591" stroke-width="1.2" opacity=".7" />
      `;
    case 'void':
      return `
        <circle cx="32" cy="48" r="16" fill="url(#${prefix}-material)" />
        <circle cx="33" cy="48" r="6" fill="#21162f" />
        <path d="M22 39c11-10 25 1 20 12-3 7-13 8-18 2-4-4-2-11 4-13 5-2 10 2 9 6" fill="none" stroke="#d3adf6" stroke-width="2" stroke-linecap="round" />
        <path d="M20 53c2 9 16 15 24 4M27 34c8-3 16 2 18 8" fill="none" stroke="#9d7ac2" stroke-width="1" />
        <path d="m44 32 .8 2.2 2.2.8-2.2.8L44 38l-.8-2.2L41 35l2.2-.8Z" fill="#f0dfff" />
        <circle cx="20" cy="45" r="1" fill="#eedbff" />
      `;
  }
}

function isIngredientName(name: IconName): name is IngredientName {
  return Object.hasOwn(ingredientPalettes, name);
}

export function ingredientIllustration(name: IconName): string {
  if (!isIngredientName(name)) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" class="ingredient-illustration" width="64" height="72" viewBox="0 0 64 72" aria-hidden="true" focusable="false">
        <g transform="translate(20 24)">${icon(name)}</g>
      </svg>
    `;
  }

  const prefix = illustrationPrefix(name);
  const palette = ingredientPalettes[name];
  const bottle = bottlePaths[name];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="ingredient-illustration ingredient-illustration--${name}" width="64" height="72" viewBox="0 0 64 72" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${prefix}-glass" x1="0" y1="0" x2="1" y2=".2">
          <stop stop-color="#222c2b" />
          <stop offset=".18" stop-color="${palette.dark}" />
          <stop offset=".36" stop-color="${palette.medium}" stop-opacity=".5" />
          <stop offset=".67" stop-color="#20282a" />
          <stop offset=".9" stop-color="${palette.dark}" />
          <stop offset="1" stop-color="${palette.medium}" stop-opacity=".7" />
        </linearGradient>
        <radialGradient id="${prefix}-material" cx=".35" cy=".28" r=".82">
          <stop stop-color="${palette.light}" />
          <stop offset=".5" stop-color="${palette.medium}" />
          <stop offset="1" stop-color="${palette.dark}" />
        </radialGradient>
        <linearGradient id="${prefix}-copper" x1="0" y1="0" x2="1" y2=".3">
          <stop stop-color="#715335" />
          <stop offset=".35" stop-color="#dec18b" />
          <stop offset=".64" stop-color="#a98551" />
          <stop offset="1" stop-color="#5b432c" />
        </linearGradient>
        <linearGradient id="${prefix}-cork" x1="0" y1="0" x2="1" y2="0">
          <stop stop-color="#705036" />
          <stop offset=".35" stop-color="#c49b62" />
          <stop offset="1" stop-color="#8f653e" />
        </linearGradient>
        <clipPath id="${prefix}-bottle-clip"><path d="${bottle}" /></clipPath>
      </defs>
      <ellipse cx="32" cy="68" rx="23" ry="3" fill="#020806" opacity=".4" />
      <path d="${bottle}" fill="url(#${prefix}-glass)" stroke="#a79874" stroke-width="1.2" />
      <g clip-path="url(#${prefix}-bottle-clip)">
        ${ingredientMaterial(name, prefix)}
        <path d="M19 35c-3 5-3 13-2 21" fill="none" stroke="#edffe8" stroke-width="2.2" stroke-linecap="round" opacity=".32" />
        <path d="M47 39c2 8 2 15-1 21" fill="none" stroke="${palette.light}" stroke-width="1" stroke-linecap="round" opacity=".45" />
        <path d="M18 62c7 4 21 5 29 0" fill="none" stroke="${palette.light}" stroke-width=".8" opacity=".45" />
      </g>
      <path d="M26 6h12l1 10H25Z" fill="url(#${prefix}-cork)" stroke="#cfad77" stroke-width=".7" />
      <ellipse cx="32" cy="6" rx="6" ry="1.7" fill="#cfaa72" stroke="#7f5d3c" stroke-width=".7" />
      <path d="m28 8 1 5m5-5v3m3 0-1 3" stroke="#6d4b32" stroke-width=".8" opacity=".7" />
      <rect x="22" y="15" width="20" height="5" rx="1.3" fill="url(#${prefix}-copper)" stroke="#5c4b31" stroke-width=".7" />
      <path d="M24 16.5h15M26 21v5m12-5v5" fill="none" stroke="#f1d9aa" stroke-width=".8" opacity=".6" />
      <path d="M26 28c2 1 10 1 12 0" fill="none" stroke="#b7bc9d" stroke-width=".8" opacity=".45" />
    </svg>
  `;
}

export function workshopScenery(): string {
  const prefix = illustrationPrefix('workshop');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="workshop-scenery" width="900" height="620" viewBox="0 0 900 620" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="${prefix}-candle">
          <stop stop-color="#d8b96a" stop-opacity=".18" />
          <stop offset="1" stop-color="#c19f50" stop-opacity="0" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="#85816a" stroke-width="2" opacity=".12">
        <path d="M46 588V210C46 69 249 24 302 193v395M67 588V210C67 91 237 54 281 198v390" />
        <path d="M598 588V193C651 24 854 69 854 210v378M619 588V198C663 54 833 91 833 210v378" />
        <path d="m55 167 23 8m-3-55 22 14m24-51 12 24m36-40v25m47-17-7 24m47 5-16 18m-186 144h24m-24 106h24m-24 111h24m207-215h24m-24 106h24m-24 111h24" />
        <path d="m845 167-23 8m3-55-22 14m-24-51-12 24m-36-40v25m-47-17 7 24m-47 5 16 18m186 144h-24m24 106h-24m24 111h-24m-207-215h-24m24 106h-24m24 111h-24" />
      </g>
      <g opacity=".18">
        <path d="M87 340h171v9H87Zm555 0h171v9H642Z" fill="#9b8153" />
        <path d="M106 339v-35l7-8v-13h12v13l7 8v35Zm45 0v-25l8-7v-17h9v17l9 7v25Z" fill="#66765b" stroke="#b4ab7f" stroke-width="1" />
        <path d="M700 339v-40l8-9v-10h12v10l8 9v40Z" fill="#6a6678" stroke="#b4ab7f" stroke-width="1" />
      </g>
      <ellipse cx="774" cy="300" rx="65" ry="83" fill="url(#${prefix}-candle)" />
      <g opacity=".4">
        <path d="M767 339v-36h14v36" fill="#ab9f72" stroke="#d0ba80" stroke-width="1" />
        <path d="M774 302c-12-10-2-18 0-26 8 10 10 19 0 26Z" fill="#d6bd72" />
        <path d="M774 300c-5-5-1-8 0-12 3 5 4 9 0 12Z" fill="#f2dda5" />
      </g>
    </svg>
  `;
}
