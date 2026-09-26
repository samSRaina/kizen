Frontend Migration: TanStack Router + Bun + Biome

You are a senior TypeScript/React migration engineer.

Your job is to migrate the existing frontend application to a modern, type-safe architecture using:

Bun

TypeScript

TanStack Router

File-based routing

Biome for formatting and linting

Existing React UI and business logic wherever possible

The application is self-hosted.

Primary objective

Migrate the existing application without changing its user-facing behavior unnecessarily.

The migration must preserve:

existing pages

existing URL behavior where practical

existing UI

existing API contracts

existing authentication behavior

existing business logic

existing visual design

existing environment configuration

Do NOT rewrite working application logic merely for stylistic reasons.

This is a migration, not a redesign.

Phase 1 — Inspect before modifying

Before making changes:

Inspect package.json.

Inspect the existing build tool.

Inspect TypeScript configuration.

Inspect all existing routes/navigation.

Identify the current routing library.

Identify authentication/session handling.

Identify API/data-fetching architecture.

Identify environment variables.

Identify global providers.

Identify state management.

Identify testing setup.

Identify CSS/styling system.

Identify deployment/start commands.

Identify any SSR assumptions.

Identify any browser-only APIs.

Identify any server-only code accidentally imported into the browser.

Create a migration report before performing large changes.

The report should contain:

Current architecture

Current route map

Authentication flow

Data-fetching flow

Build/runtime flow

Dependencies that can be removed

Dependencies that must remain

Migration risks

Proposed target architecture

Do not make architectural assumptions without inspecting the repository.

Phase 2 — Establish the toolchain

Use Bun as the package manager and runtime where appropriate.

Use Biome as the canonical formatter/linter.

Do not introduce ESLint or Prettier unless the repository contains a specific compatibility requirement that makes them necessary.

Establish scripts such as:

bun dev

bun build

bun start or the appropriate production command

bun lint

bun format

bun check

bun typecheck

bun test if tests exist

Prefer a single canonical validation command that can be run in CI.

Do not blindly replace package-manager configuration. Preserve lockfile consistency and regenerate dependencies using Bun.

Phase 3 — Introduce TanStack Router

Use TanStack Router's file-based routing architecture.

Prefer route files under:

src/routes/

Use:

src/routes/__root.tsx

as the root route.

Generate the TanStack route tree using the official supported mechanism for the project's bundler.

Do not manually maintain the generated route tree.

Do not use code-based routing unless the existing application architecture makes file-based routing impractical.

Phase 4 — Build the route tree

First construct a route map from the existing application.

For example:

Existing:

/

/login

/dashboard

/settings

/projects

/projects/:id

Target:

routes/
├── __root.tsx
├── index.tsx
├── login.tsx
├── _authenticated.tsx
└── _authenticated/
    ├── dashboard.tsx
    ├── settings.tsx
    └── projects/
        ├── index.tsx
        └── $projectId.tsx


Use TanStack Router's pathless layout route mechanism for cross-cutting route concerns.

Authentication

If the application has authenticated and unauthenticated sections, create a pathless authentication layout.

Recommended structure:

routes/_authenticated.tsx

Use beforeLoad to perform the client-side navigation guard.

Authentication state should be supplied through TanStack Router context when appropriate.

Example conceptual structure:

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: () => <Outlet />,
})


Do not treat this route guard as the application's security boundary.

Server/API endpoints must independently authenticate and authorize requests.

Preserve the existing authentication mechanism unless migration requires changing it.

Do not invent a new authentication provider.

Router context

Use router context for dependencies that routes need but should not import/create independently.

Potential examples:

auth/session state

query client

API clients

feature flags

application services

Keep the context strongly typed.

Avoid global mutable singleton state when router context provides a cleaner dependency boundary.

Route responsibilities

Route files should primarily contain:

route definition

search parameter validation

route loaders

route-level error/pending boundaries

route metadata

route-specific composition

Avoid putting large reusable UI implementations directly into route files.

Prefer:

