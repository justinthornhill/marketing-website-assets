/*! Catalyst chat scene · <catalyst-scene> web component
 *  Usage: <catalyst-scene scene="assets | website | brand-theme"></catalyst-scene>
 *  Optional: backdrop="left" puts the colored panel on the left.
 *  Optional: controlled — the scene waits for el.restart() instead of starting on scroll, plays once,
 *  then fires "catalyst-scene-end". It also fires "catalyst-scene-pause" and "catalyst-scene-resume"
 *  when it leaves or re-enters the screen.
 *  Styles live in a shadow root, so page CSS and component CSS cannot affect each other.
 *  Colors and sizes can be overridden from the page with the --cs-* variables listed in the README. */
(() => {
  if (customElements.get('catalyst-scene')) return;

  // Registered color properties let the backdrop gradient fade between themes. They must live in the document.
  if (!document.getElementById('catalyst-scene-props')) {
    const p = document.createElement('style');
    p.id = 'catalyst-scene-props';
    p.textContent = `@property --cs-g1 { syntax: '<color>'; inherits: false; initial-value: #141524; }
@property --cs-g2 { syntax: '<color>'; inherits: false; initial-value: #17134A; }
@property --cs-g3 { syntax: '<color>'; inherits: false; initial-value: #3F35C4; }
@property --cs-g4 { syntax: '<color>'; inherits: false; initial-value: #3FD7D0; }
@property --cs-g5 { syntax: '<color>'; inherits: false; initial-value: #141524; }`;
    document.head.appendChild(p);
  }

  const CSS = `*, *::before, *::after { box-sizing: border-box; }

/* Layout: a dark browser window overlapping a brand gradient panel, chat inside, a tall rounded composer pinned below. */
:host {
  display: block;
  position: relative;
  color: var(--cs-ink);
  --cs-spark-from: #4FF0E8;
  --cs-spark-to: #6A5CFF;
  --cs-bg: #141524;
  --cs-win: #1A1B2D;
  --cs-bar: #1F2034;
  --cs-box: #212238;
  --cs-ink: #ECEEF7;
  --cs-mute: #9496AF;
  --cs-line: #2C2E46;
  --cs-line2: #3A3C57;
  --cs-chip: #27293F;
  --cs-accent: #4FF0E8;
  --cs-dot: rgba(255, 255, 255, .05);
  --cs-shadow: 0 40px 80px -24px rgba(4, 5, 14, .75), 0 0 0 1px rgba(255, 255, 255, .03);
  --cs-cur-fill: #FFFFFF;
  --cs-cur-edge: #141524;
  --cs-hair: rgba(255, 255, 255, .08);
  --cs-pop-shadow: 0 18px 40px -12px rgba(0, 0, 0, .8);
  --cs-flash: rgba(79, 240, 232, .15);
  color-scheme: dark;
}























/* Stage */
.stage { position: relative; padding-top: 40px; font-family: inherit; font-size: 14px; font-weight: 400; font-style: normal; font-stretch: normal; font-variant: normal; line-height: normal; letter-spacing: normal; word-spacing: normal; text-transform: none; text-align: left; text-indent: 0; text-shadow: none; white-space: normal; color: var(--cs-ink); visibility: visible; cursor: auto; direction: ltr; }
:host([backdrop="left"]) .backdrop { right: auto; left: 0; }
:host([backdrop="left"]) .win { margin-left: auto; }
.backdrop {
  position: absolute; top: 0; right: 0; width: var(--cs-window-backdrop-width, 60%); height: calc(100% - 24px); border-radius: 18px; overflow: hidden;
  --cs-g1: #141524; --cs-g2: #17134A; --cs-g3: #3F35C4; --cs-g4: #3FD7D0; --cs-g5: #141524;
  background: linear-gradient(180deg, var(--cs-g1) 0%, var(--cs-g2) 28%, var(--cs-g3) 58%, var(--cs-g4) 80%, var(--cs-g5) 100%);
  transition: --cs-g1 .9s ease, --cs-g2 .9s ease, --cs-g3 .9s ease, --cs-g4 .9s ease, --cs-g5 .9s ease;
}
.backdrop::after {
  content: ""; position: absolute; inset: -10%;
  background: repeating-linear-gradient(174deg, rgba(255, 255, 255, .07) 0 3px, transparent 3px 26px);
  filter: blur(5px); transform: skewY(-4deg);
}

/* Window */
.win {
  position: relative; width: var(--cs-window-width, 88%); height: var(--cs-window-height, clamp(520px, 74vh, 660px)); margin-top: 36px;
  display: flex; flex-direction: column; overflow: hidden;
  background-color: var(--cs-win);
  background-image: radial-gradient(circle at 1px 1px, var(--cs-dot) 1px, transparent 0);
  background-size: 28px 28px;
  border: 1px solid var(--cs-line); border-radius: 24px; box-shadow: var(--cs-shadow);
}
.bar { display: flex; align-items: flex-end; gap: 22px; height: 54px; padding: 0 20px; background: var(--cs-bar); border-bottom: 1px solid var(--cs-line); flex: none; }
.dots { display: flex; gap: 8px; align-self: center; }
.dots i { width: 12px; height: 12px; border-radius: 50%; display: block; }
.dots i:nth-child(1) { background: #EF5F57; }
.dots i:nth-child(2) { background: #F5B73B; }
.dots i:nth-child(3) { background: #4CB84D; }
.tab {
  display: flex; align-items: center; height: 40px; padding: 0 20px 0 16px; margin-bottom: -1px;
  background: var(--cs-win); border: 1px solid var(--cs-line); border-bottom: 0; border-radius: 12px 12px 0 0; color: var(--cs-ink);
}
.logo { display: block; }

/* Chat */
.chat { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: none; padding: 28px clamp(18px, 4vw, 40px) 12px; }
.chat::-webkit-scrollbar { display: none; }
.chat-inner { max-width: 680px; margin-inline: auto; min-height: 100%; display: flex; flex-direction: column; }
.empty { margin: auto; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px; padding-block: 24px; }
.empty .spark { width: 48px; height: 48px; }
.empty h2 { margin: 8px 0 0; font-size: 26px; font-weight: 600; letter-spacing: -.015em; text-wrap: balance; }
.empty p { margin: 0; color: var(--cs-mute); font-size: 15px; }
.log { display: flex; flex-direction: column; gap: 22px; }

.msg-user { align-self: flex-end; max-width: 86%; background: var(--cs-chip); border: 1px solid var(--cs-line); border-radius: 20px 20px 6px 20px; padding: 13px 17px; display: flex; flex-direction: column; gap: 10px; animation: rise .4s ease both; }
.msg-user p { margin: 0; font-size: 15px; line-height: 1.5; }
.atts { display: flex; flex-wrap: wrap; gap: 6px; }
.att { display: inline-flex; align-items: center; gap: 7px; background: var(--cs-win); border: 1px solid var(--cs-line2); border-radius: 999px; padding: 4px 11px 4px 5px; font-size: 12.5px; max-width: 100%; }
.att span { overflow-wrap: anywhere; }

.fav { flex: none; display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; background: var(--cs-ink); color: var(--cs-win); font-style: normal; font-size: 10px; font-weight: 700; letter-spacing: 0; line-height: 1; }
.fav.sm { font-size: 7px; font-stretch: 80%; font-weight: 800; letter-spacing: -.01em; }

/* Task blocks */
.task { animation: rise .4s ease both; }
.t-head { display: flex; align-items: center; gap: 10px; min-height: 22px; }
.t-title { font-size: 14.5px; font-weight: 500; line-height: 22px; }
.t-ico, .s-ico { flex: none; width: 22px; height: 22px; display: grid; place-items: center; background: var(--cs-win); position: relative; z-index: 1; }
.t-steps { position: relative; margin-top: 10px; padding-left: 32px; display: flex; flex-direction: column; gap: 12px; }
.t-steps::before { content: ""; position: absolute; left: 10.5px; top: -10px; bottom: 11px; width: 1px; background: var(--cs-line2); }
.t-steps:empty { display: none; }
.step { position: relative; }
.s-ico { position: absolute; left: -32px; top: 0; }
.t-ico svg, .s-ico svg { width: 16px; height: 16px; }
.s-line { display: flex; align-items: baseline; gap: 8px; line-height: 22px; }
.s-title { font-size: 14px; color: var(--cs-ink); }
.step.done .s-title { color: var(--cs-mute); }
.s-time { font-size: 12.5px; color: var(--cs-mute); font-variant-numeric: tabular-nums; }
.s-more { overflow: hidden; transition: max-height .45s ease, opacity .35s ease; }
.s-desc { margin: 4px 0 0; color: var(--cs-mute); font-size: 13.5px; line-height: 1.5; }
.s-body { margin-top: 10px; }

.reads { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.read { display: flex; align-items: center; gap: 10px; font-size: 14px; animation: rise .35s ease both; overflow-wrap: anywhere; }
.read.now { color: var(--cs-ink); }
.read.past { color: var(--cs-mute); transition: color .4s; }

.lines { display: flex; flex-direction: column; gap: 10px; }
.line { display: grid; grid-template-columns: 56px 1fr; gap: 10px; font-size: 14px; line-height: 1.45; animation: rise .4s ease both; }
.line .ln { color: var(--cs-mute); font-size: 12px; padding-top: 2px; letter-spacing: .02em; }


.reply { margin: 14px 0 0; font-size: 15px; line-height: 1.55; max-width: 56ch; animation: rise .5s ease both; }

.tag { font-size: 11.5px; font-weight: 500; color: var(--cs-accent); border: 1px solid var(--cs-accent); border-radius: 999px; padding: 2px 9px; animation: rise .4s ease both; }

/* Composer */
.composer { flex: none; padding: 8px clamp(18px, 4vw, 40px) 24px; }
.c-box {
  max-width: 680px; margin-inline: auto; background: var(--cs-box); border: 1px solid var(--cs-line2); border-radius: 30px;
  padding: 20px 16px 16px 24px; display: flex; flex-direction: column; gap: 14px;
}
.c-row { display: flex; flex-wrap: wrap; gap: 6px; }
.c-row:empty { display: none; }
.c-field { font-size: 15px; line-height: 1.5; min-height: 48px; overflow-wrap: anywhere; padding-right: 8px; }
.c-text:empty + .c-ph { display: inline; }
.c-ph { display: none; color: var(--cs-mute); }
.composer.typing .c-text::after { content: ""; display: inline-block; width: 1.5px; height: 1.1em; margin-left: 1px; vertical-align: -.18em; background: var(--cs-accent); animation: blink 1s steps(2) infinite; }
.c-bottom { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.c-plus { flex: none; width: 34px; height: 34px; display: grid; place-items: center; color: var(--cs-ink); }
.c-chips { flex: 1; min-width: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chip { display: inline-flex; align-items: center; gap: 9px; height: 42px; padding: 0 17px 0 14px; border: 1px solid var(--cs-line2); border-radius: 999px; font: inherit; font-size: 14.5px; color: var(--cs-mute); background: transparent; white-space: nowrap; cursor: pointer; transition: border-color .15s ease, color .15s ease, background .15s ease; }
.chip:hover, .chip.open { color: var(--cs-ink); border-color: var(--cs-mute); }
.chip.open { background: var(--cs-chip); }
.chip:focus-visible, .item:focus-visible, .m-custom input:focus-visible { outline: 2px solid var(--cs-accent); outline-offset: 2px; }
.dd { position: relative; }
.menu { position: absolute; left: 0; bottom: calc(100% + 10px); z-index: 6; width: 250px; max-width: calc(100vw - 48px); padding: 8px; background: var(--cs-bar); border: 1px solid var(--cs-line2); border-radius: 18px; box-shadow: var(--cs-pop-shadow); display: flex; flex-direction: column; gap: 2px; animation: pop .16s ease both; }
.menu.right { left: auto; right: 0; }
.m-head { padding: 6px 10px 8px; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--cs-mute); }
.item { display: flex; align-items: center; gap: 11px; width: 100%; min-height: 40px; padding: 0 10px; border: 0; border-radius: 11px; background: transparent; color: var(--cs-ink); font: inherit; font-size: 14.5px; text-align: left; cursor: pointer; }
.item:hover { background: var(--cs-chip); }
.item svg { flex: none; }
.item > svg:not(.ck) { color: var(--cs-mute); }
.m-name { flex: 1; min-width: 0; }
.m-meta { font-size: 12.5px; color: var(--cs-mute); font-variant-numeric: tabular-nums; }
.item .ck { color: var(--cs-accent); visibility: hidden; }
.item[aria-checked="true"] .ck { visibility: visible; }
.item .dots3 i { box-shadow: 0 0 0 2px var(--cs-bar); }
.m-sep { height: 1px; background: var(--cs-line2); margin: 6px 4px; }
.m-custom { display: flex; align-items: center; gap: 10px; padding: 4px 10px 4px; font-size: 14.5px; }
.m-custom label { flex: none; }
.m-custom input { flex: 1; min-width: 0; height: 36px; padding: 0 10px; border: 1px solid var(--cs-line2); border-radius: 10px; background: var(--cs-box); color: var(--cs-ink); font: inherit; font-size: 14px; font-variant-numeric: tabular-nums; }
.m-custom.on input { border-color: var(--cs-accent); }
.m-custom span { color: var(--cs-mute); font-size: 13px; }
.chip svg { flex: none; }
.dots3 { display: inline-flex; padding-left: 7px; }
.dots3 i { display: block; width: 18px; height: 18px; border-radius: 50%; margin-left: -7px; box-shadow: 0 0 0 2px var(--cs-box); }
.c-send { flex: none; margin-left: auto; width: 46px; height: 46px; border-radius: 50%; background: var(--cs-ink); color: var(--cs-win); display: grid; place-items: center; transition: transform .15s ease; }
.c-send.press { transform: scale(.88); }

/* Status line, pdf progress, storyboard, options */
.status { display: flex; align-items: center; gap: 9px; min-height: 20px; margin-bottom: 10px; font-size: 13.5px; color: var(--cs-mute); }
.status i { flex: none; width: 7px; height: 7px; border-radius: 50%; background: var(--cs-accent); animation: glow 1.2s ease-in-out infinite; }
.status.fin { color: var(--cs-ink); }
.status.fin i { animation: none; }
.status span { animation: rise .3s ease both; }

.pdf { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.pcol { flex: 1; min-width: 0; }
.pname { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 10px; margin-bottom: 8px; font-size: 14px; overflow-wrap: anywhere; }
.pname .pg { color: var(--cs-mute); font-variant-numeric: tabular-nums; }
.pbar { height: 5px; border-radius: 3px; background: var(--cs-line2); overflow: hidden; }
.pbar i { display: block; height: 100%; width: 0; background: linear-gradient(90deg, var(--cs-spark-from), var(--cs-spark-to)); transition: width .6s ease; }

.board { margin-top: 12px; border: 1px solid var(--cs-line2); border-radius: 22px; background: var(--cs-box); padding: 18px 18px 6px; animation: rise .5s ease both; }
.b-head { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; margin-bottom: 12px; font-size: 13.5px; color: var(--cs-mute); }
.b-head b { color: var(--cs-ink); font-weight: 600; font-size: 15px; }
.b-bar { display: flex; gap: 3px; height: 6px; margin-bottom: 8px; }
.b-bar i { display: block; border-radius: 3px; background: linear-gradient(90deg, var(--cs-spark-from), var(--cs-spark-to)); }
.b-row { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 12px 0; border-top: 1px solid var(--cs-line); animation: rise .4s ease both; }
.b-row:first-of-type { border-top: 0; }
.b-txt { min-width: 0; }
.b-txt b { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 14.5px; font-weight: 600; margin-bottom: 2px; }
.b-txt .bd { display: block; font-size: 13.5px; line-height: 1.4; color: var(--cs-mute); }
.b-dur { font-size: 13px; font-variant-numeric: tabular-nums; border: 1px solid var(--cs-line2); border-radius: 999px; padding: 3px 11px; }
.b-row.upd .b-dur { border-color: var(--cs-accent); color: var(--cs-accent); }
.b-num { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--cs-line2); display: grid; place-items: center; font-size: 13px; color: var(--cs-mute); font-variant-numeric: tabular-nums; }
.b-row.upd .b-num { border-color: var(--cs-accent); color: var(--cs-accent); }
.r-prog { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.r-prog .pbar { flex: 1; }
.r-prog span { font-size: 13.5px; color: var(--cs-mute); font-variant-numeric: tabular-nums; min-width: 3.5ch; text-align: right; }
.ready-card { margin-top: 14px; display: flex; align-items: center; gap: 14px; padding: 16px 20px; border: 1px solid var(--cs-line2); border-radius: 22px; background: var(--cs-box); animation: rise .5s ease both; }
.ready-card .d-ico { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg, var(--cs-spark-from), var(--cs-spark-to)); color: #0F1015; }
.ready-card b { display: block; font-size: 16px; font-weight: 600; letter-spacing: -.01em; margin-bottom: 2px; }
.ready-card .d-sub { font-size: 13.5px; color: var(--cs-mute); line-height: 1.45; }
.ready-card > div { min-width: 0; }

.opts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; animation: rise .4s ease both; }
.opt { display: flex; align-items: center; gap: 12px; padding: 7px 20px 7px 7px; border: 1px solid var(--cs-line2); border-radius: 999px; background: var(--cs-box); font-size: 14.5px; transition: transform .15s ease, opacity .3s ease, background .2s ease; }
.opt .k { width: 30px; height: 30px; border-radius: 50%; background: var(--cs-chip); display: grid; place-items: center; font-size: 14px; font-weight: 600; font-variant-numeric: tabular-nums; }
.opt.press { transform: scale(.95); }
.opt.sel { background: var(--cs-ink); color: var(--cs-win); border-color: var(--cs-ink); }
.opt.sel .k { background: var(--cs-win); color: var(--cs-ink); }
.opt.off { opacity: .4; }
.ready-msg { font-size: 19px; font-weight: 600; letter-spacing: -.01em; }

/* Brand theme card */
.tag.draft { color: var(--cs-mute); border-color: var(--cs-line2); }
.m-meta.new { color: var(--cs-accent); }
.chip.flash { color: var(--cs-ink); border-color: var(--cs-accent); box-shadow: 0 0 0 4px var(--cs-flash); }
.tcard { margin-top: 12px; border: 1px solid var(--cs-line2); border-radius: 22px; background: var(--cs-box); padding: 18px; display: flex; flex-direction: column; gap: 18px; animation: rise .5s ease both; }
.tc-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.tc-head b { font-size: 15px; font-weight: 600; }
.tc-sec { display: flex; flex-direction: column; gap: 10px; animation: rise .45s ease both; }
.tc-sec h4 { margin: 0; font-size: 12px; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; color: var(--cs-mute); }
.sw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 12px; }
.sw { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.sw i { display: block; height: 44px; border-radius: 12px; box-shadow: inset 0 0 0 1px var(--cs-hair); margin-bottom: 5px; }
.sw b { font-size: 13px; font-weight: 500; }
.sw span { font-size: 12px; color: var(--cs-mute); }
.sw .hex { font-variant-numeric: tabular-nums; letter-spacing: .02em; opacity: .75; }
.fonts { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
.font { display: flex; align-items: center; gap: 14px; padding: 10px 14px; border: 1px solid var(--cs-line); border-radius: 14px; min-width: 0; }
.font .aa { font-size: 30px; line-height: 1; width: 48px; flex: none; }
.font b { display: block; font-size: 14px; font-weight: 500; }
.font span { font-size: 12.5px; color: var(--cs-mute); }
.logos { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
.lg { height: 72px; border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 9px; box-shadow: inset 0 0 0 1px var(--cs-hair); }
.lg .nm { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; font-family: 'Manrope', 'Roboto Flex', sans-serif; font-weight: 800; font-size: 16px; }
.lg .wm { font-family: 'Manrope', 'Roboto Flex', sans-serif; font-weight: 800; font-size: 18px; letter-spacing: -.02em; }
.traits { display: flex; flex-wrap: wrap; gap: 6px; }
.traits span { font-size: 13px; padding: 4px 12px; border-radius: 999px; background: var(--cs-chip); border: 1px solid var(--cs-line2); }
.vs { margin: 2px 0 0; font-family: 'IBM Plex Sans', 'Roboto Flex', sans-serif; font-size: 15px; }
.va { margin: 0; font-size: 13px; color: var(--cs-mute); }

/* Cursor */
.cursor { position: absolute; left: 0; top: 0; width: 22px; height: 26px; pointer-events: none; opacity: 0; z-index: 10; transition: transform .95s cubic-bezier(.45, .1, .2, 1), opacity .3s ease; filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5)); }
.cursor.show { opacity: 1; }
.cursor path { fill: var(--cs-cur-fill); stroke: var(--cs-cur-edge); stroke-width: 1.5; stroke-linejoin: round; }

/* Catalyst mark */
.spark { display: block; }
.spark.dim { opacity: .4; filter: grayscale(1); }
.spark.live { animation: glow 1.4s ease-in-out infinite; }
.shimmer { background: linear-gradient(90deg, var(--cs-mute) 0%, var(--cs-ink) 50%, var(--cs-mute) 100%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: sweep 1.6s linear infinite; }

[hidden] { display: none !important; }

@keyframes pop { from { opacity: 0; transform: translateY(4px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes sweep { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@keyframes glow { 0%, 100% { opacity: .55; transform: scale(.92); } 50% { opacity: 1; transform: scale(1); } }
@keyframes blink { to { visibility: hidden; } }
@keyframes prog { from { transform: scaleX(0); } to { transform: scaleX(1); } }

@media (max-width: 720px) {
  .backdrop { width: 70%; }
  .win { width: 100%; height: 580px; border-radius: 20px; }
  .bar { padding: 0 14px; gap: 14px; }
  .c-box { border-radius: 24px; padding: 16px 12px 12px 18px; }
  .chip { height: 38px; font-size: 13.5px; padding: 0 13px 0 11px; }
  .c-send { width: 42px; height: 42px; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .shimmer { color: var(--cs-mute); background: none; }
}`;
  const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><radialGradient id="cgrad" cx="0" cy="0" r="1" gradientTransform="matrix(-52.9309 -50.4119 28.1506 -94.7881 66 66)" gradientUnits="userSpaceOnUse"><stop stop-color="#4FF0E8"/><stop offset="1" stop-color="#6A5CFF"/></radialGradient><symbol id="cmark" viewBox="0 0 66 66"><path d="M22.3096 16.2673C22.3096 19.3476 24.8067 21.8447 27.887 21.8447H38.113C41.1933 21.8447 43.6904 19.3476 43.6904 16.2673V5.57747C43.6904 2.49712 46.1875 0 49.2679 0H60.4225C63.5029 0 66 2.49712 66 5.57747V16.7321C66 19.8125 63.5029 22.3096 60.4225 22.3096H49.7327C46.6524 22.3096 44.1553 24.8067 44.1553 27.887V38.113C44.1553 41.1933 46.6524 43.6904 49.7327 43.6904H60.4225C63.5029 43.6904 66 46.1875 66 49.2679V60.4225C66 63.5029 63.5029 66 60.4225 66H49.2679C46.1875 66 43.6904 63.5029 43.6904 60.4225V49.7327C43.6904 46.6524 41.1933 44.1553 38.113 44.1553H27.887C24.8067 44.1553 22.3096 46.6524 22.3096 49.7327V60.4225C22.3096 63.5029 19.8125 66 16.7321 66H5.57746C2.49712 66 0 63.5029 0 60.4225V49.2679C0 46.1875 2.49712 43.6904 5.57747 43.6904H16.2673C19.3476 43.6904 21.8447 41.1933 21.8447 38.113V27.887C21.8447 24.8067 19.3476 22.3096 16.2673 22.3096H5.57747C2.49712 22.3096 0 19.8125 0 16.7321V5.57746C0 2.49712 2.49712 0 5.57747 0H16.7321C19.8125 0 22.3096 2.49712 22.3096 5.57747V16.2673Z" fill="url(#cgrad)"/></symbol><symbol id="clogo" viewBox="0 0 424 73"><path d="M22.3096 16.2673C22.3096 19.3476 24.8067 21.8447 27.887 21.8447H38.113C41.1933 21.8447 43.6904 19.3476 43.6904 16.2673V5.57747C43.6904 2.49712 46.1875 0 49.2679 0H60.4225C63.5029 0 66 2.49712 66 5.57747V16.7321C66 19.8125 63.5029 22.3096 60.4225 22.3096H49.7327C46.6524 22.3096 44.1553 24.8067 44.1553 27.887V38.113C44.1553 41.1933 46.6524 43.6904 49.7327 43.6904H60.4225C63.5029 43.6904 66 46.1875 66 49.2679V60.4225C66 63.5029 63.5029 66 60.4225 66H49.2679C46.1875 66 43.6904 63.5029 43.6904 60.4225V49.7327C43.6904 46.6524 41.1933 44.1553 38.113 44.1553H27.887C24.8067 44.1553 22.3096 46.6524 22.3096 49.7327V60.4225C22.3096 63.5029 19.8125 66 16.7321 66H5.57746C2.49712 66 0 63.5029 0 60.4225V49.2679C0 46.1875 2.49712 43.6904 5.57747 43.6904H16.2673C19.3476 43.6904 21.8447 41.1933 21.8447 38.113V27.887C21.8447 24.8067 19.3476 22.3096 16.2673 22.3096H5.57747C2.49712 22.3096 0 19.8125 0 16.7321V5.57746C0 2.49712 2.49712 0 5.57747 0H16.7321C19.8125 0 22.3096 2.49712 22.3096 5.57747V16.2673Z" fill="url(#cgrad)"/><path d="M92.0156 33.5615V32.6045C92.0156 24.1507 94.9209 17.8047 100.731 13.5664C106.565 9.32812 114.187 7.20898 123.598 7.20898C132.781 7.20898 139.776 8.79264 144.584 11.96C149.415 15.1045 152.24 19.8669 153.061 26.2471L153.231 27.5801H140.038L139.901 26.4521C139.309 23.1937 137.759 20.6986 135.253 18.9668C132.746 17.235 128.952 16.3691 123.871 16.3691C118.266 16.3691 113.879 17.7135 110.712 20.4023C107.567 23.0911 105.995 27.0674 105.995 32.3311V33.7666C105.995 39.167 107.59 43.223 110.78 45.9346C113.993 48.6462 118.345 50.002 123.837 50.002C129.101 50.002 132.963 49.1702 135.424 47.5068C137.908 45.8206 139.411 43.3255 139.936 40.0215L140.106 38.8252H153.231L153.095 40.2266C152.434 46.4245 149.745 51.1071 145.028 54.2744C140.334 57.4417 133.225 59.0254 123.7 59.0254C114.016 59.0254 106.314 56.8721 100.595 52.5654C94.8753 48.2588 92.0156 41.9242 92.0156 33.5615Z" fill="currentColor"/><path d="M155.027 48.2246C155.027 44.9434 156.314 42.471 158.889 40.8076C161.464 39.1214 165.406 38.3011 170.715 38.3467L185.002 38.4834V35.9199C185.002 34.6211 184.444 33.6299 183.327 32.9463C182.211 32.2627 180.206 31.9209 177.312 31.9209C174.737 31.9209 172.846 32.2513 171.638 32.9121C170.453 33.5729 169.861 34.5072 169.861 35.7148V36.501L158.274 36.4668V35.6123C158.274 32.3311 160.017 29.665 163.503 27.6143C167.012 25.5635 171.957 24.5381 178.337 24.5381C185.105 24.5381 190.027 25.5407 193.103 27.5459C196.179 29.5511 197.717 32.707 197.717 37.0137V50.7539C197.717 52.0755 197.831 53.3288 198.059 54.5137C198.309 55.6986 198.674 56.7012 199.153 57.5215V58H186.404C186.039 57.4531 185.754 56.8037 185.549 56.0518C185.367 55.2998 185.23 54.32 185.139 53.1123C184.113 54.5479 182.256 55.8011 179.568 56.8721C176.902 57.943 173.461 58.4785 169.245 58.4785C164.62 58.4785 161.088 57.5785 158.65 55.7783C156.234 53.9554 155.027 51.4375 155.027 48.2246ZM167.605 47.2676C167.605 48.6803 168.129 49.7627 169.177 50.5146C170.225 51.2666 171.957 51.6426 174.372 51.6426C177.084 51.6426 179.533 51.0957 181.721 50.002C183.931 48.9082 185.036 47.3473 185.036 45.3193V44.123L174.714 44.0205C172.185 44.0205 170.362 44.237 169.245 44.6699C168.152 45.1029 167.605 45.9688 167.605 47.2676Z" fill="currentColor"/><path d="M234.821 48.2246C234.821 44.9434 236.109 42.471 238.683 40.8076C241.258 39.1214 245.2 38.3011 250.51 38.3467L264.797 38.4834V35.9199C264.797 34.6211 264.238 33.6299 263.122 32.9463C262.005 32.2627 260 31.9209 257.106 31.9209C254.531 31.9209 252.64 32.2513 251.432 32.9121C250.248 33.5729 249.655 34.5072 249.655 35.7148V36.501L238.068 36.4668V35.6123C238.068 32.3311 239.811 29.665 243.298 27.6143C246.807 25.5635 251.751 24.5381 258.132 24.5381C264.899 24.5381 269.821 25.5407 272.897 27.5459C275.973 29.5511 277.512 32.707 277.512 37.0137V50.7539C277.512 52.0755 277.625 53.3288 277.853 54.5137C278.104 55.6986 278.469 56.7012 278.947 57.5215V58H266.198C265.833 57.4531 265.549 56.8037 265.344 56.0518C265.161 55.2998 265.025 54.32 264.933 53.1123C263.908 54.5479 262.051 55.8011 259.362 56.8721C256.696 57.943 253.255 58.4785 249.04 58.4785C244.414 58.4785 240.882 57.5785 238.444 55.7783C236.029 53.9554 234.821 51.4375 234.821 48.2246ZM247.399 47.2676C247.399 48.6803 247.923 49.7627 248.971 50.5146C250.02 51.2666 251.751 51.6426 254.167 51.6426C256.878 51.6426 259.328 51.0957 261.515 50.002C263.726 48.9082 264.831 47.3473 264.831 45.3193V44.123L254.509 44.0205C251.979 44.0205 250.156 44.237 249.04 44.6699C247.946 45.1029 247.399 45.9688 247.399 47.2676Z" fill="currentColor"/><path d="M282.522 58V7.75586H295.34V58H282.522Z" fill="currentColor"/><path d="M298.194 71.877L298.229 63.4004C299.482 63.6966 300.712 63.9473 301.92 64.1523C303.15 64.3574 304.29 64.46 305.338 64.46C307.73 64.46 309.781 63.9017 311.49 62.7852C313.199 61.6914 314.703 60.0052 316.002 57.7266L315.763 57.6582L298.331 25.8711H310.191L320.069 44.5674C320.434 45.251 320.719 45.8092 320.924 46.2422C321.129 46.6523 321.334 47.1195 321.539 47.6436H321.642C321.869 47.1423 322.086 46.6751 322.291 46.2422C322.496 45.7865 322.77 45.2282 323.111 44.5674L333.229 25.8711H345.157L326.837 58.8545C323.738 64.1637 320.468 67.821 317.027 69.8262C313.609 71.8542 309.952 72.8682 306.056 72.8682C304.597 72.8682 303.299 72.777 302.159 72.5947C301.043 72.4352 299.721 72.196 298.194 71.877Z" fill="currentColor"/><path d="M344.869 46.9941L355.943 47.1309V47.8145C355.943 49.4779 356.9 50.5944 358.814 51.1641C360.728 51.7337 363.314 52.0186 366.573 52.0186C370.15 52.0186 372.68 51.7793 374.161 51.3008C375.642 50.7995 376.382 50.0133 376.382 48.9424C376.382 47.9626 375.642 47.2448 374.161 46.7891C372.702 46.3105 369.968 45.9346 365.958 45.6611C357.39 45.0687 351.83 43.9635 349.278 42.3457C346.749 40.7279 345.484 38.3467 345.484 35.2021C345.484 31.6475 347.33 28.9928 351.021 27.2383C354.712 25.4609 359.885 24.5723 366.539 24.5723C373.01 24.5495 378.012 25.4495 381.544 27.2725C385.075 29.0726 386.864 31.6589 386.91 35.0312V36.1934H375.87V35.4414C375.87 34.1654 375.027 33.2425 373.34 32.6729C371.654 32.0804 369.102 31.7842 365.684 31.7842C362.494 31.7842 360.261 31.9893 358.985 32.3994C357.709 32.7868 357.071 33.4362 357.071 34.3477C357.071 35.168 357.823 35.7832 359.327 36.1934C360.853 36.6035 363.804 36.9795 368.179 37.3213C377.134 37.9593 382.785 39.0303 385.132 40.5342C387.479 42.0381 388.653 44.2028 388.653 47.0283C388.653 50.9476 386.819 53.9326 383.15 55.9834C379.481 58.0114 374.138 59.0254 367.12 59.0254C359.874 59.0254 354.371 58.0911 350.611 56.2227C346.851 54.3314 344.937 51.6768 344.869 48.2588V46.9941Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M220.892 25.8711V15.8906H208.861V25.8711H200.487V34.9629H208.417V46.8916C208.417 50.7425 209.681 53.682 212.211 55.71C214.74 57.738 218.067 58.752 222.191 58.752C225.381 58.752 227.751 58.5924 229.3 58.2734C230.85 57.9544 232.058 57.6354 232.923 57.3164L232.274 48.9766C231.636 49.1361 230.93 49.307 230.155 49.4893C229.38 49.6716 228.264 49.7627 226.805 49.7627C224.891 49.7627 223.421 49.2614 222.396 48.2588C221.393 47.2334 220.892 45.6156 220.892 43.4053V34.9629H232.445V25.8711H220.892Z" fill="currentColor"/><path d="M398.633 46.8916V34.9629H390.704V25.8711H399.078V15.8906H411.109V25.8711H422.662V34.9629H411.109V43.4053C411.109 45.6156 411.61 47.2334 412.613 48.2588C413.638 49.2614 415.108 49.7627 417.022 49.7627C418.48 49.7627 419.597 49.6716 420.372 49.4893C421.146 49.307 421.853 49.1361 422.491 48.9766L423.14 57.3164C422.274 57.6354 421.067 57.9544 419.517 58.2734C417.968 58.5924 415.598 58.752 412.408 58.752C408.283 58.752 404.957 57.738 402.427 55.71C399.898 53.682 398.633 50.7425 398.633 46.8916Z" fill="currentColor"/></symbol></defs></svg>`;

const mount = (stage, opts = {}) => {
  /* ---------- Scene content: edit here ---------- */
  const SCENES = [
    {
      label: 'Assets to video',
      theme: 'northwind', shape: 'mobile', length: 30, result: 'October release for LinkedIn',
      attach: [{ g: 'N', t: 'northwind.com/blog/october-release' }, { g: 'PDF', t: 'October release deck.pdf' }],
      prompt: 'Turn this release post and deck into a LinkedIn video. Lead with approvals and include a customer quote.',
      head: 'Learning about the October release',
      steps: [
        {
          type: 'web', title: 'Viewing northwind.com', desc: 'Going through the release post, the product pages and customer stories.',
          reads: [
            ['N', 'northwind.com/blog/october-release', 'Found the main announcement about faster approvals'],
            ['N', 'northwind.com/product/approvals', 'Learning how review and sign off works'],
            ['N', 'northwind.com/customers', 'Looking for customer proof'],
            ['N', 'northwind.com/customers/harbor-and-co', 'Found a strong quote from Harbor & Co.'],
            ['N', 'northwind.com/changelog', 'Checking what else shipped this month']
          ],
          final: 'Finished viewing 5 pages', done: 'Viewed 5 pages'
        },
        {
          type: 'pdf', title: 'Reading October release deck.pdf', file: 'October release deck.pdf', pages: 14, unit: 'Slide',
          notes: [
            'Opening the deck', 'Reading the agenda and summary slides', 'Found a chart on review times',
            'Pulled 3 numbers to use on screen', 'Reading the roadmap slides', 'Checking the closing slide for a call to action'
          ],
          final: 'Finished reading the deck', done: 'Read 14 slides'
        },
        {
          type: 'notes', title: 'Planning the scenes',
          notes: ['Matching the story to your prompt', 'Choosing the Harbor & Co. quote', () => `Fitting five scenes into ${lengthPhrase()}`],
          final: 'The storyboard is ready', done: 'Planned 5 scenes'
        }
      ],
      intro: total => `I have what I need. Here is a plan for a ${total} second ${shapeOf().word} video in the ${themeOf().name} theme.`,
      board: [
        { t: 'Opening', d: 'The Northwind name over the line The October release.', s: 5 },
        { t: 'Approvals', d: 'Product screens from the approvals page with the line Review and approve in one place.', s: 7 },
        { t: 'Proof', d: 'The 42 percent faster reviews figure from the deck.', s: 6 },
        { t: 'Customer quote', d: 'Priya N. from Harbor & Co. on approvals going from a week to an afternoon.', s: 8 },
        { t: 'Close', d: 'A call to action pointing to northwind.com/october.', s: 6 }
      ],
      change: null
    },
    {
      label: 'Website to video',
      theme: 'northwind', shape: 'wide', length: 45, result: 'Northwind homepage video',
      attach: [{ g: 'N', t: 'northwind.com' }],
      prompt: 'Make a homepage video that explains what Northwind does to first time visitors.',
      head: 'Learning about Northwind',
      steps: [
        {
          type: 'web', title: 'Viewing northwind.com', desc: 'Reviewing the website, product pages and customer testimonials.',
          reads: [
            ['N', 'northwind.com/', 'Getting a feel for the homepage and tone'],
            ['N', 'northwind.com/product', 'Noting the main product benefits'],
            ['N', 'northwind.com/product/approvals', 'Found the approvals flow'],
            ['N', 'northwind.com/customers', 'Found the 1,200 teams figure'],
            ['N', 'northwind.com/customers/harbor-and-co', 'Found a quote worth using'],
            ['N', 'northwind.com/security', 'Checking the security and compliance pages'],
            ['N', 'northwind.com/pricing', 'Noting the free plan for the call to action'],
            ['N', 'northwind.com/blog', '']
          ],
          final: 'Finished viewing 8 pages', done: 'Viewed 8 pages'
        },
        {
          type: 'notes', title: 'Reading customer testimonials',
          notes: ['Found 4 customer stories', 'Comparing quotes for length and clarity', 'Choosing the Harbor & Co. quote'],
          final: 'Picked the strongest quote', done: 'Read 4 customer stories'
        },
        {
          type: 'notes', title: 'Planning the scenes',
          notes: ['Matching the story to your prompt', 'Balancing the pace across five scenes', () => `Fitting the story into ${lengthPhrase()}`],
          final: 'The storyboard is ready', done: 'Planned 5 scenes'
        }
      ],
      intro: total => `Here is a plan for a ${total} second ${shapeOf().word} video in the ${themeOf().name} theme.`,
      board: [
        { t: 'Opening', d: 'The Northwind name over the line Work moves faster with fewer handoffs.', s: 8 },
        { t: 'Product', d: 'Product screens showing drafts, feedback and approvals in one place.', s: 10 },
        { t: 'Proof', d: 'The 1,200 teams figure from the customers page.', s: 9 },
        { t: 'Customer quote', d: 'Priya N. from Harbor & Co. on the review process fitting in one tab.', s: 11 },
        { t: 'Close', d: 'A Start free call to action on northwind.com.', s: 7 }
      ],
      change: {
        prompt: 'Add our security badge to the end.',
        head: 'Updating the storyboard', stepTitle: 'Changing scene 5',
        notes: ['Pulling the SOC 2 Type II badge from northwind.com/security', 'Placing it under the signup link'],
        final: 'Scene 5 is updated', done: 'Updated scene 5',
        intro: 'Scene 5 now closes on your SOC 2 Type II badge. Here is the updated plan.',
        at: 4, row: { t: 'Close', d: 'A Start free call to action with the SOC 2 Type II badge.', s: 7 }
      }
    },
    {
      label: 'Create brand theme', kind: 'theme',
      theme: 'orchid', shape: 'wide', length: 30,
      attach: [{ g: 'N', t: 'northwind.com' }],
      prompt: 'Build a brand theme from northwind.com so every video we make looks and sounds like our website.',
      head: 'Learning the Northwind brand',
      steps: [
        {
          type: 'web', title: 'Viewing northwind.com', desc: 'Looking at the site design, logo files and how Northwind writes.',
          reads: [
            ['N', 'northwind.com/', 'Reading the homepage layout and colors'],
            ['N', 'northwind.com/about', 'Learning how Northwind describes itself'],
            ['N', 'northwind.com/brand', 'Found a press kit with logo files'],
            ['N', 'northwind.com/product', 'Collecting colors from the product pages'],
            ['N', 'northwind.com/customers', 'Noting how customer stories are written'],
            ['N', 'northwind.com/blog', 'Sampling the writing voice']
          ],
          final: 'Finished viewing 6 pages', done: 'Viewed 6 pages'
        },
        {
          type: 'notes', title: 'Pulling colors, fonts and logos',
          notes: ['Found 14 colors in the site styles', 'Grouping them into 5 core colors', 'Headings use Manrope and body text uses IBM Plex Sans', 'Downloading the logo in 2 versions'],
          final: 'Found 5 colors, 2 fonts and 2 logos', done: 'Pulled 5 colors, 2 fonts and 2 logos'
        },
        {
          type: 'notes', title: 'Defining voice and tone',
          notes: ['Reading 12 blog posts and product pages', 'Short sentences, plain words and few exclamation points', 'Writing guidance for scripts and captions'],
          final: 'Voice and tone are defined', done: 'Defined voice and tone'
        },
        {
          type: 'notes', title: 'Checking contrast',
          notes: ['Testing text on every background color', 'All text pairs pass WCAG AA'],
          final: 'Contrast checks passed', done: 'Checked contrast'
        }
      ],
      intro: 'Here is the Northwind theme I built from your site. Any video that uses it gets these colors, fonts, logos and voice.',
      brand: {
        id: 'northwind', name: 'Northwind',
        colors: [
          { n: 'Midnight', h: '#0E1B33', r: 'Text' },
          { n: 'Northwind blue', h: '#3B6FD4', r: 'Primary' },
          { n: 'Tide', h: '#16A394', r: 'Accent' },
          { n: 'Sand', h: '#EFE9DD', r: 'Surface' },
          { n: 'Signal', h: '#FFB547', r: 'Highlight' }
        ],
        fonts: [
          { f: 'Manrope', w: 800, r: 'Headings · ExtraBold' },
          { f: 'IBM Plex Sans', w: 400, r: 'Body and captions · Regular' }
        ],
        traits: ['Plainspoken', 'Confident', 'Warm'],
        sample: '“Get work approved without chasing anyone.”',
        avoid: 'Avoids jargon, exclamation points and all caps.'
      },
      ask: 'Publish this theme so everyone in the Northwind space can use it?',
      publish: {
        head: 'Publishing the theme', title: 'Adding Northwind to Brand Kit',
        notes: ['Saving the theme to Brand Kit', 'Making it available to everyone in the Northwind space'],
        final: 'The theme is live', done: 'Published to Brand Kit',
        readyTitle: 'Northwind theme is published',
        readySub: 'Saved to Brand Kit · Available to everyone in the Northwind space'
      }
    }
  ];

  /* ---------- Composer options: edit here ---------- */
  const THEMES = [
    { id: 'northwind', name: 'Northwind', dots: ['#3B6FD4', '#16A394', '#EFE9DD'], bg: ['#141524', '#0E1B33', '#3B6FD4', '#16A394', '#141524'] },
    { id: 'ember', name: 'Ember', dots: ['#FF6A3D', '#FFC24B', '#5B1A2B'], bg: ['#141524', '#4A1414', '#B8321A', '#FF9A3D', '#141524'] },
    { id: 'meadow', name: 'Meadow', dots: ['#2F8F4E', '#C9E265', '#F3EFE0'], bg: ['#141524', '#0F3520', '#2F8F4E', '#C9E265', '#141524'] },
    { id: 'orchid', name: 'Orchid', dots: ['#8B5CF6', '#F472B6', '#FDE7F1'], bg: ['#141524', '#2A1150', '#8B5CF6', '#F472B6', '#141524'] }
  ];
  const SHAPES = [
    { id: 'wide', name: 'Widescreen', word: 'widescreen', ratio: '16:9' },
    { id: 'mobile', name: 'Mobile', word: 'mobile', ratio: '9:16' },
    { id: 'square', name: 'Square', word: 'square', ratio: '1:1' }
  ];
  const LENGTHS = [15, 30, 45, 60];
  const settings = { theme: 'northwind', shape: 'mobile', length: 30 };
  const touched = {};
  const hiddenThemes = new Set();
  let newTheme = null;
  const themeOf = () => THEMES.find(t => t.id === settings.theme);
  const shapeOf = () => SHAPES.find(s => s.id === settings.shape);
  const lengthPhrase = () => settings.length ? `${settings.length} seconds` : 'a natural length';

  /* ---------- Markup ---------- */
  const uid = 'cs' + Math.random().toString(36).slice(2, 7);
  stage.classList.add('stage');
  stage.innerHTML = `<div class="backdrop"></div>
    <div class="win" data-el="cw" role="region" aria-label="${opts.label || 'Animated sample of a Catalyst chat'}">
      <div class="bar"><div class="dots"><i></i><i></i><i></i></div><div class="tab"><svg class="logo" viewBox="0 0 424 73" width="99" height="17" role="img" aria-label="Catalyst"><use href="#clogo"/></svg></div></div>
      <div class="chat" data-el="chat"><div class="chat-inner">
        <div class="empty" data-el="empty"><span data-el="emptyIco"></span><h2>What should we make?</h2><p>Describe a video, or add a link, deck or recording.</p></div>
        <div class="log" data-el="log"></div>
      </div></div>
      <div class="composer" data-el="composer"><div class="c-box">
        <div class="c-row" data-el="attach"></div>
        <div class="c-field"><span class="c-text" data-el="ctext"></span><span class="c-ph">Describe the video you want</span></div>
        <div class="c-bottom">
          <span class="c-plus"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 4v14M4 11h14"/></svg></span>
          <div class="c-chips" data-el="chips"></div>
          <span class="c-send" data-el="csend"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19.5V5M5.5 11.5L12 5l6.5 6.5"/></svg></span>
        </div>
      </div></div>
      <svg class="cursor" data-el="cursor" viewBox="0 0 22 26" aria-hidden="true"><path d="M2 1.5v18l4.6-4.3 3.2 7.3 3.2-1.4-3.2-7.2h6.4z"/></svg>
    </div>`;

  /* ---------- Setup ---------- */
  const $ = id => stage.querySelector(`[data-el="${id}"]`);
  const root = $('cw'), chat = $('chat'), log = $('log'), empty = $('empty'), composer = $('composer');
  const ctext = $('ctext'), chipsEl = $('chips'), attachEl = $('attach'), csend = $('csend'), cursor = $('cursor');
  const pills = [...(opts.tabs || [])];
  const order = opts.scenes || SCENES.map((_, n) => n);
  let paused = false;
  const waiters = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let runId = 0, current = 0;
  const timers = new Set();

  const spark = (c = '') => `<svg class="spark ${c}" width="20" height="20" viewBox="0 0 66 66" aria-hidden="true"><use href="#cmark"/></svg>`;
  const check = `<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="16" height="16" rx="5" fill="var(--cs-ink)"/><path d="M6.3 10.3l2.6 2.6 4.8-5.2" stroke="var(--cs-win)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  $('emptyIco').innerHTML = spark();

  const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sleep = (ms, id) => new Promise((res, rej) => {
    const go = () => (id === runId ? res() : rej('stop'));
    setTimeout(() => (paused ? waiters.push(go) : go()), reduced ? 0 : ms);
  });
  const jitter = (a, b) => a + Math.random() * (b - a);
  const clearTimers = () => { timers.forEach(t => clearInterval(t)); timers.clear(); };
  const toEnd = () => chat.scrollTo({ top: chat.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  new ResizeObserver(toEnd).observe(log);
  const secs = t => Math.max(1, Math.round((Date.now() - t.t0) / 1000));
  const fmt = n => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`;

  const favHTML = g => `<i class="fav${g.length > 1 ? ' sm' : ''}">${g}</i>`;
  const attHTML = a => `<span class="att">${favHTML(a.g)}<span>${a.t}</span></span>`;

  /* ---------- Composer ---------- */
  const S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  const ICON_TALL = `<svg width="18" height="18" viewBox="0 0 20 20" ${S} aria-hidden="true"><rect x="5" y="2" width="10" height="16" rx="2.5"/><path d="M8.5 15h3"/></svg>`;
  const ICON_WIDE = `<svg width="18" height="18" viewBox="0 0 20 20" ${S} aria-hidden="true"><rect x="2" y="5" width="16" height="10" rx="2.5"/><path d="M15 8.5v3"/></svg>`;
  const ICON_TIMER = `<svg width="18" height="18" viewBox="0 0 20 20" ${S} aria-hidden="true"><circle cx="10" cy="11.5" r="6.5"/><path d="M8 2.5h4M10 2.5V5M10 11.5V8M15.5 5.5l1-1"/></svg>`;
  const ICON_SQUARE = `<svg width="18" height="18" viewBox="0 0 20 20" ${S} aria-hidden="true"><rect x="3.5" y="3.5" width="13" height="13" rx="2.5"/></svg>`;
  const ICON_CHECK = '<svg class="ck" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-6.5"/></svg>';
  const shapeIcon = id => ({ wide: ICON_WIDE, mobile: ICON_TALL, square: ICON_SQUARE })[id];
  const dotsHTML = cs => `<span class="dots3">${cs.map(c => `<i style="background:${c}"></i>`).join('')}</span>`;
  const lengthLabel = () => settings.length ? `${settings.length}s` : 'None';
  const backdrop = stage.querySelector('.backdrop');

  const dd = {};
  function makeDD(key, label, right) {
    const wrap = h('div', 'dd');
    const btn = h('button', 'chip');
    btn.type = 'button';
    btn.id = `${uid}-${key}`;
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
      const i = f.indexOf(stage.getRootNode().activeElement);
      const n = e.key === 'ArrowDown' ? (i + 1) % f.length : (i - 1 + f.length) % f.length;
      f[n].focus();
      e.preventDefault();
    });
    dd[key] = { btn, menu };
  }
  function openDD(key, focus = true) {
    for (const k in dd) {
      const open = k === key;
      dd[k].menu.hidden = !open;
      dd[k].btn.setAttribute('aria-expanded', String(open));
      dd[k].btn.classList.toggle('open', open);
      if (open && focus) (dd[k].menu.querySelector('[aria-checked="true"], .m-custom.on input') || dd[k].menu.querySelector('.item')).focus();
    }
  }
  function pick(key, value) {
    settings[key] = value;
    touched[key] = true;
    applySettings();
    openDD(null);
    dd[key].btn.focus();
  }
  function item(key, value, inner, checked) {
    const b = h('button', 'item', `${inner}${ICON_CHECK}`);
    b.type = 'button';
    b.setAttribute('role', 'menuitemradio');
    b.setAttribute('aria-checked', String(checked));
    b.dataset.id = String(value);
    b.addEventListener('click', e => { e.stopPropagation(); pick(key, value); });
    return b;
  }
  function renderMenus() {
    const tm = dd.theme.menu;
    tm.innerHTML = '<div class="m-head">Brand themes</div>';
    THEMES.filter(t => !hiddenThemes.has(t.id)).forEach(t => tm.append(item('theme', t.id, `${dotsHTML(t.dots)}<span class="m-name">${t.name}</span>${t.id === newTheme ? '<span class="m-meta new">New</span>' : ''}`, t.id === settings.theme)));

    const sm = dd.shape.menu;
    sm.innerHTML = '<div class="m-head">Aspect ratio</div>';
    SHAPES.forEach(s => sm.append(item('shape', s.id, `${shapeIcon(s.id)}<span class="m-name">${s.name}</span><span class="m-meta">${s.ratio}</span>`, s.id === settings.shape)));

    const lm = dd.length.menu;
    lm.innerHTML = '<div class="m-head">Duration</div>';
    LENGTHS.forEach(n => lm.append(item('length', n, `<span class="m-name">${n} seconds</span>`, settings.length === n)));
    lm.append(item('length', null, '<span class="m-name">None</span><span class="m-meta">Catalyst decides</span>', settings.length === null));
    const custom = settings.length !== null && !LENGTHS.includes(settings.length);
    const row = h('div', 'm-custom' + (custom ? ' on' : ''), `<label for="${uid}-custom">Custom</label><input id="${uid}-custom" type="number" inputmode="numeric" min="5" max="600" placeholder="Type seconds" value="${custom ? settings.length : ''}"><span>sec</span>`);
    const inp = row.querySelector('input');
    const commit = () => {
      const v = Math.round(Number(inp.value));
      if (!v) return;
      pick('length', Math.min(600, Math.max(5, v)));
    };
    inp.addEventListener('click', e => e.stopPropagation());
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } });
    inp.addEventListener('change', commit);
    lm.append(h('div', 'm-sep'), row);
  }
  function applySettings() {
    const t = themeOf(), s = shapeOf();
    dd.theme.btn.innerHTML = `${dotsHTML(t.dots)}<span>${t.name}</span>`;
    dd.shape.btn.innerHTML = `${shapeIcon(s.id)}<span>${s.name}</span>`;
    dd.length.btn.innerHTML = `${ICON_TIMER}<span>${lengthLabel()}</span>`;
    t.bg.forEach((c, i) => backdrop.style.setProperty(`--cs-g${i + 1}`, c));
    renderMenus();
  }
  makeDD('theme', 'Brand theme');
  makeDD('shape', 'Aspect ratio');
  makeDD('length', 'Duration', true);
  document.addEventListener('click', e => { if (!e.composedPath().some(n => n.classList && n.classList.contains('dd') && stage.contains(n))) openDD(null, false); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    for (const k in dd) if (!dd[k].menu.hidden) { openDD(null); dd[k].btn.focus(); }
  });

  function fitPlan(rows) {
    const out = rows.map(r => ({ ...r }));
    if (!settings.length) return out;
    const sum = out.reduce((a, r) => a + r.s, 0);
    out.forEach(r => { r.s = Math.max(1, Math.round((r.s * settings.length) / sum)); });
    const last = out[out.length - 1];
    last.s = Math.max(1, last.s + settings.length - out.reduce((a, r) => a + r.s, 0));
    return out;
  }
  async function typeInto(text, id) {
    composer.classList.add('typing');
    if (reduced) { ctext.textContent = text; return; }
    for (const ch of text) { ctext.textContent += ch; await sleep(jitter(16, 44), id); }
  }
  function moveCursor(el) {
    const w = root.getBoundingClientRect(), r = el.getBoundingClientRect();
    cursor.style.transform = `translate(${r.left - w.left + r.width / 2 - 4}px, ${r.top - w.top + r.height / 2 - 3}px)`;
  }
  async function clickAt(el, id) {
    if (reduced) return;
    const w = root.getBoundingClientRect();
    cursor.style.transition = 'none';
    cursor.style.transform = `translate(${w.width * 0.68}px, ${w.height * 0.5}px)`;
    void cursor.offsetWidth;
    cursor.style.transition = '';
    cursor.classList.add('show');
    moveCursor(el);
    await sleep(1100, id);
    el.classList.add('press');
    await sleep(170, id);
    el.classList.remove('press');
    await sleep(260, id);
    cursor.classList.remove('show');
  }
  function addUser(text, atts) {
    empty.hidden = true;
    const m = h('div', 'msg-user', `${atts.length ? `<div class="atts">${atts.map(attHTML).join('')}</div>` : ''}<p></p>`);
    m.querySelector('p').textContent = text;
    log.append(m);
  }
  async function send(text, atts, id) {
    await typeInto(text, id);
    await sleep(450, id);
    await clickAt(csend, id);
    composer.classList.remove('typing');
    ctext.textContent = '';
    attachEl.innerHTML = '';
    addUser(text, atts);
  }

  /* ---------- Assistant blocks ---------- */
  function addTask() {
    const t = h('div', 'task', `<div class="t-head"><span class="t-ico">${spark('dim')}</span><span class="t-title shimmer">Thinking…</span></div><div class="t-steps"></div>`);
    log.append(t);
    t.titleEl = t.querySelector('.t-title');
    t.stepsEl = t.querySelector('.t-steps');
    t.t0 = Date.now();
    return t;
  }
  function addStep(task, title, desc) {
    const s = h('div', 'step', `<span class="s-ico">${spark('live')}</span><div class="s-line"><span class="s-title">${title}</span><span class="s-time">0s</span></div><div class="s-more">${desc ? `<p class="s-desc">${desc}</p>` : ''}<div class="s-body"></div></div>`);
    task.stepsEl.append(s);
    s.bodyEl = s.querySelector('.s-body');
    s.moreEl = s.querySelector('.s-more');
    s.titleEl = s.querySelector('.s-title');
    const t0 = Date.now(), tm = s.querySelector('.s-time');
    s.iv = setInterval(() => { tm.textContent = Math.floor((Date.now() - t0) / 1000) + 's'; }, 250);
    timers.add(s.iv);
    return s;
  }
  function doneStep(s, summary, collapse) {
    clearInterval(s.iv);
    s.classList.add('done');
    s.querySelector('.s-ico').innerHTML = check;
    s.titleEl.textContent = summary;
    if (collapse) {
      s.moreEl.style.maxHeight = s.moreEl.scrollHeight + 'px';
      requestAnimationFrame(() => { s.moreEl.style.maxHeight = '0px'; s.moreEl.style.opacity = '0'; });
    }
  }
  const txt = v => (typeof v === 'function' ? v() : v);
  function statusLine(s) {
    const st = h('div', 'status');
    s.bodyEl.append(st);
    return {
      say(txt) { st.classList.remove('fin'); st.innerHTML = '<i></i><span></span>'; st.lastChild.textContent = txt; },
      end(txt) { st.classList.add('fin'); st.innerHTML = '<i></i><span></span>'; st.lastChild.textContent = txt; }
    };
  }

  async function runStep(task, spec, id) {
    const s = addStep(task, spec.title, spec.desc || '');
    let pdf = null;
    if (spec.type === 'pdf') {
      pdf = h('div', 'pdf', favHTML('PDF') + '<div class="pcol"><div class="pname"><span></span><span class="pg"></span></div><div class="pbar"><i></i></div></div>');
      pdf.querySelector('.pname span').textContent = spec.file;
      s.bodyEl.append(pdf);
    }
    const st = statusLine(s);

    if (spec.type === 'web') {
      const ul = h('ul', 'reads');
      s.bodyEl.append(ul);
      let prev = null;
      for (const [g, label, note] of spec.reads) {
        const li = h('li', 'read now', `${favHTML(g)}<span>Reading ${label}</span>`);
        ul.append(li);
        if (prev) { prev.classList.remove('now'); prev.classList.add('past'); }
        prev = li;
        await sleep(jitter(320, 450), id);
        if (note) st.say(note);
        await sleep(jitter(300, 430), id);
      }
      prev.classList.remove('now'); prev.classList.add('past');
    } else if (spec.type === 'pdf') {
      const pg = pdf.querySelector('.pg'), bar = pdf.querySelector('.pbar i');
      for (let i = 0; i < spec.notes.length; i++) {
        st.say(txt(spec.notes[i]));
        const now = Math.max(1, Math.round(((i + 1) / spec.notes.length) * spec.pages));
        pg.textContent = `${spec.unit} ${now} of ${spec.pages}`;
        bar.style.width = (now / spec.pages) * 100 + '%';
        await sleep(jitter(820, 1100), id);
      }
    } else {
      for (const n of spec.notes) { st.say(txt(n)); await sleep(jitter(820, 1050), id); }
    }
    st.end(spec.final);
    await sleep(700, id);
    doneStep(s, spec.done, true);
  }

  async function research(sc, id) {
    const t = addTask();
    await sleep(1500, id);
    t.titleEl.classList.remove('shimmer');
    t.titleEl.textContent = sc.head;
    for (const spec of sc.steps) { await runStep(t, spec, id); await sleep(450, id); }
    t.titleEl.textContent = `Finished in ${secs(t)}s`;
    await sleep(500, id);
  }

  function boardEl(sc, rows) {
    const total = rows.reduce((a, r) => a + r.s, 0);
    return h('div', 'board', `<div class="b-head"><b>Suggested storyboard</b><span>${rows.length} scenes · ${fmt(total)} · ${shapeOf().name}</span></div><div class="b-bar">${rows.map(r => `<i style="flex:${r.s}"></i>`).join('')}</div>`);
  }
  function rowEl(r, n, updated) {
    const row = h('div', 'b-row' + (updated ? ' upd' : ''), `<span class="b-num">${n + 1}</span><div class="b-txt"><b><span class="bt"></span>${updated ? '<span class="tag">Updated</span>' : ''}</b><span class="bd"></span></div><span class="b-dur">${r.s}s</span>`);
    row.querySelector('.bt').textContent = r.t;
    row.querySelector('.bd').textContent = r.d;
    return row;
  }
  async function proposal(sc, base, intro, updatedAt, id) {
    const rows = fitPlan(base);
    const p = h('p', 'reply');
    p.textContent = typeof intro === 'function' ? intro(rows.reduce((a, r) => a + r.s, 0)) : intro;
    log.append(p);
    await sleep(800, id);
    const b = boardEl(sc, rows);
    log.append(b);
    for (let n = 0; n < rows.length; n++) {
      b.append(rowEl(rows[n], n, n === updatedAt));
      await sleep(560, id);
    }
    await sleep(600, id);
    return ask('Want me to build it or change anything first?', 'Make it', 'Type changes', id);
  }
  async function ask(question, a, b, id) {
    const q = h('p', 'reply');
    q.textContent = question;
    log.append(q);
    await sleep(500, id);
    const o = h('div', 'opts', `<div class="opt"><span class="k">1</span><span>${a}</span></div><div class="opt"><span class="k">2</span><span>${b}</span></div>`);
    log.append(o);
    await sleep(1400, id);
    return [o.children[0], o.children[1]];
  }
  async function choose(opts, n, id) {
    await clickAt(opts[n], id);
    opts[n].classList.add('sel');
    opts[1 - n].classList.add('off');
  }

  async function applyChange(sc, id) {
    const c = sc.change;
    const t = addTask();
    await sleep(1100, id);
    t.titleEl.classList.remove('shimmer');
    t.titleEl.textContent = c.head;
    await runStep(t, { type: 'notes', title: c.stepTitle, notes: c.notes, final: c.final, done: c.done }, id);
    await sleep(500, id);
  }

  async function build(sc, base, id) {
    const rows = fitPlan(base);
    const t = addTask();
    const words = ['Thinking', 'Catalysting', 'Sparking ideas', 'Cutting the scenes', 'Matching your theme', 'Polishing the edit'];
    let w = 0;
    t.titleEl.textContent = words[0] + '…';
    const iv = setInterval(() => { w = (w + 1) % words.length; t.titleEl.textContent = words[w] + '…'; }, 1300);
    timers.add(iv);
    await sleep(1400, id);

    const n = rows.length;
    const s = addStep(t, `Building scene 1 of ${n}`, '');
    const pr = h('div', 'r-prog', '<div class="pbar"><i></i></div><span>0%</span>');
    const st = statusLine(s);
    s.bodyEl.prepend(pr);
    const bar = pr.querySelector('i'), pct = pr.querySelector('span');
    for (let k = 0; k < n; k++) {
      s.titleEl.textContent = `Building scene ${k + 1} of ${n}`;
      st.say(`${rows[k].t}: ${rows[k].d}`);
      await sleep(jitter(1400, 1800), id);
      const v = Math.round(((k + 1) / n) * 100);
      bar.style.width = v + '%';
      pct.textContent = v + '%';
    }
    st.end('Rendering the final cut');
    await sleep(1200, id);
    doneStep(s, `Built ${n} scenes`, true);
    clearInterval(iv); timers.delete(iv);
    t.titleEl.classList.remove('shimmer');
    t.titleEl.textContent = `Built in ${secs(t)}s`;
    await sleep(700, id);

    const total = rows.reduce((a, r) => a + r.s, 0);
    readyCard('Your video is ready!', `${sc.result} · ${fmt(total)} · ${shapeOf().name} · ${themeOf().name} theme`);
  }
  function readyCard(title, sub) {
    const d = h('div', 'ready-card', `<span class="d-ico"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 10.5l3.2 3.2L15 7"/></svg></span><div><b></b><span class="d-sub"></span></div>`);
    d.querySelector('b').textContent = title;
    d.querySelector('.d-sub').textContent = sub;
    log.append(d);
  }

  /* ---------- Brand theme scene ---------- */
  function brandSections(b) {
    const sec = (title, inner) => h('section', 'tc-sec', `<h4>${title}</h4>${inner}`);
    const logo = (bg, mark, markInk, word) => `<div class="lg" style="background:${bg}"><span class="nm" style="background:${mark};color:${markInk}">N</span><span class="wm" style="color:${word}">northwind</span></div>`;
    return [
      sec('Colors', `<div class="sw-grid">${b.colors.map(c => `<div class="sw"><i style="background:${c.h}"></i><b>${c.n}</b><span>${c.r}</span><span class="hex">${c.h}</span></div>`).join('')}</div>`),
      sec('Fonts', `<div class="fonts">${b.fonts.map(f => `<div class="font"><span class="aa" style="font-family:'${f.f}', 'Roboto Flex', sans-serif;font-weight:${f.w}">Aa</span><div><b>${f.f}</b><span>${f.r}</span></div></div>`).join('')}</div>`),
      sec('Logos', `<div class="logos">${logo('#EFE9DD', '#3B6FD4', '#FFFFFF', '#0E1B33')}${logo('#0E1B33', '#FFFFFF', '#0E1B33', '#FFFFFF')}</div>`),
      sec('Voice and tone', `<div class="traits">${b.traits.map(t => `<span>${t}</span>`).join('')}</div><p class="vs">${b.sample}</p><p class="va">${b.avoid}</p>`)
    ];
  }
  async function playTheme(sc, id) {
    await research(sc, id);
    const p = h('p', 'reply');
    p.textContent = sc.intro;
    log.append(p);
    await sleep(800, id);
    const b = sc.brand;
    const card = h('div', 'tcard', `<div class="tc-head"><b>${b.name} theme</b><span class="tag draft">Draft</span></div>`);
    log.append(card);
    for (const s of brandSections(b)) { await sleep(750, id); card.append(s); }
    await sleep(900, id);

    const opts = await ask(sc.ask, 'Yes, publish', 'No, keep as a draft', id);
    await choose(opts, 0, id);
    await sleep(400, id);
    addUser('Yes, publish', []);

    const pb = sc.publish;
    const t = addTask();
    await sleep(1100, id);
    t.titleEl.classList.remove('shimmer');
    t.titleEl.textContent = pb.head;
    await runStep(t, { type: 'notes', title: pb.title, notes: pb.notes, final: pb.final, done: pb.done }, id);
    t.titleEl.textContent = `Finished in ${secs(t)}s`;
    const tag = card.querySelector('.tag');
    tag.classList.remove('draft');
    tag.textContent = 'Published';
    await sleep(500, id);
    readyCard(pb.readyTitle, pb.readySub);

    await sleep(1600, id);
    hiddenThemes.delete(b.id);
    newTheme = b.id;
    renderMenus();
    await clickAt(dd.theme.btn, id);
    openDD('theme', false);
    await sleep(900, id);
    await clickAt(dd.theme.menu.querySelector(`[data-id="${b.id}"]`), id);
    settings.theme = b.id;
    applySettings();
    openDD(null, false);
    dd.theme.btn.classList.add('flash');
    await sleep(1200, id);
    dd.theme.btn.classList.remove('flash');
  }

  function reset(i) {
    const sc = SCENES[i];
    log.innerHTML = '';
    empty.hidden = false;
    ctext.textContent = '';
    attachEl.innerHTML = '';
    composer.classList.remove('typing');
    cursor.classList.remove('show');
    hiddenThemes.clear();
    newTheme = null;
    if (sc.kind === 'theme') hiddenThemes.add(sc.brand.id);
    for (const k of ['theme', 'shape', 'length']) if (!touched[k]) settings[k] = sc[k];
    if (hiddenThemes.has(settings.theme)) settings.theme = sc.theme;
    openDD(null, false);
    applySettings();
    chat.scrollTo({ top: 0 });
    pills.forEach(p => p.setAttribute('aria-pressed', String(Number(p.dataset.scene) === i)));
  }

  async function play(i) {
    const id = ++runId;
    current = i;
    clearTimers();
    reset(i);
    const sc = SCENES[i];
    const rows = [...(sc.board || [])];
    try {
      await sleep(1100, id);
      for (const a of sc.attach) { attachEl.insertAdjacentHTML('beforeend', attHTML(a)); await sleep(420, id); }
      await sleep(500, id);
      await send(sc.prompt, sc.attach, id);

      if (sc.kind === 'theme') {
        await playTheme(sc, id);
        await finish(i, id, 7000);
        return;
      }

      await research(sc, id);
      let opts = await proposal(sc, rows, sc.intro, -1, id);

      if (sc.change) {
        const c = sc.change;
        await choose(opts, 1, id);
        await sleep(500, id);
        await send(c.prompt, [], id);
        await applyChange(sc, id);
        rows[c.at] = c.row;
        opts = await proposal(sc, rows, c.intro, c.at, id);
      }

      await choose(opts, 0, id);
      await sleep(400, id);
      addUser('Make it', []);
      await build(sc, rows, id);

      await finish(i, id, 9000);
    } catch (e) {
      if (e !== 'stop') console.error(e);
    }
  }

  const host = opts.host || stage;
  const emit = name => host.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  async function finish(i, id, hold) {
    if (opts.controlled) {
      await sleep(reduced ? 0 : 3000, id);
      emit('catalyst-scene-end');
      return;
    }
    if (!reduced) { await sleep(hold, id); play(order[(order.indexOf(i) + 1) % order.length]); }
  }
  pills.forEach(p => p.addEventListener('click', () => { paused = false; waiters.length = 0; play(Number(p.dataset.scene)); }));
  let started = false, visible = false;
  const pause = () => { if (!paused) { paused = true; emit('catalyst-scene-pause'); } };
  const resume = () => { if (paused) { paused = false; waiters.splice(0).forEach(f => f()); emit('catalyst-scene-resume'); } };
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) {
      if (!started && !opts.controlled) { started = true; play(order[0]); return; }
      if (started) resume();
    } else if (started) {
      pause();
    }
  }, { threshold: 0.3 }).observe(stage);
  // Start (or start over) from the first step. Used by page scripts such as auto-advancing tabs.
  return {
    restart() {
      started = true;
      waiters.length = 0;
      paused = !visible;
      if (paused) emit('catalyst-scene-pause');
      play(order[0]);
    }
  };
};

  const SCENE_INDEX = { assets: 0, website: 1, 'brand-theme': 2 };
  const LABELS = [
    'Animated example of a Catalyst chat that turns a blog post and a deck into a video plan',
    'Animated example of a Catalyst chat that turns a website into a video plan',
    'Animated example of Catalyst building a brand theme from a website'
  ];

  class CatalystScene extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) return;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML = `<style>${CSS}</style>${SPRITE}<div class="cs-stage"></div>`;
      const n = SCENE_INDEX[this.getAttribute('scene')] ?? 0;
      this._scene = mount(root.querySelector('.cs-stage'), { scenes: [n], label: LABELS[n], host: this, controlled: this.hasAttribute('controlled') });
      if (this._pendingRestart) { this._pendingRestart = false; this._scene.restart(); }
    }
    restart() {
      if (this._scene) this._scene.restart();
      else this._pendingRestart = true;
    }
  }
  customElements.define('catalyst-scene', CatalystScene);
})();
