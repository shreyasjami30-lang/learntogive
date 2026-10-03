# Learn To Give website

The website for **Learn To Give**, a student-run volunteer tutoring group. Tagline: *Learning that gives back.*

It is a plain static site: HTML, CSS and vanilla JavaScript. There are no frameworks, no npm, and no build step.

```
index.html  about.html  classes.html  join.html  volunteer.html
impact.html  donate.html  fundraise.html  contact.html  404.html
css/styles.css         one shared stylesheet (colors and motion tokens are CSS variables at the top)
js/site-config.js      every changeable value (start here)
js/translations.js     all page text, English + Telugu
js/components.js       shared header and footer (written once, injected on every page)
js/main.js             language toggle, menu, filters, schedule, FAQ, dialog, forms
images/                logo, favicon, share image, placeholder SVGs (see "Swap images")
images/packets/        where curriculum packet samples go (see its README.md)
dev/                   developer tools only. Delete before launch (see below)
robots.txt  sitemap.xml
```

### Pages

| Page | What it is |
| --- | --- |
| `index.html` | Home |
| `about.html` | Founders and "Why we started this" |
| `classes.html` | Weekly schedule table, class cards, how classes work, "How a class looks", gallery and packet samples (when filled in), FAQ |
| `join.html` | Overview for parents: the classes, how classes work, the four enrollment steps, FAQ. The sign-up itself is a Google Form |
| `volunteer.html` | Tutor information and application form |
| `impact.html` | Stats, donations, "Share your experience" (when set), testimonials (when turned on) |
| `donate.html` | How donating works, donate dialog, link to Fundraise |
| `fundraise.html` | For people in the US raising money for Sadhana in their own community. Linked from Donate, the Home banner and the footer, not the main nav |
| `contact.html` | Contact form |
| `404.html` | Page not found |

## Run it locally

Either double-click `index.html`, or run this from the project folder:

```
python3 -m http.server
```

Then open http://localhost:8000. The site uses classic `<script>` tags and keeps its data on `window` objects, so both ways work.

## Edit text and settings

**Most changes happen in `js/site-config.js`.** It holds the organization name, tagline, mission, contact email, stats, donation figures, founders, classes and their schedule, the school year, the sign-up and feedback form links, the Discord switch, gallery photos, packet samples, fundraise ideas, flags, the Formspree endpoint and every image path. A "REPLACE BEFORE LAUNCH" comment at the top of the file lists every sample value.

### Config keys added in this update

| Key | What it does |
| --- | --- |
| `images.logoMark` | The logo mark file (icon only). One line to switch logos (see "Swap the logo") |
| `images.appleTouchIcon` | 180x180 PNG home-screen icon |
| `images.gallery` | `[{ src, alt, caption, width, height }]`. The Classes page gallery stays out of the page while this is empty. Never photos of children |
| `schoolYear` | `{ start: 'June', end: 'April', status: 'sample, confirm' }`. Shown in "How classes work" and the FAQ |
| `scheduleStatus` | Reminder that the schedule is a sample |
| `classes[*].focus` | Focus area shown on the class card (`null` = none). Science classes use it |
| `classes[*].topicsStatus` | Notes that the science topics are drafts |
| `classes[*].signupUrl` | Optional Google Form for one class; overrides `signupFormUrl` |
| `classes[*].versions` | One entry per language, each with its own `day` and `timeIST` |
| `signupFormUrl` | The parent sign-up Google Form. Placeholder: `[GOOGLE FORM URL]` |
| `feedbackFormUrl` | The "Share your experience" Google Form. Placeholder: `[FEEDBACK FORM URL]` |
| `discord.enabled` | `true` shows the Discord copy on Classes, Join, Volunteer and Contact. `false` hides it and swaps in email wording |
| `curriculumSamples` | `[{ classId, title, description, previewImage, fileUrl }]`. Hidden while empty |
| `fundraiseIdeas` | `[{ title, examples }]` for the Fundraise page |
| `fundraiseHowItWorks` | The "How it works" text on the Fundraise page (marked "confirm") |

### Sign-up and feedback forms (Google Forms)

Families sign up through a Google Form, not a form on this site. Paste the form's link into `signupFormUrl`. A link only counts once it starts with `https://`. Until then, every "Sign Up" button goes to `contact.html`, so no button is ever broken. Real links open in a new tab. To send one class to its own form, set that class's `signupUrl`.

The feedback form works the same way through `feedbackFormUrl`. It is for parents, students and tutors. Ask for **first name only** and include a **permission-to-publish checkbox**. The Impact page shows a "Share your experience" button only once the link is real.

### Discord