routes/
features/
components/
lib/


with clear responsibilities.

Search parameters

Use TanStack Router search parameter validation instead of manually reading:

window.location.search


Use schemas where appropriate.

Search parameters must be:

typed

validated

serializable

represented in the route definition

Do not duplicate URL parsing logic across components.

Navigation

Replace manual navigation patterns with TanStack Router primitives.

Prefer:

Link

useNavigate

route-aware navigation

typed route params

typed search parameters

Avoid hard-coded navigation strings when TanStack Router can provide type safety.

Data loading

Inspect the existing data-fetching architecture before changing it.

Do not automatically replace React Query, SWR, fetch wrappers, or another existing data layer unless there is a clear migration requirement.

If TanStack Query is already present, integrate it with TanStack Router rather than creating a second competing data-fetching abstraction.

Route loaders should be used for route-level loading requirements, not as a reason to move all application data fetching into route files.

Components

Preserve existing components whenever possible.

Do not perform broad visual refactors during the routing migration.

Separate:

route composition

feature logic

reusable UI

infrastructure

A route should be allowed to remain thin.

Self-hosting

The application must remain deployable on infrastructure controlled by the project owner.

Do not introduce mandatory dependencies on:

Vercel

Netlify

Cloudflare

proprietary auth infrastructure

managed backend services

unless the existing project already depends on them.

Keep deployment configuration explicit.

Document:

required environment variables

build command

production start command

port configuration

host configuration

persistent storage requirements

database requirements

reverse-proxy requirements

HTTPS requirements

authentication/session requirements

If using TanStack Start, use its documented deployment mechanism and choose the Bun-compatible deployment configuration.

Environment variables

Audit every environment variable.

Separate:

public/client variables

server-only secrets

Never expose secrets through client-side environment variables.

Do not rename environment variables without documenting the migration.

Type safety

The final project must pass TypeScript without suppressing errors.

Do not solve migration problems using:

any


or:

@ts-ignore


unless there is a documented unavoidable third-party typing problem.

Prefer fixing the underlying type issue.

Biome

Use Biome as the canonical formatter/linter.

After migration:

Run Biome formatting.

Run Biome checks.

Fix actual violations.

Avoid disabling rules globally simply to make the migration pass.

Keep generated TanStack Router files under the appropriate generated-file handling strategy.

Do not manually format generated files if the generator owns them.

Verification

After every meaningful migration phase:

Run TypeScript.

Run Biome.

Run tests.

Build the application.

Start the production build when possible.

Verify important routes.

Verify authentication redirects.

Verify login → redirect-back behavior.

Verify authenticated navigation.

Verify direct browser navigation to nested routes.

Verify refresh behavior.

Verify environment-variable behavior.

Do not declare the migration complete because the application merely compiles.

Migration discipline

Make changes incrementally.

Do not perform an uncontrolled repository-wide rewrite.

For each phase:

Explain what will change.

Make the smallest coherent change.

Run validation.

Fix errors.

Continue.

If a migration decision is ambiguous, inspect the existing code and documentation before guessing.

Never invent APIs for TanStack Router, Bun, Biome, or TanStack Start.

Prefer official documentation when verifying framework APIs.

Definition of done

The migration is complete only when:

Bun installs the project successfully.

The application starts in development.

The application builds successfully.

The production application can be started.

Biome passes.

TypeScript passes.

Existing tests pass or documented failures have been addressed.

Existing URLs have been migrated or explicitly documented.

Authentication behavior works.

Protected routes cannot render before authentication is established.

API/server authorization remains enforced independently of client routing.

No unnecessary authentication provider or cloud dependency has been introduced.

The route tree is understandable from the filesystem.

Generated TanStack Router files are generated rather than manually maintained.

The project contains documentation explaining local development and self-hosted deployment.

Before finishing, provide:

Final architecture

Route tree

Authentication flow

Commands for development

Commands for validation

Production deployment procedure

Environment variables

Removed dependencies

Added dependencies

Remaining migration risks

Any assumptions made during migration
