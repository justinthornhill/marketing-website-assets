/*! Catalyst hero prompt · <catalyst-prompt> web component
 *  Usage: <catalyst-prompt></catalyst-prompt>
 *  Optional attributes:
 *    href="https://..."   the send button links here
 *    menus="up"           open the dropdown menus above the box instead of below
 *    mode="dark"           dark version (light is the default)
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
  color-scheme: dark;
}
.wrap {
  position: relative; isolation: isolate;
  font-family: inherit; font-size: 16px; font-weight: 400; font-style: normal; font-stretch: normal; line-height: normal;
  letter-spacing: normal; word-spacing: normal; text-transform: none; text-align: left; text-indent: 0; text-shadow: none;
  white-space: normal; color: var(--cs-ink); visibility: visible; cursor: auto; direction: ltr;
}
.glow {
  position: absolute; inset: 0; z-index: -1; pointer-events: none; border-radius: 32px;
  background: linear-gradient(90deg, var(--cs-h1), var(--cs-h2), var(--cs-h3), var(--cs-h1));
  background-size: 300% 100%;
  filter: blur(var(--cs-glow-blur, 60px));
  opacity: var(--cs-glow-opacity);
  transition: --cs-h1 .9s ease, --cs-h2 .9s ease, --cs-h3 .9s ease;
  animation: drift 18s ease-in-out infinite alternate;
}
.box {
  position: relative; background: var(--cs-box); border: 1px solid var(--cs-line2); border-radius: 32px;
  padding: 26px 18px 18px 30px; display: flex; flex-direction: column; gap: 22px;
  box-shadow: var(--cs-box-shadow);
}
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
      const href = this.getAttribute('href');
      root.innerHTML = `<style>${CSS}</style>
        <div class="wrap">
          <div class="glow"></div>
          <div class="box">
            <div class="field" aria-hidden="true"><span class="text"></span><span class="caret"></span></div>
            <div class="bottom">
              <span class="plus"><svg width="24" height="24" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4v14M4 11h14"/></svg></span>
              <div class="chips"></div>
              ${href ? `<a class="send" href="${href.replace(/"/g, '&quot;')}" aria-label="Start creating">` : '<button class="send" type="button" aria-label="Start creating">'}<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.5V5M5.5 11.5L12 5l6.5 6.5"/></svg>${href ? '</a>' : '</button>'}
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
        btn.addEventListener('click', e => { e.stopPropagation(); openDD(dd[key].menu.hidden ? key : null); });
        menu.addEventListener('keydown', e => {
          if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
          const f = [...menu.querySelectorAll('.item, input')];
          const i = f.indexOf(root.activeElement);
          f[e.key === 'ArrowDown' ? (i + 1) % f.length : (i - 1 + f.length) % f.length].focus();
          e.preventDefault();
        });
        dd[key] = { wrap, btn, menu };
      };
      const openDD = key => {
        for (const k in dd) {
          const open = k === key;
          dd[k].menu.hidden = !open;
          dd[k].btn.setAttribute('aria-expanded', String(open));
          dd[k].btn.classList.toggle('open', open);
          if (open) (dd[k].menu.querySelector('[aria-checked="true"], .custom.on input') || dd[k].menu.querySelector('.item')).focus();
        }
      };
      const pick = (key, value) => { settings[key] = value; apply(); openDD(null); dd[key].btn.focus(); };
      const item = (key, value, inner, checked) => {
        const b = h('button', 'item', inner + ICON.check);
        b.type = 'button';
        b.setAttribute('role', 'menuitemradio');
        b.setAttribute('aria-checked', String(checked));
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
      const apply = () => {
        const t = themeOf(), s = shapeOf();
        dd.theme.btn.innerHTML = `${dotsHTML(t.dots)}<span>${t.name}</span>`;
        dd.shape.btn.innerHTML = `${ICON[s.id]}<span>${s.name}</span>`;
        dd.length.btn.innerHTML = `${ICON.timer}<span>${settings.length ? settings.length + 's' : 'None'}</span>`;
        t.glow.forEach((c, i) => glow.style.setProperty(`--cs-h${i + 1}`, c));
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

      $('.send').addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('catalyst-prompt-submit', {
          bubbles: true, composed: true,
          detail: { prompt: prompts[index], theme: settings.theme, shape: settings.shape, length: settings.length }
        }));
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
          for (let i = 1; i <= text.length; i++) {
            await whenVisible();
            textEl.textContent = text.slice(0, i);
            await wait(TIMING.type + Math.random() * 30 - 12);
          }
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
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        if (visible && this._resume) { const r = this._resume; this._resume = null; r(); }
      }).observe(this);
      run();
    }
  }
  customElements.define('catalyst-prompt', CatalystPrompt);
})();
