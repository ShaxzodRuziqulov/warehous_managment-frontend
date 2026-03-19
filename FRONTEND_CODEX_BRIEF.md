# Warehouse Management Frontend Brief

This document is for Codex to build the frontend for the existing backend in this repository.

## Goal

Build an admin frontend for the warehouse management system.

The frontend should:

- use the existing Spring Boot backend as-is
- implement authentication with JWT
- provide CRUD screens for the main entities
- include table views, create/edit forms, filters, paging, and detail views where useful
- be practical and clean, not overdesigned

## Backend Base

- Backend base URL: `http://localhost:8080`
- Main API prefix: `/api/admin`
- Auth prefix: `/auth`
- Database is PostgreSQL on the backend side

## Auth Flow

### Login

`POST /auth/login`

Request:

```json
{
  "username": "string",
  "password": "string"
}
```

Response:

```json
{
  "token": "jwt",
  "expiresIn": 86400000,
  "userId": 1,
  "roles": ["ROLE_ADMIN"]
}
```

Frontend requirements:

- store JWT token securely on the client side
- send `Authorization: Bearer <token>` on protected requests
- create protected routes
- redirect unauthenticated users to login
- fetch current user from `/auth/me`

### Current User

`GET /auth/me`

Expected response:

```json
{
  "userId": 1,
  "businessId": 1,
  "username": "admin",
  "roles": ["ROLE_ADMIN"]
}
```

## Core Screens

Build these pages first:

1. Login
2. Dashboard
3. Products
4. Categories
5. Stock
6. Orders
7. Incomes
8. Suppliers
9. Customers
10. Warehouses
11. Users

Then add secondary CRUD pages:

- Business
- Creator
- Employee
- Market
- Measure
- Outgoing Product
- Position
- Room
- Tag
- Role list

## Dashboard

Create a usable admin dashboard with:

- active product count from `GET /api/admin/product/count`
- active order count from `GET /api/admin/order/count`
- active income count from `GET /api/admin/income/count`
- product status chart from `GET /api/admin/product/chart`
- latest incomes from `GET /api/admin/income/latest?limit=5` if query param is supported, otherwise call default endpoint
- quick links to Products, Orders, Stock, Incomes

## Main API Endpoints

### Products

Base: `/api/admin/product`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /delete/{id}`
- `GET /count`
- `GET /chart`
- `GET /active`
- `GET /deleted`
- `POST /paging`

### Categories

Base: `/api/admin/category`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /deleted/{id}`
- `POST /paging`

### Stock

Base: `/api/admin/stock`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /deleted/{id}`
- `POST /paging`

### Orders

Base: `/api/admin/order`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `GET /count`
- `GET /allActive`
- `DELETE /delete/{id}`
- `POST /paging`
- `GET /release/{id}`
- `GET /canceled/{id}`
- `GET /complete/{id}`

Note: order state-changing endpoints use `GET`, not `POST`.

### Incomes

Base: `/api/admin/income`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `GET /all-active`
- `DELETE /delete/{id}`
- `GET /count`
- `GET /latest`
- `POST /paging`
- `GET /incomes`

### Suppliers

Base: `/api/admin/supplier`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /delete/{id}`
- `GET /get-status-type?type=ACTIVE`
- `POST /paging`

### Customers

Base: `/api/admin/customer`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /delete/{id}`
- `POST /paging`

### Warehouses

Base: `/api/admin/warehouse`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /delete/{id}`
- `DELETE /deleted/{id}`
- `POST /paging`

### Users

Base: `/api/admin/user`

- `POST /create`
- `PUT /update/{id}`
- `GET /all`
- `GET /{id}`
- `DELETE /delete/{id}`
- `POST /paging`

### Secondary Resources

Use similar CRUD pages for:

- `/api/admin/business`
- `/api/admin/creator`
- `/api/admin/employee`
- `/api/admin/market`
- `/api/admin/measure`
- `/api/admin/outgoingProduct`
- `/api/admin/position`
- `/api/admin/room`
- `/api/admin/tag`
- `/api/admin/role/roles`

## UI Requirements

- sidebar navigation for all admin modules
- top bar with current user and logout
- responsive layout
- reusable data table component
- reusable form component patterns
- loading states
- empty states
- error handling with backend message display
- confirmation before destructive actions

## Recommended Frontend Architecture

Use a modern frontend stack. Good default:

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Axios or Fetch wrapper
- a simple component library if needed

Structure suggestion:

- `src/app`
- `src/pages`
- `src/features`
- `src/components`
- `src/lib/api`
- `src/lib/auth`
- `src/types`

## API Client Rules

- centralize API calls in one layer
- automatically attach JWT token
- handle `401` by redirecting to login
- create typed request and response models
- support filter and paging endpoints with reusable helpers

## Important Backend Notes

- endpoint naming is not fully uniform, so do not try to normalize backend URLs
- some delete endpoints are `/delete/{id}`, some are `/deleted/{id}`
- some list endpoints expose both `/all` and `/find-all`
- some workflow actions are implemented as `GET`
- use backend contracts exactly as provided

## What Codex Should Deliver

Codex should generate:

- project structure
- auth flow
- protected routes
- dashboard
- reusable table and form infrastructure
- CRUD pages for the main modules
- API integration layer
- clear README with run instructions

## Suggested Delivery Order

1. App shell and routing
2. Auth and protected routes
3. API client and token handling
4. Dashboard
5. Products, Categories, Stock
6. Orders and Incomes
7. Suppliers, Customers, Warehouses, Users
8. Secondary resource pages

## Final Instruction For Frontend Codex

Build the frontend against this backend exactly as documented above. Prioritize working integration, predictable admin UX, and maintainable code over visual experimentation.
