---
name: taught-master-applications
description: >
  Use this bilingual Chinese/English skill when the user wants to find, compare, plan, or prepare study abroad applications, especially taught master's programs such as MSc, MA, MDes, MFA, MEd, MPP, and professional master's degrees. It covers degree-route triage, program discovery, fit analysis, tuition and ROI, deadlines, SOP/PS/CV guidance, timeline planning, application tracking, offer comparison, and portfolio or writing-sample strategy when relevant.
---

# Study Abroad Applications

## Purpose

Help the user apply to study abroad programs from first uncertainty to submitted applications. The strongest current route is taught master's applications; undergraduate, research master's, PhD, and offer-comparison workflows are supported as lighter route-specific extensions.

Default to taught master's logic for MSc, MA, MDes, MFA, MEd, MPP, and professional master's programs. Use `references/degree-routes.md` whenever the route is unclear, broader than taught master's, or includes undergraduate, research, PhD, scholarship, or offer-decision work.

This skill is bilingual. Follow the user's language for planning output. Use English for final overseas application materials such as SOP, PS, motivation letter, CV bullets, and short-answer drafts when the target program expects English; keep Chinese planning notes when useful.

Use this skill for requests like:
- "规划留学申请"
- "Help me plan my study abroad applications"
- "找授课型硕士项目"
- "Find taught master's programs for me"
- "规划英国/欧洲/港新/澳洲硕士申请"
- "我不知道该申请本科/授课硕/研究型硕士/PhD 哪条路线"
- "帮我看这个 MSc/MA/MDes 值不值得申"
- "我的背景适合哪些授课硕"
- "帮我做文书主线和申请时间规划"
- "帮我准备 personal statement / SOP / CV / 推荐信素材"
- "Help me prepare my personal statement, SOP, CV, and recommendation packet"
- "我的背景适合商科/社科/工科/教育/传媒/设计/交叉学科里的哪些项目"
- "这个项目需要作品集或 writing sample，帮我规划材料"
- "帮我比较 offer，看看去哪一个更值"

## Operating Principles

- Start simple. If the user is unsure, use `references/simple-start.md` and ask only one next question.
- Match the user's language for planning. For English application documents, write in polished English unless the user asks for Chinese notes or bilingual output.
- For lower latency and fewer back-and-forth questions, offer the prefilled Markdown form in `references/prefilled-intake.md` early.
- Treat Notion as optional. Use `references/export-strategy.md` so auth/API setup never blocks progress.
- Route first when the user is not clearly asking for taught master's work. Use `references/degree-routes.md` to keep undergraduate, taught master's, research master's, PhD, and offer comparison workflows separate.
- Treat taught master's applications as a program-fit and execution problem; portfolio fit is one possible dimension, not the default center.
- Treat the workflow like a lightweight application operating system: profile, evidence, program pool, document plan, deadline tracker, and application pack should stay connected instead of becoming separate chat answers.
- Use `references/system-architecture.md` when the user wants a durable workflow, local workspace, repeated review loop, or "application operating system" style help.
- Prefer official program pages for requirements, deadlines, tuition, and portfolio rules. Mark uncertain facts as `待官网确认`.
- Do not invent portfolio work. Only use projects found in user-provided files, local folders, repos, screenshots, Notion pages, or explicit user statements.
- For portfolio programs, separate showcase projects from archive material. Build a sharp through-line first; weaker or older work can support provenance but should not dilute the main portfolio story.
- Keep first-run setup small: ask for only the target direction and where to look for portfolio/project materials if not already obvious.
- When dates are discussed, always use concrete dates (for example, `2026-12-15`) and avoid only saying "this month" or "next month".
- Keep evidence boundaries explicit: distinguish `官网已核查` from `待官网确认`, and avoid mixing them in one conclusion sentence.
- Public information can be used for scouting and planning, but must be labeled by evidence level and source type.

## Public Information Scope

Allowed public information sources:
- Official university/program/admissions pages.
- Official policy pages (international admissions, language requirements, scholarships, visa guidance entry points).
- Official school showcase pages and student profile pages.
- Public student portfolio websites and public case-study pages.
- Public inspiration platforms (for expression reference only): Issuu, Behance, Pinterest, Xiaohongshu.

Mandatory source boundaries:
- Use official pages for requirements, deadlines, tuition, language policies, and submission formats.
- Use non-official pages only for expression patterns, project presentation ideas, and risk reminders.
- If a non-official page states a requirement, mark it `待官网确认` until matched with an official page.

## Quick Start

