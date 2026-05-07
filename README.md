# RecouvraClient — Angular Frontend Walkthrough

## What Was Built

A complete Angular frontend application for the **Recouvra+** debt recovery management system, connected to the existing Express.js/MongoDB backend API.

### Project Structure

```
recouvraClient1/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/         → auth, guest, admin guards
│   │   │   ├── interceptors/   → JWT Bearer token interceptor
│   │   │   ├── models/         → TypeScript interfaces (User, Client, Invoice, Payment, RecoveryAction)
│   │   │   └── services/       → Auth, Client, Invoice, Payment, RecoveryAction, Statistics, User services
│   │   ├── layout/             → LayoutComponent (sidebar + navbar + router-outlet)
│   │   ├── pages/
│   │   │   ├── login/          → Login page
│   │   │   ├── register/       → Registration page
│   │   │   ├── dashboard/      → Statistics dashboard
│   │   │   ├── clients/        → CRUD with search & modal
│   │   │   ├── invoices/       → CRUD with line items, pagination, status filter
│   │   │   ├── payments/       → CRUD with method filter, pagination
│   │   │   ├── recovery-actions/ → CRUD with type/status filters, pagination
│   │   │   └── users/          → Admin-only user list
│   │   └── shared/components/  → Sidebar, Navbar
│   ├── environments/           → Dev & prod API URL configs
│   └── styles.scss             → Global premium dark theme
```

### Key Features

| Feature | Details |
|---------|---------|
| **Auth** | JWT login/register, auto-token via interceptor, role-based guards |
| **Dashboard** | Stats cards, status breakdown, recent payments, upcoming actions |
| **Clients** | Full CRUD, search filter, create/edit modal |
| **Invoices** | CRUD with line items, pagination, status filter |
| **Payments** | Create linked to invoices, method filter, pagination |
| **Recovery Actions** | CRUD with type/status filters, pagination |
| **Users** | Admin-only list with delete |
| **Design** | Dark theme, glassmorphism, indigo/violet gradients, Inter font |

### Backend Changes

- Added `cors()` middleware to [app.js](file:///c:/Users/CALLMEFAD/Desktop/re/RecouvraApi%20v1%20%20mongo%20compass/app.js) to allow frontend requests

## Verification

- **`ng build`**: ✅ Compiled successfully (exit code 0)
- **Dev server**: Running at `http://localhost:4200`
- **Browser test**: Not available (Chrome not installed in environment)

## How to Run

```bash
# Terminal 1 — Start backend (requires MongoDB running)
cd "RecouvraApi v1  mongo compass"
npm start

# Terminal 2 — Start frontend
cd recouvraClient1
npx ng serve
# Open http://localhost:4200
```
