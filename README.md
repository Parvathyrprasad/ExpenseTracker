# Expense Tracker Application

A modern, responsive, and secure personal finance & expense tracking application built with a decoupled React frontend, Express/Node.js backend, and PostgreSQL with Prisma ORM.

---

## Tech Stack Overview

- **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS, Lucide Icons, TanStack Query, Zustand, Recharts, Vitest
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, Zod, Bcrypt, JWT, Helmet, CORS, Vitest + Supertest
- **Database:** PostgreSQL (Docker Container `internship-postgres` on port 5432, dedicated database: `expensetracker_db`)
- **Currency Standard:** Indian Rupee (INR - ₹) with Decimal(12,2) precision for financial calculations.

---

## Database Architecture

- **`users`**: Manages credentials (bcrypt hashed with 12 salt rounds), profile details, default currency (`INR`), and timestamps.
- **`categories`**: System-level default categories (18 seeded: 11 Expense, 7 Income) and user-defined custom categories with custom icons and colors.
- **`transactions`**: Income and Expense records linked strictly to the user and category, storing `title`, `Decimal(12,2)` amounts, payment methods (`UPI`, `CASH`, `CARD`, `BANK_TRANSFER`, `OTHER`), and notes.
- **`budgets`**: User-scoped monthly budgets per category with alert threshold indicators (e.g. 80%) and compound uniqueness per user, category, month, and year.

---

## Implemented Milestones

- [x] **Milestone 1:** Project Foundation, Docker PostgreSQL Setup, Prisma Migrations, and Category Seeder.
- [x] **Milestone 2:** User Authentication, Bcrypt Password Hashing, JWT Middleware, Protected Routes, Profile Management.
- [x] **Milestone 3:** Categories & Transaction Core CRUD with strict Decimal(12,2) precision, user data isolation, and responsive UI.
- [ ] **Milestone 4:** Dashboard Metrics, Budgeting & Over-Budget Alerts, and Recharts Analytics.

---

## Running Locally

### 1. Database (Docker)
Ensure Docker Desktop is running. The PostgreSQL container `internship-postgres` is exposed on `localhost:5432` with database `expensetracker_db`.

### 2. Backend
```bash
npm run dev:server
```
Runs at `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### 3. Frontend
```bash
npm run dev:client
```
Runs at `http://localhost:5173`.

### 4. Tests
```bash
npm run test:server   # 30 tests passing (Health, Auth, Categories, Transactions)
npm run test:client   # 9 tests passing (App, Auth, Categories, Transactions)
```
