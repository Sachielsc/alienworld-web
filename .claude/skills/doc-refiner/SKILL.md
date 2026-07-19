# doc-refiner

Refine, correct, and improve a target document using evidence gathered from a target repository. Use when validating or improving a markdown or text document against actual codebase files.

## allowed-tools
Read Glob Grep Write

## Invocation

```
/doc-refiner --doc <path-to-document> --repo <path-to-repository>
```

Both `--doc` and `--repo` are required. If either is missing, stop and ask the user to provide them before continuing.

---

## Step 1 — Parse Arguments

Extract the values of `--doc` and `--repo` from the invocation arguments.

- `--doc` is the path to the target document (.txt or .md)
- `--repo` is the path to the target repository or folder

Resolve both paths relative to the current working directory if they are not absolute.

---

## Step 2 — Read the Target Document

Use the Read tool to read the full content of `--doc`.

From the document, identify:
- The **title** (from filename or first heading)
- The **topic** (what the document is about)
- The **purpose** (what the document is trying to communicate)
- The **scope** (what aspects of the system it covers)

Do not output anything to the user yet.

---

## Step 3 — Scope the Repository (CRITICAL)

Based on the topic, purpose, and scope identified in Step 2, determine which areas of `--repo` are relevant.

Do NOT blindly read all files. Use the document topic to guide exploration.

Examples:
- "Authentication Flow" → auth modules, middleware, JWT config, login APIs
- "Playwright E2E Strategy" → test folders, playwright config, CI pipeline
- "Vue I18n Implementation" → i18n usage, locale files, frontend config

Use Glob to discover candidate files by pattern (e.g. `**/*auth*`, `**/tests/**`, `**/*.config.*`).
Use Grep to search for specific keywords, function names, or symbols mentioned in the document.

Read only the full file contents that are directly relevant to the document topic.

Do not output anything to the user yet.

---

## Step 4 — Analyse

With the document content and the relevant repository files in context, identify:

1. **Inaccurate claims** — statements in the document that contradict what the repository shows
2. **Outdated content** — references to things that have changed or no longer exist
3. **Missing details** — important information present in the repository but absent from the document
4. **Unclear sections** — content that is correct but poorly explained or structured
5. **Preserved content** — sections that are accurate, well-written, and should remain unchanged

For each finding, note:
- WHAT the issue is
- WHY it is wrong or incomplete
- WHICH file and line in the repository is the evidence

Do not output anything to the user yet.

---

## Step 5 — Discussion (REQUIRED before any output)

Present your findings to the user in a structured format:

```
## Analysis Summary

### Document: <title>
### Repository scanned: <list of files read>

---

### Findings

#### Inaccuracies
- [finding]: <what> — Evidence: <file:line>

#### Outdated Content
- [finding]: <what> — Evidence: <file:line>

#### Missing Details
- [finding]: <what> — Evidence: <file:line>

#### Unclear Sections
- [finding]: <what>

#### Preserved (no changes needed)
- [finding]: <what>

---

### Uncertainties
<list any points where you are unsure and need user clarification>

---

### Planned Improvements
<numbered list of every change you intend to make to the document>

---

**Please review the above. Reply with:**
- Any corrections or clarifications to the findings
- Approval to proceed with generating the refined document
- Or specific changes to the improvement plan

Do not generate the output file until the user explicitly approves.
```

Wait for the user's response before continuing.

---

## Step 6 — Incorporate User Feedback

If the user provided corrections or clarifications, update your understanding accordingly.

If the user approved without changes or confirmed that all intent changes are correct, proceed to Step 7.

---

## Step 7 — Write the Refined Document

Rewrite the full document applying all confirmed improvements.

The refined document must be:
- **Accurate** — every claim is supported by repository evidence
- **Complete** — no important details are missing
- **Structured** — clear headings, logical flow, good markdown formatting
- **Readable** — written for a human reader, not a machine
- **Preserving** — useful human-written context is kept where accurate

Determine the output path:
- Same directory as `--doc`
- Filename: `{original-filename}-refined.md`
- Example: `./docs/authentication.txt` → `./docs/authentication-refined.md`

Use the Write tool to write the refined document to that path.

---

## Step 8 — Completion Summary

After writing the file, output a short summary:

```
## Done

Refined document written to: <output path>

### Changes made
<brief list of what was changed and why>

### Evidence used
<list of repository files referenced>
```