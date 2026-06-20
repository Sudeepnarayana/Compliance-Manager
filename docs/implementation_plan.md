# Implementation Plan - Modern Enterprise Workforce Management (RPOC-1)

Create a production-grade, highly aesthetic enterprise workforce management web application (inspired by ServiceNow and the RPO Compliance Control Tower) using Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and NextAuth.

---

## User Review Required

> [!IMPORTANT]
> **Database Setup & Prisma Client**: 
> - We will configure a Prisma schema using PostgreSQL. To ensure the application builds and runs locally without requiring a live, external PostgreSQL database, we will implement a dual-mode adapter/mocking fallback for local development (or use SQLite / an in-memory db fallback for the active UI dev server, while keeping the PostgreSQL Prisma schema ready for production). We recommend using SQLite locally for immediate local running (via a dev Prisma file or client mock) and delivering the full PostgreSQL schema.
> - **Please confirm if you have a local PostgreSQL database running** or if you would like us to configure a local SQLite fallback for testing the pages.

> [!TIP]
> **NextAuth Version & Configuration**:
> - We will use **NextAuth v4** (highly compatible with standard credentials provider and Next.js App Router) or **NextAuth v5 (Auth.js)**. NextAuth v4 is selected for its robust credentials adapter behavior in App Router.
> - We will seed default credentials for all 6 enterprise roles (`Admin`, `HR`, `Payroll`, `Recruiter`, `Accounting`, `Manager`) so you can log in as any role immediately and explore the custom UI dashboards.

---

## Open Questions

- Should we include mock data seeding for the workforce dashboard (e.g. mock disputes, visa tracking documents, candidate offer letters) so that the analytics charts and status grids are pre-populated upon startup? *(Recommended: Yes, to immediately showcase the ServiceNow-style enterprise interface).*
- Do you have specific SMTP or email settings for the "Forgot Password" or offer-letter notification simulations, or should we mock email deliveries using a console logger / UI-based notification log? *(Recommended: Mock via a UI-based notification panel / system log to avoid configuration blocks).*

---

## Proposed Changes

### Next.js 15 Setup
We will initialize a Next.js 15 TypeScript project with Tailwind CSS, ESLint, and App Router.

#### [NEW] [schema.prisma](file:///d:/p1/prisma/schema.prisma)
Define the PostgreSQL database schema for enterprise users, profiles, audit logs, payroll compliance checklists, offer letters, and disputes.
Key Models:
- `User` (id, email, passwordHash, name, role [ADMIN, HR, PAYROLL, RECRUITER, ACCOUNTING, MANAGER], status)
- `Profile` (id, userId, title, department, phone, avatarUrl, startDate)
- `PayrollChecklist` (id, userId, visaStatus, visaExpiry, directDepositSet, stateRegistered, payrollHold)
- `OfferLetter` (id, candidateName, candidateEmail, roleTitle, salary, status [DRAFT, SENT, HR_APPROVED, CANDIDATE_ACCEPTED, REJECTED])
- `PaymentDispute` (id, employeeId, amount, status [OPEN, UNDER_REVIEW, RESOLVED], disputeReason, resolutionNotes)
- `AuditLog` (id, userId, action, resource, details, timestamp)

#### [NEW] [middleware.ts](file:///d:/p1/src/middleware.ts)
RBAC middleware that checks the user's role in the JWT session token and guards routes:
- `/dashboard/admin/**` -> Only `ADMIN`
- `/dashboard/hr/**` -> Only `HR`, `ADMIN`
- `/dashboard/payroll/**` -> Only `PAYROLL`, `ADMIN`
- `/dashboard/recruiter/**` -> Only `RECRUITER`, `ADMIN`
- `/dashboard/accounting/**` -> Only `ACCOUNTING`, `ADMIN`
- `/dashboard/manager/**` -> Only `MANAGER`, `ADMIN`
- `/dashboard` -> Accessible by all authenticated roles, loading customized components.

#### [NEW] Authentication Pages
- **[login/page.tsx](file:///d:/p1/src/app/login/page.tsx)**: Beautiful enterprise login form with role-selection quick links (for developer testing) and Credentials sign-in.
- **[register/page.tsx](file:///d:/p1/src/app/register/page.tsx)**: Self-service registration page allowing selection of enterprise role (or default employee role).
- **[forgot-password/page.tsx](file:///d:/p1/src/app/forgot-password/page.tsx)**: Request password reset link (simulated email notification).

#### [NEW] Enterprise Dashboard Layout & Pages
- **[layout.tsx](file:///d:/p1/src/app/dashboard/layout.tsx)**: Collapsible sidebar navigation, top utility navbar (search, notification list, light/dark mode switch, user menu), and main content region.
- **[page.tsx](file:///d:/p1/src/app/dashboard/page.tsx)**: Central dispatch panel that renders specialized controls based on the logged-in user's role, plus a unified compliance scorecard:
  - **Admin Panel**: User role management and real-time security audit trails.
  - **HR Control**: Onboarding pipelines, I-9/Visa expiration alert center, employee statuses.
  - **Payroll Hub**: Visa validation checks, direct deposit setup verifications, state tax registry status.
  - **Recruiting Queue**: Offer letter wizard (similar to the n8n POC), approval state tracking.
  - **Accounting Logs**: Payment disputes resolution console, audit evidence upload.
  - **Manager Authorization**: Management approvals list for expense sheets, offer letters, or LOA requests.

#### [NEW] Styling & Themes
- **[globals.css](file:///d:/p1/src/app/globals.css)**: Integrate custom Tailwind theme with HSL-based variables for Light and Dark modes. Dark mode will use a sleek slate/charcoal palette, and light mode will follow ServiceNow's clean enterprise look.

---

## Verification Plan

### Automated Tests
- Build test: `npm run build` to verify TypeScript compile and Next.js route generation.
- Schema verification: `npx prisma validate` to confirm schema structure correctness.

### Manual Verification
- Deploy Next.js dev server: `npm run dev` and navigate through:
  - Credentials Login/Register.
  - Test role protections (e.g. verify Recruiter cannot access `/dashboard/admin` and is redirected).
  - Verify Dark/Light mode toggle preserves choice (using local storage).
  - Interactive submission of an offer letter and approval of a payment dispute.
