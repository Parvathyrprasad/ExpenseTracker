

\# ExpenseTracker — AI Project Rules



\## 1. Project Overview



ExpenseTracker is a full-stack personal finance application.



The project uses:

\- Frontend: React 18, TypeScript, Vite, Tailwind CSS

\- Backend: Node.js, Express, TypeScript

\- Database: PostgreSQL

\- ORM: Prisma 6

\- Validation: Zod

\- Authentication: JWT and bcrypt

\- Frontend testing: Vitest and React Testing Library

\- Backend testing: Vitest and Supertest



\## 2. Project Structure



\- `client/` — React frontend application

\- `server/` — Express backend application

\- `server/prisma/` — Prisma schema, migrations, and seed data

\- `server/src/` — Backend source code and tests

\- `README.md` — Project documentation

\- `package.json` — Root scripts for development, building, and testing



\## 3. Important Commands



Run these commands from the project root.



Development:

\- `npm run dev:server`

\- `npm run dev:client`



Build:

\- `npm run build`

\- `npm run build:server`

\- `npm run build:client`



Tests:

\- `npm test`

\- `npm run test:server`

\- `npm run test:client`



Database:

\- `npm run prisma:seed`



Frontend lint:

\- `npm --prefix client run lint`



\## 4. Coding Standards



\- Use TypeScript for frontend and backend code.

\- Follow the existing folder structure and coding conventions.

\- Use reusable components and services.

\- Validate incoming data before processing it.

\- Handle errors clearly and consistently.

\- Keep frontend and backend responsibilities separate.

\- Write meaningful tests for new functionality.

\- Use Prisma for database operations.



\## 5. Never Rules



1\. Never expose or commit passwords, API keys, JWT secrets, or environment files.

2\. Never install a new dependency without asking for approval.

3\. Never delete or overwrite existing project functionality without approval.

4\. Never modify database migrations or schema without explaining the impact.

5\. Never claim a feature or test is complete without verifying it.



\## 6. AI-Assisted Development Workflow



For every new feature:



1\. Restate the requested feature.

2\. Inspect the relevant existing code.

3\. Propose a short implementation plan.

4\. Wait for approval before making changes.

5\. Implement in small, reviewable steps.

6\. Add or update relevant tests.

7\. Run the appropriate tests and build.

8\. Report changed files, test results, and any remaining issues.



\## 7. Definition of Done



A task is complete when:



\- The requested functionality is implemented.

\- Existing functionality is not unintentionally broken.

\- Input validation and error handling are considered.

\- Relevant tests pass.

\- The application builds successfully.

\- Changes are reviewed before committing.

\- Documentation is updated when necessary.