All communication with students, parents and tutors happens on the Discord server. The site never shows an invite link: families get access after their sign-up is processed. To hide every Discord mention (for example, if you stop using it), set `discord.enabled: false`. Text that mentions Discord has a `.noDiscord` version in `translations.js` (for example `join.step3.noDiscord`), which is shown instead.

Some things you can do there:

- **Change a stat or donation figure**: edit `stats` or `donations`. `donations.totalReceived` stays hidden while it is `null`. Set it to a number in rupees, such as `25000`, to show it. Money **transferred** to Sadhana and money **received** are always shown as separate figures.
- **Change the contact email**: edit `contactEmail`. The footer, the Contact page and every mailto link read it from here. The one exception is the no-JavaScript fallback (see "Values that also live in the HTML").
- **Show testimonials**: add real entries to `testimonials` (first names only, never photos of children), then set `flags.showTestimonials: true`. Until then the Impact page leaves the section out of the page completely.
- **Add social links**: add `{ label: 'Instagram', url: 'https://...' }` to `socialLinks`. The social section stays hidden while the list is empty.
- **Hide the Telugu review notice** once a native speaker has checked the Telugu: set `flags.showTeluguReviewNotice: false`.
- **Add gallery photos or packet samples**: fill in `images.gallery` or `curriculumSamples`. Each section appears by itself once its list has an entry. See `images/packets/README.md` for what to upload, and remove all student information first.

### Values that also live in the HTML

The English text is also written directly in the HTML. That way the site still reads well with JavaScript off, search engines see real content, and the page doesn't flash empty while loading. When JavaScript runs, `js/translations.js` and `js/site-config.js` are the source of truth and overwrite that text.

So a few things exist in two places:

1. **English page text** lives in `translations.js` (the `en` section) *and* in the HTML. If you edit one, edit the other. Search for the `data-i18n="key"` value to find the HTML copy. The tagline, mission and Sadhana description come from `site-config.js` instead, and also have an HTML copy.
2. **The contact email** appears in the `<noscript>` block of every page, so it still shows without JavaScript. To change it everywhere, see "Find and replace" below.
3. **The Formspree URL** appears in each form's `action=""` attribute (volunteer, contact, donate, fundraise) as the no-JavaScript fallback.
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
| `images/logo-mark.svg` | Logo mark, direction A: an open book whose pages curve into a heart |
| `images/logo-mark-pencil.svg`, `logo-mark-sunrise.svg` | Logo directions B and C, kept so you can switch |
| `images/favicon.svg` | Browser tab icon: the logo mark on a cream tile |
| `images/apple-touch-icon.png` | 180×180 home-screen icon |
| `images/og-image.svg` | Source for the social sharing image |
| `images/og-image.png` | 1200×630 PNG rendered from `og-image.svg`. Social networks ignore SVG, so every page points at this PNG. |

To swap one, put the new file in `images/` and update its path in `SITE_CONFIG.images`. Founder photos should be square, at least 320×320. For the share image, replace `og-image.png` with a 1200×630 PNG or JPG. **Never use photos of children.** The hero image's `src` in `index.html` is a no-JavaScript fallback, so update it too if you rename the file.

## Swap the logo

The header and footer show the logo mark as an image next to the words "Learn To Give". The words are real text in Fraunces, not part of the image, because web fonts do not load inside an SVG shown as an `<img>`.

1. Open `dev/logo-picker.html` in a browser and flip through the three directions (keys 1, 2, 3).
2. In `js/site-config.js`, change the one line `logoMark: 'images/logo-mark.svg'` to `'images/logo-mark-pencil.svg'` or `'images/logo-mark-sunrise.svg'`. The header and footer update right away.
3. Rebuild the favicon, share image and touch icon from the new mark: `NODE_PATH="$(npm root -g)" node dev/render-brand-images.cjs` (needs Node and Playwright, not part of the site).
4. Update the `og:image:alt` / `twitter:image:alt` text in each page's `<head>`, which describes logo A.

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

A new card appears on the About page automatically. For a Telugu role, add `'role:Cofounder and Outreach Lead': '…'` to the `te` section of `translations.js`. If `photo` is `null` (or the file fails to load), the card shows the founder's initials instead. Once real photos are in, change `about.founderPhotoAlt` to something like "Photo of {name}".

## Add or edit a class

Each class in `SITE_CONFIG.classes` has an `id`, translation keys for its name and audience, an optional `focus`, `topics`, `durationMinutes`, `signupOpen`, an optional `signupUrl`, and a `versions` list with one entry per language (`language`, `day`, `timeIST`). The Telugu and English versions have different times. The Classes page cards, the "Weekly schedule at a glance" table, the Join page class cards and the Volunteer page subject list all update from this list. The All / Telugu / English filter on the Classes page applies to both the table and the cards.

