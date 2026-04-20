# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` workspace with multiple runtimes. Put user-facing apps in `apps/` (`web`, `admin`, `miniapp`), shared TypeScript code in `packages/`, backend services in `services/`, API and event contracts in `contracts/`, and operational material in `infra/` and `docs/`. Follow the existing split before adding new modules: frontend concerns stay in `apps/` or `packages/`, domain or integration changes should usually start in `contracts/`.

## Build, Test, and Development Commands
- `pnpm install`: install workspace dependencies.
- `pnpm build`: run all package and app builds through Turborepo.
- `pnpm test`: run all configured test tasks.
- `pnpm lint`: run lint tasks across the workspace.
- `pnpm dev:web`, `pnpm dev:admin`, `pnpm dev:miniapp`: start the corresponding frontend locally.
- `. .\infra\scripts\use-dev-env.ps1`: load the expected `Java 21` and `Python 3.12` into the current PowerShell session.
- `.\services\core-platform\gradlew.bat test`: run Spring Boot tests.
- `cd services/ai-orchestrator; uv run pytest` and `cd services/knowledge-pipeline; uv run pytest`: run Python service tests.

## Coding Style & Naming Conventions
Respect `.editorconfig`: UTF-8, LF, final newline, and trimmed trailing whitespace. Use 2-space indentation for Markdown, JSON, TypeScript, and React files; use 4 spaces for Python and Java. Match established naming: React components in `PascalCase`, hooks and helpers in `camelCase`, Python test files as `test_*.py`, and Java tests as `*Test.java`. Keep Java packages under `com.tongfuli.platform`.

## Testing Guidelines
Frontend test scripts exist but are still placeholders, so add targeted tests when expanding UI logic. Python services use `pytest`; keep tests in each service’s `tests/` directory. The Java service uses JUnit 5 via Gradle; place tests under `src/test/java`. For contract or API changes, update tests in the affected service before opening a PR.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commits, for example `feat(conversation-core): ship end-to-end slice` and `chore: initialize Tongfuli monorepo`. Keep messages imperative and scoped when the area is clear. PRs should state the impacted app or service, summarize behavior changes, list the commands you ran, and include screenshots for UI changes. `CODEOWNERS` currently routes all areas to `@mi`, so request review accordingly.

## Security & Configuration Tips
Do not commit secrets, `.env` files, or machine-specific paths. Use the environment bootstrap script before running Python or Java tooling. When changing shared payloads or integration behavior, update `contracts/` first, then align implementations in `apps/`, `packages/`, and `services/`.