1. If the request is broad, read `references/simple-start.md` first and give a low-friction first plan.
2. If the user wants fewer questions or a reusable setup, use `references/prefilled-intake.md` and generate the Markdown intake form.
3. Clarify the task type using `references/workflow-map.md`:
   - **Application OS setup**: create or update a durable application workspace using `references/system-architecture.md`.
   - **Degree-route triage**: choose undergraduate, taught master's, research master's, PhD, or offer comparison using `references/degree-routes.md`.
   - **Profile intake**: build or update the user's taught-master application profile.
   - **Evidence map**: turn coursework, internships, projects, writing, research, and portfolio pieces into application proof.
   - **Program scout**: find taught master's programs.
   - **Fit analysis**: compare one or more programs against the user's background, goals, budget, and timeline.
   - **Document guidance**: plan SOP, personal statement, motivation letter, CV, short answers, and study plan.
   - **CV generation**: create, anonymize, or tailor a study-abroad CV using `references/cv-generation-workflow.md`.
   - **Recommendation letter**: create referee support packs or template-based drafts using `references/recommendation-letter-workflow.md`.
   - **Timeline planning**: turn deadlines into weekly tasks and material milestones.
   - **Portfolio scout**: inventory projects and identify case studies when relevant.
   - **Reference scout**: find official showcases, student work, Issuu, Pinterest, Xiaohongshu, or other examples.
   - **Execution tracker**: maintain local or Notion-ready application status and next actions.
   - **Application pack**: produce program-specific material strategy and checklist.
   - **Agent-ready pack**: prepare portal/checklist fields for later guided application work.
4. Gather minimal context:
   - Target field: business, social sciences, engineering, education, media, design, data, public policy, interdisciplinary, or open.
   - Target regions: UK, EU, US, Canada, Australia, Singapore, Hong Kong, or open.
   - Intake/timeline and budget preference if relevant.
   - Academic/profile sources and portfolio/project source paths if relevant.
5. Use `references/profile-intake.md` if the user's background is unclear or the task requires personalized planning.
6. Search or inspect sources depending on the task.
7. Score fit using `references/rubric.md`.
8. Output using `references/output-schema.md` when creating an inbox, table, or report.

### First-Reply Contract

On broad requests, the first assistant reply should:
- Give a usable draft plan immediately with clear assumptions.
- Ask only one next question.
- Offer the local intake template option from `assets/templates/授课硕申请资料表.md` to reduce back-and-forth.

## Profile Intake Workflow

Use `references/profile-intake.md` when starting from scratch, updating the user's target direction, or preparing a serious school list. Ask only for the minimal first-run inputs unless the user explicitly wants a full intake.

## Prefilled Intake Workflow

Use `references/prefilled-intake.md` when the user wants to avoid slow option-by-option questioning. Create a local Markdown form from `assets/templates/授课硕申请资料表.md`, then wait for the user to fill it before producing a full plan.

## Workflow Map

Use `references/workflow-map.md` to choose the right module. Do not expose the full workflow unless the user asks; use it internally to decide the next best action.

## Application OS Workflow

Use `references/system-architecture.md` when the user wants the system to remember progress across sessions, maintain a local application workspace, run weekly reviews, or connect intake, evidence, program selection, documents, deadlines, and portal preparation into one operating system. Keep the workspace compact and refresh downstream objects when upstream facts change.

## Degree Route Workflow

Use `references/degree-routes.md` when the request is broader than taught master's, when the user is unsure which application route fits, or when the user mentions undergraduate, research master's, PhD, scholarships, PI/supervisor fit, UCAS/Common App, or offer comparison. Keep the route explicit in outputs.

## Language Workflow

Use `references/language-policy.md` when the user asks for bilingual output, when writing formal English application documents, or when converting Chinese planning notes into English application wording.

## Evidence Map Workflow

Use `references/evidence-map.md` when the user is unsure what they can apply for, has many scattered experiences, or needs a stronger narrative before school selection. Convert raw experiences into ability nodes, proof artifacts, target directions, keywords, gaps, and document/portfolio usage.

## Program Scout Workflow

When searching the web, use current official pages and cite links. Search with combinations such as:

```text
site:edu OR site:ac.uk taught master application requirements international students
MSc business analytics international students deadline tuition SOP CV
MA media management international students application requirements
MEd education technology taught master requirements personal statement
MPP public policy data analytics master requirements writing sample
MDes design portfolio requirements international students
```

For each promising program, extract:
- Program name, school, country/city, degree type, duration, mode.
- Official URL and application URL if different.
- Deadline and intake.
- Tuition and scholarships, if visible.
- Application requirements: academic background, GPA/degree class, language, CV, SOP/PS, references, transcript, writing sample, interview, portfolio.
- Portfolio requirement if any: required, optional, not required, or unclear.
- Portfolio format if any: PDF, website, slides, video, number of projects, page count, file size, prompt.
- SOP/personal statement requirements.
- Curriculum and track keywords.
- Career direction and cohort style if official page states it.
- Fit score and recommended strategy.
- Gaps and next action.