**The schedule rule.** The English version of one subject meets at the same time as the Telugu version of the other subject, then they trade. The sample schedule (all IST, to confirm):

| | Slot A: Saturdays 6:00 to 7:00 PM | Slot B: Saturdays 8:00 to 9:00 PM |
| --- | --- | --- |
| 4th and 5th Grade Math | Telugu | English |
| 4th and 5th Grade Science | English | Telugu |
| Intro to Python | Sundays, English 6:00 PM | Sundays, Telugu 8:00 PM |

So a student who takes math and science in the same language never has a clash. After editing any time, run `node dev/check-schedule.cjs`: it fails if two same-language classes in different subjects overlap, or if a time can't be read. Write times as `6:00 PM to 7:00 PM`.

## Class times are anchored to IST

All class times are stored and shown in India Standard Time, because that's where the students are. US clocks change for daylight saving time and India's don't, so the US Eastern equivalent shifts by an hour twice a year. For that reason Eastern times are never shown on family-facing pages. `usEasternNote` in each class is for internal reference only and is not displayed.

## Set up Formspree (forms)

Four forms (Volunteer, Contact, the Donate dialog and Fundraise) send to [Formspree](https://formspree.io). There is no backend. Class sign-ups use the Google Form instead (see "Sign-up and feedback forms").

1. Create a Formspree account and a new form.
2. Copy the form's endpoint, which looks like `https://formspree.io/f/abcdwxyz`.
3. Paste it into `forms.endpoint` in `js/site-config.js`.
4. Replace `https://formspree.io/f/YOUR_FORM_ID` in the `action=""` attributes of `volunteer.html`, `contact.html`, `donate.html` and `fundraise.html` (see "Find and replace").
5. **Set the notification address (info.learntogive@gmail.com) in the Formspree dashboard.** The `forms.notifyEmail` value in the config is only a reminder; Formspree does not read it.

Each form sends a hidden `_subject` ("New volunteer application", "New contact message", "New donation inquiry", "New fundraiser idea") and a hidden `_gotcha` honeypot field for spam. With JavaScript on, forms send JSON and show an inline thank-you message. If the request fails, a friendly error with a mailto link appears. With JavaScript off, forms do a normal POST to Formspree.

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
4. Replace `https://www.example.com` with your domain across every `.html` file (including `fundraise.html`), `sitemap.xml` and `robots.txt`:
   ```
   grep -rl "https://www.example.com" --include=*.html --include=*.xml --include=*.txt . | xargs sed -i 's#https://www.example.com#https://www.yourdomain.com#g'
   ```
   On macOS, use `sed -i ''`. Check afterwards with `grep -rn "example.com" .`

This README makes no claims about any host's pricing or exact screens, so check their current docs.

## Replace before launch

- [ ] **Sign-up Google Form.** Paste it into `signupFormUrl` (placeholder `[GOOGLE FORM URL]`). Until then, Sign Up buttons go to the Contact page.
- [ ] **Feedback Google Form.** Paste it into `feedbackFormUrl` (placeholder `[FEEDBACK FORM URL]`). First name only, with a permission-to-publish checkbox.
- [ ] **Class schedule.** The Slot A / Slot B times are a sample (`classes[*].versions`). Confirm each version's day and time, then run `node dev/check-schedule.cjs`.
- [ ] **School year.** June to April is a sample (`schoolYear`).
- [ ] **Science topics.** Drafts; confirm them against the packets (`classes` science-4 and science-5, marked `topicsStatus`).
- [ ] **Math and Python topics.** Samples to confirm (`classes[*].topics`).
- [ ] **Intro to Python audience.** Assumed to be "4th and 5th grade" (`gradeKey: 'grade.4and5'`).
- [ ] **Shreyas's new bio** (`founders`) and **the new founders' story** (`about.story` in `translations.js`, plus the no-JavaScript copy in `about.html`). Confirm the wording.
- [ ] **Founder photos.** All three are initials placeholders.
- [ ] **Fundraise "How it works".** Confirm it matches how you handle money raised (`fundraiseHowItWorks`).
- [ ] **Curriculum packet samples.** Add real pages with all student information removed (`curriculumSamples`, `images/packets/`).
- [ ] **Gallery images.** Optional (`images.gallery`). Never photos of children.
- [ ] **Testimonials.** Currently none, and hidden. Only add real quotes collected with permission, first names only, then set `flags.showTestimonials: true`.
- [ ] **FAQ answers written as reasonable defaults.** Confirm materials (including "a computer works best" for Python), what happens after a missed session, and whether students can switch versions (`faq.a3`, `faq.a4`, `faq.a7`).
- [ ] **Volunteer "Preparation" text.** Confirm it matches what tutors actually do (`volunteer.prepBody`).
- [ ] **Volunteer languages.** The Classes page says every tutor speaks both languages; the volunteer form still lets applicants pick Telugu, English or both. Decide which you want.
- [ ] **Formspree endpoint.** Update `forms.endpoint` and the four `action=""` attributes. Set the notify email in the Formspree dashboard.
- [ ] **Site URL and domain.** Update `siteUrl`, the canonical/OG tags in every page, `sitemap.xml` and `robots.txt`.
- [ ] **Logo.** Direction A is live. To switch, see "Swap the logo".
- [ ] **Total received.** Optional; it stays hidden while `null`.
- [ ] **Social links.** Currently empty, so they are hidden.
- [ ] **Hero image.** Placeholder (`images/hero.svg`).
- [ ] **Every Telugu string.** Machine-translated, so it needs native-speaker review (see below). Afterwards, set `flags.showTeluguReviewNotice: false`.
- [ ] **Contact email in the noscript blocks.** If the email ever changes, find and replace it in every `.html` file as well as `site-config.js`.
- [ ] **Delete the `dev/` folder** (see next section).

## Delete before launch

Everything in `dev/` is for building and testing only. None of it is linked from any page or listed in `sitemap.xml`. Delete the whole folder before launch:

| File | What it is |
| --- | --- |
| `dev/logo-picker.html` | The three logo directions behind a picker |
| `dev/worst-case.html` | Stress test: the real page sections fed worst-case data, with a Demo / Worst case / Empty toggle |
| `dev/render-brand-images.cjs` | Rebuilds the favicon, share image and touch icon from the chosen logo |
| `dev/check-schedule.cjs` | Fails if same-language classes in different subjects overlap |
| `dev/verify-site.cjs` | Playwright checks for every page in both languages (links, forms, hidden sections, Discord, keyboard, reduced motion, file://) |

If you want to keep using the checks after launch, move `check-schedule.cjs` and `verify-site.cjs` out of the published folder instead of deleting them.

## Needs native-speaker review

**All Telugu on this site is machine-translated** and has not been reviewed. While `flags.showTeluguReviewNotice` is `true`, a small notice in Telugu mode tells visitors the translation is under review. Telugu text lives in:

- `js/translations.js`, the whole `te` section (marked `MACHINE-TRANSLATED. NEEDS REVIEW BY A NATIVE SPEAKER.`). This includes:
  - navigation, footer, the review notice and the disclaimer
  - the tagline and mission (`config:tagline`, `config:mission`) and Sadhana's description (`config:sadhana.description`)
  - every page's headings and body text (`home.*`, `about.*`, `classes.*`, `schedule.*`, `faq.*`, `join.*`, `volunteer.*`, `impact.*`, `donate.*`, `fundraise.*`, `contact.*`, `notfound.*`), including the `.noDiscord` variants
  - fundraise ideas (`idea:*`), the Fundraise "How it works" text (`config:fundraiseHowItWorks.text`), class focus areas (`focus:*`) and the new science topics
  - form labels, hints, error, thank-you and failure messages (`form.*` and each form's keys)
  - class names, audiences, topics, days, cities, months, language names and founder roles (`class.*`, `grade.*`, `topic:*`, `day:*`, `city:*`, `month:*`, `lang:*`, `role:*`)
- `js/components.js`: the "తెలుగు" and short "తె" labels on the language toggle button.

**Not translated yet** (they stay in English with `lang="en"` in Telugu mode): the founder bios, the founders' story, founder names, the school name, the "(about $200)" figure text, and class times (which use "PM" and "IST").

## Accessibility notes

- Semantic landmarks, a skip link, and a visible focus ring on every interactive element.
- The mobile menu, FAQ and filters use `aria-expanded` / `aria-pressed`. Escape closes the menu and the dialog, and focus returns to whatever opened it.
- Form errors are tied to their fields with `aria-describedby` and `aria-invalid`.
- All Telugu text is marked `lang="te"` through the page's `<html lang>`.
- Motion is subtle: the donate dialog and mobile menu ease in with a spring-style curve, FAQ answers and thank-you messages fade in, and buttons scale slightly when pressed. Under `prefers-reduced-motion` all movement stops and only short fades remain. Hover effects only apply on devices with a mouse or trackpad.
- The header is translucent where the browser supports it, and solid under "reduce transparency" or "increase contrast".
- On phones: no tap flash, 16px minimum input text (no zoom on focus), safe-area padding for notched screens, and the schedule table and gallery scroll sideways inside their own boxes.
- Colors were measured for WCAG AA. The notes at the top of `css/styles.css` list the ratios. `--terracotta` (#C8553D) fails AA for normal text, so text and button fills use `--terracotta-dark` (#B84A33) instead.
