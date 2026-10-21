export function cauldronIllustration(filled = false): string {
  const title = filled ? 'Potion cauldron' : 'Empty cauldron';
  const contents = filled
    ? `
      <path d="M43 17H85V18H94V20H97V23H92V25H36V23H31V20H34V18H43z" fill="#718a43" />
      <path d="M43 19H85V20H94V23H85V24H43V23H34V20H43z" fill="#c8df80" />
      <path d="M43 19H60V20H43zM64 19H71V20H64zM36 20H43V21H36z" fill="#ecf3b4" />
      <path d="M48 22H73V23H48zM78 21H87V22H78z" fill="#9bb85b" />
      <g class="potion-bubble">
        <path d="M45 15H48V17H50V21H48V23H45V21H43V17H45z" fill="#718a43" />
        <path d="M45 17H48V21H45z" fill="#ecf3b4" />
        <path d="M46 19H48V21H46z" fill="#c8df80" />
      </g>
      <g class="potion-bubble">
        <path d="M78 16H82V18H83V22H82V24H78V22H76V18H78z" fill="#718a43" />
        <path d="M78 18H82V22H78z" fill="#ecf3b4" />
      </g>
      <g class="potion-bubble">
        <path d="M66 11H69V13H71V17H69V19H66V17H64V13H66z" fill="#718a43" />
        <path d="M66 13H69V17H66z" fill="#ecf3b4" />
      </g>
      <g class="potion-steam" fill="#a5bd91">
        <path d="M49 13V10H47V8H49V5H51V3H53V7H51V9H49V10H51V13z" />
        <path d="M61 11V8H63V7H61V4H63V2H65V5H63V7H65V9H63V11z" />
        <path d="M77 13V11H79V9H77V7H79V4H81V8H79V9H81V11H79V13z" />
      </g>
    `
    : `
      <path d="M43 17H85V18H94V20H97V23H92V25H36V23H31V20H34V18H43z" fill="#211c26" />
      <path d="M43 17H85V18H94V20H85V19H43V20H34V18H43z" fill="#17141d" />
      <path d="M38 22H46V23H82V22H90V24H38z" fill="#453d49" />
    `;

  const handle = `
    <path d="M10 19H22V21H28V25H32V33H28V41H24V47H18V43H14V37H10V29H6V23H10zM14 25V29H16V35H20V31H24V27H20V25z" fill="#17141d" fill-rule="evenodd" />
    <path d="M10 21H22V23H26V27H30V31H26V39H22V44H18V39H14V33H12V27H10zM14 25V29H16V35H20V31H24V27H20V25z" fill="#615660" fill-rule="evenodd" />
    <path d="M10 21H20V23H10zM8 23H12V27H8zM12 29H14V33H12zM14 33H16V37H14z" fill="#a38f95" />
    <path d="M20 21H22V23H20zM24 25H26V29H24zM18 39H22V43H18zM16 35H18V39H16z" fill="#453d49" />`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" class="cauldron-illustration" width="600" height="480" viewBox="0 0 128 104" shape-rendering="crispEdges" role="img" aria-label="${title}" focusable="false">
      <title>${title}</title>
      <path d="M30 99h68v1h8v2H22v-2h8z" fill="#111019" />
      <g class="cauldron-handles">
        ${handle}
        <g transform="translate(128 0) scale(-1 1)">${handle}</g>
      </g>
      <g class="cauldron-feet">
        <path d="M32 82h14v7h-5v5h-2v2h2v4h-4v2H24v-2h-4v-5h5v-3h3v-6h4z M82 82h14v4h4v6h3v3h5v5h-4v2H91v-2h-4v-4h2v-2h-2v-5h-5z" fill="#17141d" />
        <path d="M33 85h10v3h-5v5h-3v4h3v2H25v-1h-3v-2h6v-4h3v-5h2z M85 85h10v2h2v5h3v4h6v2h-3v1H90v-2h3v-4h-3v-5h-5z" fill="#615660" />
        <path d="M33 85h8v2h-8z M31 87h6v3h-6z M24 96h5v2h-5z M88 85h7v2h-7z M91 87h6v3h-6z M98 96h6v2h-6z" fill="#a38f95" />
        <path d="M30 91h5v4h-5z M92 91h5v4h-5z M29 99h7v1h-7z M94 99h7v1h-7z" fill="#453d49" />
      </g>
      <g class="cauldron-body">
        <path d="M30 30H98V35H104V39H108V46H112V55H114V67H112V76H108V83H102V88H94V90H34V88H26V83H20V76H16V67H14V55H16V46H20V39H24V35H30z" fill="#17141d" />
        <path d="M32 32H96V37H102V42H106V48H110V58H112V65H110V74H106V81H100V85H92V88H36V85H28V81H22V74H18V65H16V58H18V48H22V42H26V37H32z" fill="#615660" />
        <path d="M34 35H94V39H100V44H104V51H108V72H104V78H98V83H82V85H48V81H36V74H30V53H34z" fill="#7e6f78" />
        <path d="M34 35H48V39H40V46H36V69H40V78H46V83H56V88H36V85H28V81H22V74H18V65H16V58H18V48H22V42H26V37H34z" fill="#453d49" />
        <path d="M28 42H34V46H30V58H28V69H30V76H34V81H28V78H24V72H20V55H22V48H26V44H28z" fill="#302a35" />
        <path d="M56 39H80V44H92V53H98V74H92V81H62V76H54V51H56z" fill="#a38f95" />
        <path d="M64 43H76V47H84V57H88V72H84V78H68V74H62V53H64z" fill="#b6a0a5" />
        <path d="M98 42H104V51H108V72H104V78H98V83H82V85H56V83H78V78H92V72H98z" fill="#615660" />
        <path d="M36 83H48V85H82V83H98V85H92V88H36zM46 88H82V89H46z" fill="#302a35" />
      </g>
      <g class="cauldron-patina" fill="#615660">
        <path d="M42 42H48V46H44V53H40V46H42zM52 37H58V42H56V46H52zM72 37H80V39H84V44H80V42H72zM88 42H92V46H90V51H86V46H88z" />
        <path d="M50 53H54V60H52V65H48V58H50zM76 53H80V58H84V62H82V67H76V62H78V58H76zM90 67H94V74H92V76H88V72H90zM58 76H62V78H68V83H60V81H56V78H58z" />
        <path d="M96 53H98V58H96zM70 72H72V76H70zM82 78H86V81H82zM60 46H62V48H60z" />
      </g>
      <g fill="#453d49">
        <path d="M44 39H48V42H44zM48 46H50V51H48zM54 39H56V42H54zM76 37H80V39H76zM88 44H90V46H88zM78 58H82V60H78zM58 78H62V81H58zM92 72H94V74H92z" />
      </g>
      <g fill="#a38f95">
        <path d="M38 53H40V60H38zM40 65H42V69H40zM44 72H46V76H44zM50 78H54V81H50zM56 48H58V53H56zM72 48H74V51H72zM86 65H88V69H86zM98 60H100V65H98z" />
      </g>
      <g class="cauldron-collar">
        <path d="M22 22H106V29H104V34H100V38H28V34H24V29H22z" fill="#17141d" />
        <path d="M24 24H104V29H102V34H98V36H30V34H26V29H24z" fill="#615660" />
        <path d="M28 26H54V30H48V34H32V32H28z" fill="#453d49" />
        <path d="M58 27H100V31H98V34H58z" fill="#7e6f78" />
        <path d="M32 34H44V35H32zM52 35H92V36H52zM88 28H94V30H88zM64 30H68V32H64z" fill="#a38f95" />
        <path d="M40 28H44V30H40zM70 28H76V30H70zM82 32H86V34H82zM96 27H100V29H96z" fill="#453d49" />
      </g>
      <g class="cauldron-rim">
        <path d="M45 10H83V11H94V13H101V15H104V18H106V23H104V26H99V28H90V30H38V28H29V26H24V23H22V18H24V15H27V13H34V11H45z" fill="#17141d" />
        <path d="M45 12H83V13H94V15H101V17H102V23H97V26H88V28H40V26H31V23H26V17H27V15H34V13H45z" fill="#a38f95" />
        <path d="M45 12H83V13H45zM34 13H45V15H34zM27 15H34V17H27zM26 17H29V21H26z" fill="#ded0c8" />
        <path d="M46 13H82V14H46zM85 14H94V15H85zM96 16H101V18H96z" fill="#c4b0b0" />
        <path d="M43 15H85V16H94V18H99V24H92V26H36V24H29V18H34V16H43z" fill="#453d49" />
      </g>
      ${contents}
      <g class="cauldron-rim-front">
        <path d="M26 21H29V23H36V25H92V23H99V21H102V24H99V27H90V29H38V27H29V24H26z" fill="#7e6f78" />
        <path d="M29 22H36V24H45V25H83V24H92V22H99V24H92V26H83V27H45V26H36V24H29z" fill="#c4b0b0" />
        <path d="M38 26H54V27H38zM57 27H83V28H57z" fill="#ded0c8" />
        <path d="M38 29H90V30H38z" fill="#453d49" />
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
