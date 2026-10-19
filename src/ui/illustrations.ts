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

export function workshopScenery(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="workshop-scenery" width="900" height="620" viewBox="0 0 320 224" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
      <rect width="320" height="224" fill="#161820" />
      <g class="workshop-masonry">
        <g fill="#1e2029">
          <path d="M0 4h48v26H0z M51 4h61v26H51z M115 4h67v26h-67z M185 4h68v26h-68z M256 4h64v26h-64z" />
          <path d="M0 33h23v29H0z M26 33h58v29H26z M87 33h69v29H87z M159 33h59v29h-59z M221 33h69v29h-69z M293 33h27v29h-27z" />
          <path d="M0 65h49v28H0z M52 65h67v28H52z M122 65h63v28h-63z M188 65h67v28h-67z M258 65h62v28h-62z" />
          <path d="M0 96h23v29H0z M26 96h62v29H26z M91 96h65v29H91z M159 96h65v29h-65z M227 96h63v29h-63z M293 96h27v29h-27z" />
          <path d="M0 128h51v30H0z M54 128h64v30H54z M121 128h63v30h-63z M187 128h68v30h-68z M258 128h62v30h-62z" />
          <path d="M0 161h26v29H0z M29 161h58v29H29z M90 161h66v29H90z M159 161h63v29h-63z M225 161h68v29h-68z M296 161h24v29h-24z" />
          <path d="M0 193h51v27H0z M54 193h64v27H54z M121 193h64v27h-64z M188 193h67v27h-67z M258 193h62v27h-62z" />
        </g>
        <g fill="#252733">
          <path d="M53 6h56v22H53z M187 6h64v22h-64z M28 35h54v25H28z M260 67h58v24h-58z M28 98h58v25H28z M229 98h59v25h-59z M56 130h60v26H56z M31 163h54v25H31z M227 163h64v25h-64z" />
        </g>
        <g fill="#2e303c" opacity=".55">
          <path d="M3 4h39v1H3z M54 4h49v1H54z M188 4h58v1h-58z M29 33h47v1H29z M224 33h57v1h-57z M3 65h38v1H3z M261 65h48v1h-48z M29 96h49v1H29z M230 96h52v1h-52z M57 128h51v1H57z M261 128h50v1h-50z M32 161h47v1H32z M228 161h53v1h-53z M3 193h39v1H3z M261 193h48v1h-48z" />
        </g>
        <g fill="#161820">
          <path d="M47 24h2v6h-2z M78 33h6v2h-6z M258 65h5v2h-5z M26 119h3v6h-3z M287 118h3v7h-3z M54 128h5v2h-5z M81 184h6v6h-6z M290 161h3v4h-3z" />
        </g>
      </g>

      <g class="workshop-niche">
        <path d="M140 25h40v5h12v7h9v10h7v14h5v163H107V61h5V47h7V37h9v-7h12z" fill="#24232d" />
        <path d="M141 34h38v5h11v8h8v13h6v164h-88V60h6V47h8v-8h11z" fill="#11131a" />
        <g fill="#2e303c">
          <path d="M140 25h40v2h-40z M129 30h11v2h-11z M120 37h8v2h-8z M113 47h6v2h-6z M108 61h4v46h-4z M108 111h4v39h-4z M108 154h4v39h-4z" />
        </g>
        <g fill="#161820">
          <path d="M128 32h2v6h-2z M118 41h2v7h-2z M111 58h6v2h-6z M108 107h8v3h-8z M108 150h8v3h-8z M108 193h8v3h-8z M204 107h8v3h-8z M204 150h8v3h-8z M204 193h8v3h-8z" />
        </g>
        <path d="M118 203h84v4h-84z M114 207h92v5h-92z M110 212h100v12H110z" fill="#1e2029" />
      </g>

      <g class="workshop-shelves">
        <path d="M14 117h78v4H14z M19 121h5v9h-5z M82 121h5v9h-5z M227 107h79v4h-79z M232 111h5v8h-5z M296 111h5v8h-5z" fill="#11131a" />
        <path d="M14 116h78v2H14z M227 106h79v2h-79z" fill="#37313e" />
        <path d="M27 91h7v5h3v18H24V96h3z M67 99h9v4h3v11H64v-11h3z M243 86h6v6h3v12h-12V92h3z" fill="#37313e" />
        <path d="M27 97h2v13h-2z M67 104h2v7h-2z M243 93h2v8h-2z" fill="#4d3c3a" />
        <path d="M45 102h10v12H45z M47 99h6v3h-6z M264 90h5v14h-5z M270 92h4v12h-4z" fill="#4d3c3a" />
        <path d="M45 103h2v8h-2z M264 90h2v14h-2z" fill="#74604c" opacity=".45" />
      </g>

      <g class="workshop-accent" opacity=".7">
        <path d="M285 94h5v10h-5z M283 104h9v2h-9z" fill="#74604c" />
        <path d="M287 83h1v2h1v3h1v3h-1v2h-3v-2h-1v-3h1v-3h1z" fill="#a88a5b" />
        <path d="M287 88h1v4h-1z" fill="#cbc097" />
        <path d="M72 71h2v2h-2z M74 69h2v2h-2z M76 71h2v2h-2z M74 73h2v2h-2z" fill="#37313e" />
      </g>
    </svg>
  `;
}
