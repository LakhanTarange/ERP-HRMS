# ERP-HRMS

A web-based **Human Resource Management System (HRMS)** for managing employees, attendance, payroll, leaves, recruitment, and performance — all in one place.

---

## 🚀 Tech Stack

### Backend
- **Java** — programming language
- **Spring Boot 3.5.5** — backend framework
- **Spring Security + JWT** — authentication & authorization
- **Spring Data JPA + Hibernate** — database ORM
- **MySQL** — database
- **Maven** — build tool

### Frontend
- **React** (Vite) — UI library
- **JavaScript (JSX)** — application logic
- **React Router** — client-side routing
- **CSS** — styling

### Dev Environment
- **GitHub Codespaces** — cloud-based development environment

---

## 📦 Modules

| Module | Description |
|---|---|
| Employees | Core employee records |
| Departments | Company departments |
| Designations | Job titles/levels |
| Attendance | Daily attendance tracking |
| Leaves | Leave applications & approvals |
| Payroll | Salary processing |
| Expenses | Expense claims & approvals |
| Candidates | Recruitment pipeline |
| Interviews | Interview scheduling |
| Job Positions | Open positions |
| Performance Reviews | Employee performance tracking |
| Employee Documents | Document storage per employee |

---

## 🔐 How It Works

1. **Register/Login** — User signs up or logs in. On success, backend returns a **JWT token**.
2. **Token storage** — Frontend stores the token and attaches it (`Authorization: Bearer <token>`) to every API request.
3. **Dashboard** — After login, the sidebar lists all HR modules.
4. **Data view** — Clicking a module fetches its data from MySQL via a REST API and displays it in a table.
5. **Security** — A custom `JwtAuthenticationFilter` validates the token on every request; unauthenticated requests are rejected (`403`).

---

## 🛠️ Project Structure

```
ERP-HRMS/
├── backend/
│   ├── src/main/java/com.erp.hrms/
│   │   ├── controller/     # REST API endpoints
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Database access (Spring Data JPA)
│   │   ├── entity/         # Database models
│   │   ├── security/       # JWT filter, SecurityConfig
│   │   ├── employee/       # Employee module
│   │   └── dto/            # Request/response objects
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
│
└── frontend/
    ├── src/
    │   ├── components/     # Sidebar, Layout
    │   ├── pages/          # Login, Register, Dashboard, ModuleView
    │   ├── services/       # api.js, authService.js
    │   ├── App.jsx
    │   └── index.css
    └── package.json
```

---

## ▶️ Running the Project

### Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`

> **Note:** If running in GitHub Codespaces, make sure port `8080` is set to **Public** visibility, and update `BASE_URL` in `frontend/src/services/api.js` to your Codespaces backend URL.

---

## ✅ Completed

- [x] Secure login/registration with JWT
- [x] 12 HR modules on backend
- [x] JWT-protected API routes
- [x] Dashboard with sidebar navigation
- [x] Data tables with delete functionality

## 🔜 To Do

- [ ] Add/Create forms per module
- [ ] Edit existing records
- [ ] Link related data (e.g. employee ↔ attendance ↔ payroll)
- [ ] Role-based views (Admin vs Employee)
