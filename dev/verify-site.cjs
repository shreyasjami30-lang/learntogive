/* DEV ONLY. Delete before launch (see README).
   Playwright checks for the whole site. Not part of the site; needs Node + Playwright:
     python3 -m http.server 8765            (from the project folder, in another terminal)
     NODE_PATH="$(npm root -g)" node dev/verify-site.cjs [screenshot-folder]
   Google Fonts requests are blocked so runs are deterministic; install Fraunces,
   Nunito and Noto Sans Telugu locally so Telugu renders in screenshots.
   Exits with code 1 if any check fails. */
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const BASE = process.env.BASE_URL || 'http://localhost:8765/';
const SHOTS = process.argv[2] || null;
const PAGES = ['index.html', 'about.html', 'classes.html', 'join.html', 'volunteer.html', 'impact.html',
  'donate.html', 'contact.html', 'fundraise.html', '404.html'];
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok: !!ok, detail: detail || '' });
}

/* Serve js/site-config.js with edits, to test config-driven behavior without touching the file. */
async function withConfig(context, patch) {
  const original = fs.readFileSync(path.join(ROOT, 'js/site-config.js'), 'utf8');
  await context.route(/js\/site-config\.js$/, (route) => route.fulfill({
    contentType: 'application/javascript',
    body: original + '\n;(function (C) {' + patch + '})(window.SITE_CONFIG);'
  }));
}

async function newContext(browser, opts) {
  const context = await browser.newContext(Object.assign({ viewport: { width: 375, height: 800 } }, opts || {}));
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  return context;
}

async function open(context, page, url, lang) {
  const p = await context.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => {
    if (m.type() === 'error' && !/fonts\.g|ERR_FAILED/.test(m.text() + (m.location().url || ''))) errors.push(m.text());
  });
  p.on('requestfailed', (r) => { if (!/fonts\.g/.test(r.url())) errors.push('request failed: ' + r.url()); });
  if (lang) await p.addInitScript((l) => { try { localStorage.setItem('ltg-language', l); } catch (e) {} }, lang);
  await p.goto(url || BASE + page);
  await p.waitForTimeout(250);
  return { p, errors };
}

