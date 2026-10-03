# Learn To Give website

The website for **Learn To Give**, a student-run volunteer tutoring group. Tagline: *Learning that gives back.*

It is a plain static site: HTML, CSS and vanilla JavaScript. There are no frameworks, no npm, and no build step.

```
index.html  about.html  classes.html  join.html  volunteer.html
impact.html  donate.html  contact.html  404.html
css/styles.css         one shared stylesheet (colors are CSS variables at the top)
js/site-config.js      every changeable value (start here)
js/translations.js     all page text, English + Telugu
js/components.js       shared header and footer (written once, injected on every page)
js/main.js             language toggle, menu, filters, FAQ, dialog, forms
images/                placeholder SVG images (see "Swap images")
robots.txt  sitemap.xml
```

## Run it locally

Either double-click `index.html`, or run this from the project folder:

```
python3 -m http.server
```

Then open http://localhost:8000. The site uses classic `<script>` tags and keeps its data on `window` objects, so both ways work.

## Edit text and settings

**Most changes happen in `js/site-config.js`.** It holds the organization name, tagline, mission, contact email, stats, donation figures, founders, classes, flags, the form endpoint and every image path. A "REPLACE BEFORE LAUNCH" comment at the top of the file lists every sample value.

Some things you can do there:

- **Change a stat or donation figure**: edit `stats` or `donations`. `donations.totalReceived` stays hidden while it is `null`. Set it to a number in rupees, such as `25000`, to show it. Money **transferred** to Sadhana and money **received** are always shown as separate figures.
- **Change the contact email**: edit `contactEmail`. The footer, the Contact page and every mailto link read it from here. The one exception is the no-JavaScript fallback (see "Values that also live in the HTML").
- **Show testimonials**: add real entries to `testimonials` (first names only, never photos of children), then set `flags.showTestimonials: true`. Until then the Impact page leaves the section out of the page completely.
- **Add social links**: add `{ label: 'Instagram', url: 'https://...' }` to `socialLinks`. The social section stays hidden while the list is empty.
- **Hide the Telugu review notice** once a native speaker has checked the Telugu: set `flags.showTeluguReviewNotice: false`.

### Values that also live in the HTML

The English text is also written directly in the HTML. That way the site still reads well with JavaScript off, search engines see real content, and the page doesn't flash empty while loading. When JavaScript runs, `js/translations.js` and `js/site-config.js` are the source of truth and overwrite that text.

So a few things exist in two places:

1. **English page text** lives in `translations.js` (the `en` section) *and* in the HTML. If you edit one, edit the other. Search for the `data-i18n="key"` value to find the HTML copy. The tagline, mission and Sadhana description come from `site-config.js` instead, and also have an HTML copy.
2. **The contact email** appears in the `<noscript>` block of every page, so it still shows without JavaScript. To change it everywhere, see "Find and replace" below.
3. **The Formspree URL** appears in each form's `action=""` attribute (join, volunteer, contact, donate) as the no-JavaScript fallback.
4. **The site URL** (`https://www.example.com`) appears in each page's `<head>` (canonical and Open Graph tags), `sitemap.xml` and `robots.txt`. Static files can't read the config.

Numbers (stats, donation figures, class times) come **only** from `site-config.js`. With JavaScript off they are hidden, and a note asks the visitor to email the team.

### Find and replace across files

Any code editor's "Find in files" / "Replace in files" (such as VS Code's Ctrl+Shift+H) works. From a terminal:

```
# macOS
grep -rl "OLD" --include=*.html --include=*.xml --include=*.txt . | xargs sed -i '' 's#OLD#NEW#g'
# Linux / Git Bash
grep -rl "OLD" --include=*.html --include=*.xml --include=*.txt . | xargs sed -i 's#OLD#NEW#g'
```

## Edit translations

All page text is in `js/translations.js`. The `en` section is the English source and the `te` section is Telugu. Every element with `data-i18n="some.key"` shows that key's text in the current language.

- Keep `{placeholders}` such as `{orgName}` or `{sadhanaName}` exactly as they are. They are filled from `site-config.js`.
- Values from `site-config.js` are translated with prefixed keys. Examples: `topic:Fractions`, `day:Saturday`, `city:Hyderabad`, `month:July`, `role:Cofounder and Math Lead`, `config:mission`. The part after the colon must match the English text in `site-config.js` exactly. If a Telugu entry is missing, the English text is shown and marked `lang="en"`.
- The language choice is saved in the browser (`localStorage`). If storage is blocked, the site still works and just doesn't remember the choice.
- **Founder bios and the founders' story stay in English** (`lang="en"`) in Telugu mode. In Telugu mode, a small note on the About page says so. To translate them later, add Telugu versions and render them the same way as other strings.