## Portfolio Scout Workflow

When the user wants AI to collect portfolio projects:

1. Inspect only paths or links the user provides or has already configured.
2. Look for README files, project descriptions, screenshots, Figma/design links, websites, docs, decks, and code repos.
3. For every candidate project, produce:
   - One-line positioning.
   - User role and contribution.
   - Problem, target user, design/product approach, AI component if any.
   - Evidence artifacts available now.
   - Missing artifacts to create.
   - Best-fit program categories.
   - Showcase/archive decision.
4. Favor a coherent application narrative over a chronological list.

Good evidence anchors may include coursework, internships, research reports, data projects, policy memos, product or engineering projects, education/media work, design portfolios, writing samples, and professional outputs, but verify each claim from current materials before using it.

## Reference Scout Workflow

Use `references/reference-scout.md` when the user asks for official examples, student portfolios, Issuu, Pinterest, Xiaohongshu, Behance, or inspiration. Clearly separate official requirements from inspiration sources.

## Execution Tracker Workflow

Use `references/execution-tracker.md` when the user wants ongoing management, Notion/local inbox output, weekly task lists, or application status tracking. If Notion is unavailable, write a local Markdown tracker and keep moving.

## Agent-Ready Application Workflow

Use `references/agent-ready-pack.md` when the user has target programs and wants help preparing, checking, or later guiding application portal work. Keep preparation separate from final submission, payment, legal declarations, sensitive uploads, or recommendation sending, which require explicit user approval.

## Export Workflow

Use `references/export-strategy.md` whenever writing to Notion, local files, CSV, HTML, spreadsheet trackers, or clipboard-ready outputs. Default to local Markdown plus CSV when Notion authentication is missing.

## Document Guidance Workflow

Use `references/document-guidance.md` when the user asks for SOP, PS, motivation letter, CV positioning, short answers, study plan, or application narrative. Keep factual claims grounded in existing materials; enrich framing and detail without inventing experience.

For CV creation, anonymization, or program-specific CV tailoring, use `references/cv-generation-workflow.md`. For a privacy-safe, generic STEM-oriented CV starting point, use `assets/templates/cv-template-stem.docx`.

For recommendation-letter format, academic reference letters, or recommender support packs, use `references/recommendation-letter-workflow.md`. Default reusable template: `assets/templates/academic-recommendation-letter-template.docx`. Treat recommendation letters as referee-confirmed materials: prepare structure and evidence support, but do not invent or impersonate the recommender.

## Timeline Planning Workflow

Use `references/timeline-planner.md` when the user asks what to do first, how to schedule applications, or how to plan around deadlines. Always use concrete dates; treat today's date as the current environment date unless updated by the user.

## Fit Analysis

Use the rubric in `references/rubric.md`. Default priority labels:

- **A**: strong program/portfolio fit, feasible timeline, clear requirements, worth preparing now.
- **B**: relevant but has gaps, cost/timeline uncertainty, or portfolio angle needs work.
- **C**: weak fit, unclear value, unrealistic deadline/cost, or portfolio mismatch.

For expensive taught master's programs, explicitly discuss ROI as a practical constraint: tuition, location cost, work opportunities, career alignment, and whether the user's profile/story can justify applying.

## Output Modes

- **Short answer**: recommendation table plus next three actions.
- **Inbox/report**: use `references/output-schema.md` and write a structured Markdown page or Notion-ready content.
- **Portfolio plan**: project ranking, missing assets checklist, and case-study outlines.
- **Document plan**: SOP/PS angle, CV emphasis, references, short-answer themes, and evidence map.
- **Timeline plan**: deadline calendar, weekly tasks, blockers, and first next action.
- **Application pack**: program-specific strategy, portfolio case selection if relevant, document angle, CV emphasis, and material checklist.
- **Agent-ready pack**: portal URL, verified fields, material checklist, open questions, and pause points for user approval.

When writing to Notion, fetch the database/page schema first. If schema updates fail, preserve content in a well-structured page body instead of forcing database changes.

## Boundaries

- Do not guarantee admission or predict exact admit probability.
- Do not treat ranking alone as fit.
- Do not hide uncertainty in tuition, visa, OPT/PSW/work rights, or deadline facts; verify or mark `待官网确认`.
- Do not mix research-degree logic such as PI cold email or funded-only filtering into taught master's work unless the program explicitly requires research supervision.
