# ClaimDesk Production Deployment & Architecture Guide

ClaimDesk is an enterprise Insurance Claim Management System built with a Spring Boot (Java 17) backend, PostgreSQL relational database, and a React 18 / TypeScript frontend powered by Vite.

---

## 1. Architecture Overview

- **Backend:** Spring Boot 3.3.4, Spring Security 6 (Stateless JWT), Spring Data JPA / Hibernate, Flyway Migrations
- **Frontend:** React 18, TypeScript, Vite, React Router v6, Lucide Icons, Recharts
- **Database:** PostgreSQL 14+
- **File Storage:** Local disk / mounted volume with role-based access control validation

---

## 2. Environment Variables

### Backend Configuration (`backend/.env` or system environment)

| Variable | Description | Default (Local Fallback) |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC URL for PostgreSQL database | `jdbc:postgresql://localhost:5432/claimdesk_db` |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL database password | `8344` |
| `PORT` | Spring Boot HTTP listening port | `8080` |
| `JWT_SECRET` | 256-bit+ HMAC SHA secret key | `9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `http://localhost:5173,http://localhost:3000` |
| `UPLOAD_DIR` | Directory path for document and photo uploads | `./uploads` |

### Frontend Configuration (`frontend/.env`)

| Variable | Description | Default (Local Fallback) |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint URL of backend API | `http://localhost:8080/api` |

---

## 3. Security Highlights & Controls

1. **Role-Based Document Ownership:**
   - Document viewing, downloading, and deletion enforce strict role-based access.
   - Customers can only access documents belonging to their own claims.
   - Claim Officers can only access documents for claims assigned to them.
   - System Admins retain audit and supervisory access.
   - Authenticated token validation via headers or secure query tokens for media previews.

2. **CORS Hardening:**
   - Wildcards removed; origins strictly validated against configured `CORS_ALLOWED_ORIGINS`.

3. **Database Migration:**
   - Flyway scripts in `backend/src/main/resources/db/migration/` automatically create tables (`V1__init_schema.sql`) and seed default admin/officer accounts (`V2__seed_data.sql`).

4. **Error Exposure Protection:**
   - `server.error.include-stacktrace=never` and `server.error.include-exception=false` prevent leak of internal stack traces.

---

## 4. Build & Run Instructions

### Prerequisites
- Java 17+ JDK installed
- Node.js 18+ and npm installed
- PostgreSQL 14+ running with database `claimdesk_db`

### Backend Build & Run
```bash
cd backend

# Compile and package JAR
./mvnw clean package -DskipTests

# Run JAR with custom environment variables
java -jar target/claimdesk-0.0.1-SNAPSHOT.jar
```

### Frontend Build & Run
```bash
cd frontend

# Install dependencies
npm install

# Build production bundle (outputs to frontend/dist)
npm run build

# Preview production build locally
npm run preview
```

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
./mvnw spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## 5. Seed Credentials (Default)

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin@123` | Admin Kumar |
| **Claim Officer** | `officer@company.com` | `Officer@123` | Officer Rajesh |
| **Claim Officer** | `rajesh.k@company.com` | `Officer@123` | Rajesh Kumar |
| **Claim Officer** | `lavanya@company.com` | `Officer@123` | Lavanya T |
| **Customer** | `arun.kumar@example.com` | `Customer@123` | Arun Kumar |
| **Customer** | `priya@gmail.com` | `Customer@123` | Priya S |
