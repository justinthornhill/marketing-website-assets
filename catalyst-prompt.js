/*! Catalyst hero prompt · <catalyst-prompt> web component
 *  Usage: <catalyst-prompt></catalyst-prompt>
 *  Optional attributes:
 *    menus="up"           open the dropdown menus above the box instead of below
 *    mode="dark"           dark version (light is the default)
 *    celebrate="spark"     on send, the Catalyst spark assembles (default is a glow surge)
 *    prompts='["...","..."]'  replace the rotating prompts (JSON array)
 *  Fires "catalyst-prompt-submit" with { prompt, theme, shape, length } when the send button is clicked.
 *  Styles live in a shadow root. The font is inherited from the page. Colors use --cs-* variables.
 */
(() => {
  if (customElements.get('catalyst-prompt')) return;

  /* ---------- Content: edit here ---------- */
  const PROMPTS = [
    'Turn this quarter\u2019s portfolio review into a personalized client video',
    'Create a LinkedIn clip from last week’s customer webinar',
    'Turn our latest product update into a 60-second announcement video',
    'Make a quick explainer showing how to set up a new workspace',
    'Generate a highlight reel from our Q3 all-hands recording',
    'Draft a short welcome video for new enterprise onboarding'
  ];
  // glow: three colors blended behind the box
  const THEMES = [
    { id: 'northwind', name: 'Northwind', dots: ['#3B6FD4', '#16A394', '#EFE9DD'], glow: ['#3B6FD4', '#3F35C4', '#16A394'] },
    { id: 'ember', name: 'Ember', dots: ['#FF6A3D', '#FFC24B', '#5B1A2B'], glow: ['#B8321A', '#FF6A3D', '#FFB23F'] },
    { id: 'meadow', name: 'Meadow', dots: ['#2F8F4E', '#C9E265', '#F3EFE0'], glow: ['#2F8F4E', '#1E6B5A', '#C9E265'] },
    { id: 'orchid', name: 'Orchid', dots: ['#8B5CF6', '#F472B6', '#FDE7F1'], glow: ['#8B5CF6', '#5B3FD4', '#F472B6'] }
  ];
  const SHAPES = [
    { id: 'wide', name: 'Widescreen', ratio: '16:9' },
    { id: 'mobile', name: 'Mobile', ratio: '9:16' },
    { id: 'square', name: 'Square', ratio: '1:1' }
  ];
  const LENGTHS = [15, 30, 45, 60];
  const DEFAULTS = { theme: 'northwind', shape: 'mobile', length: 30 };
  const TIMING = { type: 38, erase: 16, hold: 2400, gap: 450 };
  const MARK = 'M22.3096 16.2673C22.3096 19.3476 24.8067 21.8447 27.887 21.8447H38.113C41.1933 21.8447 43.6904 19.3476 43.6904 16.2673V5.57747C43.6904 2.49712 46.1875 0 49.2679 0H60.4225C63.5029 0 66 2.49712 66 5.57747V16.7321C66 19.8125 63.5029 22.3096 60.4225 22.3096H49.7327C46.6524 22.3096 44.1553 24.8067 44.1553 27.887V38.113C44.1553 41.1933 46.6524 43.6904 49.7327 43.6904H60.4225C63.5029 43.6904 66 46.1875 66 49.2679V60.4225C66 63.5029 63.5029 66 60.4225 66H49.2679C46.1875 66 43.6904 63.5029 43.6904 60.4225V49.7327C43.6904 46.6524 41.1933 44.1553 38.113 44.1553H27.887C24.8067 44.1553 22.3096 46.6524 22.3096 49.7327V60.4225C22.3096 63.5029 19.8125 66 16.7321 66H5.57746C2.49712 66 0 63.5029 0 60.4225V49.2679C0 46.1875 2.49712 43.6904 5.57747 43.6904H16.2673C19.3476 43.6904 21.8447 41.1933 21.8447 38.113V27.887C21.8447 24.8067 19.3476 22.3096 16.2673 22.3096H5.57747C2.49712 22.3096 0 19.8125 0 16.7321V5.57746C0 2.49712 2.49712 0 5.57747 0H16.7321C19.8125 0 22.3096 2.49712 22.3096 5.57747V16.2673Z';
  // Cursor demo after the first prompt: switches the theme from one to the other.
  const DEMO = { from: 'northwind', to: 'ember' };

  // Registered color properties let the glow fade between themes. They must live in the document.
  if (!document.getElementById('catalyst-prompt-props')) {
    const p = document.createElement('style');
    p.id = 'catalyst-prompt-props';
    p.textContent = [1, 2, 3].map(i => `@property --cs-h${i} { syntax: '<color>'; inherits: true; initial-value: transparent; }`).join('\n');
    document.head.appendChild(p);
  }

  const CSS = `
*, *::before, *::after { box-sizing: border-box; }
:host {
  display: block;
  position: relative;
  /* Light (default) */
  --cs-box: #FFFFFF;
  --cs-bar: #FFFFFF;
  --cs-chip: #F1F2F6;
  --cs-ink: #171923;
  --cs-text: #3E4251;
  --cs-mute: #5F6475;
  --cs-line: #E6E8EE;
  --cs-line2: #D6D9E1;
  --cs-accent: #5446E8;
  --cs-pop-shadow: 0 18px 40px -14px rgba(30, 34, 60, .22);
  --cs-box-shadow: 0 24px 60px -28px rgba(30, 34, 60, .22);
  --cs-glow-opacity: .45;
  --cs-cur-fill: #171923;
  --cs-cur-edge: #FFFFFF;
  color-scheme: light;
}
:host([mode="dark"]) {
  --cs-box: #1F2034;
  --cs-bar: #1F2034;
  --cs-chip: #27293F;
  --cs-ink: #ECEEF7;
  --cs-text: #ECEEF7;
  --cs-mute: #9496AF;
  --cs-line: #2C2E46;
  --cs-line2: #3A3C57;
  --cs-accent: #4FF0E8;
  --cs-pop-shadow: 0 18px 40px -12px rgba(0, 0, 0, .8);
  --cs-box-shadow: 0 30px 60px -30px rgba(4, 5, 14, .8);
  --cs-glow-opacity: .7;
  --cs-cur-fill: #FFFFFF;
  --cs-cur-edge: #1F2034;
  color-scheme: dark;
}
.wrap {
  position: relative; isolation: isolate;
  font-family: inherit; font-size: 16px; font-weight: 400; font-style: normal; font-stretch: normal; line-height: normal;
  letter-spacing: normal; word-spacing: normal; text-transform: none; text-align: left; text-indent: 0; text-shadow: none;
  white-space: normal; color: var(--cs-ink); visibility: visible; cursor: auto; direction: ltr;
}
.wrap { transition: --cs-h1 .9s ease, --cs-h2 .9s ease, --cs-h3 .9s ease; }
.wrap.surge { transition-duration: .17s, .17s, .17s; }
.flare .glow, .surge .glow { opacity: .95; filter: blur(calc(var(--cs-glow-blur, 60px) * .8)); }
.glow {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; border-radius: 32px;
  background: linear-gradient(90deg, var(--cs-h1), var(--cs-h2), var(--cs-h3), var(--cs-h1));
  background-size: 300% 100%;
  filter: blur(var(--cs-glow-blur, 60px));
  opacity: var(--cs-glow-opacity);
  transition: opacity .5s ease, filter .5s ease;
  animation: drift 18s ease-in-out infinite alternate;
}
.box {
  position: relative; background: var(--cs-box); border: 1px solid var(--cs-line2); border-radius: 32px;
  padding: 26px 18px 18px 30px; display: flex; flex-direction: column; gap: 22px;
  box-shadow: var(--cs-box-shadow);
}
.sparks { position: absolute; inset: 0; z-index: 9; pointer-events: none; }
.node { position: absolute; left: 0; top: 0; opacity: 0; will-change: transform, opacity; }
.mark { position: absolute; left: 0; top: 0; opacity: 0; overflow: visible; will-change: transform, opacity; }
.field, .chips, .plus { transition: opacity .3s ease; }
.dim .field, .dim .chips, .dim .plus { opacity: .12; }
.field { font-size: 19px; line-height: 1.45; min-height: 2.9em; padding-right: 12px; color: var(--cs-text); overflow-wrap: anywhere; }
.caret { display: inline-block; width: 2px; height: 1.15em; margin-left: 2px; vertical-align: -.2em; background: var(--cs-ink); animation: blink 1s steps(2) infinite; }
.bottom { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.plus { flex: none; width: 36px; height: 36px; display: grid; place-items: center; color: var(--cs-ink); }
.chips { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.dd { position: relative; }
.chip { display: inline-flex; align-items: center; gap: 10px; height: 46px; padding: 0 19px 0 15px; border: 1px solid var(--cs-line2); border-radius: 999px; font: inherit; font-size: 16px; color: var(--cs-mute); background: transparent; white-space: nowrap; cursor: pointer; transition: border-color .15s ease, color .15s ease, background .15s ease; }
.chip:hover, .chip.open { color: var(--cs-ink); border-color: var(--cs-mute); }
.chip.open { background: var(--cs-chip); }
.chip svg { flex: none; }
.dots3 { display: inline-flex; padding-left: 8px; }
.dots3 i { display: block; width: 20px; height: 20px; border-radius: 50%; margin-left: -8px; box-shadow: 0 0 0 2px var(--cs-box); }
.box::before {
  content: ""; position: absolute; inset: -1px; border-radius: inherit; padding: 1px; pointer-events: none; opacity: 0;
  background: linear-gradient(90deg, transparent 0%, var(--cs-h1) 30%, var(--cs-h2) 50%, var(--cs-h3) 70%, transparent 100%) 0 0 / 250% 100%;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}
.surge .box::before { animation: sweep 1.1s ease-out; }
.surge .send, .flare .send { animation: ping .8s ease-out; }
.send { flex: none; margin-left: auto; width: 52px; height: 52px; border-radius: 50%; border: 0; background: var(--cs-ink); color: var(--cs-box); display: grid; place-items: center; cursor: pointer; text-decoration: none; transition: transform .15s ease; }
.send:active { transform: scale(.9); }
.chip:focus-visible, .item:focus-visible, .send:focus-visible, .custom input:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px; }
.menu { position: absolute; left: 0; top: calc(100% + 10px); z-index: 6; width: 260px; max-width: calc(100vw - 48px); padding: 8px; background: var(--cs-bar); border: 1px solid var(--cs-line2); border-radius: 18px; box-shadow: var(--cs-pop-shadow); display: flex; flex-direction: column; gap: 2px; animation: pop .16s ease both; }
:host([menus="up"]) .menu { top: auto; bottom: calc(100% + 10px); }
.menu.right { left: auto; right: 0; }
.head { padding: 6px 10px 8px; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--cs-mute); }
.item { display: flex; align-items: center; gap: 11px; width: 100%; min-height: 40px; padding: 0 10px; border: 0; border-radius: 11px; background: transparent; color: var(--cs-ink); font: inherit; font-size: 14.5px; text-align: left; cursor: pointer; }
.item:hover { background: var(--cs-chip); }
.item svg { flex: none; }
.item > svg:not(.ck) { color: var(--cs-mute); }
.name { flex: 1; min-width: 0; }
.meta { font-size: 12.5px; color: var(--cs-mute); font-variant-numeric: tabular-nums; }
.ck { color: var(--cs-accent); visibility: hidden; }
.item[aria-checked="true"] .ck { visibility: visible; }
.item .dots3 i { width: 18px; height: 18px; margin-left: -7px; box-shadow: 0 0 0 2px var(--cs-bar); }
.sep { height: 1px; background: var(--cs-line2); margin: 6px 4px; }
.custom { display: flex; align-items: center; gap: 10px; padding: 4px 10px; font-size: 14.5px; }
.custom label { flex: none; }
.custom input { flex: 1; min-width: 0; height: 36px; padding: 0 10px; border: 1px solid var(--cs-line2); border-radius: 10px; background: var(--cs-box); color: var(--cs-ink); font: inherit; font-size: 14px; font-variant-numeric: tabular-nums; }
.custom.on input { border-color: var(--cs-accent); }
.custom span { color: var(--cs-mute); font-size: 13px; }
[hidden] { display: none !important; }
.cursor { position: absolute; left: 0; top: 0; width: 24px; height: 28px; z-index: 10; pointer-events: none; opacity: 0; transition: transform .9s cubic-bezier(.45, .1, .2, 1), opacity .3s ease; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, .3)); }
.cursor.show { opacity: 1; }
.cursor path { fill: var(--cs-cur-fill); stroke: var(--cs-cur-edge); stroke-width: 1.5; stroke-linejoin: round; }
.chip.press { transform: scale(.96); }
.item.press { background: var(--cs-chip); }
.chip { transition: border-color .15s ease, color .15s ease, background .15s ease, transform .15s ease; }
@keyframes sweep { 0% { opacity: 0; background-position: 100% 0; } 30% { opacity: .45; } 100% { opacity: 0; background-position: -150% 0; } }
@keyframes ping { from { box-shadow: 0 0 0 0 var(--cs-h2); } to { box-shadow: 0 0 0 20px transparent; } }
@keyframes blink { to { visibility: hidden; } }
@keyframes pop { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes drift { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
@media (max-width: 640px) {
  .box { border-radius: 26px; padding: 20px 12px 12px 20px; gap: 16px; }
  .field { font-size: 17px; }
  .chip { height: 40px; font-size: 14.5px; padding: 0 14px 0 12px; }
  .send { width: 46px; height: 46px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}`;

  const S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const ICON = {
    mobile: `<svg width="20" height="20" viewBox="0 0 20 20" ${S}><rect x="5" y="2" width="10" height="16" rx="2.5"/><path d="M8.5 15h3"/></svg>`,
    wide: `<svg width="20" height="20" viewBox="0 0 20 20" ${S}><rect x="2" y="5" width="16" height="10" rx="2.5"/><path d="M15 8.5v3"/></svg>`,
    square: `<svg width="20" height="20" viewBox="0 0 20 20" ${S}><rect x="3.5" y="3.5" width="13" height="13" rx="2.5"/></svg>`,
    timer: `<svg width="20" height="20" viewBox="0 0 20 20" ${S}><circle cx="10" cy="11.5" r="6.5"/><path d="M8 2.5h4M10 2.5V5M10 11.5V8M15.5 5.5l1-1"/></svg>`,
    check: '<svg class="ck" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5"/></svg>'
  };
  const dotsHTML = cs => `<span class="dots3">${cs.map(c => `<i style="background:${c}"></i>`).join('')}</span>`;
  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  class CatalystPrompt extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${CSS}</style>
        <div class="wrap">
          <div class="glow"></div>
          <div class="sparks" aria-hidden="true"></div>
          <svg class="cursor" viewBox="0 0 22 26" aria-hidden="true"><path d="M2 1.5v18l4.6-4.3 3.2 7.3 3.2-1.4-3.2-7.2h6.4z"/></svg>
          <div class="box">
            <div class="field" aria-hidden="true"><span class="text"></span><span class="caret"></span></div>
            <div class="bottom">
              <span class="plus"><svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4v14M4 11h14"/></svg></span>
              <div class="chips"></div>
              <button class="send" type="button" aria-label="Send"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.5V5M5.5 11.5L12 5l6.5 6.5"/></svg></button>
            </div>
          </div>
        </div>`;

      let prompts = PROMPTS;
      try { const p = JSON.parse(this.getAttribute('prompts') || 'null'); if (Array.isArray(p) && p.length) prompts = p; } catch (e) {}
      if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Example Catalyst prompts: ' + prompts.join('; '));
      this.setAttribute('role', 'group');

      const $ = s => root.querySelector(s);
      const textEl = $('.text'), chipsEl = $('.chips'), glow = $('.glow');
      const settings = { ...DEFAULTS };
      const uid = 'cp' + Math.random().toString(36).slice(2, 7);
      const themeOf = () => THEMES.find(t => t.id === settings.theme);
      const shapeOf = () => SHAPES.find(s => s.id === settings.shape);

      /* ----- dropdowns ----- */
      const dd = {};
      const makeDD = (key, label, right) => {
        const wrap = h('div', 'dd');
        const btn = h('button', 'chip');
        btn.type = 'button';
        btn.setAttribute('aria-haspopup', 'menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', label);
        const menu = h('div', 'menu' + (right ? ' right' : ''));
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', label);
        menu.hidden = true;
        wrap.append(btn, menu);
        chipsEl.append(wrap);
        btn.addEventListener('click', e => { e.stopPropagation(); userTouched = true; openDD(dd[key].menu.hidden ? key : null); });
        menu.addEventListener('keydown', e => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          const f = [...menu.querySelectorAll('.item, input')];
          const i = f.indexOf(root.activeElement);
          f[e.key === 'ArrowDown' ? (i + 1) % f.length : (i - 1 + f.length) % f.length].focus();
          e.preventDefault();
        });
        dd[key] = { wrap, btn, menu };
      };
      let userTouched = false;
      const openDD = (key, focus = true) => {
        for (const k in dd) {
          const open = k === key;
          dd[k].menu.hidden = !open;
          dd[k].btn.setAttribute('aria-expanded', String(open));
          dd[k].btn.classList.toggle('open', open);
          if (open && focus) (dd[k].menu.querySelector('[aria-checked="true"], .custom.on input') || dd[k].menu.querySelector('.item')).focus();
        }
      };
      const pick = (key, value) => { userTouched = true; settings[key] = value; apply(); openDD(null); dd[key].btn.focus(); };
      const item = (key, value, inner, checked) => {
        const b = h('button', 'item', inner + ICON.check);
        b.type = 'button';
        b.setAttribute('role', 'menuitemradio');
        b.setAttribute('aria-checked', String(checked));
        b.dataset.id = String(value);
        b.addEventListener('click', e => { e.stopPropagation(); pick(key, value); });
        return b;
      };
      const renderMenus = () => {
        const tm = dd.theme.menu;
        tm.innerHTML = '<div class="head">Brand themes</div>';
        THEMES.forEach(t => tm.append(item('theme', t.id, `${dotsHTML(t.dots)}<span class="name">${t.name}</span>`, t.id === settings.theme)));
        const sm = dd.shape.menu;
        sm.innerHTML = '<div class="head">Aspect ratio</div>';
        SHAPES.forEach(s => sm.append(item('shape', s.id, `${ICON[s.id]}<span class="name">${s.name}</span><span class="meta">${s.ratio}</span>`, s.id === settings.shape)));
        const lm = dd.length.menu;
        lm.innerHTML = '<div class="head">Duration</div>';
        LENGTHS.forEach(n => lm.append(item('length', n, `<span class="name">${n} seconds</span>`, settings.length === n)));
        lm.append(item('length', null, '<span class="name">None</span><span class="meta">Catalyst decides</span>', settings.length === null));
        const custom = settings.length !== null && !LENGTHS.includes(settings.length);
        const row = h('div', 'custom' + (custom ? ' on' : ''), `<label for="${uid}-c">Custom</label><input id="${uid}-c" type="number" inputmode="numeric" min="5" max="600" placeholder="Type seconds" value="${custom ? settings.length : ''}"><span>sec</span>`);
        const inp = row.querySelector('input');
        const commit = () => { const v = Math.round(Number(inp.value)); if (v) pick('length', Math.min(600, Math.max(5, v))); };
        inp.addEventListener('click', e => e.stopPropagation());
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
        inp.addEventListener('change', commit);
        lm.append(h('div', 'sep'), row);
      };
      const setGlow = t => t.glow.forEach((c, i) => $('.wrap').style.setProperty(`--cs-h${i + 1}`, c));
      const apply = () => {
        const t = themeOf(), s = shapeOf();
        dd.theme.btn.innerHTML = `${dotsHTML(t.dots)}<span>${t.name}</span>`;
        dd.shape.btn.innerHTML = `${ICON[s.id]}<span>${s.name}</span>`;
        dd.length.btn.innerHTML = `${ICON.timer}<span>${settings.length ? settings.length + 's' : 'None'}</span>`;
        setGlow(t);
        renderMenus();
      };
      makeDD('theme', 'Brand theme');
      makeDD('shape', 'Aspect ratio');
      makeDD('length', 'Duration', true);
      apply();
      document.addEventListener('click', e => { if (!e.composedPath().some(n => n.classList && n.classList.contains('dd') && root.contains(n))) openDD(null); });
      root.addEventListener('keydown', e => {
        if (e.key !== 'Escape') return;
        for (const k in dd) if (!dd[k].menu.hidden) { openDD(null); dd[k].btn.focus(); }
      });

      /* ----- send: glow surge (no navigation) ----- */
      let surging = false;
      const pause = ms => new Promise(res => setTimeout(res, ms));
      const surge = async () => {
        const w = $('.wrap');
        surging = true;
        w.classList.add('surge');
        const order = THEMES.filter(t => t.id !== settings.theme).concat(themeOf());
        for (const t of order) { setGlow(t); await pause(170); }
        setTimeout(() => { w.classList.remove('surge'); surging = false; }, 700);
      };
      const spark = async () => {
        const w = $('.wrap'), layer = $('.sparks'), box = $('.box'), send = $('.send');
        surging = true;
        const W = w.getBoundingClientRect(), B = box.getBoundingClientRect(), S = send.getBoundingClientRect();
        const M = Math.min(84, B.height * 0.62), u = M / 66;
        const cx = B.left - W.left + B.width / 2, cy = B.top - W.top + B.height / 2;
        const mx = cx - M / 2, my = cy - M / 2;
        const sx = S.left - W.left + S.width / 2, sy = S.top - W.top + S.height / 2;
        // the five nodes of the mark: four corners and the center, colored along the logo gradient
        const nodes = [
          { x: 0, y: 0, s: 22.3, c: '#6A5CFF' }, { x: 43.7, y: 0, s: 22.3, c: '#5D93F4' },
          { x: 0, y: 43.7, s: 22.3, c: '#5D93F4' }, { x: 43.7, y: 43.7, s: 22.3, c: '#4FF0E8' },
          { x: 21.8, y: 21.8, s: 22.4, c: '#58B6EE' }
        ];
        w.classList.add('flare', 'dim');
        const els = nodes.map((n, i) => {
          const size = n.s * u, el = h('div', 'node');
          el.style.cssText = `width:${size}px;height:${size}px;border-radius:${size * 0.25}px;background:${n.c};box-shadow:0 0 18px ${n.c}`;
          layer.append(el);
          const ang = (200 + i * 34 + Math.random() * 18) * Math.PI / 180, dist = 80 + Math.random() * 70;
          const x0 = sx - size / 2, y0 = sy - size / 2;
          const x1 = x0 + Math.cos(ang) * dist, y1 = y0 + Math.sin(ang) * dist;
          const x2 = mx + n.x * u, y2 = my + n.y * u;
          const rot = (Math.random() * 160 - 80).toFixed(0);
          return el.animate([
            { transform: `translate(${x0}px,${y0}px) rotate(0deg) scale(.2)`, opacity: 0, easing: 'cubic-bezier(.2,.8,.3,1)' },
            { transform: `translate(${x1}px,${y1}px) rotate(${rot}deg) scale(.75)`, opacity: 1, offset: .4, easing: 'cubic-bezier(.5,0,.2,1.3)' },
            { transform: `translate(${x2}px,${y2}px) rotate(0deg) scale(1)`, opacity: 1 }
          ], { duration: 1000, delay: i * 45, fill: 'forwards' });
        });
        await Promise.all(els.map(a => a.finished));
        // swap the nodes for the real mark, pulse it, then let it go
        const markEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        markEl.setAttribute('class', 'mark');
        markEl.setAttribute('viewBox', '0 0 66 66');
        markEl.setAttribute('width', M);
        markEl.setAttribute('height', M);
        markEl.innerHTML = `<defs><radialGradient id="spark-g" cx="0" cy="0" r="1" gradientTransform="matrix(-52.9309 -50.4119 28.1506 -94.7881 66 66)" gradientUnits="userSpaceOnUse"><stop stop-color="#4FF0E8"/><stop offset="1" stop-color="#6A5CFF"/></radialGradient></defs><path d="${MARK}" fill="url(#spark-g)"/>`;
        markEl.style.transform = `translate(${mx}px,${my}px)`;
        markEl.style.filter = 'drop-shadow(0 0 16px rgba(106, 92, 255, .55))';
        layer.append(markEl);
        markEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 140, fill: 'forwards' });
        els.forEach(a => a.effect.target.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
        const T = s => `translate(${mx + M / 2}px,${my + M / 2}px) scale(${s}) translate(${-M / 2}px,${-M / 2}px)`;
        await markEl.animate([{ transform: T(1) }, { transform: T(1.1), offset: .35 }, { transform: T(1) }], { duration: 520, easing: 'ease-out', fill: 'forwards' }).finished;
        await pause(420);
        w.classList.remove('dim');
        await markEl.animate([{ transform: T(1), opacity: 1 }, { transform: T(1.18), opacity: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' }).finished;
        layer.innerHTML = '';
        w.classList.remove('flare');
        surging = false;
      };
      $('.send').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('catalyst-prompt-submit', {
          bubbles: true, composed: true,
          detail: { prompt: prompts[index], theme: settings.theme, shape: settings.shape, length: settings.length }
        }));
        if (matchMedia('(prefers-reduced-motion: reduce)').matches || surging) return;
        if (this.getAttribute('celebrate') === 'spark') spark(); else surge();
      });

      /* ----- typewriter ----- */
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let index = 0, visible = false, timer = null;
      const wait = ms => new Promise(res => { timer = setTimeout(res, ms); });
      const whenVisible = () => visible ? Promise.resolve() : new Promise(res => { this._resume = res; });
      const run = async () => {
        if (reduced) {
          textEl.textContent = prompts[index];
          setInterval(() => { index = (index + 1) % prompts.length; textEl.textContent = prompts[index]; }, 4000);
          return;
        }
        for (;;) {
          const text = prompts[index];
          // Each loop starts on the default theme so the demo can show the switch again.
          if (index === 0 && !userTouched && settings.theme !== DEMO.from) { settings.theme = DEMO.from; apply(); }
          for (let i = 1; i <= text.length; i++) {
            await whenVisible();
            textEl.textContent = text.slice(0, i);
            await wait(TIMING.type + Math.random() * 30 - 12);
          }
          if (index === 0 && !userTouched) await demo();
          await wait(TIMING.hold);
          for (let i = text.length - 1; i >= 0; i--) {
            await whenVisible();
            textEl.textContent = text.slice(0, i);
            await wait(TIMING.erase);
          }
          await wait(TIMING.gap);
          index = (index + 1) % prompts.length;
        }
      };
      /* ----- cursor demo: open the theme menu and pick another theme ----- */
      const wrapEl = $('.wrap'), cur = $('.cursor');
      const pointAt = el => {
        const w = wrapEl.getBoundingClientRect(), r = el.getBoundingClientRect();
        cur.style.transform = `translate(${r.left - w.left + r.width * 0.42}px, ${r.top - w.top + r.height * 0.5}px)`;
      };
      const press = el => { el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 170); };
      const demo = async () => {
        await whenVisible();
        await wait(600);
        if (userTouched) return;
        const w = wrapEl.getBoundingClientRect();
        cur.style.transition = 'none';
        cur.style.transform = `translate(${w.width * 0.5}px, ${w.height * 0.62}px)`;
        void cur.offsetWidth;
        cur.style.transition = '';
        cur.classList.add('show');
        await wait(150);
        pointAt(dd.theme.btn);
        await wait(1050);
        if (userTouched) { cur.classList.remove('show'); return; }
        press(dd.theme.btn);
        openDD('theme', false);
        await wait(750);
        const target = dd.theme.menu.querySelector(`[data-id="${DEMO.to}"]`);
        if (!target || userTouched) { openDD(null, false); cur.classList.remove('show'); return; }
        pointAt(target);
        await wait(1000);
        press(target);
        await wait(180);
        settings.theme = DEMO.to;
        apply();
        openDD(null, false);
        await wait(500);
        const r = wrapEl.getBoundingClientRect(), b = dd.theme.btn.getBoundingClientRect();
        cur.style.transform = `translate(${b.right - r.left + 60}px, ${b.bottom - r.top + 40}px)`;
        cur.classList.remove('show');
        await wait(700);
      };

      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && this._resume) { const r = this._resume; this._resume = null; r(); }
      }).observe(this);
      run();
    }
  }
  customElements.define('catalyst-prompt', CatalystPrompt);
})();
