# Restaurant Ordering Platform
A full-stack restaurant ordering application built with Angular, TypeScript, Node.js, Express, and PostgreSQL.
The project models an online ordering platform for a multi-location restaurant, with a customer-facing ordering experience and a backend architecture designed to support customer, staff, and administrative workflows.

**Status:** Active Development

## Tech Stack
### Frontend
-	Angular
-	TypeScript
-	RxJS
-	SCSS
-	Angular standalone components
-	Lazy-loaded routing

### Backend
-	Node.js
-	Express
-	TypeScript
-	REST APIs
-	Session-based authentication
-	bcrypt password hashing
### Data
-	PostgreSQL
-	SQL migrations
-	PostgreSQL-backed session storage
### Development
-	ESLint
-	Prettier
-	Vitest
-	Git / GitHub
_____________________________________________________________________________________
## Current Functionality
The application currently includes core pieces of the customer ordering flow:
-	Restaurant home and navigation experience
-	Menu browsing
-	Checkout workflow
-	Order creation
-	Order confirmation
-	User authentication
-	Persistent server-side sessions
-	REST API endpoints for menus, orders, authentication, and application health
-	PostgreSQL database migrations and seed tooling

Additional customer, staff, and administrative functionality is planned as development continues.
_____________________________________________________________________________________
## Architecture
The project separates the client, API, and database layers:
```text
Angular Frontend
Menu – Checkout – Orders
        |
        | REST API
        |
        ▼
Node.js / Express API
Routes – Controllers – Services
        |
        |
        |
        ▼
PostgreSQL
Application Data – Sessions
```
The frontend and backend are maintained as separate applications within the same repository:
```
restaurant-app/
|--- frontend/		# Angular application
|---backend/		# Node.js / Express API
|---docs/		# Database and design documentation
```
The backend follows a layered structure separating routing, controllers, services, configuration, database migrations, and application types.

_____________________________________________________________________________________
## Engineering Decisions
### PostgreSQL
I chose PostgreSQL to build the application around a relational data model. Restaurant ordering naturally involves relationships between concepts such as locations, menus, menu items, customers, orders, and order details.
Using PostgreSQL also gave me an opportunity to expand my relational database experience beyond SQL Server while designing the application’s schema and queries directly.
### TypeScript Across the Stack
Both the Angular frontend and the Express backend use TypeScript.
Using a common language across the client and server keeps the development model consistent while still maintaining a clear separation between frontend, API, and persistence responsibilities.
### Layered Backend Architecture
Rather than placing API behavior directly inside route definitions, the backend separates concerns across:
-	Routes
-	Controllers
-	Services
-	Database configuration and migrations
-	Shared types

The goal is to keep HTTP concerns separate from application and data-access logic as the project grows.
### Server-Side Sessions
Authentication uses server-side sessions backed by PostgreSQL. Authentication cookies are configured as HTTP-only, while session state is persisted through the database rather than relying solely on process memory.
Passwords are hashed before storage using bcrypt.
### Modern Angular Architecture
The frontend is built with modern Angular patterns, including standalone components and lazy-loaded routes.
The application also separates reusable services, shared UI, layouts, models, modals, and page-level components to keep responsibilities organized as functionality expands.
_____________________________________________________________________________________
## Application Goals
The broader application design includes three primary areas.
### Customer Experience
-	Browse restaurant menus
-	Customize dishes
-	Place orders
-	Guest checkout
-	Customer accounts
-	Favorite orders
-	Order history
-	Order tracking
### Staff Experience
-	View incoming orders
-	Update order status
-	Manage menu availability
### Administration
-	Manage employees 
-	Manage restaurant locations
-	Manage menus

Not all planned functionality is currently implemented.
_____________________________________________________________________________________
## Local Development
### Prerequisites
Install:
-	Node.js
-	npm
-	PostgreSQL
-	Angular CLI

### 1.	Clone the repository
```bash
git clone https://github.com/jasondavis1025/restaurant-app.git
cd restaurant-app
```
### 2.	Configure the backend
```bash
cd backend
npm install
```
Create your local environment configuration using `backend/.env.example` as a reference.

Create the PostgreSQL database, then run the application’s migrations:
```bash
npm run migrate
```
Optional seed data can be loaded with:
```bash
npm run seed
```
Start the backend development server:
```bash
npm run dev
```
### 3.	Start the frontend
From another terminal:
```bash
cd frontend
npm install
npm start
```
The Angular development server will start locally and communicate with the Express API. 
_____________________________________________________________________________________
## Backend Commands
Run the API in development with file watching.
```bash
npm run dev
```

Compile the TypeScript backend.
```bash
npm run build
```
Run the compiled application.
```bash
npm start
```
Apply database migrations.
```bash
npm run migrate
```
or
```bash
npm run migrate:up
```
Roll back a migration:
```bash
npm run migrate:down
```
Populate development seed data.
```bash
npm run seed
```
Code-quality and formatting utilities.
```bash
npm run lint
npm run format
npm run format:check
```

_____________________________________________________________________________________
## Frontend Commands

Start the Angular development server.
```bash
npm start
```
Create a production build.
```bash
npm run build
```
Run frontend tests.
```bash
npm test
```
Run Angular linting.
```bash
npm run lint
```
_____________________________________________________________________________________
## Roadmap
The project is under active development. Planned work includes:
-	Customer account functionality
-	Saved preferences and favorite orders
-	Order history and tracking
-	Staff order management
-	Menu availability management
-	Multi-location administration
-	Administrative analytics
-	Automated testing
-	Deployment and production configuration
-	Docker-based development and deployment workflow
