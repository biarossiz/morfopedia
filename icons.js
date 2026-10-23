/* Ícones e ilustrações originais (SVG) — livres para uso no projeto. */
(function () {
  const s = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

  window.ICONS = {
    esqueletico: s('<path d="M7.5 4.5a2 2 0 1 0-2.8 2.8 2 2 0 1 0 2.8 2.8l6.4 6.4a2 2 0 1 0 2.8 2.8 2 2 0 1 0 2.8-2.8 2 2 0 1 0-2.8-2.8L10.3 7.3a2 2 0 1 0-2.8-2.8z"/>'),
    articular: s('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v5.8M12 15.2V21M5 12h3.8M15.2 12H19"/><path d="M8.6 8.6 6.4 6.4M15.4 15.4l2.2 2.2"/>'),
    muscular: s('<path d="M5 18c2-6 3.5-10 7-12 3.5 2 5 6 7 12"/><path d="M8.5 13c1.2.8 2.3 1.2 3.5 1.2s2.3-.4 3.5-1.2"/><path d="M5 18h14"/>'),
    nervoso: s('<path d="M12 4.5c-3.6 0-6.5 2.6-6.5 6 0 2 1 3.4 2.4 4.4V19h8.2v-4.1c1.4-1 2.4-2.4 2.4-4.4 0-3.4-2.9-6-6.5-6z"/><path d="M12 4.5V19M9 8.5c1 .6 2 .9 3 .9M15 11.5c-1 .6-2 .9-3 .9"/>'),
    cardiovascular: s('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8.5 11.5h2l1-2 1.6 4 1-2h1.4"/>'),
    respiratorio: s('<path d="M12 3.5V11M12 11c-1.5 0-2.5 1-3.4 2.4M12 11c1.5 0 2.5 1 3.4 2.4"/><path d="M8.6 8C6.2 8.5 4.5 12 4.5 16c0 2.4 1.4 3.5 3 3.5 1.8 0 3-1.6 3-4V9.6"/><path d="M15.4 8c2.4.5 4.1 4 4.1 8 0 2.4-1.4 3.5-3 3.5-1.8 0-3-1.6-3-4V9.6"/>'),
    digestorio: s('<path d="M9 3.5v4c0 1.5 1 2.5 2.5 2.5H14a4 4 0 0 1 4 4v.5a5.5 5.5 0 0 1-5.5 5.5H11a3 3 0 0 1-3-3"/><path d="M8 17c0-1.7 1.3-3 3-3h1.5"/>'),
    urinario: s('<path d="M8.5 4.5c-2.5 0-4 2.3-4 5.5s1.5 5 3.5 5c1.5 0 2-1.2 2-2.5 0-1-.8-1.5-.8-2.5s.8-1.5.8-2.5c0-1.8-.6-3-1.5-3z"/><path d="M15.5 4.5c2.5 0 4 2.3 4 5.5s-1.5 5-3.5 5c-1.5 0-2-1.2-2-2.5 0-1 .8-1.5.8-2.5s-.8-1.5-.8-2.5c0-1.8.6-3 1.5-3z"/><path d="M10 12.5c.5 2.5 1 4 2 5.5M14 12.5c-.5 2.5-1 4-2 5.5M12 18v2.5"/>'),
    genital: s('<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>'),
    endocrino: s('<path d="M12 4c-1 2-4 3-4 6.5a4 4 0 0 0 8 0C16 7 13 6 12 4z"/><path d="M6 17.5c1.8 1.6 3.8 2.5 6 2.5s4.2-.9 6-2.5"/><circle cx="12" cy="11" r="1.2"/>'),
    tegumentar: s('<path d="M3.5 15c3 0 3-2 6-2s3 2 6 2 3-2 5-2"/><path d="M3.5 19.5c3 0 3-2 6-2s3 2 6 2 3-2 5-2"/><path d="M8 13V6M12 13.5V4M16 13V7"/>'),
    sentidos: s('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>'),
    embriologia: s('<path d="M15.5 6.5a6.5 6.5 0 1 0 1.6 8.4"/><path d="M15.5 6.5c-2.2 0-3.5 1.6-3.5 3.5 0 1.6 1.2 2.6 2.5 2.6 1.6 0 2.6-1.2 2.6-2.8"/><circle cx="12.5" cy="9.6" r=".7" fill="currentColor"/>'),
    histologia: s('<ellipse cx="12" cy="12" rx="8.5" ry="7"/><circle cx="11" cy="11.5" r="2.6"/><circle cx="11" cy="11.5" r=".8" fill="currentColor"/><path d="M16 9.5h.01M16.5 14h.01M7 15.5h.01"/>'),
    patologia: s('<path d="M9 3.5h6M10 3.5v5.2L5.2 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.8-2.9L14 8.7V3.5"/><path d="M7.5 14h9"/><circle cx="10.5" cy="17" r=".8" fill="currentColor"/><circle cx="13.8" cy="16" r=".6" fill="currentColor"/>'),
    geral: s('<path d="M4 6.5h16M4 12h16M4 17.5h10"/>'),
    // regiões
    cabeca: s('<circle cx="12" cy="9" r="5.5"/><path d="M9.5 14.2V18h5v-3.8M6.5 21c1.4-1.8 3.3-2.6 5.5-2.6s4.1.8 5.5 2.6"/>'),
    torax: s('<path d="M6 4.5 4.5 19.5h15L18 4.5"/><path d="M12 5v13M8 8.5c1.3.6 2.6 1 4 1s2.7-.4 4-1M7.6 12c1.4.6 2.9 1 4.4 1s3-.4 4.4-1M7.2 15.5c1.5.6 3.1 1 4.8 1s3.3-.4 4.8-1"/>'),
    abdome: s('<path d="M6 4.5c-.8 5-.8 9.5 1.5 13.5 1.2 2 2.8 2.5 4.5 2.5s3.3-.5 4.5-2.5C18.8 14 18.8 9.5 18 4.5"/><circle cx="12" cy="12" r="1"/><path d="M8 8h8"/>'),
    dorso: s('<path d="M12 3v18"/><rect x="9.5" y="4.5" width="5" height="2.6" rx="1"/><rect x="9.5" y="9" width="5" height="2.6" rx="1"/><rect x="9.5" y="13.5" width="5" height="2.6" rx="1"/><rect x="10" y="18" width="4" height="2.2" rx="1"/>'),
    superior: s('<path d="M8 3.5c-.5 4 0 7.5 1.5 10.5L9 20.5h3.5l.5-5.5c.8-1 1.8-1.5 3-1.5"/><path d="M13 15c1.5-.2 3 .3 4 1.5M13.5 13l2-3.5"/>'),
    inferior: s('<path d="M9 3.5c-.6 4.5-.4 9 .8 13.5L8 20.5h6.5l.2-2.5c-.4-4.6.2-9.6 1.3-14.5"/>'),
    // UI
    search: s('<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>'),
    arrowL: s('<path d="M15 5l-7 7 7 7"/>'),
    arrowR: s('<path d="M9 5l7 7-7 7"/>'),
    copy: s('<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>'),
    book: s('<path d="M4 5.5c3-1.3 5.6-1 8 1v13c-2.4-2-5-2.3-8-1zM20 5.5c-3-1.3-5.6-1-8 1v13c2.4-2 5-2.3 8-1z"/>'),
    shuffle: s('<path d="M4 7h3.5c4.5 0 5.5 10 10 10H20M4 17h3.5c1.6 0 2.7-1.2 3.6-2.8M14 9c.9-1.2 2-2 3.5-2H20M18 4.5 20.5 7 18 9.5M18 14.5l2.5 2.5-2.5 2.5"/>'),
    link: s('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    focus: s('<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>'),
    check: s('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
    print: s('<path d="M7 9V4.5h10V9M7 17H5a1.5 1.5 0 0 1-1.5-1.5v-5A1.5 1.5 0 0 1 5 9h14a1.5 1.5 0 0 1 1.5 1.5v5A1.5 1.5 0 0 1 19 17h-2"/><rect x="7" y="14" width="10" height="6" rx="1"/>'),
  };

  // Ilustração original do corpo humano (vista anterior), com regiões clicáveis.
  window.BODY_SVG = `
<svg class="body-map" viewBox="0 0 220 440" role="group" aria-label="Mapa do corpo humano: selecione uma região">
  <defs>
    <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="var(--body-a)"/><stop offset="1" stop-color="var(--body-b)"/>
    </linearGradient>
  </defs>
  <g class="region" data-region="superior" tabindex="0" role="button" aria-label="Membro superior">
    <path d="M66 92c-12 3-19 12-21 26l-8 66-10 54c-2 9 1 16 7 17 5 1 8-3 9-8l11-58 14-58z"/>
    <path d="M154 92c12 3 19 12 21 26l8 66 10 54c2 9-1 16-7 17-5 1-8-3-9-8l-11-58-14-58z"/>
  </g>
  <g class="region" data-region="inferior" tabindex="0" role="button" aria-label="Membro inferior">
    <path d="M64 226c-4 22-5 46-3 72l4 62 1 50c0 8 4 12 11 12h12c5 0 6-4 3-8l-6-6 3-48 9-74 6-44c-14 2-27-4-40-16z"/>
    <path d="M156 226c4 22 5 46 3 72l-4 62-1 50c0 8-4 12-11 12h-12c-5 0-6-4-3-8l6-6-3-48-9-74-6-44c14 2 27-4 40-16z"/>
  </g>
  <g class="region" data-region="abdome" tabindex="0" role="button" aria-label="Abdome e pelve">
    <path d="M66 168h88c1 20 2 40 2 58-12 12-26 18-46 18s-34-6-46-18c0-18 1-38 2-58z"/>
  </g>
  <g class="region" data-region="torax" tabindex="0" role="button" aria-label="Tórax">
    <path d="M66 92c14-6 30-8 44-8s30 2 44 8c3 24 2 50 0 76H66c-2-26-3-52 0-76z"/>
  </g>
  <g class="region" data-region="cabeca" tabindex="0" role="button" aria-label="Cabeça e pescoço">
    <path d="M110 12c-17 0-29 13-29 31 0 13 5 23 13 29v12c5 3 10 4 16 4s11-1 16-4V72c8-6 13-16 13-29 0-18-12-31-29-31z"/>
  </g>
  <g class="region region--line" data-region="dorso" tabindex="0" role="button" aria-label="Dorso e coluna">
    <path d="M110 86v148" />
    <path class="spine-dots" d="M110 92v136"/>
  </g>
  <g class="labels" aria-hidden="true">
    <text x="110" y="47">Caput</text>
    <text x="110" y="132">Thorax</text>
    <text x="110" y="206">Abdomen</text>
    <text x="34" y="300">Membrum</text><text x="34" y="311">superius</text>
    <text x="182" y="330">Membrum</text><text x="182" y="341">inferius</text>
    <path class="leader" d="M34 289 L34 262"/>
    <path class="leader" d="M182 319 L150 300"/>
  </g>
</svg>`;
})();
