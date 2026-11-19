# Agent Guidelines

See [.agentrules.md](./.agentrules.md) for project rules, architecture, technology standards, and documentation management rules.

## Documentation Management

All AI Agents working on the TechStore repository MUST read and strictly adhere to the `Documentation Management Rules` (Section 4) in [.agentrules.md](./.agentrules.md):
- **RULE 0 (Interview Documentation Before Planning):** For complex tasks with tradeoffs, document the decision tree and requirements interview in `docs/interviews/YYYY-MM-DD-ten-task-interview.md` before finalizing plans.
- **RULE 1 (Task Plans Before Coding):** Before writing code, check for an existing plan in `docs/task-plans/`. If none exists, create `docs/task-plans/YYYY-MM-DD-ten-task-plan.md` defining goals, affected files, technical solution, and measurable acceptance criteria.
- **RULE 2 (Code Change Documentation):** After implementation, inspect the git diff and create or update `docs/code-changes/YYYY-MM-DD-ten-task-change-log.md` detailing every changed file, before/after logic, technical rationale, impact analysis, and actual test results.
- **RULE 3 (Naming by Creation Date):** Always use the original creation date (`YYYY-MM-DD`) and lowercase hyphenated task name (`ten-task`) without Vietnamese diacritics. Use the identical task name across interviews, task plans, code change logs, and code reviews (`docs/code-reviews/YYYY-MM-DD-ten-task-code-review.md`). Never use the current execution date when updating existing documents.
- **RULE 4 (Plan & Result Synchronization):** The plan is the baseline for acceptance. Explicitly report met, unmet, and unverified criteria without retroactively altering plan criteria.
- **RULE 5 (Fixed Directory Structure):** All interview docs MUST go to `docs/interviews/`. All task plans MUST go to `docs/task-plans/`. All code change logs MUST go to `docs/code-changes/`. All code review reports MUST go to `docs/code-reviews/`. None of these may reside directly in `docs/`. Other documents (ADR, Agent docs, Master Plan) remain in their dedicated directories.
- **RULE 6 (Universal Agent Compliance):** Every AI agent tooling must load and enforce `.agentrules.md`.
- **RULE 7 (Git & Worktree Safety):** Do not commit, push, merge, or reset autonomously. Never overwrite uncommitted user changes, and confine all worktree operations to the current worktree.

## Agent skills

### Issue tracker

GitHub Issues using the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical 5-role triage vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context repository layout (`GLOSSARY.md` and `docs/adr/` at repo root). See `docs/agents/domain.md`.
