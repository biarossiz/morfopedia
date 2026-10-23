/* Morfopedia — aplicação (JavaScript puro, sem dependências) */
(function () {
  'use strict';

  const DATA = window.DICT || [];
  const META = window.DICT_META || { systems: {}, regions: {} };
  const ICONS = window.ICONS || {};
  const SYSTEMS = Object.assign({}, META.systems, { geral: 'Termos gerais' });
  const REGIONS = Object.assign({}, META.regions, { geral: 'Corpo todo / geral' });
  const LAT = {
    esqueletico: 'Systema skeletale', articular: 'Systema articulare', muscular: 'Systema musculare', nervoso: 'Systema nervosum',
    cardiovascular: 'Systema cardiovasculare', respiratorio: 'Systema respiratorium', digestorio: 'Systema digestorium', urinario: 'Systema urinarium',
    genital: 'Systemata genitalia', endocrino: 'Glandulae endocrinae', tegumentar: 'Integumentum commune', sentidos: 'Organa sensuum',
    embriologia: 'Embryologia', histologia: 'Histologia', patologia: 'Pathologia', geral: 'Termini generales',
  };
  const LATR = { cabeca: 'Caput et collum', torax: 'Thorax', abdome: 'Abdomen et pelvis', dorso: 'Dorsum', superior: 'Membrum superius', inferior: 'Membrum inferius', geral: 'Corpus humanum' };
  const SOURCES = {
    M: { short: 'Simões MJ', cite: 'SIMÕES, M. J. Dicionário etimológico de termos médicos. [S. l.], 2008.', html: '<cite>Dicionário etimológico de termos médicos</cite>. Manuel de Jesus Simões, 2008. Fonte principal da Morfopedia.' },
    U: { short: 'Simões RS et al.', cite: 'SIMÕES, R. S. et al. Dicionário de etimologia de termos morfológicos. São Paulo: Escola Paulista de Medicina, UNIFESP, 2014.', html: '<cite>Dicionário de etimologia de termos morfológicos</cite>. Simões RS, Girão JHRC, Sasso GRS, Silva RF, Alonso LG, Marques SR. EPM/UNIFESP, 2014. Fonte complementar.' },
  };
  const REGION_ORDER = ['cabeca', 'torax', 'abdome', 'dorso', 'superior', 'inferior', 'geral'];
  const PAGE = 48;
  const $main = document.getElementById('main');

  // ---------- utilidades ----------
  const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const normKey = (s) => norm(s).replace(/[^\p{L}\p{N}]+/gu, '');
  const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (k) => ICONS[k] || '';
  const cmp = (a, b) => a.n.localeCompare(b.n, 'pt-BR');
  const sysOf = (e) => (e.sy.length ? e.sy : ['geral']);
  const regOf = (e) => (e.rg.length ? e.rg : ['geral']);

  DATA.forEach((e, i) => {
    e.i = i;
    e.t = norm(e.m.replace(/\*/g, ''));
    e.L = (e.k[0] || '').normalize('NFD')[0].toUpperCase();
  });
  DATA.sort(cmp);
  const BY_ID = new Map(DATA.map((e) => [e.id, e]));
  const LETTERS = [...new Set(DATA.map((e) => e.L))].filter((l) => /[A-Z]/.test(l)).sort();
  const countBy = (fn) => DATA.reduce((m, e) => { fn(e).forEach((k) => (m[k] = (m[k] || 0) + 1)); return m; }, {});
  const SYS_COUNT = countBy(sysOf);
  const REG_COUNT = countBy(regOf);

  // índice de raízes (para "mesma raiz")
  const ROOT_IDX = new Map();
  DATA.forEach((e) => e.r.forEach((r) => {
    const k = normKey(r);
    if (k.length < 3) return;
    if (!ROOT_IDX.has(k)) ROOT_IDX.set(k, []);
    ROOT_IDX.get(k).push(e);
  }));

  function md(text) {
    return esc(text).split(/\n{2,}/).map((p) => `<p>${p.replace(/\*([^*]+?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>')}</p>`).join('');
  }
  function highlight(text, q) {
    const safe = esc(text);
    if (!q) return safe;
    const nq = norm(q);
    const nt = norm(text);
    const i = nt.indexOf(nq);
    if (i < 0) return safe;
    // posições equivalem porque a normalização remove só diacríticos combinantes
    return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
  }
  function langBadge(l) {
    const c = l === 'Grego' ? 'lang--grego' : l === 'Latim' ? 'lang--latim' : '';
    return `<span class="lang ${c}">${esc(l)}</span>`;
  }
  function rootMeaning(e, root) {
    const re = new RegExp('\\*' + root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\*\\s*,\\s*([^*.;:()]{2,60})');
    const m = e.m.match(re);
    if (!m) return '';
    let t = m[1].split(/\s+(?:e|ou)\s+(?:do|da|de|dos|das|o|a)?\s*(?:grego|latim|árabe)?\b|\s+ou\s*$|\s+e\s*$/i)[0];
    t = t.replace(/^(que significa|significa|ou seja)\s+/i, '').replace(/[\s,]+$/, '').trim();
    if (t.length < 2 || /^(e|ou|de|do|da)$/i.test(t)) return '';
    return t.length > 40 ? t.slice(0, 38) + '…' : t;
  }
  function uniqRoots(e) {
    const seen = new Set();
    return e.r.filter((r) => { const k = normKey(r); if (k.length < 2 || seen.has(k)) return false; seen.add(k); return true; });
  }
  function toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (_) { return null; } }

  // ---------- busca ----------
  function search(query, pool) {
    const q = normKey(query);
    const qs = norm(query).trim();
    if (!q) return [];
    const out = [];
    (pool || DATA).forEach((e) => {
      let score = 0; let where = '';
      if (e.n === q) score = 100;
      else if (e.n.startsWith(q)) score = 80 - Math.min(20, e.n.length - q.length);
      else if (e.n.includes(q)) score = 55;
      else if (e.r.some((r) => normKey(r).startsWith(q))) { score = 40; where = 'raiz'; }
      else if (qs.length >= 3 && e.t.includes(qs)) { score = 20; where = 'texto'; }
      if (score) out.push({ e, score, where });
    });
    out.sort((a, b) => b.score - a.score || cmp(a.e, b.e));
    // se nada encontrado, tenta prefixos menores (tolerância a digitação)
    if (!out.length && q.length > 4) return search(query.slice(0, -1), pool).map((x) => ({ ...x, approx: true }));
    return out;
  }

  // ---------- rotas ----------
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    const [path, qs] = h.split('?');
    const params = Object.fromEntries(new URLSearchParams(qs || ''));
    return { parts: path.split('/').filter(Boolean), params };
  }
  function href(path, params) {
    const p = new URLSearchParams();
    Object.entries(params || {}).forEach(([k, v]) => { if (v) p.set(k, v); });
    const s = p.toString();
    return '#/' + path + (s ? '?' + s : '');
  }
  function go(path, params) { location.hash = href(path, params); }
  function setParams(params) { history.replaceState(null, '', href('', params)); }

  function route() {
    const { parts, params } = parseHash();
    document.body.classList.remove('focus-mode');
    const page = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === (page === 'v' ? 'home' : page)));
    if (page === 'v') renderEntry(parts[1], params);
    else if (page === 'organograma') renderFlow();
    else if (page === 'requisitos') renderReqs();
    else if (page === 'sobre') renderAbout();
    else renderHome(params);
    $main.focus({ preventScroll: true });
    if (pendingScroll) { const y = pendingScroll.getBoundingClientRect().top + window.scrollY - 84; window.scrollTo(0, Math.max(0, y)); pendingScroll = null; }
    else window.scrollTo(0, 0);
  }

  // ---------- componentes ----------
  function card(e, q, ctx, where) {
    const sys = sysOf(e)[0];
    const reg = regOf(e)[0];
    return `<a class="card" href="${href('v/' + e.id, ctx)}">
      <h3>${highlight(e.k, q)}</h3>
      <p>${esc(cap(e.s))}</p>
      <div class="meta">
        ${e.l.slice(0, 2).map(langBadge).join('')}
        <span class="tag" title="Órgão/Sistema">${icon(sys)}${esc(SYSTEMS[sys])}</span>
        ${reg !== 'geral' ? `<span class="tag" title="Região">· ${esc(REGIONS[reg])}</span>` : ''}
        ${where === 'texto' ? '<span class="hit">· citado no texto</span>' : where === 'raiz' ? '<span class="hit">· pela raiz</span>' : ''}
      </div>
    </a>`;
  }

  function resultsBlock(list, opts) {
    const { q = '', ctx = {}, id = 'res' } = opts || {};
    if (!list.length) {
      return `<div class="panel empty"><h3>Nenhum verbete encontrado</h3><p>Tente outra grafia, uma raiz grega/latina (ex.: <em>kardia</em>, <em>os</em>) ou navegue pelas letras.</p></div>`;
    }
    return `<div class="results" id="${id}"></div><div class="more" id="${id}-more"></div>`;
  }
  function mountResults(list, opts) {
    const { q = '', ctx = {}, id = 'res' } = opts || {};
    const box = document.getElementById(id);
    const more = document.getElementById(id + '-more');
    if (!box) return;
    let shown = 0;
    const step = () => {
      const slice = list.slice(shown, shown + PAGE);
      box.insertAdjacentHTML('beforeend', slice.map((x) => card(x.e || x, q, ctx, x.where)).join(''));
      shown += slice.length;
      more.innerHTML = shown < list.length ? `<button class="btn" type="button">Mostrar mais (${list.length - shown} restantes)</button>` : '';
      const b = more.querySelector('button');
      if (b) b.onclick = step;
    };
    step();
  }

  // ---------- HOME ----------
  function dailyEntry() {
    const pool = DATA.filter((e) => e.m.length > 380 && e.r.length);
    const d = new Date();
    const n = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
    return pool[(n * 7919) % pool.length];
  }

  function renderHome(params) {
    const mode = params.modo || (params.q ? 'termo' : params.s ? 'orgao' : params.r ? 'regiao' : 'termo');
    const daily = dailyEntry();
    const nLat = DATA.filter((e) => e.l.includes('Latim')).length;
    const nGr = DATA.filter((e) => e.l.includes('Grego')).length;
    const tab = (k, label, ic) => `<button type="button" role="tab" aria-selected="${mode === k}" data-mode="${k}">${icon(ic)}${label}</button>`;

    const nM = DATA.filter((e) => e.o === 'M').length;
    $main.innerHTML = `
    <section class="masthead fade-in">
      <p class="eyebrow">Nomenclatura anatômica · Etimologia científica</p>
      <h1>Morfopedia</h1>
      <p class="subtitle">Descubra a origem grega e latina dos termos que descrevem o corpo humano.</p>
      <p class="intro">Na Morfopedia, cada termo anatômico tem uma história. Explore ${DATA.length.toLocaleString('pt-BR')} verbetes de Anatomia, Histologia, Embriologia e Medicina e encontre a raiz que explica o nome de ossos, músculos, órgãos e tecidos — por termo, por órgão/sistema ou por região do corpo.</p>
      <div class="modes" role="tablist" aria-label="Modalidade de busca">
        ${tab('termo', 'Termo', 'search')}${tab('orgao', 'Órgão / Sistema', 'cardiovascular')}${tab('regiao', 'Região / Membro', 'superior')}
      </div>
      <form class="searchbox" id="searchForm" role="search" autocomplete="off">
        ${icon('search')}
        <input id="q" type="search" placeholder="Busque um termo ou raiz… ex.: acetábulo, kardia, zigomático" aria-label="Buscar termo" value="${esc(params.q || '')}">
        <kbd>/</kbd>
        <div class="suggest" id="suggest" role="listbox"></div>
      </form>
      <div class="quick">Experimente:
        ${['Acetábulo', 'Zigomático', 'Periósteo', 'Coração', 'Alvéolo', 'Xifóide'].map((w) => `<button type="button" data-q="${w}">${w}</button>`).join('')}
      </div>
    </section>
    <section class="plates fade-in">
      <div class="plate">
        <p class="eyebrow">Tabula I · Acervo</p>
        <div class="stats">
          <div class="stat"><strong>${DATA.length.toLocaleString('pt-BR')}</strong><span>verbetes</span></div>
          <div class="stat"><strong>${nGr}</strong><span>de raiz grega</span></div>
          <div class="stat"><strong>${nLat}</strong><span>de raiz latina</span></div>
          <div class="stat"><strong>${Object.keys(SYSTEMS).length - 1}</strong><span>órgãos e sistemas</span></div>
        </div>
        <p class="cap"><b>Fontes</b>${nM} verbetes de Simões MJ (2008) e ${DATA.length - nM} complementares de Simões RS et al. (2014).</p>
      </div>
      <div class="plate daily">
        <p class="eyebrow">Verbete do dia</p>
        <h3>${esc(daily.k)}</h3>
        <div style="display:flex;gap:6px;margin-bottom:10px">${daily.l.map(langBadge).join('')}</div>
        <p class="daily-text">${esc(cap(daily.m.replace(/\*/g, '').replace(/^.*?\s[–—-]\s/, '')))}</p>
        <div class="row">
          <a class="btn btn--primary" href="${href('v/' + daily.id)}">${icon('book')}Ler verbete</a>
          <button class="btn" type="button" id="randomBtn">${icon('shuffle')}Aleatório</button>
        </div>
        <p class="cap"><b>Fig.</b>Um termo por dia para estudo da nomenclatura.</p>
      </div>
      <figure class="plate plate--fig" style="margin:0">
        <a href="${href('', { modo: 'regiao' })}" aria-label="Abrir busca por região">${window.BODY_SVG}</a>
        <figcaption><b style="font-style:normal">Fig. 1</b> — <i>Regiones corporis humani</i>, vista anterior. Clique para buscar por região.</figcaption>
      </figure>
    </section>
    <div class="explore-head"><h2>Explore a nomenclatura</h2><p>Cada termo conta uma história. Navegue pelas letras, pelos sistemas do corpo ou pelas regiões anatômicas.</p></div>
    <section id="explore" class="fade-in"></section>`;

    // tabs
    $main.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = () => go('', { modo: b.dataset.mode })));
    $main.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => go('', { modo: 'termo', q: b.dataset.q })));
    document.getElementById('randomBtn').onclick = () => go('v/' + DATA[Math.floor(Math.random() * DATA.length)].id);
    setupSearch(document.getElementById('q'), document.getElementById('suggest'), document.getElementById('searchForm'));

    const ex = document.getElementById('explore');
    if (mode === 'orgao') renderSystems(ex, params);
    else if (mode === 'regiao') renderRegions(ex, params);
    else renderTerm(ex, params);
    if (params.modo || params.q || params.s || params.r || params.letra || params.f) pendingScroll = document.querySelector('.explore-head') || ex;
  }

  function setupSearch(input, box, form) {
    let sel = -1; let items = [];
    const close = () => { box.classList.remove('open'); sel = -1; };
    const paint = () => {
      box.innerHTML = items.map((x, i) => `<button type="button" role="option" class="${i === sel ? 'sel' : ''}" data-id="${x.e.id}"><b>${highlight(x.e.k, input.value)}</b><span>${esc(cap(x.e.s))}</span></button>`).join('');
      box.classList.toggle('open', items.length > 0);
      box.querySelectorAll('button').forEach((b) => (b.onmousedown = (ev) => { ev.preventDefault(); go('v/' + b.dataset.id, { modo: 'termo', q: input.value }); }));
    };
    input.addEventListener('input', () => { items = input.value.trim() ? search(input.value).slice(0, 7) : []; sel = -1; paint(); });
    input.addEventListener('keydown', (ev) => {
      if (!box.classList.contains('open')) return;
      if (ev.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); paint(); ev.preventDefault(); }
      else if (ev.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); paint(); ev.preventDefault(); }
      else if (ev.key === 'Escape') close();
      else if (ev.key === 'Enter' && sel >= 0) { ev.preventDefault(); go('v/' + items[sel].e.id, { modo: 'termo', q: input.value }); }
    });
    input.addEventListener('blur', () => setTimeout(close, 120));
    form.onsubmit = (ev) => {
      ev.preventDefault();
      const v = input.value.trim();
      if (!v) return;
      const r = search(v);
      if (r.length && r[0].score === 100 && (r.length === 1 || r[1].score < 80)) go('v/' + r[0].e.id, { modo: 'termo', q: v });
      else go('', { modo: 'termo', q: v });
    };
  }

  // Caminho 2 — termo
  function renderTerm(ex, params) {
    const q = params.q || '';
    if (q) {
      const list = search(q);
      const approx = list.length && list[0].approx;
      ex.innerHTML = `
        <div class="section-head"><div><p class="eyebrow">Busca por termo</p><h2>Resultados para “${esc(q)}”</h2></div>
        <a class="btn btn--ghost" href="${href('', { modo: 'termo' })}">Limpar busca</a></div>
        <div class="results-meta"><span>${list.length} verbete(s)${approx ? ' · resultados aproximados' : ''} · ordenados por relevância e ordem alfabética</span></div>
        ${resultsBlock(list)}`;
      mountResults(list, { q, ctx: { modo: 'termo', q } });
      return;
    }
    const L = params.letra && LETTERS.includes(params.letra) ? params.letra : 'A';
    const list = DATA.filter((e) => e.L === L);
    ex.innerHTML = `
      <div class="section-head"><div><p class="eyebrow">Índice alfabético</p><h2>Letra ${L}</h2></div>
      <span class="muted">${list.length} verbetes</span></div>
      <div class="alpha" style="margin-bottom:18px">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => `<button type="button" data-l="${l}" class="${l === L ? 'on' : ''}" ${LETTERS.includes(l) ? '' : 'disabled'}>${l}</button>`).join('')}</div>
      ${resultsBlock(list)}`;
    ex.querySelectorAll('[data-l]').forEach((b) => (b.onclick = () => go('', { modo: 'termo', letra: b.dataset.l })));
    mountResults(list, { ctx: { modo: 'letra', letra: L } });
  }

  // Caminho 1 — órgão específico → região → termo no contexto
  function renderSystems(ex, params) {
    const s = params.s;
    if (!s || !SYSTEMS[s]) {
      ex.innerHTML = `
        <div class="section-head"><div><p class="eyebrow">Busca por órgão / sistema</p><h2>Escolha um órgão ou sistema</h2></div>
        <span class="muted">Classificação automática por palavras-chave</span></div>
        <div class="sys-grid">${Object.keys(SYSTEMS).map((k) => `
          <button class="sys" type="button" data-s="${k}"><span class="ic">${icon(k)}</span><span><b>${esc(SYSTEMS[k])}</b><span class="lat">${esc(LAT[k] || '')}</span><small>${SYS_COUNT[k] || 0} verbetes</small></span></button>`).join('')}
        </div>`;
      ex.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => go('', { modo: 'orgao', s: b.dataset.s })));
      return;
    }
    const pool = DATA.filter((e) => sysOf(e).includes(s));
    const regs = {};
    pool.forEach((e) => regOf(e).forEach((r) => (regs[r] = (regs[r] || 0) + 1)));
    const r = params.r && regs[params.r] ? params.r : '';
    ex.innerHTML = `
      <div class="section-head"><div>
        <div class="crumbs"><a href="${href('', { modo: 'orgao' })}">Órgãos e sistemas</a>${icon('arrowR')}<span>${esc(SYSTEMS[s])}</span>${r ? icon('arrowR') + '<span>' + esc(REGIONS[r]) + '</span>' : ''}</div>
        <h2 style="display:flex;align-items:center;gap:10px"><span class="sys" style="padding:0;border:0;background:none"><span class="ic">${icon(s)}</span></span>${esc(SYSTEMS[s])}</h2></div></div>
      <div class="layout">
        <aside class="panel sidebar">
          <div class="group"><h3>1 · Região</h3><div class="chips">
            <button class="chip ${r ? '' : 'on'}" data-r="">Todas <small>${pool.length}</small></button>
            ${REGION_ORDER.filter((k) => regs[k]).map((k) => `<button class="chip ${r === k ? 'on' : ''}" data-r="${k}">${esc(REGIONS[k])} <small>${regs[k]}</small></button>`).join('')}
          </div></div>
          <div class="group" style="margin:0"><h3>Outros sistemas</h3><div class="chips">
            ${Object.keys(SYSTEMS).filter((k) => k !== s).map((k) => `<a class="chip" href="${href('', { modo: 'orgao', s: k })}">${icon(k)}${esc(SYSTEMS[k])}</a>`).join('')}
          </div></div>
        </aside>
        <div>
          <label class="filter-input">${icon('search')}<input id="f" type="search" placeholder="2 · Filtrar termo dentro de ${esc(SYSTEMS[s])}${r ? ' · ' + esc(REGIONS[r]) : ''}…" value="${esc(params.f || '')}" aria-label="Filtrar termos neste contexto"></label>
          <div class="results-meta"><span id="count"></span><span>Ordem alfabética</span></div>
          <div id="list"></div>
        </div>
      </div>`;
    ex.querySelectorAll('[data-r]').forEach((b) => (b.onclick = () => go('', { modo: 'orgao', s, r: b.dataset.r })));
    const base = r ? pool.filter((e) => regOf(e).includes(r)) : pool;
    contextFilter(base, { modo: 'orgao', s, r }, params.f);
  }

  // Caminho 3 — região / membro → órgão
  function renderRegions(ex, params) {
    const r = params.r && REGIONS[params.r] ? params.r : '';
    const pool = r ? DATA.filter((e) => regOf(e).includes(r)) : [];
    const syss = {};
    pool.forEach((e) => sysOf(e).forEach((k) => (syss[k] = (syss[k] || 0) + 1)));
    const s = params.s && syss[params.s] ? params.s : '';
    ex.innerHTML = `
      <div class="section-head"><div><p class="eyebrow">Busca por região / membro</p><h2>${r ? esc(REGIONS[r]) : 'Selecione uma região do corpo'}</h2></div>
      ${r ? `<a class="btn btn--ghost" href="${href('', { modo: 'regiao' })}">Trocar região</a>` : ''}</div>
      <div class="region-wrap">
        <aside class="panel body-card">
          ${window.BODY_SVG}
          <div class="region-list">${REGION_ORDER.map((k) => `<button type="button" data-r="${k}" class="${r === k ? 'on' : ''}">${icon(k === 'geral' ? 'geral' : k)}<span>${esc(REGIONS[k])}<span class="lat">${esc(LATR[k])}</span></span><small>${REG_COUNT[k] || 0}</small></button>`).join('')}</div>
        </aside>
        <div>${r ? `
          <div class="panel" style="padding:16px;margin-bottom:14px"><h3 style="font-size:1rem;margin-bottom:10px">1 · Selecione o órgão / sistema</h3><div class="chips" style="display:flex;flex-wrap:wrap;gap:6px">
            <button class="chip ${s ? '' : 'on'}" data-s="">Todos <small>${pool.length}</small></button>
            ${Object.keys(SYSTEMS).filter((k) => syss[k]).map((k) => `<button class="chip ${s === k ? 'on' : ''}" data-s="${k}">${icon(k)}${esc(SYSTEMS[k])} <small>${syss[k]}</small></button>`).join('')}
          </div></div>
          <label class="filter-input">${icon('search')}<input id="f" type="search" placeholder="2 · Filtrar termo dentro de ${esc(REGIONS[r])}…" value="${esc(params.f || '')}" aria-label="Filtrar termos nesta região"></label>
          <div class="results-meta"><span id="count"></span><span>Ordem alfabética</span></div>
          <div id="list"></div>` : `
          <div class="panel empty"><h3>Clique no mapa do corpo</h3><p>Escolha cabeça, tórax, abdome, membros ou a coluna (linha central) para ver os termos daquela região. Depois, refine por órgão/sistema e filtre por um termo.</p></div>`}
        </div>
      </div>`;
    const svg = ex.querySelector('.body-map');
    svg.querySelectorAll('.region').forEach((g) => {
      g.classList.toggle('on', g.dataset.region === r);
      const pick = () => go('', { modo: 'regiao', r: g.dataset.region });
      g.addEventListener('click', pick);
      g.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); pick(); } });
    });
    ex.querySelectorAll('.region-list [data-r]').forEach((b) => (b.onclick = () => go('', { modo: 'regiao', r: b.dataset.r })));
    if (!r) return;
    ex.querySelectorAll('[data-s]').forEach((b) => (b.onclick = () => go('', { modo: 'regiao', r, s: b.dataset.s })));
    const base = s ? pool.filter((e) => sysOf(e).includes(s)) : pool;
    contextFilter(base, { modo: 'regiao', r, s }, params.f);
  }

  // RF04 — filtro de termo dentro do contexto
  function contextFilter(base, ctx, initial) {
    const input = document.getElementById('f');
    const listEl = document.getElementById('list');
    const countEl = document.getElementById('count');
    const draw = () => {
      const f = input.value.trim();
      const list = f ? search(f, base) : base.map((e) => ({ e }));
      if (!f) list.sort((a, b) => cmp(a.e, b.e));
      countEl.textContent = `${list.length} de ${base.length} verbetes${f ? ` contendo “${f}”` : ''}`;
      listEl.innerHTML = resultsBlock(list);
      mountResults(list, { q: f, ctx: Object.assign({}, ctx, { f }) });
      setParams(Object.assign({}, ctx, { f }));
    };
    let t;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(draw, 120); });
    if (initial) input.value = initial;
    draw();
  }

  // ---------- VERBETE (RF02, RF03, RF05) ----------
  function contextList(params) {
    const { modo, s, r, f, q } = params;
    let list; let label;
    if (modo === 'orgao' && SYSTEMS[s]) {
      list = DATA.filter((e) => sysOf(e).includes(s) && (!r || regOf(e).includes(r)));
      label = `${SYSTEMS[s]}${r ? ' · ' + REGIONS[r] : ''}`;
    } else if (modo === 'regiao' && REGIONS[r]) {
      list = DATA.filter((e) => regOf(e).includes(r) && (!s || sysOf(e).includes(s)));
      label = `${REGIONS[r]}${s ? ' · ' + SYSTEMS[s] : ''}`;
    } else {
      list = DATA.slice();
      label = 'todo o dicionário';
    }
    if (f) { const m = new Set(search(f, list).map((x) => x.e.id)); list = list.filter((e) => m.has(e.id)); label += ` · “${f}”`; }
    list.sort(cmp);
    return { list, label };
  }

  function renderEntry(id, params) {
    const e = BY_ID.get(id);
    if (!e) { $main.innerHTML = `<div class="panel empty"><h3>Verbete não encontrado</h3><p><a href="#/">Voltar à pesquisa</a></p></div>`; return; }
    let { list, label } = contextList(params);
    if (!list.some((x) => x.id === e.id)) ({ list, label } = contextList({}));
    const pos = list.findIndex((x) => x.id === e.id);
    const prev = list[(pos - 1 + list.length) % list.length];
    const next = list[(pos + 1) % list.length];
    const recs = [];
    for (let i = 1; recs.length < 6 && i < list.length; i++) recs.push(list[(pos + i) % list.length]);
    const ctx = Object.fromEntries(Object.entries(params).filter(([k]) => ['modo', 's', 'r', 'f', 'q', 'letra'].includes(k)));

    const sameRoot = new Map();
    e.r.forEach((r) => (ROOT_IDX.get(normKey(r)) || []).forEach((x) => { if (x.id !== e.id) sameRoot.set(x.id, { x, r }); }));
    const rootRel = [...sameRoot.values()].slice(0, 8);

    const back = params.modo === 'orgao' ? href('', { modo: 'orgao', s: params.s, r: params.r, f: params.f })
      : params.modo === 'regiao' ? href('', { modo: 'regiao', r: params.r, s: params.s, f: params.f })
      : params.q ? href('', { modo: 'termo', q: params.q }) : href('', { modo: 'termo', letra: e.L });

    const url = location.href.split('#')[0] + '#/v/' + e.id;
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    const SRC = SOURCES[e.o] || SOURCES.M;
    const citation = `${e.k.toUpperCase()}. In: ${SRC.cite} Disponível em: Morfopedia, ${url}. Acesso em: ${today}.`;
    const rootsHtml = uniqRoots(e).slice(0, 6).map((r) => { const m = rootMeaning(e, r); return `<span class="root"><i>${esc(r)}</i>${m ? `<small>${esc(m)}</small>` : ''}</span>`; }).join('');
    const rest = e.m.replace(/^.*?\s[–—-]\s/, '');

    $main.innerHTML = `
      <div class="crumbs"><a href="${back}">${icon('arrowL')} Voltar aos resultados</a><span>· contexto: ${esc(label)}</span></div>
      <div class="entry-layout fade-in">
        <div>
          <article class="panel entry">
            <span class="letter-bg" aria-hidden="true">${esc(e.L)}</span>
            <p class="eyebrow">Verbete ${pos + 1} de ${list.length} <span class="src-badge" style="margin-left:8px">${esc(SRC.short)}</span></p>
            <h1>${esc(e.k)}</h1>
            <div class="langs">${e.l.map(langBadge).join('') || '<span class="lang">Origem diversa</span>'}</div>
            ${rootsHtml ? `<p class="eyebrow" style="color:var(--muted)">Raízes</p><div class="roots">${rootsHtml}</div>` : ''}
            <div class="summary"><b>Resumo</b>${esc(cap(e.s))}</div>
            <div class="prose">${md(rest.charAt(0).toUpperCase() + rest.slice(1))}</div>
            <div class="tools">
              <button class="btn" type="button" id="focusBtn">${icon('focus')}<span>Modo foco</span></button>
              <button class="btn" type="button" id="citeBtn">${icon('copy')}Copiar citação</button>
              <button class="btn" type="button" id="linkBtn">${icon('link')}Copiar link</button>
              <button class="btn" type="button" onclick="window.print()">${icon('print')}Imprimir</button>
            </div>
          </article>
          <nav class="pager" aria-label="Verbetes vizinhos">
            <a href="${href('v/' + prev.id, ctx)}"><small>${icon('arrowL')} Anterior</small><b>${esc(prev.k)}</b></a>
            <a class="next" href="${href('v/' + next.id, ctx)}"><small>Próximo ${icon('arrowR')}</small><b>${esc(next.k)}</b></a>
          </nav>
        </div>
        <aside class="aside">
          <div class="panel"><h3>Órgão / sistema</h3><div class="chips">
            ${sysOf(e).map((k) => `<a class="chip" href="${href('', { modo: 'orgao', s: k })}">${icon(k)}${esc(SYSTEMS[k])} <small>${SYS_COUNT[k]}</small></a>`).join('')}</div>
            <p class="lat" style="margin-top:6px">${sysOf(e).map((k) => esc(LAT[k])).join(' · ')}</p>
            <h3 style="margin-top:14px">Região</h3><div class="chips">
            ${regOf(e).map((k) => `<a class="chip" href="${href('', { modo: 'regiao', r: k })}">${icon(k)}${esc(REGIONS[k])} <small>${REG_COUNT[k]}</small></a>`).join('')}</div>
            <p class="context-note">Clique para ver outras etimologias deste órgão ou região.</p>
          </div>
          <div class="panel"><h3>Recomendados</h3><div class="related">
            ${recs.map((x) => `<a href="${href('v/' + x.id, ctx)}">${esc(x.k)}<span>${x.l[0] ? esc(x.l[0]) : ''}</span></a>`).join('')}</div>
            <p class="context-note">Em ordem alfabética, dentro de: ${esc(label)}.</p>
          </div>
          ${rootRel.length ? `<div class="panel"><h3>Mesma raiz</h3><div class="related">
            ${rootRel.map(({ x, r }) => `<a href="${href('v/' + x.id)}">${esc(x.k)}<span><i>${esc(r)}</i></span></a>`).join('')}</div></div>` : ''}
          <div class="panel source"><h3>Fonte</h3>
            <p style="margin:0 0 8px">${SRC.html}</p>
            <a href="#/sobre">Ver referências bibliográficas →</a>
          </div>
        </aside>
      </div>`;

    const fb = document.getElementById('focusBtn');
    fb.onclick = () => { const on = document.body.classList.toggle('focus-mode'); fb.querySelector('span').textContent = on ? 'Sair do foco' : 'Modo foco'; };
    const copy = (txt, msg) => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast(msg), () => { window.prompt('Copie o texto:', txt); });
    document.getElementById('citeBtn').onclick = () => copy(citation, 'Citação copiada (ABNT)');
    document.getElementById('linkBtn').onclick = () => copy(url, 'Link copiado');
    document.title = `${e.k} · Morfopedia`;
    keyNav = { prev: href('v/' + prev.id, ctx), next: href('v/' + next.id, ctx) };
  }
  let keyNav = null;
  let pendingScroll = null;

  // ---------- ORGANOGRAMA ----------
  const FLOW = {
    inicio: { t: 'Início', type: 'Ponto de entrada', d: 'O usuário abre o dicionário e chega à tela de pesquisa.', a: 'Exibe a busca e as três modalidades.', req: ['RF01'], go: ['', {}] },
    modalidade: { t: 'Modalidade de busca', type: 'Decisão', d: 'O estudante escolhe como prefere encontrar a informação.', a: 'Abas “Termo”, “Órgão / Sistema” e “Região / Membro”.', req: ['RF01'], go: ['', {}] },
    'orgao-esp': { t: 'Órgão específico', type: 'Caminho 1', d: 'Busca focada em um órgão ou sistema.', a: 'Mostra a grade de órgãos/sistemas com ícones e contagem.', req: ['RF01', 'RF03'], go: ['', { modo: 'orgao' }], path: 1 },
    'sel-regiao': { t: 'Seleciona a região desejada', type: 'Ação do usuário', d: 'Dentro do órgão, o usuário escolhe a região.', a: 'Chips de região na barra lateral.', req: ['RF04'], go: ['', { modo: 'orgao', s: 'esqueletico' }], path: 1 },
    'proc-regiao': { t: 'Localiza região e termos', type: 'Ação do sistema', d: 'O sistema resgata todos os termos e etimologias do órgão naquela região.', a: 'Lista em ordem alfabética.', req: ['RF03', 'RF05'], go: ['', { modo: 'orgao', s: 'esqueletico', r: 'inferior' }], path: 1 },
    'termo-contexto': { t: 'Termo no contexto da região', type: 'Entrada de texto', d: 'O usuário digita um termo para filtrar só aquele contexto.', a: 'Campo “Filtrar termo dentro de…”.', req: ['RF04'], go: ['', { modo: 'orgao', s: 'esqueletico', r: 'inferior', f: 'fe' }], path: 1 },
    'proc-filtro': { t: 'Busca com filtro local', type: 'Ação do sistema', d: 'Busca o termo digitado apenas na região/órgão escolhidos.', a: 'Resultados filtrados em tempo real.', req: ['RF04'], go: ['', { modo: 'orgao', s: 'esqueletico', r: 'inferior', f: 'fe' }], path: 1 },
    'termo-anat': { t: 'Termo anatômico', type: 'Caminho 2', d: 'Busca livre por palavra, raiz grega/latina ou trecho.', a: 'Campo de busca com autocompletar.', req: ['RF01', 'RF03'], go: ['', { modo: 'termo' }], path: 2 },
    'termo-buscado': { t: 'Termo a ser buscado', type: 'Entrada do usuário', d: 'Inserção da palavra, prefixo ou raiz.', a: 'Sugestões aparecem enquanto digita.', req: ['RF02'], go: ['', { modo: 'termo', q: 'cardi' }], path: 2 },
    'proc-termo': { t: 'Localiza termo e correlatos', type: 'Ação do sistema', d: 'Procura no nome, nas raízes e no texto dos verbetes.', a: 'Abre um único verbete por vez, com recomendados em ordem alfabética.', req: ['RF02', 'RF03'], go: ['v/c-1', { modo: 'termo' }], path: 2 },
    'regiao-membro': { t: 'Região / membro', type: 'Caminho 3', d: 'Busca pela divisão topográfica do corpo.', a: 'Mapa do corpo clicável.', req: ['RF01', 'RF03'], go: ['', { modo: 'regiao' }], path: 3 },
    'sel-orgao': { t: 'Seleciona o órgão desejado', type: 'Ação do usuário', d: 'Escolha do órgão/sistema dentro da região.', a: 'Chips de órgão/sistema acima da lista.', req: ['RF01'], go: ['', { modo: 'regiao', r: 'torax' }], path: 3 },
    'proc-orgao': { t: 'Localiza o órgão e termos', type: 'Ação do sistema', d: 'Resgata termos e etimologias do órgão naquela região.', a: 'Lista alfabética + filtro local.', req: ['RF03', 'RF05'], go: ['', { modo: 'regiao', r: 'torax', s: 'cardiovascular' }], path: 3 },
    database: { t: 'Base de dados local', type: 'Armazenamento', d: `${DATA.length} verbetes carregados no próprio site (arquivo data.js).`, a: 'Funciona offline após o primeiro acesso (PWA).', req: ['RNF Off-line', 'RNF Dinâmico'], go: ['sobre', {}] },
  };

  function renderFlow() {
    document.title = 'Organograma · Morfopedia';
    const n = (id, cls, inner) => `<button type="button" class="node ${cls}" data-node="${id}">${inner || esc(FLOW[id].t)}</button>`;
    const io = (id) => n(id, 'node--io', `<span>${esc(FLOW[id].t)}</span>`);
    const pr = (id) => n(id, 'node--proc', esc(FLOW[id].d));
    const ar = '<span class="arrow">↓</span>';
    $main.innerHTML = `
      <div class="section-head" style="margin-top:0"><div><p class="eyebrow">Arquitetura de fluxo</p><h2>Organograma da pesquisa</h2>
      <p class="lead" style="margin:6px 0 0">Clique em um bloco para ver o que ele faz — e em “Experimentar” para abrir aquele passo no dicionário.</p></div></div>
      <div class="flow-grid fade-in">
        <div class="panel flow"><div class="flow-inner">
          ${n('inicio', 'node--start')}<div class="vline"></div>
          ${n('modalidade', 'node--decision')}
          <div class="branches"><svg viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M50 0V12H16.5V30M50 12V30M50 12H83.5V30" fill="none" stroke="var(--line-2)" stroke-width="1" vector-effect="non-scaling-stroke" style="stroke-width:2px"/></svg></div>
          <div class="cols">
            <div class="col"><span class="pill">Caminho 1</span>${io('orgao-esp')}${ar}${io('sel-regiao')}${ar}${pr('proc-regiao')}${ar}${io('termo-contexto')}${ar}${pr('proc-filtro')}</div>
            <div class="col"><span class="pill">Caminho 2</span>${io('termo-anat')}${ar}${io('termo-buscado')}${ar}${pr('proc-termo')}</div>
            <div class="col"><span class="pill">Caminho 3</span>${io('regiao-membro')}${ar}${io('sel-orgao')}${ar}${pr('proc-orgao')}</div>
          </div>
          <div class="vline" style="height:28px"></div>
          ${n('database', 'node--db', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/></svg><span style="text-align:left"><b>Consulta direta à base de dados</b><br><small class="muted">${DATA.length} verbetes · offline</small></span>`)}
        </div></div>
        <aside class="panel detail" id="detail"><span class="badge">Selecione um bloco</span><h3>Como a pesquisa funciona</h3>
          <div class="box">Três caminhos levam ao mesmo lugar: um <b>verbete único</b>, com raízes, resumo, fonte e recomendações em ordem alfabética dentro do contexto da busca.</div>
          <div class="box"><b>Caminho 1</b> — órgão → região → termo<br><b>Caminho 2</b> — termo livre<br><b>Caminho 3</b> — região → órgão</div>
        </aside>
      </div>`;
    const paths = { 1: ['orgao-esp', 'sel-regiao', 'proc-regiao', 'termo-contexto', 'proc-filtro'], 2: ['termo-anat', 'termo-buscado', 'proc-termo'], 3: ['regiao-membro', 'sel-orgao', 'proc-orgao'] };
    $main.querySelectorAll('[data-node]').forEach((b) => (b.onclick = () => {
      const id = b.dataset.node; const d = FLOW[id];
      const active = d.path ? ['inicio', 'modalidade', ...paths[d.path], 'database'] : Object.keys(FLOW);
      $main.querySelectorAll('[data-node]').forEach((x) => { x.classList.toggle('dim', !active.includes(x.dataset.node)); x.classList.toggle('on', x === b); });
      document.getElementById('detail').innerHTML = `
        <span class="badge">${esc(d.type)}</span><h3>${esc(d.t)}</h3>
        <div class="box"><b>Descrição:</b> ${esc(d.d)}</div>
        <div class="box"><b>No site:</b> ${esc(d.a)}</div>
        <p style="margin:6px 0 8px;font-size:.8rem;font-weight:700;color:var(--muted);letter-spacing:.08em;text-transform:uppercase">Requisitos</p>
        <div>${d.req.map((r) => `<span class="req-tag">${esc(r)}</span>`).join('')}</div>
        <a class="btn btn--primary" style="margin-top:14px" href="${href(d.go[0], d.go[1])}">Experimentar ${icon('arrowR')}</a>`;
    }));
  }

  // ---------- REQUISITOS ----------
  function renderReqs() {
    document.title = 'Requisitos · Morfopedia';
    const how = (t) => `<div class="how">${icon('check')}<span>${t}</span></div>`;
    $main.innerHTML = `
      <div class="section-head" style="margin-top:0"><div><p class="eyebrow">Especificação</p><h2>Requisitos do sistema</h2>
      <p class="lead" style="margin:6px 0 0">Cada requisito do documento técnico e como ele foi atendido neste site.</p></div></div>
      <div class="reqs fade-in">
        <div class="panel" style="padding:8px 24px"><h3 style="padding-top:16px">Requisitos funcionais</h3>
          <div class="req"><span class="code">RF01</span><div><p>O usuário deve poder escolher o tipo de busca: <b>termo direto</b>, <b>por órgão específico</b> ou <b>por região/membro</b>.</p>${how('Abas de modalidade na página inicial: Termo, Órgão / Sistema e Região / Membro (mapa do corpo).')}</div></div>
          <div class="req"><span class="code">RF02</span><div><p>O usuário deve poder ver somente um verbete (TDAH).</p>${how('Página dedicada a um verbete por vez e botão “Modo foco”, que esconde menus e painéis.')}</div></div>
          <div class="req"><span class="code">RF03</span><div><p>O app deve recomendar outros verbetes com base no tipo de busca:</p>
            <ul><li>termo livre: ordem alfabética;</li><li>por órgão: verbetes do mesmo órgão, em ordem alfabética;</li><li>por região: verbetes da mesma região, em ordem alfabética.</li></ul>
            ${how('Bloco “Recomendados” e botões Anterior/Próximo seguem o contexto da busca de origem.')}</div></div>
          <div class="req"><span class="code">RF04</span><div><p>O usuário deve poder fazer busca com filtro dentro da busca por região.</p>${how('Campo “Filtrar termo dentro de…” nas buscas por órgão e por região, com resultado instantâneo.')}</div></div>
          <div class="req"><span class="code">RF05</span><div><p>Na guia do verbete deve constar o órgão em que a etimologia está presente, com conexão para outras etimologias desse órgão.</p>${how('Painel “Órgão / sistema” e “Região” no verbete, com links para os demais termos.')}</div></div>
        </div>
        <div class="panel" style="padding:8px 24px"><h3 style="padding-top:16px">Requisitos não funcionais</h3>
          <div class="nfr"><span class="ic">${icon('link')}</span><div><b>Disponível off-line</b><span>Dados embutidos no site e cache por service worker (PWA instalável).</span></div></div>
          <div class="nfr"><span class="ic">${icon('search')}</span><div><b>Dinâmico</b><span>Busca e filtros instantâneos no navegador, sem servidor.</span></div></div>
          <div class="nfr"><span class="ic">${icon('book')}</span><div><b>Didático</b><span>Raízes destacadas com significado, resumo, idioma de origem e termos da mesma raiz.</span></div></div>
          <div class="nfr"><span class="ic">${icon('sentidos')}</span><div><b>Visual aconchegante</b><span>Paleta em tons de papel e verde, tipografia serifada para leitura longa e modo escuro.</span></div></div>
        </div>
      </div>`;
  }

  // ---------- SOBRE ----------
  function renderAbout() {
    document.title = 'Sobre e fontes · Morfopedia';
    const refsM = ['Bueno FS. Grande dicionário etimológico prosódico da língua portuguesa. Editora Brasília, São Paulo, 1974.', 'Fernandes GJM. Eponímia: glossário de termos epônimos em anatomia. Etimologia: dicionário etimológico da nomenclatura anatômica. Editora Plêiade, São Paulo, 1999.', 'Paciornik R. Dicionário médico. 2ª ed. Editora Guanabara Koogan, Rio de Janeiro, 1975.', 'Pepper OHP. Medical etymology. Editora Saunders, Philadelphia, 1949.', 'Skinner HA. The origin of medical terms. Baltimore: Williams & Wilkins, 1963.'];
    const refsU = ['Bridge EM. Pedagogia médica, 1965, p. 141.', 'Coutinho IL. Pontos de gramática histórica, 1962.', "Dorland's Illustrated Medical Dictionary. 28th ed., 1994.", 'Garnier M, Delamare V. Dicionário de termos técnicos de medicina. 2ª ed., 1984.', 'Houaiss A. Estudos vários sobre palavras, livros, autores, 1979.', 'Poppelmann C. Dicionário de máximas e expressões em latim. Editora Escala, 2010.', 'Rezende JM. Linguagem médica. AB Editora, 2000.', 'SBA. Terminologia anatômica: terminologia anatômica internacional. Editora Manole, São Paulo, 2001.', 'Silveira S. Lições de português. 1960.', 'Sousa AT. Ensaio de uma tradução portuguesa da Nomina Histologica. Coimbra, 1970.'];
    const nM = DATA.filter((e) => e.o === 'M').length;
    $main.innerHTML = `
      <div class="explore-head" style="margin-top:6px"><p class="eyebrow">Sobre a Morfopedia</p><h2>Etimologia da nomenclatura anatômica</h2>
      <p>Uma fonte de consulta para compreender — e memorizar — a terminologia de Anatomia, Histologia, Embriologia e Medicina a partir de suas raízes gregas e latinas.</p></div>
      <div class="about fade-in">
        <div class="panel"><h2>Fontes dos verbetes</h2>
          <p><b>Fonte principal (${nM} verbetes)</b><br><i>Dicionário etimológico de termos médicos</i> — Manuel de Jesus Simões, 2008.</p>
          <p><b>Fonte complementar (${DATA.length - nM} verbetes)</b><br><i>Dicionário de etimologia de termos morfológicos</i> — Simões RS, Girão JHRC, Sasso GRS, Silva RF, Alonso LG, Marques SR. Escola Paulista de Medicina, UNIFESP, 2014. Versão digital: <a href="https://github.com/deusanyjunior/dicionarioetimologico" target="_blank" rel="noopener">deusanyjunior/dicionarioetimologico</a>.</p>
          <p class="muted">Quando um termo aparece nas duas obras, a Morfopedia exibe o texto da fonte principal. Cada verbete indica sua fonte.</p>
          <h2 style="margin-top:22px">Classificação anatômica</h2>
          <p>As obras de origem são alfabéticas. Para a busca por <b>órgão/sistema</b> e por <b>região do corpo</b>, cada verbete foi classificado automaticamente por palavras-chave, usando a divisão da nomenclatura anatômica (<i>Systema skeletale</i>, <i>Systema nervosum</i>, <i>Membrum superius</i>…). A classificação é auxiliar e pode conter imprecisões; o texto do verbete é sempre o original.</p>
          <p class="muted">${DATA.length} verbetes · ${Object.keys(META.systems).length} órgãos/sistemas · ${Object.keys(META.regions).length} regiões.</p>
        </div>
        <div class="panel"><h2>Referências bibliográficas</h2>
          <p class="eyebrow" style="margin-top:4px">Da fonte principal</p><ul class="refs">${refsM.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          <p class="eyebrow" style="margin-top:16px">Da fonte complementar</p><ul class="refs">${refsU.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div>`;
  }

  // ---------- tema, atalhos e offline ----------
  function applyTheme(t) { document.documentElement.dataset.theme = t; }
  const saved = store('ea-theme');
  applyTheme(saved || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  document.getElementById('themeBtn').onclick = () => {
    const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(t); store('ea-theme', t);
  };
  document.addEventListener('keydown', (ev) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if (ev.key === '/' && !typing) { const q = document.getElementById('q') || document.getElementById('f'); if (q) { ev.preventDefault(); q.focus(); } }
    if (!typing && keyNav && location.hash.startsWith('#/v/')) {
      if (ev.key === 'ArrowLeft') location.hash = keyNav.prev;
      if (ev.key === 'ArrowRight') location.hash = keyNav.next;
      if (ev.key === 'Escape') document.body.classList.remove('focus-mode');
    }
  });
  window.addEventListener('hashchange', () => { keyNav = null; document.title = 'Morfopedia · Etimologia da nomenclatura anatômica'; route(); });
  route();

  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
})();
