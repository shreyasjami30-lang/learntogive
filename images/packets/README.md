# Curriculum packet samples

Put sample pages from the curriculum packets here. They appear in
"A look inside our curriculum packets" on the Classes page once they are
listed in `curriculumSamples` in `js/site-config.js`. The section stays
hidden until at least one sample is listed.

What to upload for each sample:

- **A preview image** (PNG or JPG), about 600 x 776 pixels (a portrait page).
  Example: `images/packets/math-4-fractions.png`
- **The page itself** as a PDF (or the same image), which opens in a new tab.
  Example: `images/packets/math-4-fractions.pdf`

Before uploading, **remove all student information**: names, handwriting
that identifies a child, photos of children, school names, phone numbers,
and anything written on a filled-in page. Use a blank page or a page a
founder filled in.

Then add an entry to `curriculumSamples`:

```js
{ classId: 'math-4', title: 'Fractions practice page',
  description: 'One sentence about what the page covers.',
  previewImage: 'images/packets/math-4-fractions.png',
  fileUrl: 'images/packets/math-4-fractions.pdf' }
```

`classId` must match a class `id` (math-4, math-5, science-4, science-5, python).
This README is not linked from the site.
