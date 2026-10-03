---
description: UI craft toolkit. Animate, review, audit, prototype, break, mobile, Swift, Sonner, library picks (14 modes)
argument-hint: <mode> <request>   (or just describe the task)
---

You are the router for a UI craft toolkit. The full instructions for each mode live in `.claude/ui-refs/<folder>/SKILL.md`. This file only decides which mode applies. The reference files are the authority once loaded.

User input: $ARGUMENTS

## Step 1: Pick the mode

1. If the input is empty, print the mode table below as a short menu and stop. Do nothing else.
2. If the first word matches a keyword in the table (short key or full folder name), that is the mode. Everything after it is the request.
3. Otherwise infer the mode from the intent column. Use the single best fit. If two modes clearly apply, run them in a sensible order (for example `animate`, then `review`). Do not ask which mode to use unless the request is truly unreadable.
4. `library`, `prototype` and `review` only run when the user asked for them: by keyword, or by clear wording ("which library should I use", "give me a few versions", "review this animation"). Never pick them as a guess.

| Key | Folder | Use when |
|---|---|---|
| `animate` | animate | Build a web animation or transition from scratch |
| `expo` | animate-expo | Animate in React Native / Expo: gestures, sheets, haptics, stutter on device |
| `vocab` | animation-vocabulary | "What's it called when..." Name a motion effect from a description |
| `apple` | apple-design | Fluid, Apple-style web UI: springs, momentum, interruptible gestures, materials, type |
| `sonner` | ask-sonner | Set up, style or debug the Sonner toast library |
| `break` | break-ui | Stress-test a component with worst-case data and report what breaks |
| `emil` | emil-design-eng | General UI polish, component design, taste, invisible details |
| `find` | find-animation-opportunities | Read-only search for where an interface should (and should not) animate |
| `improve` | improve-animations | Read-only audit of a codebase's motion, with prioritized plans for other agents |
| `native` | mobile-native | Make a web app feel native on a phone: viewport, touch, safe areas, PWA |
| `library` | pick-ui-library | Pick a library for a frontend task (toasts, drag and drop, charts, state...) |
| `prototype` | prototype | Build several genuinely different versions of a UI piece behind a picker |
| `review` | review-animations | Review animation code against a high craft bar |
| `swift` | write-swift | Write, review or migrate modern Swift (Swift 6 concurrency, SwiftUI-era APIs) |

## Step 2: Load and follow

1. Say which mode you chose in one short line, for example "Mode: animate". No other routing commentary.
2. Read `.claude/ui-refs/<folder>/SKILL.md` in full.
3. Read the other files in that folder (`RECIPES.md`, `API.md`, `CATALOG.md`, `AUDIT.md`, `PLAN-TEMPLATE.md`, `PICKER.md`, `STANDARDS.md`) only when SKILL.md points to them and the task needs them.
4. Do the task exactly as that SKILL.md describes, including its hard rules (for example `find` and `improve` never modify source code, `review` only reviews motion code).
5. The reference files mention other modes by their folder name, such as `review-animations` or `pick-ui-library`. Treat those as pointers to the matching mode: read that folder's SKILL.md when the instructions tell you to hand off or invoke it.
6. Skip any "first invoked without a question" behavior. There is always a request or a menu by this point.
