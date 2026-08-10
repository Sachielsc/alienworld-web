---
# Brief for the /frontend-beautify skill - see the note under this frontmatter.
# Every option below is shown with its default. Delete what you don't need;
# empty frontmatter (or none at all) is fine as long as the Goal names a page.

target: /                    # route path, or a view file like client/src/views/HomeView.vue

revisionRounds: 1            # 0 = critique only, apply nothing
                             # 1 = one pass applying accepted items (default)
                             # 2-3 = re-capture and re-consult between passes; stops early
                             #       once a round accepts nothing. 3 is the hard cap.

seats:                       # OVERRIDES ONLY - any line you omit keeps its default from
                             # tools/ai-council/config.json, where both seats are defined
                             # (designer = Gemini, reviewer = Poolside Laguna). Listing
                             # one seat here does not disable the other.
  designer:
    model: gemini-3.5-flash  # see config.json for alternatives; model ids go stale fast
  reviewer:
    enabled: true            # false skips this seat entirely and saves free-tier quota
---

> **What this file is:** the *input* to the `/frontend-beautify` skill — not a plan. Each run
> takes one of these:
>
> ```
> /frontend-beautify "C:\Users\gaide\repos\alienworld-web\docs\briefs\beautify-home.md"
> ```
>
> Copy it per page and edit the frontmatter and the sections below.
> Options reference: `tools/ai-council/README.md` · Workflow: `.claude/skills/frontend-beautify/SKILL.md`

# Goal

Make the homepage feel less cramped on mobile. The hero text and the nav sit too close
together at 390px, and the whole page reads as one dense block with no breathing room.

# Constraints

- Keep the dark alien identity: the `#97ff77` green, Orbitron/Inconsolata, the egg and
  head secret menus.
- Prefer editing `theme.css` custom properties over adding new one-off classes.
- No new dependencies, no CSS framework changes.

# Out of scope

- Navigation structure and link order
- Page content and copy
- Anything under `/about/*`

# Notes

Anything else worth knowing: a specific element that bothers you, a page you want it to
match, a change you already tried and rejected. Optional, but the designer seat uses this.
