/*! Catalyst brand theme · <catalyst-brand-theme> web component
 *  Usage: <catalyst-brand-theme></catalyst-brand-theme>
 *  Optional attributes:
 *    theme="naboo | tatooine | hoth"   starting theme (Naboo is the default)
 *    breakpoint="760"                  container width in px below which the mobile layout shows
 *  Fires "catalyst-brand-theme-change" with { theme } when someone picks a theme.
 *  Desktop is a 1200×720 composition that scales down to fit narrower containers and sits centered in wider ones.
 *  Mobile is the switcher, a title card and a lower third.
 *  Styles live in a shadow root. The UI font is inherited from the page (Roboto Flex). The six brand fonts load from Google Fonts.
 *  The background is #141524 with no border, so it blends into the Socialive site.
 */
(() => {
  if (customElements.get('catalyst-brand-theme')) return;

  /* ---------- Themes: edit here ---------- */
  const THEMES = [
    {
      id: 'naboo', name: 'Naboo', meta: 'Private wealth',
      dots: ['#1F4FBF', '#7FB3FF', '#F2F0E9'], ring: ['#1F4FBF', '#7FB3FF', '#EAF1FF'],
      primary: '#1F4FBF', accent: '#7FB3FF', swatch: '50%',
      colors: [['#0B1F4B', 'Navy'], ['#1F4FBF', 'Royal'], ['#7FB3FF', 'Sky'], ['#EAF1FF', 'Mist'], ['#F2F0E9', 'Ivory']],
      head: { family: "'Cormorant Garamond', serif", name: 'Cormorant Garamond', weight: 600, aa: 36 },
      body: { family: "'IBM Plex Sans', sans-serif", name: 'IBM Plex Sans' },
      voice: { text: 'We plan in decades.', size: 22 }
    },
    {
      id: 'tatooine', name: 'Tatooine', meta: 'Business banking',
      dots: ['#D9601E', '#F0A830', '#F3E2BF'], ring: ['#D9601E', '#F0A830', '#F3E2BF'],
      primary: '#D9601E', accent: '#F0A830', swatch: '2px',
      colors: [['#3A2314', 'Bark'], ['#5C3A1E', 'Umber'], ['#D9601E', 'Clay'], ['#F0A830', 'Amber'], ['#F3E2BF', 'Sand']],
      head: { family: "'Syne', sans-serif", name: 'Syne', weight: 800, aa: 26 },
      body: { family: "'DM Sans', sans-serif", name: 'DM Sans' },
      voice: { text: 'We say yes faster.', size: 17 }
    },
    {
      id: 'hoth', name: 'Hoth', meta: 'Treasury platform',
      dots: ['#FFFFFF', '#BFE3F5', '#2E6A8F'], ring: ['#FFFFFF', '#BFE3F5', '#2E6A8F'],
      primary: '#3A7CA5', accent: '#BFE3F5', swatch: '999px',
      colors: [['#FFFFFF', 'Snow'], ['#EDF5FB', 'Frost'], ['#BFE3F5', 'Ice'], ['#2E6A8F', 'Steel'], ['#16324A', 'Deep']],
      head: { family: "'Outfit', sans-serif", name: 'Outfit', weight: 300, aa: 34 },
      body: { family: "'Manrope', sans-serif", name: 'Manrope' },
      voice: { text: 'Know where every dollar sits.', size: 18 }
    }
  ];
  const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=IBM+Plex+Sans:wght@400;500&family=Syne:wght@800&family=DM+Sans:wght@400;600;700&family=Outfit:wght@300;400;500&family=Manrope:wght@400;500;600&display=swap';
  const FONT_FACES = ['600 1em "Cormorant Garamond"', '400 1em "IBM Plex Sans"', '500 1em "IBM Plex Sans"', '800 1em "Syne"', '400 1em "DM Sans"', '600 1em "DM Sans"', '700 1em "DM Sans"', '300 1em "Outfit"', '400 1em "Outfit"', '500 1em "Outfit"', '400 1em "Manrope"', '500 1em "Manrope"', '600 1em "Manrope"'];
  const SHADOW = 'box-shadow: 0 20px 40px -18px rgba(0, 0, 0, 0.7)';

  /* ---------- Brand pieces: each theme has its own layout ---------- */
  const P = {
    naboo: {
      title: `<div style="position: relative; width: 300px; height: 169px; border-radius: 12px; overflow: hidden; background: #0B1F4B; ${SHADOW}">
  <div style="position: absolute; inset: 10px; border: 1px solid rgba(127, 179, 255, 0.38); border-radius: 3px"></div>
  <div style="position: absolute; left: -60px; bottom: -120px; width: 240px; height: 240px; border-radius: 50%; border: 1px solid rgba(127, 179, 255, 0.18)"></div>
  <div style="position: absolute; inset: 0; padding: 20px 30px 18px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center">
    <span style="width: 24px; height: 24px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 15px; line-height: 1; color: #F2F0E9">N</span>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 7px">
      <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5px; line-height: 1; letter-spacing: 0.2em; text-transform: uppercase; color: #7FB3FF">Q3 2026 outlook</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 20px; line-height: 1.08; color: #F2F0E9">A steady hand through the rate cycle</span>
      <span style="width: 32px; height: 1px; background: #7FB3FF"></span>
    </div>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 7.5px; line-height: 1; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(242, 240, 233, 0.7)">Naboo private wealth</span>
  </div>
</div>`,
      stat: `<div style="position: relative; width: 300px; padding: 20px 24px 18px; background: #F2F0E9; border-radius: 12px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; ${SHADOW}">
  <div style="position: absolute; inset: 8px; border: 1px solid rgba(11, 31, 75, 0.18); border-radius: 3px; pointer-events: none"></div>
  <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 9px; line-height: 1.2; letter-spacing: 0.2em; text-transform: uppercase; color: #1F4FBF">Assets under management</span>
  <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 48px; line-height: 1; letter-spacing: -0.01em; color: #0B1F4B">$12.4B</span>
  <span style="width: 32px; height: 1px; background: #1F4FBF"></span>
  <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 11.5px; line-height: 1.3; color: #0B1F4B">Up 8% year over year</span>
</div>`,
      lower: `<div style="display: inline-flex; align-items: center; gap: 14px; max-width: 300px; padding: 12px 20px 12px 14px; background: #0B1F4B; border: 1px solid rgba(127, 179, 255, 0.5); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45)">
  <span style="width: 32px; height: 32px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 19px; line-height: 1; color: #F2F0E9">N</span>
  <span style="width: 1px; height: 36px; flex: none; background: rgba(127, 179, 255, 0.5)"></span>
  <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
    <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 21px; line-height: 1; color: #F2F0E9">Elena Marchetti</span>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 9.5px; line-height: 1.3; letter-spacing: 0.16em; text-transform: uppercase; color: #7FB3FF">Chief investment officer</span>
  </div>
</div>`,
      caption: `<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 300px; padding: 4px 0; text-align: center">
  <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; line-height: 1.35; font-weight: 500; color: #F2F0E9; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8)">Our outlook favors quality and patience this quarter.</span>
  <span style="width: 40px; height: 1px; background: #7FB3FF"></span>
</div>`,
      end: `<div style="position: relative; width: 260px; height: 146px; border-radius: 12px; overflow: hidden; background: #0B1F4B; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; text-align: center; ${SHADOW}">
  <div style="position: absolute; inset: 9px; border: 1px solid rgba(127, 179, 255, 0.38); border-radius: 3px"></div>
  <span style="width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 17px; line-height: 1; color: #F2F0E9">N</span>
  <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 21px; line-height: 1; letter-spacing: 0.08em; color: #F2F0E9">Naboo</span>
  <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 7.5px; line-height: 1; letter-spacing: 0.24em; text-transform: uppercase; color: #7FB3FF">Private wealth</span>
  <span style="margin-top: 4px; font-family: 'IBM Plex Sans', sans-serif; font-size: 10px; line-height: 1.2; color: #F2F0E9; border-bottom: 1px solid #7FB3FF; padding-bottom: 2px">Schedule a conversation</span>
</div>`,
      logos: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: 300px">
  <div style="height: 86px; border-radius: 12px; background: #F2F0E9; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; ${SHADOW}">
    <div style="display: flex; align-items: center; gap: 7px">
      <span style="width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid #0B1F4B; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 13px; line-height: 1; color: #0B1F4B">N</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 19px; line-height: 1; letter-spacing: 0.08em; color: #0B1F4B">Naboo</span>
    </div>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 6.5px; line-height: 1; letter-spacing: 0.24em; text-transform: uppercase; color: #1F4FBF">Private wealth</span>
  </div>
  <div style="height: 86px; border-radius: 12px; background: #0B1F4B; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; ${SHADOW}">
    <div style="display: flex; align-items: center; gap: 7px">
      <span style="width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 13px; line-height: 1; color: #F2F0E9">N</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 19px; line-height: 1; letter-spacing: 0.08em; color: #F2F0E9">Naboo</span>
    </div>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 6.5px; line-height: 1; letter-spacing: 0.24em; text-transform: uppercase; color: #7FB3FF">Private wealth</span>
  </div>
</div>`,
      mTitle: `<div style="position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #0B1F4B; ${SHADOW}">
  <div style="position: absolute; inset: 11px; border: 1px solid rgba(127, 179, 255, 0.38); border-radius: 3px"></div>
  <div style="position: absolute; left: -70px; bottom: -140px; width: 280px; height: 280px; border-radius: 50%; border: 1px solid rgba(127, 179, 255, 0.18)"></div>
  <div style="position: absolute; inset: 0; padding: 22px 34px 20px; display: flex; flex-direction: column; align-items: center; justify-content: space-between; text-align: center">
    <span style="width: 28px; height: 28px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 17px; line-height: 1; color: #F2F0E9">N</span>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
      <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 9.5px; line-height: 1; letter-spacing: 0.2em; text-transform: uppercase; color: #7FB3FF">Q3 2026 outlook</span>
      <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 24px; line-height: 1.06; color: #F2F0E9">A steady hand through the rate cycle</span>
      <span style="width: 36px; height: 1px; background: #7FB3FF"></span>
    </div>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 8.5px; line-height: 1; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(242, 240, 233, 0.7)">Naboo private wealth</span>
  </div>
</div>`,
      mLower: `<div style="display: inline-flex; align-items: center; gap: 14px; max-width: 100%; padding: 12px 20px 12px 14px; background: #0B1F4B; border: 1px solid rgba(127, 179, 255, 0.5); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.45)">
  <span style="width: 34px; height: 34px; flex: none; display: grid; place-items: center; border-radius: 50%; border: 1px solid #7FB3FF; font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 20px; line-height: 1; color: #F2F0E9">N</span>
  <span style="width: 1px; height: 38px; flex: none; background: rgba(127, 179, 255, 0.5)"></span>
  <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
    <span style="font-family: 'Cormorant Garamond', serif; font-weight: 600; font-size: 22px; line-height: 1; color: #F2F0E9">Elena Marchetti</span>
    <span style="font-family: 'IBM Plex Sans', sans-serif; font-size: 10px; line-height: 1.3; letter-spacing: 0.16em; text-transform: uppercase; color: #7FB3FF">Chief investment officer</span>
  </div>
</div>`
    },

    tatooine: {
      title: `<div style="position: relative; width: 300px; height: 169px; border-radius: 12px; overflow: hidden; background: #F3E2BF; ${SHADOW}">
  <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 64px; background: #F0A830"></div>
  <div style="position: absolute; right: 64px; top: 0; bottom: 0; width: 6px; background: #D9601E"></div>
  <div style="position: absolute; right: 14px; top: 16px; width: 36px; height: 36px; border-radius: 50%; background: #D9601E"></div>
  <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 230px; padding: 16px 20px 18px 18px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start">
    <div style="display: flex; align-items: center; gap: 6px">
      <span style="width: 16px; height: 16px; display: grid; place-items: center; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 10px; line-height: 1">T</span>
      <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 10px; line-height: 1; letter-spacing: 0.1em; text-transform: uppercase; color: #3A2314">Tatooine</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
      <span style="padding: 3px 6px; background: #3A2314; color: #F3E2BF; font-family: 'DM Sans', sans-serif; font-size: 7.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase">Q4 lending update</span>
      <div style="display: flex; gap: 10px">
        <span style="width: 4px; flex: none; background: #D9601E"></span>
        <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; line-height: 1.02; letter-spacing: -0.02em; color: #3A2314">Loans approved in days</span>
      </div>
    </div>
  </div>
</div>`,
      stat: `<div style="position: relative; width: 300px; background: #3A2314; border-radius: 2px; overflow: hidden; display: flex; flex-direction: column; ${SHADOW}">
  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 14px; background: #F0A830">
    <span style="font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #3A2314">Loans funded, Q3</span>
    <span style="width: 12px; height: 12px; background: #3A2314"></span>
  </div>
  <div style="padding: 14px; display: flex; flex-direction: column; gap: 10px">
    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap">
      <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 38px; line-height: 1; letter-spacing: -0.03em; color: #F3E2BF">$860M</span>
      <span style="padding: 2px 6px; background: #D9601E; color: #3A2314; font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 700">+14%</span>
    </div>
    <span style="font-family: 'DM Sans', sans-serif; font-size: 12px; line-height: 1.3; color: rgba(243, 226, 191, 0.82)">Across 4,200 small businesses</span>
    <div style="height: 6px; background: rgba(243, 226, 191, 0.18)"><div style="width: 72%; height: 100%; background: #D9601E"></div></div>
  </div>
</div>`,
      lower: `<div style="display: inline-flex; align-items: stretch; max-width: 300px; filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45))">
  <span style="width: 7px; flex: none; background: #F0A830"></span>
  <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0">
    <span style="padding: 8px 14px; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 16px; line-height: 1.05; letter-spacing: -0.01em">Marcus Oyelaran</span>
    <span style="padding: 6px 14px; background: #D9601E; color: #3A2314; font-family: 'DM Sans', sans-serif; font-size: 10px; line-height: 1.3; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase">Head of small business lending</span>
  </div>
</div>`,
      caption: `<div style="display: inline-flex; align-items: stretch; max-width: 300px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4)">
  <span style="width: 5px; flex: none; background: #D9601E"></span>
  <span style="padding: 8px 14px; background: #3A2314; color: #F3E2BF; font-family: 'DM Sans', sans-serif; font-size: 15px; line-height: 1.35; font-weight: 600">Most loans get a decision in three days.</span>
</div>`,
      end: `<div style="position: relative; width: 260px; height: 146px; border-radius: 12px; overflow: hidden; background: #F3E2BF; ${SHADOW}">
  <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 44px; background: #F0A830"></div>
  <div style="position: absolute; right: 44px; top: 0; bottom: 0; width: 5px; background: #D9601E"></div>
  <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 211px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start">
    <div style="display: flex; align-items: center; gap: 6px">
      <span style="width: 20px; height: 20px; flex: none; display: grid; place-items: center; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; line-height: 1">T</span>
      <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 12px; line-height: 1; letter-spacing: 0.1em; text-transform: uppercase; color: #3A2314">Tatooine</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px">
      <span style="padding: 7px 12px; background: #3A2314; color: #F3E2BF; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 10.5px; line-height: 1.2">Apply in 10 minutes</span>
      <span style="font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #3A2314">tatooine.bank</span>
    </div>
  </div>
</div>`,
      logos: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: 300px">
  <div style="height: 86px; border-radius: 12px; background: #F3E2BF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; ${SHADOW}">
    <span style="width: 24px; height: 24px; display: grid; place-items: center; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; line-height: 1">T</span>
    <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; line-height: 1; letter-spacing: 0.12em; text-transform: uppercase; color: #3A2314">Tatooine</span>
  </div>
  <div style="height: 86px; border-radius: 12px; background: #3A2314; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; ${SHADOW}">
    <span style="width: 24px; height: 24px; display: grid; place-items: center; background: #F0A830; color: #3A2314; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; line-height: 1">T</span>
    <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; line-height: 1; letter-spacing: 0.12em; text-transform: uppercase; color: #F3E2BF">Tatooine</span>
  </div>
</div>`,
      mTitle: `<div style="position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: #F3E2BF; ${SHADOW}">
  <div style="position: absolute; right: 0; top: 0; bottom: 0; width: 22%; background: #F0A830"></div>
  <div style="position: absolute; right: 22%; top: 0; bottom: 0; width: 7px; background: #D9601E"></div>
  <div style="position: absolute; right: 5%; top: 18px; width: 40px; height: 40px; border-radius: 50%; background: #D9601E"></div>
  <div style="position: absolute; left: 0; top: 0; bottom: 0; right: calc(22% + 7px); padding: 18px 20px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start">
    <div style="display: flex; align-items: center; gap: 7px">
      <span style="width: 18px; height: 18px; display: grid; place-items: center; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; line-height: 1">T</span>
      <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 11px; line-height: 1; letter-spacing: 0.1em; text-transform: uppercase; color: #3A2314">Tatooine</span>
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 9px">
      <span style="padding: 3px 7px; background: #3A2314; color: #F3E2BF; font-family: 'DM Sans', sans-serif; font-size: 8.5px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase">Q4 lending update</span>
      <div style="display: flex; gap: 11px">
        <span style="width: 5px; flex: none; background: #D9601E"></span>
        <span style="font-family: 'Syne', sans-serif; font-weight: 800; font-size: 23px; line-height: 1.02; letter-spacing: -0.02em; color: #3A2314">Loans approved in days</span>
      </div>
    </div>
  </div>
</div>`,
      mLower: `<div style="display: inline-flex; align-items: stretch; max-width: 100%; filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.45))">
  <span style="width: 7px; flex: none; background: #F0A830"></span>
  <div style="display: flex; flex-direction: column; align-items: flex-start; min-width: 0">
    <span style="padding: 9px 14px; background: #3A2314; color: #F3E2BF; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px; line-height: 1.05; letter-spacing: -0.01em">Marcus Oyelaran</span>
    <span style="padding: 6px 14px; background: #D9601E; color: #3A2314; font-family: 'DM Sans', sans-serif; font-size: 10.5px; line-height: 1.3; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase">Head of small business lending</span>
  </div>
</div>`
    },

    hoth: {
      title: `<div style="position: relative; width: 300px; height: 169px; border-radius: 12px; overflow: hidden; background: linear-gradient(160deg, #FFFFFF 0%, #EDF5FB 100%); ${SHADOW}">
  <div style="position: absolute; right: -40px; top: -60px; width: 190px; height: 190px; border-radius: 50%; background: radial-gradient(circle closest-side, #BFE3F5 30%, rgba(191, 227, 245, 0) 100%)"></div>
  <div style="position: absolute; inset: 0; padding: 18px 20px; display: flex; flex-direction: column; justify-content: space-between">
    <div style="display: flex; align-items: center; justify-content: space-between">
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #2E6A8F"></span>
        <span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 13px; line-height: 1; letter-spacing: -0.01em; color: #16324A">hoth</span>
      </div>
      <span style="font-family: 'Manrope', sans-serif; font-size: 8.5px; letter-spacing: 0.06em; color: #2E6A8F">01 / 04</span>
    </div>
    <div style="width: 220px; display: flex; flex-direction: column; align-items: flex-start; gap: 9px">
      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px 3px 7px; border: 1px solid #BFE3F5; border-radius: 999px; background: rgba(255, 255, 255, 0.7); font-family: 'Manrope', sans-serif; font-size: 8px; font-weight: 600; color: #2E6A8F"><i style="display: block; width: 5px; height: 5px; border-radius: 50%; background: #2E6A8F"></i>Product update</span>
      <span style="font-family: 'Outfit', sans-serif; font-weight: 300; font-size: 20px; line-height: 1.12; letter-spacing: -0.015em; color: #16324A">A clearer view of every dollar you hold</span>
    </div>
  </div>
</div>`,
      stat: `<div style="position: relative; width: 300px; padding: 20px 22px; background: #FFFFFF; border: 1px solid #BFE3F5; border-radius: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; ${SHADOW}">
  <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0">
    <span style="font-family: 'Manrope', sans-serif; font-size: 11px; font-weight: 500; color: #2E6A8F">Payment uptime</span>
    <span style="font-family: 'Outfit', sans-serif; font-weight: 300; font-size: 40px; line-height: 1; letter-spacing: -0.02em; color: #16324A">99.98%</span>
    <span style="font-family: 'Manrope', sans-serif; font-size: 11px; color: #2E6A8F">Trailing 12 months</span>
  </div>
  <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Uptime ring at 99.98 percent" style="flex: none"><circle cx="32" cy="32" r="27" fill="none" stroke="#EDF5FB" stroke-width="6"></circle><circle cx="32" cy="32" r="27" fill="none" stroke="#2E6A8F" stroke-width="6" stroke-linecap="round" stroke-dasharray="169.6" stroke-dashoffset="2" transform="rotate(-90 32 32)"></circle><circle cx="32" cy="32" r="4" fill="#BFE3F5"></circle></svg>
</div>`,
      lower: `<div style="display: inline-flex; align-items: center; gap: 10px; max-width: 300px; padding: 10px 18px 10px 10px; background: rgba(255, 255, 255, 0.94); border: 1px solid #BFE3F5; border-radius: 16px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35)">
  <span style="width: 32px; height: 32px; flex: none; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFFFFF 0%, #BFE3F5 45%, #2E6A8F 100%)"></span>
  <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
    <span style="font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 15px; line-height: 1.2; color: #16324A">Sofia Lindqvist</span>
    <span style="font-family: 'Manrope', sans-serif; font-size: 11.5px; line-height: 1.3; font-weight: 500; color: #2E6A8F">VP, treasury products</span>
  </div>
</div>`,
      caption: `<div style="display: inline-flex; max-width: 300px">
  <span style="padding: 8px 16px; background: rgba(255, 255, 255, 0.94); border: 1px solid #BFE3F5; border-radius: 18px; color: #16324A; font-family: 'Manrope', sans-serif; font-size: 14px; line-height: 1.35; font-weight: 500; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3)">Every payment reconciles as it settles.</span>
</div>`,
      end: `<div style="position: relative; width: 260px; height: 146px; border-radius: 12px; overflow: hidden; background: linear-gradient(160deg, #FFFFFF 0%, #EDF5FB 100%); ${SHADOW}">
  <div style="position: absolute; right: -50px; bottom: -70px; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle closest-side, #BFE3F5 30%, rgba(191, 227, 245, 0) 100%)"></div>
  <div style="position: absolute; inset: 0; padding: 16px 18px; display: flex; flex-direction: column; justify-content: space-between">
    <div style="display: flex; align-items: center; gap: 6px">
      <span style="width: 8px; height: 8px; border-radius: 50%; background: #2E6A8F"></span>
      <span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 13px; line-height: 1; color: #16324A">hoth</span>
    </div>
    <span style="width: 180px; font-family: 'Outfit', sans-serif; font-weight: 300; font-size: 17px; line-height: 1.15; letter-spacing: -0.01em; color: #16324A">Banking built for finance teams</span>
    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px">
      <span style="padding: 7px 14px; border-radius: 999px; background: #2E6A8F; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-weight: 600; font-size: 10.5px; line-height: 1.2">Open an account</span>
      <span style="font-family: 'Manrope', sans-serif; font-size: 8.5px; letter-spacing: 0.04em; color: #2E6A8F">hoth.com</span>
    </div>
  </div>
</div>`,
      logos: `<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; width: 300px">
  <div style="height: 86px; border-radius: 12px; background: #FFFFFF; border: 1px solid #BFE3F5; display: flex; align-items: center; justify-content: center; gap: 8px; ${SHADOW}">
    <span style="width: 11px; height: 11px; border-radius: 50%; background: #2E6A8F"></span>
    <span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 22px; line-height: 1; letter-spacing: -0.01em; color: #16324A">hoth</span>
  </div>
  <div style="height: 86px; border-radius: 12px; background: #16324A; display: flex; align-items: center; justify-content: center; gap: 8px; ${SHADOW}">
    <span style="width: 11px; height: 11px; border-radius: 50%; background: #BFE3F5"></span>
    <span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 22px; line-height: 1; letter-spacing: -0.01em; color: #FFFFFF">hoth</span>
  </div>
</div>`,
      mTitle: `<div style="position: relative; width: 100%; aspect-ratio: 16 / 9; border-radius: 12px; overflow: hidden; background: linear-gradient(160deg, #FFFFFF 0%, #EDF5FB 100%); ${SHADOW}">
  <div style="position: absolute; right: -40px; top: -70px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle closest-side, #BFE3F5 30%, rgba(191, 227, 245, 0) 100%)"></div>
  <div style="position: absolute; inset: 0; padding: 20px 22px; display: flex; flex-direction: column; justify-content: space-between">
    <div style="display: flex; align-items: center; justify-content: space-between">
      <div style="display: flex; align-items: center; gap: 6px">
        <span style="width: 9px; height: 9px; border-radius: 50%; background: #2E6A8F"></span>
        <span style="font-family: 'Outfit', sans-serif; font-weight: 400; font-size: 15px; line-height: 1; letter-spacing: -0.01em; color: #16324A">hoth</span>
      </div>
      <span style="font-family: 'Manrope', sans-serif; font-size: 9.5px; letter-spacing: 0.06em; color: #2E6A8F">01 / 04</span>
    </div>
    <div style="max-width: 260px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px">
      <span style="display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px 3px 8px; border: 1px solid #BFE3F5; border-radius: 999px; background: rgba(255, 255, 255, 0.7); font-family: 'Manrope', sans-serif; font-size: 9px; font-weight: 600; color: #2E6A8F"><i style="display: block; width: 5px; height: 5px; border-radius: 50%; background: #2E6A8F"></i>Product update</span>
      <span style="font-family: 'Outfit', sans-serif; font-weight: 300; font-size: 23px; line-height: 1.12; letter-spacing: -0.015em; color: #16324A">A clearer view of every dollar you hold</span>
    </div>
  </div>
</div>`,
      mLower: `<div style="display: inline-flex; align-items: center; gap: 10px; max-width: 100%; padding: 10px 18px 10px 10px; background: rgba(255, 255, 255, 0.94); border: 1px solid #BFE3F5; border-radius: 16px; box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35)">
  <span style="width: 34px; height: 34px; flex: none; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFFFFF 0%, #BFE3F5 45%, #2E6A8F 100%)"></span>
  <div style="display: flex; flex-direction: column; gap: 2px; min-width: 0">
    <span style="font-family: 'Outfit', sans-serif; font-weight: 500; font-size: 16px; line-height: 1.2; color: #16324A">Sofia Lindqvist</span>
    <span style="font-family: 'Manrope', sans-serif; font-size: 12px; line-height: 1.3; font-weight: 500; color: #2E6A8F">VP, treasury products</span>
  </div>
</div>`
    }
  };

  // Generated pieces: the colors card and the fonts card share one Catalyst layout and swap their content.
  const colorsHTML = t => `<div class="panel colors">${t.colors.map(([hex, name]) => `<div class="sw"><i style="background: ${hex}; border-radius: ${t.swatch}"></i><span>${name}</span></div>`).join('')}</div>`;
  const fontsHTML = t => `<div class="panel fonts">
  <div class="font"><span class="aa" style="font-family: ${t.head.family}; font-weight: ${t.head.weight}; font-size: ${t.head.aa}px">Aa</span><div><b>${t.head.name}</b><span>Headings</span></div></div>
  <div class="rule"></div>
  <div class="font"><span class="aa" style="font-family: ${t.body.family}; font-weight: 400; font-size: 28px">Aa</span><div><b>${t.body.name}</b><span>Body and captions</span></div></div>
  <div class="rule"></div>
  <p class="voice" style="font-family: ${t.head.family}; font-weight: ${t.head.weight}; font-size: ${t.voice.size}px">${t.voice.text}</p>
</div>`;
  const pieceOf = (t, key) => key === 'colors' ? colorsHTML(t) : key === 'fonts' ? fontsHTML(t) : P[t.id][key];
  const variants = key => THEMES.map(t => `<div class="v v-${t.id}">${pieceOf(t, key)}</div>`).join('');
  const item = (label, key, float, delay, ripDelay, style = '') =>
    `<div class="item ${float}" style="animation-delay: ${delay}s; ${style}"><span class="lbl">${label}</span><div class="rip" style="animation-delay: ${ripDelay}s">${variants(key)}</div></div>`;

  /* ---------- Switcher ---------- */
  const CHEVRON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#bbbdc9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex: none"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg>';
  const CHECK = '<svg class="ck" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 7.5l3 3 6-6.5"/></svg>';
  const CURSOR = '<svg class="demo" width="22" height="26" viewBox="0 0 22 26" aria-hidden="true"><path d="M3 2 L3 20 L7.6 15.6 L11 23 L14 21.6 L10.6 14.4 L17 14.4 Z" fill="#f6f6fa" stroke="#141524" stroke-width="1.4" stroke-linejoin="round"/></svg>';
  const dotsHTML = cs => cs.map(c => `<i style="background: ${c}"></i>`).join('');
  const switcher = mode => `<div class="sel sel-${mode}">
  <span class="sel-label">Switch the brand theme</span>
  <div class="anchor">
    <span class="halo" aria-hidden="true"></span>
    <div class="press">
      <div class="ring"><span class="spin" aria-hidden="true"></span>
        <button type="button" class="chip" aria-haspopup="menu" aria-expanded="false"><span class="dots"></span><span class="name"></span>${mode === 'mob' ? '<span class="meta"></span>' : ''}${CHEVRON}</button>
      </div>
    </div>
    ${CURSOR}
    <div class="menu" role="menu" aria-label="Brand themes" hidden>
      <div class="menu-label">Brand themes</div>
      ${THEMES.map((t, i) => `<button type="button" class="row" role="menuitemradio" aria-checked="false" data-i="${i}"><span class="dots">${dotsHTML(t.dots)}</span><span class="row-name">${t.name}</span><span class="row-meta">${t.meta}</span><span class="row-check">${CHECK}</span></button>`).join('')}
    </div>
  </div>
</div>`;

  /* ---------- Layouts ---------- */
  const LINES = ['360 160', '600 220', '840 130', '360 380', '840 360', '360 620', '600 500', '840 610'];
  const DESKTOP = `<div class="desk-wrap"><div class="desk">
  <div class="dotgrid" aria-hidden="true"></div>
  <div class="glow" aria-hidden="true"></div>
  <div class="orbit o1" aria-hidden="true"></div><div class="orbit o2" aria-hidden="true"></div>
  <svg class="lines" width="1200" height="720" viewBox="0 0 1200 720" aria-hidden="true">
    <g class="base">${LINES.map(p => `<path d="M600 360 L${p}"/>`).join('')}</g>
    <g class="rays">${LINES.map(p => `<path pathLength="100" d="M600 360 L${p}"/>`).join('')}</g>
  </svg>
  <div class="col" style="left: 60px">
    ${item('Title card', 'title', 'fa', -1.4, 0.36)}
    ${item('Lower third', 'lower', 'fb', -0.6, 0.28)}
    ${item('Captions', 'caption', 'fc', -1.8, 0.4)}
  </div>
  ${item('Stat card', 'stat', 'fb', -3, 0.2, 'position: absolute; left: 450px; top: 48px; width: 300px')}
  ${item('End card', 'end', 'fa', -2.8, 0.24, 'position: absolute; left: 470px; bottom: 48px; width: 260px')}
  <div class="col" style="left: 840px">
    ${item('Colors', 'colors', 'fc', -2.2, 0.36)}
    ${item('Fonts and voice', 'fonts', 'fa', -4, 0.3)}
    ${item('Logos', 'logos', 'fb', -5, 0.36)}
  </div>
  ${switcher('desk')}
</div></div>`;
  const MOBILE = `<div class="mob">
  <div class="mglow" aria-hidden="true"></div>
  ${switcher('mob')}
  <div class="mitem"><span class="lbl">Title card</span><div class="rip" style="animation-delay: 0.1s">${variants('mTitle')}</div></div>
  <div class="mitem"><span class="lbl">Lower third</span><div class="rip" style="animation-delay: 0.22s">${variants('mLower')}</div></div>
</div>`;

  /* ---------- Styles ---------- */
  const CSS = `:host { display: block; width: 100%; }
*, *::before, *::after { box-sizing: border-box; }
[hidden] { display: none !important; }
.root {
  --organic: cubic-bezier(.45, 0, .15, 1); --snappy: cubic-bezier(.2, 0, 0, 1);
  position: relative; width: 100%; background: #141524; color: #f6f6fa; overflow: hidden;
  font-family: inherit; font-size: 16px; font-weight: 400; font-style: normal; line-height: normal; letter-spacing: normal;
  text-align: left; text-transform: none; text-shadow: none; white-space: normal; -webkit-font-smoothing: antialiased; color-scheme: dark;
}
button { font: inherit; color: inherit; margin: 0; }
p { margin: 0; }

/* Theme visibility: every theme's pieces are in the page, only the current one shows. */
.v { display: none; }
.v { animation: fadein .6s var(--organic) both; }
.v span, .v p { text-wrap: balance; }
.root[data-t="naboo"] .v-naboo, .root[data-t="tatooine"] .v-tatooine, .root[data-t="hoth"] .v-hoth { display: block; }

/* Desktop: 1200×720, scaled to the container */
.desk-wrap { position: relative; width: 100%; height: calc(720px * var(--s, 1)); }
.desk { position: absolute; left: 50%; top: 0; width: 1200px; height: 720px; transform: translateX(-50%) scale(var(--s, 1)); transform-origin: 50% 0; }
.root.is-mobile .desk-wrap { display: none; }
.root:not(.is-mobile) .mob { display: none; }

.dotgrid { position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(246, 246, 250, .05) 1px, transparent 0); background-size: 28px 28px;
  -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 40%, transparent 100%); mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 40%, transparent 100%); }
.glow { position: absolute; left: 300px; top: 60px; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle closest-side, var(--primary) 0%, transparent 100%); opacity: .3; }
.orbit { position: absolute; border-radius: 50%; }
.o1 { left: 440px; top: 200px; width: 320px; height: 320px; border: 1px solid #2c2d40; }
.o2 { left: 500px; top: 260px; width: 200px; height: 200px; border: 1px solid #202132; }
.lines { position: absolute; left: 0; top: 0; pointer-events: none; }
.lines .base path { stroke: #2c2d40; stroke-width: 1; stroke-dasharray: 3 6; fill: none; }
.lines .rays path { stroke: var(--accent); stroke-width: 2; stroke-linecap: round; fill: none; stroke-dasharray: 16 200; stroke-dashoffset: 16; opacity: 0; }
.lines .rays.go path { animation: ray .8s ease-out both; }

.col { position: absolute; top: 48px; bottom: 48px; width: 300px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; }
.item { width: 100%; max-width: 300px; min-width: 0; }
.lbl { display: block; margin-bottom: 8px; font-size: 12.8px; line-height: 16px; color: #9597a7; }
.fa { animation: fa 6s ease-in-out infinite alternate; }
.fb { animation: fb 7.5s ease-in-out infinite alternate; }
.fc { animation: fc 5.5s ease-in-out infinite alternate; }
.rip.go { animation: rip .8s var(--organic) both; }

/* Catalyst panels: colors and fonts */
.panel { width: 300px; background: #202132; border: 1px solid #2c2d40; border-radius: 16px; box-shadow: 0 20px 40px -18px rgba(0, 0, 0, .7); }
.colors { padding: 16px; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; }
.sw { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.sw i { display: block; height: 44px; box-shadow: inset 0 0 0 1px rgba(246, 246, 250, .1); }
.sw span { font-size: 11px; line-height: 14px; color: #bbbdc9; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fonts { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.font { display: flex; align-items: center; gap: 14px; }
.font .aa { width: 64px; flex: none; overflow: hidden; line-height: 40px; color: #f6f6fa; white-space: nowrap; }
.font div { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.font b { font-size: 14px; line-height: 18px; font-weight: 500; }
.font div span { font-size: 12.8px; line-height: 16px; color: #9597a7; }
.rule { height: 1px; background: #2c2d40; }
.voice { line-height: 1.25; color: #f6f6fa; }

/* Switcher (Catalyst OptionChip and Menu, with a rotating ring in the theme's colors) */
.sel { display: flex; flex-direction: column; gap: 14px; }
.sel-desk { position: absolute; left: 600px; top: 360px; transform: translate(-50%, -50%); z-index: 5; align-items: center; }
.sel-label { font-size: 12.8px; line-height: 16px; color: #bbbdc9; white-space: nowrap; }
.anchor { position: relative; }
.ring { position: relative; padding: 2px; border-radius: 999px; overflow: hidden; box-shadow: 0 18px 40px -16px rgba(0, 0, 0, .85); isolation: isolate; }
.spin { position: absolute; left: 50%; top: 50%; width: 320px; height: 320px; margin: -160px 0 0 -160px; border-radius: 50%;
  background: conic-gradient(from 0deg, var(--g1), var(--g2), var(--g3), var(--g1)); animation: spin 3.2s linear infinite; }
.chip { --chip-bg: #141524; position: relative; display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 16px 0 14px;
  border: 1px solid #2c2d40; border-radius: 999px; background: var(--chip-bg); font-size: 16px; line-height: 24px; white-space: nowrap; cursor: pointer;
  transition: background-color .14s var(--snappy), border-color .14s var(--snappy); }
.chip:hover { border-color: #3c3e51; }
.chip[aria-expanded="true"] { --chip-bg: #2c2d40; border-color: #3c3e51; }
.chip:focus-visible { outline: none; box-shadow: 0 0 0 2px #141524, 0 0 0 4px #9c8eff; }
.dots { display: inline-flex; padding-left: 8px; flex: none; }
.dots i { display: block; width: 20px; height: 20px; margin-left: -8px; border-radius: 50%; box-shadow: 0 0 0 2px var(--chip-bg), inset 0 0 0 1px rgba(246, 246, 250, .22); }
.halo { position: absolute; inset: -4px; border-radius: 999px; border: 2px solid var(--accent); pointer-events: none; display: none; }
.demo { position: absolute; left: 50%; top: 50%; margin: -4px 0 0 -4px; pointer-events: none; opacity: 0; display: none; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, .6)); }
.root.hint .halo { display: block; animation: halo 2s var(--organic) infinite; }
.root.hint .demo { display: block; animation: demo-d 5s var(--snappy) .8s infinite; }
.root.hint .press { animation: press 5s var(--snappy) .8s infinite; }
.root.hint .sel-mob .halo { display: none; }
.root.hint .sel-mob .ring { animation: pulse 2s var(--organic) infinite; }
.root.hint .sel-mob .demo { animation-name: demo-m; }

.menu { position: absolute; top: calc(100% + 8px); z-index: 10; padding: 4px; background: #0c0d19; border: 1px solid #2c2d40; border-radius: 16px;
  display: flex; flex-direction: column; animation: pop .14s var(--snappy) both; }
.sel-desk .menu { left: 50%; width: 256px; margin-left: -128px; }
.menu-label { padding: 8px 12px 4px; font-size: 12.8px; line-height: 16px; letter-spacing: .06em; text-transform: uppercase; color: #9597a7; }
.row { --chip-bg: #0c0d19; display: flex; align-items: center; gap: 8px; width: 100%; min-height: 48px; padding: 12px; border: 0; border-radius: 12px;
  background: var(--chip-bg); font-size: 16px; line-height: 24px; text-align: left; cursor: pointer; }
.row:hover { --chip-bg: #1c1938; }
.row[aria-checked="true"] { --chip-bg: #2b244f; }
.row:focus-visible { outline: none; box-shadow: inset 0 0 0 2px #9c8eff; }
.row .dots { padding-left: 7px; }
.row .dots i { width: 18px; height: 18px; margin-left: -7px; }
.row-name { flex: 1; min-width: 0; }
.row-meta { font-size: 12.8px; line-height: 16px; color: #bbbdc9; }
.row-check { width: 24px; height: 24px; flex: none; display: grid; place-items: center; color: #b7b1ff; }
.row[aria-checked="false"] .ck { visibility: hidden; }
.sel-desk .row-meta { display: none; }

/* Mobile */
.mob { position: relative; max-width: 480px; margin: 0 auto; padding: 24px 16px 32px; display: flex; flex-direction: column; gap: 28px; }
.mglow { position: absolute; left: 50%; top: 0; width: 380px; height: 380px; margin-left: -190px; border-radius: 50%;
  background: radial-gradient(circle closest-side, var(--primary) 0%, transparent 100%); opacity: .28; pointer-events: none; }
.sel-mob { position: relative; z-index: 5; gap: 10px; }
.sel-mob .spin { width: 600px; height: 600px; margin: -300px 0 0 -300px; }
.sel-mob .chip { display: flex; width: 100%; text-align: left; }
.sel-mob .name { flex: 1; min-width: 0; }
.sel-mob .meta { font-size: 12.8px; line-height: 16px; color: #9597a7; }
.sel-mob .menu { left: 0; right: 0; }
.mitem { position: relative; }

/* Pause everything while off screen */
.root.off * { animation-play-state: paused !important; }

@keyframes fa { from { transform: translateY(0); } to { transform: translateY(-8px); } }
@keyframes fb { from { transform: translate(0, 0); } to { transform: translate(5px, -7px); } }
@keyframes fc { from { transform: translate(0, 0); } to { transform: translate(-5px, 7px); } }
@keyframes rip { 0% { transform: scale(1); } 30% { transform: scale(.95); } 100% { transform: scale(1); } }
@keyframes fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes ray { 0% { stroke-dashoffset: 16; opacity: 1; } 85% { opacity: 1; } 100% { stroke-dashoffset: -100; opacity: 0; } }
@keyframes pop { from { opacity: 0; transform: translateY(-4px) scale(.98); } to { opacity: 1; transform: none; } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes halo { 0% { transform: scale(1); opacity: .7; } 70%, 100% { transform: scale(1.28); opacity: 0; } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 var(--accent); } 70%, 100% { box-shadow: 0 0 0 10px transparent; } }
@keyframes press { 0%, 46% { transform: scale(1); } 50% { transform: scale(.965); } 56%, 100% { transform: scale(1); } }
@keyframes demo-d { 0% { opacity: 0; transform: translate(150px, 96px); } 12% { opacity: 1; } 42% { transform: translate(34px, 16px) scale(1); } 48% { transform: translate(34px, 16px) scale(.82); } 54% { transform: translate(34px, 16px) scale(1); } 76% { opacity: 1; transform: translate(34px, 16px); } 88% { opacity: 0; transform: translate(60px, 40px); } 100% { opacity: 0; transform: translate(150px, 96px); } }
@keyframes demo-m { 0% { opacity: 0; transform: translate(110px, 70px); } 12% { opacity: 1; } 42% { transform: translate(24px, 12px) scale(1); } 48% { transform: translate(24px, 12px) scale(.82); } 54% { transform: translate(24px, 12px) scale(1); } 76% { opacity: 1; transform: translate(24px, 12px); } 88% { opacity: 0; transform: translate(50px, 34px); } 100% { opacity: 0; transform: translate(110px, 70px); } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .demo { display: none !important; }
}`;

  function loadFonts() {
    if (document.getElementById('catalyst-brand-theme-fonts')) return;
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = 'https://fonts.gstatic.com';
    pre.crossOrigin = '';
    const link = document.createElement('link');
    link.id = 'catalyst-brand-theme-fonts';
    link.rel = 'stylesheet';
    link.href = FONTS_URL;
    // Fetch every brand font up front, so the first switch to a theme never flashes a fallback font.
    link.addEventListener('load', () => { if (document.fonts) FONT_FACES.forEach(f => document.fonts.load(f).catch(() => {})); });
    document.head.append(pre, link);
  }

  class CatalystBrandTheme extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) { this._observe(); return; }
      loadFonts();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = `<style>${CSS}</style><div class="root hint">${DESKTOP}${MOBILE}</div>`;
      this._root = shadow.querySelector('.root');
      const start = THEMES.findIndex(t => t.id === this.getAttribute('theme'));
      this._idx = start < 0 ? 0 : start;
      this._apply(false);
      shadow.querySelectorAll('.sel').forEach(sel => this._wire(sel));
      this._observe();
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._outside, true);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
    }

    _observe() {
      this._outside = e => {
        const open = this._root.querySelector('.anchor.open');
        if (open && !e.composedPath().includes(open)) this._close(open, false);
      };
      document.addEventListener('pointerdown', this._outside, true);
      this._ro = new ResizeObserver(() => this._layout());
      this._ro.observe(this);
      this._io = new IntersectionObserver(([e]) => this._root.classList.toggle('off', !e.isIntersecting));
      this._io.observe(this);
      this._layout();
    }

    _layout() {
      const w = this.getBoundingClientRect().width;
      if (!w) return;
      const bp = Number(this.getAttribute('breakpoint')) || 760;
      const mobile = w < bp;
      if (mobile !== this._root.classList.contains('is-mobile')) this._root.querySelectorAll('.anchor.open').forEach(a => this._close(a, false));
      this._root.classList.toggle('is-mobile', mobile);
      this._root.style.setProperty('--s', String(Math.min(1, w / 1200)));
    }

    _apply(animate) {
      const t = THEMES[this._idx];
      const r = this._root;
      r.dataset.t = t.id;
      r.style.setProperty('--primary', t.primary);
      r.style.setProperty('--accent', t.accent);
      t.ring.forEach((c, i) => r.style.setProperty(`--g${i + 1}`, c));
      r.querySelectorAll('.chip').forEach(chip => {
        chip.querySelector('.dots').innerHTML = dotsHTML(t.dots);
        chip.querySelector('.name').textContent = t.name;
        const meta = chip.querySelector('.meta');
        if (meta) meta.textContent = t.meta;
        chip.setAttribute('aria-label', `Brand theme: ${t.name}`);
      });
      r.querySelectorAll('.row').forEach(row => row.setAttribute('aria-checked', String(Number(row.dataset.i) === this._idx)));
      if (animate) {
        const els = r.querySelectorAll('.rip, .rays');
        els.forEach(el => el.classList.remove('go'));
        void r.offsetWidth;
        els.forEach(el => el.classList.add('go'));
      }
    }

    _pick(i) {
      this._root.classList.remove('hint');
      if (i === this._idx) return;
      this._idx = i;
      this._apply(true);
      this.dispatchEvent(new CustomEvent('catalyst-brand-theme-change', { detail: { theme: THEMES[i].id }, bubbles: true, composed: true }));
    }

    _open(anchor) {
      this._root.classList.remove('hint');
      anchor.classList.add('open');
      anchor.querySelector('.menu').hidden = false;
      anchor.querySelector('.chip').setAttribute('aria-expanded', 'true');
      (anchor.querySelector('.row[aria-checked="true"]') || anchor.querySelector('.row')).focus();
    }

    _close(anchor, focusChip = true) {
      anchor.classList.remove('open');
      anchor.querySelector('.menu').hidden = true;
      const chip = anchor.querySelector('.chip');
      chip.setAttribute('aria-expanded', 'false');
      if (focusChip) chip.focus();
    }

    _wire(sel) {
      const anchor = sel.querySelector('.anchor');
      const chip = anchor.querySelector('.chip');
      const menu = anchor.querySelector('.menu');
      const rows = [...menu.querySelectorAll('.row')];
      chip.addEventListener('click', () => (menu.hidden ? this._open(anchor) : this._close(anchor)));
      chip.addEventListener('keydown', e => {
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && menu.hidden) { e.preventDefault(); this._open(anchor); }
      });
      rows.forEach(row => row.addEventListener('click', () => { this._pick(Number(row.dataset.i)); this._close(anchor); }));
      menu.addEventListener('keydown', e => {
        const i = rows.indexOf(this.shadowRoot.activeElement);
        if (e.key === 'Escape') { e.preventDefault(); this._close(anchor); }
        else if (e.key === 'Tab') { this._close(anchor, false); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); rows[(i + 1) % rows.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); rows[(i - 1 + rows.length) % rows.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); rows[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); rows[rows.length - 1].focus(); }
      });
    }
  }

  customElements.define('catalyst-brand-theme', CatalystBrandTheme);
})();