## Swap images

Every image is a **placeholder**:

| File | What it is |
| --- | --- |
| `images/hero.svg` | Home page illustration (laptop with a video call grid, books, pencil) |
| `images/founder-rishita.svg`, `founder-samatha.svg`, `founder-shreyas.svg` | Founder portraits showing initials |
| `images/class-math.svg`, `class-science.svg`, `class-python.svg` | Class icons |
| `images/favicon.svg` | Browser tab icon |
| `images/og-image.svg` | Source for the social sharing image |
| `images/og-image.png` | 1200×630 PNG rendered from `og-image.svg`. Social networks need PNG or JPG. |

To swap one, put the new file in `images/` and update its path in `SITE_CONFIG.images`. Founder photos should be square, at least 320×320. For the share image, replace `og-image.png` with a 1200×630 PNG or JPG. **Never use photos of children.** The hero image's `src` in `index.html` is a no-JavaScript fallback, so update it too if you rename the file.

## Duplicate a founder card

Copy one object in the `founders` array in `js/site-config.js`, then change its values:

```js
{
  name: 'New Founder',
  role: 'Cofounder and Outreach Lead',
  grade: 12,
  school: 'South Forsyth High School',
  bio: 'Short bio in English.',
  photo: images.founderNew   // add  founderNew: 'images/founder-new.svg'  to `images` above
}
```

A new card appears on the About page automatically. For a Telugu role, add `'role:Cofounder and Outreach Lead': '…'` to the `te` section of `translations.js`.

## Add or edit a class

Each class in `SITE_CONFIG.classes` has an `id`, translation keys for its name and audience, `topics`, `durationMinutes`, `signupOpen`, and a `versions` list with one entry per language (`language`, `day`, `timeIST`). The Telugu and English versions can have different days and times. The Classes page cards, the Join page dropdown, the Volunteer page subject list, and the `join.html?class=<id>` sign-up links all update from this list.

## Class times are anchored to IST

All class times are stored and shown in India Standard Time, because that's where the students are. US clocks change for daylight saving time and India's don't, so the US Eastern equivalent shifts by an hour twice a year. For that reason Eastern times are never shown on family-facing pages. `usEasternNote` in each class is for internal reference only and is not displayed.

## Set up Formspree (forms)

All four forms (Join a Class, Volunteer, Contact, and the Donate dialog) send to [Formspree](https://formspree.io). There is no backend.

1. Create a Formspree account and a new form.
2. Copy the form's endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `forms.endpoint` in `js/site-config.js`.
4. Replace `https://formspree.io/f/YOUR_FORM_ID` in the `action=""` attributes of `join.html`, `volunteer.html`, `contact.html` and `donate.html` (see "Find and replace").
5. **Set the notification address (info.learntogive@gmail.com) in the Formspree dashboard.** The `forms.notifyEmail` value in the config is only a reminder; Formspree does not read it.

Each form sends a hidden `_subject` ("New class signup", "New volunteer application", "New contact message", "New donation inquiry") and a hidden `_gotcha` honeypot field for spam. With JavaScript on, forms send JSON and show an inline thank-you message. If the request fails, a friendly error with a mailto link appears. With JavaScript off, forms do a normal POST to Formspree.

Until the real endpoint is set, every submission shows the error message, which is expected.

## Deploy

Any static host works: Netlify, Cloudflare Pages, or GitHub Pages. There is no build command, and the publish directory is the project root.

**Netlify walkthrough:**

1. Push this folder to a GitHub repository.
2. In Netlify, choose to add a new site and import it from Git, then pick the repository.
3. Leave the build command **empty** and set the publish directory to `/` (the repository root).
4. Deploy. Netlify gives you a temporary address. Netlify serves `404.html` automatically for missing pages.

**Cloudflare Pages:** connect the repository, choose no framework preset, leave the build command empty, and set the output directory to `/`.
**GitHub Pages:** in the repository settings, enable Pages and serve from the main branch, root folder.

Note: `404.html` uses relative links. They work for missing pages at the top level, such as `/missing.html`. For deep missing URLs, such as `/a/b/c`, the styles may not load. If that matters, change the links in `404.html` to start with `/`.

## Connect a custom .com domain

1. Buy the domain from any registrar.
2. In your host's domain settings (for example Netlify's domain management), add the domain, then follow the DNS records the host gives you at your registrar.
3. Update `siteUrl` in `js/site-config.js` (no trailing slash).
4. Replace `https://www.example.com` with your domain across every `.html` file, `sitemap.xml` and `robots.txt`:
   ```
   grep -rl "https://www.example.com" --include=*.html --include=*.xml --include=*.txt . | xargs sed -i 's#https://www.example.com#https://www.yourdomain.com#g'
   ```
   On macOS, use `sed -i ''`. Check afterwards with `grep -rn "example.com" .`

