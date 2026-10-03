/* DEV ONLY. Delete before launch (see README).
   Reads js/site-config.js and fails (exit code 1) if a student who picks one
   language could be double-booked: any two versions in the SAME language of
   classes in DIFFERENT subjects (math, science, python) that meet on the same
   day at overlapping times. That is the rule that lets a family take math and
   science in one language without a clash.
   Also fails on a time it cannot read, so a typo never passes silently.
   Run:  node dev/check-schedule.cjs
         node dev/check-schedule.cjs path/to/site-config.js   (to test another file) */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const file = path.resolve(process.argv[2] || path.join(__dirname, '..', 'js', 'site-config.js'));
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
const classes = (sandbox.window.SITE_CONFIG && sandbox.window.SITE_CONFIG.classes) || [];

function toMinutes(text) {
  const m = /^\s*(\d{1,2}):(\d{2})\s*([AP]M)\s*$/i.exec(text);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === 'PM') h += 12;
  return h * 60 + Number(m[2]);
}

function parseRange(timeIST) {
  const parts = String(timeIST || '').split(/\s+to\s+/i);
  if (parts.length !== 2) return null;
  const start = toMinutes(parts[0]);
  const end = toMinutes(parts[1]);
  if (start == null || end == null || end <= start) return null;
  return { start, end };
}

const problems = [];
const slots = [];
classes.forEach((cls) => {
  (cls.versions || []).forEach((v) => {
    const range = parseRange(v.timeIST);
    if (!range) {
      problems.push(`Cannot read the time "${v.timeIST}" for ${cls.id} (${v.language}). Use the form "6:00 PM to 7:00 PM".`);
      return;
    }
    slots.push({ id: cls.id, subject: cls.subject, language: v.language, day: v.day, ...range, label: `${cls.id} ${v.language} ${v.day} ${v.timeIST}` });
  });
});

for (let i = 0; i < slots.length; i++) {
  for (let j = i + 1; j < slots.length; j++) {
    const a = slots[i];
    const b = slots[j];
    if (a.subject === b.subject) continue;      // same subject: a student takes one of them (4th or 5th grade)
    if (a.language !== b.language) continue;    // the rule is about one language
    if (a.day !== b.day) continue;
    if (a.start < b.end && b.start < a.end) {
      problems.push(`Overlap in ${a.language}: ${a.label}  and  ${b.label}`);
    }
  }
}

if (problems.length) {
  console.error('Schedule check FAILED:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log(`Schedule check passed: ${slots.length} class versions, no same-language overlap between different subjects.`);
