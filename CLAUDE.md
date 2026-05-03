# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Two-package monorepo. Run all commands from inside the relevant package — the root `package.json` has no scripts:

- `backend/` — NestJS 11 + TypeORM + MySQL
- `frontend/` — Vite 7 + React 18 + TypeScript + shadcn/ui + Tailwind
- `uploads/` (root) and `backend/uploads/` — disk storage for user-uploaded images, served from the backend at `/uploads/`

## Commands

### Backend (`cd backend`)
- `npm run start:dev` — Nest watch mode (port 3000)
- `npm run build` / `npm run start:prod` — compile to `dist/` and run
- `npm run lint` — ESLint with `--fix`
- `npm test` — Jest (uses `*.spec.ts` under `src/`)
- `npm test -- path/to/file.spec.ts` — run a single test file
- `npm run test:e2e` — e2e tests via `test/jest-e2e.json`
- `npm run seed` — runs `src/seed.ts` (clears and reseeds applications, categories, products, blogs, contacts; user seeding is commented out)

### Frontend (`cd frontend`)
- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint over the package

## Required environment

Backend reads these at runtime (no `.env.example` is committed):
- `JWT_SECRET`, `JWT_REFRESH_SECRET` — fall back to `'changeme'` / `'refreshsecret'` if unset, so set them for anything non-local
- `FRONTEND_URL` — comma-separated allow-list for CORS, also used to build email confirmation links (defaults to `http://localhost:5173`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` — required for user registration emails and contact-form notifications

Frontend:
- `VITE_API_URL` — base URL of the backend API; consumed via `apiFetch` and `getImageUrl`

MySQL connection is **hardcoded** in `backend/src/app.module.ts` (`localhost:3306`, db `ecom`, user `sani`/`sani123`) with `synchronize: true` — schema auto-migrates from entity changes, so be careful when editing entities against a non-disposable database.

## Architecture

### Backend modules
Each domain entity lives in its own module under `backend/src/<name>/` with the `entity.ts` / `dto.ts` / `controller.ts` / `service.ts` / `module.ts` quintet. Domains: `users`, `auth`, `applications`, `categories`, `products`, `blogs`, plus a flat `contact.{controller,entity,module}.ts` at the src root. All wired in `app.module.ts`.

### Translation pattern (important)
Categories, Products, Applications, and Blogs are **multilingual via a sibling translation entity**: e.g. `Category` ↔ `CategoryTranslation` (one-to-many, `cascade: true, eager: true`). The `Language` enum (`'en' | 'mk'`) lives in `backend/src/shared-types.ts`. When adding fields that vary per language, add them to the translation entity, not the parent. The `Application.languages` array tells the frontend which locales to expose.

### Auth
- `AuthService.validateUser` issues an access JWT (1h, `JWT_SECRET`) **and** a refresh JWT (7d, `JWT_REFRESH_SECRET`); the refresh token is also persisted on the `User` row and rechecked on `/auth/refresh`.
- `JwtAuthGuard` verifies the access token from the `Authorization: Bearer …` header and attaches `request.user`.
- `RolesGuard` extends `JwtAuthGuard` and checks the `ROLES_KEY` metadata set by the `@Roles(...)` decorator. Note: `users.controller.ts` uses raw `SetMetadata('role', 'SUPERADMIN')` in one place — that key does **not** match `ROLES_KEY` (`'roles'`), so the guard treats it as no role requirement. Use the `@Roles()` decorator if you actually want role enforcement.
- New users are created unconfirmed; `email.util.ts` emails a confirmation link (`/auth/confirm?token=…`). Login fails until `isConfirmed = true`.

### File uploads
Product/category/etc. image uploads use `multer` `diskStorage` writing to `backend/uploads/<domain>/`. `main.ts` serves these via `useStaticAssets` under the `/uploads/` URL prefix. Controllers store **relative paths** (e.g. `/uploads/products/foo.jpg`) in the entity's `images` array; the frontend's `getImageUrl(path)` in `lib/utils.ts` resolves them against `VITE_API_URL` (or returns the value as-is if it's already an `http(s)` URL — products mix uploaded files with seed URLs).

### Promoted product
At most one product has `promoted = true`. `ProductsService.setPromoted` clears the flag on all rows before setting it on the chosen one — preserve this invariant when touching that code.

### `NoCacheMiddleware`
Applied globally in `main.ts` — every response gets `Cache-Control: no-store`. If a response is unexpectedly uncacheable, that's why.

### Frontend structure
- Routing in `src/App.tsx`: public pages (`/`, `/about-us`, `/contact`, `/blogs`, `/blog/:slug`, `/category/:id`, `/product/:id`) plus admin routes under `/admin/*`, all gated by `ProtectedRoute`. The `AdminPanel` page renders different sub-admins based on the path.
- `src/components/admin/*Admin.tsx` — list/CRUD UIs; `src/components/forms/*Form.tsx` + `CreateEditDrawer.tsx` — shared add/edit drawer wired with `react-hook-form` + `zod`.
- `src/components/ui/*` — generated shadcn/ui (new-york style, `neutral` base, `lucide` icons). The `@/` alias maps to `frontend/src` (see `vite.config.ts` and `components.json`); use it for imports.
- **i18n**: `frontend/i18n.ts` (one level above `src/`) loads `src/locales/{en,mk}/translation.json` and is imported by `App.tsx` for side effects. `LanguageContext` (`src/context/LanguageContext.tsx`) is the React-side language state; it persists to `localStorage['language']`. Keep both in sync when switching languages.
- **Theming**: `ThemeProvider` handles light/dark; `lib/utils.ts` `changeTheme` / `restoreTheme` toggles a color-name class on `<html>` (one of the entries in the `colors` array) and persists to `localStorage['selected-color-theme']`. `restoreTheme()` runs on app start.
- **API calls**:
  - `lib/apiFetch.ts` — unauthenticated, returns `{ data, error }`.
  - `lib/fetchWithAuth.ts` — adds `Authorization: Bearer <userToken>`, on 401 attempts a `/auth/refresh` round-trip with `refreshToken`, and on failure clears both tokens from `localStorage` and redirects to `/`. Use this for any admin/authenticated request.
  - Tokens live in `localStorage` as `userToken` and `refreshToken`.

### React version mismatch (be aware)
`backend/package.json` pulls in `react`/`react-dom` `^19.1.1` (used only for some types in seed scripts), while `frontend/package.json` pins `18.2.0`. Don't unify these without checking — the frontend code targets React 18.