This README makes no claims about any host's pricing or exact screens, so check their current docs.

## Replace before launch

- [ ] **Shreyas's bio.** It is currently `[Shreyas's bio goes here]` (`founders` in `site-config.js`).
- [ ] **Founder photos.** All three are initials placeholders.
- [ ] **First sentence of the founders' story** ("Two of us are daughters of immigrants…") needs founder confirmation, because it refers to two of the three founders (`about.html`, flagged in a comment).
- [ ] **Class topics.** All are samples to confirm (`classes[*].topics`).
- [ ] **Telugu and English time slots.** Confirm whether the two versions really share one slot (`classes[*].versions`).
- [ ] **Intro to Python audience.** Assumed to be "4th and 5th grade" (`gradeKey: 'grade.4and5'`).
- [ ] **FAQ answers written as reasonable defaults.** Confirm materials (including "a computer works best" for Python), what happens after a missed session, and whether students can switch versions (`faq.a3`, `faq.a4`, `faq.a7`).
- [ ] **Volunteer "Preparation" text.** Confirm it matches what tutors actually do (`volunteer.prepBody`).
- [ ] **Formspree endpoint.** Update `forms.endpoint` and the four `action=""` attributes. Set the notify email in the Formspree dashboard.
- [ ] **Site URL and domain.** Update `siteUrl`, the canonical/OG tags in every page, `sitemap.xml` and `robots.txt`.
- [ ] **Total received.** Optional; it stays hidden while `null`.
- [ ] **Social links.** Currently empty, so they are hidden.
- [ ] **Testimonials.** Currently none, and hidden. Only add real quotes, first names only.
- [ ] **Favicon.** Placeholder (`images/favicon.svg`).
- [ ] **Hero image and share image.** Placeholders (`images/hero.svg`, `images/og-image.svg` / `.png`).
- [ ] **Every Telugu string.** Machine-translated, so it needs native-speaker review (see below). Afterwards, set `flags.showTeluguReviewNotice: false`.
- [ ] **Contact email in the noscript blocks.** If the email ever changes, find and replace it in every `.html` file as well as `site-config.js`.

## Needs native-speaker review

**All Telugu on this site is machine-translated** and has not been reviewed. While `flags.showTeluguReviewNotice` is `true`, a small notice in Telugu mode tells visitors the translation is under review. Telugu text lives in:

- `js/translations.js`, the whole `te` section (marked `MACHINE-TRANSLATED. NEEDS REVIEW BY A NATIVE SPEAKER.`). This includes:
  - navigation, footer, the review notice and the disclaimer
  - the tagline and mission (`config:tagline`, `config:mission`) and Sadhana's description (`config:sadhana.description`)
  - every page's headings and body text (`home.*`, `about.*`, `classes.*`, `faq.*`, `join.*`, `volunteer.*`, `impact.*`, `donate.*`, `contact.*`, `notfound.*`)
  - form labels, hints, error, thank-you and failure messages (`form.*` and each form's keys)
  - class names, audiences, topics, days, cities, months, language names and founder roles (`class.*`, `grade.*`, `topic:*`, `day:*`, `city:*`, `month:*`, `lang:*`, `role:*`)
- `js/components.js`: the "తెలుగు" label on the language toggle button.

**Not translated yet** (they stay in English with `lang="en"` in Telugu mode): the founder bios, the founders' story, founder names, the school name, the "(about $200)" figure text, and class times (which use "PM" and "IST").

## Accessibility notes

- Semantic landmarks, a skip link, and a visible focus ring on every interactive element.
- The mobile menu, FAQ and filters use `aria-expanded` / `aria-pressed`. Escape closes the menu and the dialog, and focus returns to whatever opened it.
- Form errors are tied to their fields with `aria-describedby` and `aria-invalid`.
- All Telugu text is marked `lang="te"` through the page's `<html lang>`.
- Motion is subtle and turns off under `prefers-reduced-motion`.
- Colors were measured for WCAG AA. The notes at the top of `css/styles.css` list the ratios. `--terracotta` (#C8553D) fails AA for normal text, so text and button fills use `--terracotta-dark` (#B84A33) instead.
