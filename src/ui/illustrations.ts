export function cauldronIllustration(filled = false): string {
  const title = filled ? 'Potion cauldron' : 'Empty cauldron';
  const runeColor = filled ? '#d5e991' : '#b79a70';
  const contents = filled
    ? `
      <path d="M38 33h52v2h10v2h4v2h-4v2H90v2H38v-2H28v-2h-4v-2h4v-2h10z" fill="#9bb85b" />
      <path d="M28 37h10v-2h52v2h10v2H88v2H40v-2H28z" fill="#c8df80" />
      <path d="M38 35h24v2H38z M66 35h8v2h-8z M30 37h8v2h-8z" fill="#ecf3b4" />
      <path d="M42 41h44v2H42z M92 39h8v2h-8z" fill="#718a43" />
      <g class="potion-bubble">
        <path d="M42 31h4v2h2v4h-2v2h-4v-2h-2v-4h2z" fill="#718a43" />
        <path d="M42 33h4v4h-4z" fill="#ecf3b4" />
        <path d="M44 35h2v2h-2z" fill="#c8df80" />
      </g>
      <g class="potion-bubble">
        <path d="M80 32h4v2h2v4h-2v2h-4v-2h-2v-4h2z" fill="#718a43" />
        <path d="M80 34h4v4h-4z" fill="#ecf3b4" />
      </g>
      <g class="potion-bubble">
        <path d="M66 25h4v2h2v4h-2v2h-4v-2h-2v-4h2z" fill="#718a43" />
        <path d="M66 27h4v4h-4z" fill="#ecf3b4" />
      </g>
      <g class="potion-steam" fill="#a5bd91">
        <path d="M47 28v-5h-2v-5h2v-5h2v-4h2v6h-2v5h-2v3h2v5z" />
        <path d="M62 25v-5h2v-4h-2v-5h2V5h2v8h-2v3h2v5h-2v4z" />
        <path d="M79 27v-5h2v-4h-2v-5h2v-4h2v6h-2v3h2v5h-2v4z" />
      </g>
    `
    : `
      <path d="M38 33h52v2h10v2h4v2h-4v2H90v2H38v-2H28v-2h-4v-2h4v-2h10z" fill="#15121d" />
      <path d="M38 33h52v2h10v2H90v-2H38v2H28v-2h10z" fill="#0d0b13" />
      <path d="M40 41h48v2H40z M30 39h10v2H30z" fill="#312b3b" />
    `;

  const handle = `
    <path d="M18 40h10v4h4v4h2v10h-4v4H18v-2h-6v-4H8V46h4v-4h6z M18 47v2h-2v5h3v2h6v-2h3v-5h-2v-2z" fill="#100e18" fill-rule="evenodd" />
    <path d="M18 43h9v3h3v3h1v6h-4v4h-8v-2h-5v-3h-2v-7h3v-2h3z M18 47v2h-2v5h3v2h6v-2h3v-5h-2v-2z" fill="#a57b50" fill-rule="evenodd" />
    <path d="M18 43h8v2h-8z M14 46h4v2h-4z M12 48h2v6h-2z" fill="#ddc38e" />
    <path d="M19 57h8v2h-8z M28 52h3v3h-3z" fill="#70513d" />`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="cauldron-illustration" width="600" height="480" viewBox="0 0 128 104" shape-rendering="crispEdges" role="img" aria-label="${title}" focusable="false">
      <title>${title}</title>
      <g class="cauldron-hearth">
        <path d="M24 88h80v2h10v6h4v4h-10v2H20v-2H10v-4h4v-6h10z" fill="#100e18" />
        <path d="M24 90h16v6H18v-4h6z M42 89h20v8H40v-3h2z M64 89h20v8H64z M86 90h18v2h6v4H86z" fill="#514554" />
        <path d="M24 90h14v2H24z M44 89h16v2H44z M66 89h16v2H66z M88 90h14v2H88z" fill="#796877" />
        <path d="M18 97h20v3H20v-1h-2z M40 98h22v2H40z M64 98h20v2H64z M86 97h24v2h-4v1H86z" fill="#312b3b" />
        <path d="M30 92h2v4h-2z M52 91h2v3h-2v3h-2v-4h2z M74 92h2v4h-2z M96 92h2v3h2v1h-4z" fill="#312b3b" />
      </g>
      <g class="cauldron-feet" fill="#100e18">
        <path d="M35 78h12v8h-3v7h-3v2H30v-5h2v-6h3z" />
        <path d="M81 78h12v6h3v6h2v5H87v-2h-3v-7h-3z" />
        <path d="M36 82h7v5h-3v5h-7v-2h2v-5h1z M85 82h6v3h2v5h2v2h-7v-5h-3z" fill="#514554" />
        <path d="M34 90h6v2h-6z M88 90h6v2h-6z" fill="#a57b50" />
      </g>
      <g class="cauldron-handles">
        ${handle}
        <g transform="translate(128 0) scale(-1 1)">${handle}</g>
      </g>
      <g class="cauldron-body">
        <path d="M28 38h72v4h4v22h-4v10h-4v6h-8v6h-8v4H48v-4h-8v-4h-8v-8h-4V64h-4V46h4z" fill="#100e18" />
        <path d="M30 44h68v6h2v13h-4v10h-6v6H80v6H48v-3h-8v-6h-6V66h-4z" fill="#403747" />
        <path d="M32 48h12v4h-3v14h3v9h6v5h-8v-5h-5v-8h-3V57h-2z" fill="#625666" />
        <path d="M34 50h4v13h-2v-7h-2z M39 69h3v5h-3z" fill="#91818b" />
        <path d="M48 50h35v8h-5v20H56v-4h-8z" fill="#493f50" />
        <path d="M86 48h12v2h2v13h-4v10h-6v6H80v6H64v-4h14v-6h5V63h3z" fill="#292331" />
        <path d="M46 82h34v3H48v-1h-2z M53 86h24v2H53z" fill="#201b29" />
        <path d="M43 57h3v2h-3z M86 65h3v2h-3z M45 73h2v2h-2z M77 79h3v2h-3z" fill="#625666" />
      </g>
      <g class="cauldron-rivets">
        <path d="M29 45h7v3h2v9h-2v2h-6v-3h-2v-8h1z M92 45h7v3h1v8h-2v3h-6v-2h-2v-9h2z" fill="#70513d" />
        <path d="M30 46h5v3h1v6h-5v-2h-1z M93 46h4v3h1v4h-1v2h-5v-6h1z" fill="#b79a70" />
        <path d="M32 49h2v3h-2z M94 49h2v3h-2z" fill="#403747" />
      </g>
      <g class="cauldron-rim">
        <path d="M38 28h52v2h10v2h8v4h4v6h-4v4h-8v2H28v-2h-8v-4h-4v-6h4v-4h8v-2h10z" fill="#100e18" />
        <path d="M38 30h52v2h10v2h6v3h2v4h-8v3H28v-3h-8v-4h2v-3h6v-2h10z" fill="#91818b" />
        <path d="M38 30h52v2H38z M28 32h10v2H28z M22 35h6v2h-6z" fill="#c4b3a8" />
        <path d="M28 42h72v2H90v2H38v-2H28z M100 39h8v3h-8z" fill="#625666" />
        <path d="M38 32h52v2h10v2h6v4h-6v2H90v2H38v-2H28v-2h-6v-4h6v-2h10z" fill="#292331" />
      </g>
      ${contents}
      <g class="cauldron-emblem">
        <path d="M57 52h14v2h4v4h2v14h-2v4h-4v2H57v-2h-4v-4h-2V58h2v-4h4z" fill="#70513d" />
        <path d="M58 54h12v2h4v4h1v10h-2v4h-4v2H59v-2h-4v-4h-2V60h2v-4h3z" fill="#b79a70" />
        <path d="M59 57h10v2h3v12h-3v3H59v-3h-3V59h3z" fill="#292331" />
        <path d="M63 58h2v4h-2z M61 62h2v4h-2z M65 62h2v4h-2z M59 66h2v4h-2z M67 66h2v4h-2z M57 70h2v4h-2z M69 70h2v4h-2z M59 72h10v2H59z M60 69h8v1h-8z" fill="${runeColor}" />
        <path d="M59 54h9v1h-9z" fill="${runeColor}" />
      </g>
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