(async () => {
  const browser = await chromium.launch();

  /* 1. Every page, both languages, phone and desktop. */
  for (const width of [375, 1280]) {
    for (const lang of ['en', 'te']) {
      const context = await newContext(browser, { viewport: { width, height: 900 } });
      for (const page of PAGES) {
        const { p, errors } = await open(context, page, null, lang);
        const info = await p.evaluate(() => {
          const visible = document.body.innerText;
          const rawKey = /\b(nav|home|about|classes|class|schedule|faq|join|volunteer|impact|donate|contact|fundraise|form|footer|notfound|stat|donation|common|lang|grade|focus|idea)\.[a-z0-9]+[A-Za-z0-9.]*\b/.exec(visible);
          return {
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth - window.innerWidth,
            rawKey: rawKey ? rawKey[0] : null,
            h1: !!document.querySelector('h1'),
            logo: !!document.querySelector('.wordmark .wordmark-mark'),
            footerFundraise: !!document.querySelector('#site-footer a[href="fundraise.html"]'),
            mainNavFundraise: !!document.querySelector('#primary-nav a[href="fundraise.html"]')
          };
        });
        const tag = `${page} ${lang} ${width}px`;
        check(`${tag}: no JS or console errors`, errors.length === 0, errors.join(' | '));
        check(`${tag}: html lang=${lang}`, info.lang === lang);
        check(`${tag}: no horizontal scroll`, info.overflow <= 0, 'overflow ' + info.overflow + 'px');
        check(`${tag}: no raw translation keys visible`, !info.rawKey, info.rawKey);
        check(`${tag}: has h1, logo mark, footer Fundraise link, not in main nav`, info.h1 && info.logo && info.footerFundraise && !info.mainNavFundraise);
        if (SHOTS && width === 375 && ['index.html', 'classes.html', 'join.html', 'fundraise.html'].includes(page)) {
          await p.screenshot({ path: path.join(SHOTS, `${page.replace('.html', '')}-375-${lang}.png`), fullPage: true });
        }
        await p.close();
      }
      await context.close();
    }
  }

  /* 2. Internal links point at files that exist; no ?class= leftovers; head tags use PNGs. */
  for (const page of PAGES) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    const hrefs = [...html.matchAll(/href="([^"#?:]+\.html)/g)].map((m) => m[1]);
    const missing = hrefs.filter((h) => !fs.existsSync(path.join(ROOT, h)));
    check(`${page}: internal links exist`, missing.length === 0, missing.join(', '));
    check(`${page}: og:image and apple-touch-icon are PNG`, /og:image" content="[^"]+\.png"/.test(html) && /apple-touch-icon" href="[^"]+\.png"/.test(html));
  }

  /* 3. Placeholder form URLs route to contact.html; real https:// URLs open in a new tab. */
  {
    const context = await newContext(browser);
    const { p } = await open(context, 'classes.html');
    const links = await p.$$eval('.class-card .btn', (els) => els.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target') })));
    check('placeholder signupFormUrl: every Sign Up goes to contact.html, same tab',
      links.length === 5 && links.every((l) => /^contact\.html/.test(l.href) && !l.target), JSON.stringify(links));
    const join = await open(context, 'join.html');
    const joinLinks = await join.p.$$eval('[data-render="signup-link"]', (els) => els.map((a) => a.getAttribute('href') + '|' + a.getAttribute('target')));
    check('placeholder signupFormUrl: Join page buttons go to contact.html', joinLinks.length === 2 && joinLinks.every((l) => /^contact\.html.*\|null$/.test(l)), joinLinks.join(', '));
    const imp = await open(context, 'impact.html');
    check('placeholder feedbackFormUrl: no feedback section in the DOM', await imp.p.evaluate(() => document.querySelector('[data-render="feedback"]').children.length === 0));
    const home = await open(context, 'index.html');
    check('Home "Join a Class" goes to join.html', await home.p.evaluate(() => document.querySelector('.hero .btn-primary').getAttribute('href') === 'join.html'));
    await context.close();
  }
  {
    const context = await newContext(browser);
    await withConfig(context, "C.signupFormUrl = 'https://docs.google.com/forms/d/e/TEST/viewform'; C.classes[4].signupUrl = 'https://docs.google.com/forms/d/e/PYTHON/viewform'; C.feedbackFormUrl = 'https://docs.google.com/forms/d/e/FEEDBACK/viewform';");
    const { p } = await open(context, 'classes.html');
    const links = await p.$$eval('.class-card .btn', (els) => els.map((a) => ({ href: a.href, target: a.target, rel: a.rel })));
    check('real signupFormUrl: buttons open the form in a new tab with rel=noopener',
      links.length === 5 && links.slice(0, 4).every((l) => /TEST/.test(l.href) && l.target === '_blank' && l.rel === 'noopener'), JSON.stringify(links));
    check('per-class signupUrl overrides the shared form', /PYTHON/.test(links[4].href) && links[4].target === '_blank');
    const join = await open(context, 'join.html');
    check('real signupFormUrl: Join page buttons open in a new tab', await join.p.$$eval('[data-render="signup-link"]', (els) => els.every((a) => /TEST/.test(a.href) && a.target === '_blank' && a.rel === 'noopener')));
    const imp = await open(context, 'impact.html');
    check('real feedbackFormUrl: "Share your experience" button appears, new tab',
      await imp.p.evaluate(() => { const a = document.querySelector('[data-render="feedback"] a'); return !!a && /FEEDBACK/.test(a.href) && a.target === '_blank' && a.rel === 'noopener'; }));
    await context.close();
  }

  /* 4. Config-driven sections stay out of the DOM while empty, and render when filled. */
  {
    const context = await newContext(browser);
    const cls = await open(context, 'classes.html');
    const counts = await cls.p.evaluate(() => ['gallery', 'samples'].map((k) => document.querySelector(`[data-render="${k}"]`).children.length));
    check('empty gallery and samples: nothing in the DOM', counts[0] === 0 && counts[1] === 0, counts.join(','));
    const imp = await open(context, 'impact.html');
    check('testimonials off: nothing in the DOM', await imp.p.evaluate(() => document.querySelector('[data-render="testimonials"]').children.length === 0 && !document.querySelector('blockquote')));
    await context.close();
  }
  {
    const context = await newContext(browser);
    await withConfig(context, "C.images.gallery = [{ src: 'images/hero.svg', alt: 'Test photo', caption: 'Caption', width: 600, height: 480 }];" +
      "C.curriculumSamples = [{ classId: 'math-4', title: 'Sample', description: 'D', previewImage: 'images/class-math.svg', fileUrl: 'images/class-math.svg' }];" +
      "C.flags.showTestimonials = true; C.testimonials = [{ quote: 'Q', name: 'Lakshmi Devi Kantamneni', role: 'Parent' }];");
    const cls = await open(context, 'classes.html');
    const g = await cls.p.evaluate(() => { const img = document.querySelector('[data-render="gallery"] img'); return img && img.loading === 'lazy' && img.getAttribute('width') && img.getAttribute('height'); });
    check('filled gallery renders lazy images with width and height', !!g);
    check('filled samples render a "View sample page" link in a new tab', await cls.p.evaluate(() => { const a = document.querySelector('[data-render="samples"] a'); return !!a && a.target === '_blank' && a.rel === 'noopener'; }));
    const imp = await open(context, 'impact.html');
    check('testimonials on: first name only', await imp.p.evaluate(() => document.querySelector('.testimonial-name').textContent === 'Lakshmi, Parent'));
    await context.close();
  }

  /* 5. Discord: no invite links; every mention hides when discord.enabled is false. */
  {
    const context = await newContext(browser);
    await withConfig(context, 'C.discord.enabled = false;');
    let leaks = [];
    for (const page of PAGES) {
      for (const lang of ['en', 'te']) {
        const { p } = await open(context, page, null, lang);
        const text = await p.evaluate(() => document.body.innerText);
        if (/discord|డిస్కార్డ్/i.test(text)) leaks.push(page + ' ' + lang);
        await p.close();
      }
    }
    check('discord.enabled=false: no Discord mention on any page, either language', leaks.length === 0, leaks.join(', '));
    await context.close();
    const ctx2 = await newContext(browser);
    let found = 0;
    for (const page of ['classes.html', 'join.html', 'volunteer.html', 'contact.html']) {
      const { p } = await open(ctx2, page);
      if (/Discord/.test(await p.evaluate(() => document.body.innerText))) found++;
    }
    check('discord.enabled=true: Classes, Join, Volunteer and Contact mention Discord', found === 4, found + '/4');
    await ctx2.close();
  }

  /* 6. Filter applies to cards and table. */
  {
    const context = await newContext(browser);
    const { p } = await open(context, 'classes.html');
    await p.click('.filter-btn[data-filter="Telugu"]');
    const r = await p.evaluate(() => ({
      tableEnglishVisible: [...document.querySelectorAll('.schedule-table tr[data-language="English"]')].filter((tr) => !tr.hidden).length,
      tableTelugu: [...document.querySelectorAll('.schedule-table tr[data-language="Telugu"]')].filter((tr) => !tr.hidden).length,
      cardEnglishVisible: [...document.querySelectorAll('.version[data-language="English"]')].filter((li) => !li.hidden).length
    }));
    check('Telugu filter hides English rows in the table and on cards', r.tableEnglishVisible === 0 && r.tableTelugu === 5 && r.cardEnglishVisible === 0, JSON.stringify(r));
    const table = await p.evaluate(() => {
      const t = document.querySelector('.schedule-table');
      return !!t.querySelector('caption') && [...t.querySelectorAll('thead th')].every((th) => th.scope === 'col') && [...t.querySelectorAll('tbody th')].every((th) => th.scope === 'row');
    });
    check('schedule table has caption and th scope attributes', table);
    await context.close();
  }

  /* 7. Keyboard-only: donate dialog and mobile menu. */
  {
    const context = await newContext(browser, { viewport: { width: 375, height: 800 } });
    const { p } = await open(context, 'donate.html');
    await p.focus('[data-open-dialog]');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(450);
    const opened = await p.evaluate(() => ({ open: document.getElementById('donate-dialog').open, focus: document.activeElement.id }));
    check('keyboard: Enter opens the dialog and focuses its first field', opened.open && opened.focus === 'don-name', JSON.stringify(opened));
    let trapped = true;
    for (let i = 0; i < 8; i++) {
      await p.keyboard.press('Tab');
      const inside = await p.evaluate(() => document.getElementById('donate-dialog').contains(document.activeElement) || document.activeElement === document.body);
      if (!inside) trapped = false;
    }
    check('keyboard: Tab stays inside the open dialog', trapped);
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
    const closed = await p.evaluate(() => ({ open: document.getElementById('donate-dialog').open, display: getComputedStyle(document.getElementById('donate-dialog')).display, focusOnTrigger: document.activeElement.hasAttribute('data-open-dialog') }));
    check('keyboard: Escape closes the dialog and returns focus to the trigger', !closed.open && closed.display === 'none' && closed.focusOnTrigger, JSON.stringify(closed));

    await p.focus('.nav-toggle');
    await p.keyboard.press('Enter');
    await p.waitForTimeout(350);
    const menu = await p.evaluate(() => ({ expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'), visible: getComputedStyle(document.getElementById('primary-nav')).display !== 'none' }));
    await p.keyboard.press('Tab');
    const firstLink = await p.evaluate(() => document.activeElement.closest('#primary-nav') !== null);
    await p.keyboard.press('Escape');
    const menuClosed = await p.evaluate(() => ({ expanded: document.querySelector('.nav-toggle').getAttribute('aria-expanded'), focus: document.activeElement.classList.contains('nav-toggle') }));
    check('keyboard: Enter opens the menu, Tab reaches its links', menu.expanded === 'true' && menu.visible && firstLink, JSON.stringify(menu));
    check('keyboard: Escape closes the menu and returns focus to the toggle', menuClosed.expanded === 'false' && menuClosed.focus, JSON.stringify(menuClosed));

    const faq = await open(context, 'classes.html');
    await faq.p.focus('#faq-1-btn');
    await faq.p.keyboard.press('Enter');
    check('keyboard: Enter opens an FAQ answer', await faq.p.evaluate(() => !document.getElementById('faq-1').hidden && document.getElementById('faq-1-btn').getAttribute('aria-expanded') === 'true'));
    await context.close();
  }

  /* 8. Reduced motion: no transform transitions; normal motion: the dialog scales. */
  for (const reducedMotion of ['no-preference', 'reduce']) {
    const context = await newContext(browser, { reducedMotion });
    const { p } = await open(context, 'donate.html');
    await p.click('[data-open-dialog]');
    await p.waitForTimeout(30);
    const props = await p.evaluate(() => document.getAnimations().map((a) => a.transitionProperty || a.animationName).filter(Boolean));
    await p.keyboard.press('Escape');
    await p.setViewportSize({ width: 375, height: 800 });
    await p.click('.nav-toggle');
    await p.waitForTimeout(30);
    const menuProps = await p.evaluate(() => document.getAnimations().map((a) => a.transitionProperty).filter(Boolean));
    if (reducedMotion === 'reduce') {
      check('reduced motion: dialog and menu run no transform transitions', !props.includes('transform') && !menuProps.includes('transform'), props.concat(menuProps).join(','));
      check('reduced motion: gentle opacity fade kept on the dialog', props.includes('opacity'), props.join(','));
    } else {
      check('normal motion: dialog scales in and menu slides in', props.includes('transform') && menuProps.includes('transform'), props.concat(menuProps).join(','));
    }
    await context.close();
  }

  /* 9. Opens straight from disk (file://). */
  {
    const context = await newContext(browser);
    for (const page of ['index.html', 'classes.html', 'join.html', 'fundraise.html']) {
      const { p, errors } = await open(context, page, 'file://' + path.join(ROOT, page));
      const ok = await p.evaluate(() => document.documentElement.classList.contains('js') && !!document.querySelector('#site-header .wordmark'));
      const rendered = page === 'classes.html' ? await p.evaluate(() => document.querySelectorAll('.class-card').length === 5 && !!document.querySelector('.schedule-table')) : true;
      check(`file:// ${page}: scripts run, header and content render`, ok && rendered && errors.length === 0, errors.join(' | '));
    }
    await context.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  results.forEach((r) => { if (!r.ok) console.log('FAIL  ' + r.name + (r.detail ? '  [' + r.detail + ']' : '')); });
  console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
  process.exit(failed.length ? 1 : 0);
})();
