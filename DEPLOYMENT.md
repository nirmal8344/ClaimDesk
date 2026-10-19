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
| `PORT` | Spring Boot HTTP listening port | `8080` (Render binds dynamically) |
| `JWT_SECRET` | 256-bit+ HMAC SHA secret key | `claimdesk_adz4needz_super_secret_jwt_key_2026_claim_processing_platform_secure_token!` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins | `https://claim-desk-three.vercel.app,http://localhost:5173,http://localhost:3000` |
| `FILE_UPLOAD_DIR` | Directory path for document and photo uploads | `uploads` |

### Frontend Configuration (`frontend/.env` or Vercel Environment Variables)

| Variable | Description | Production Value (Vercel) |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base endpoint URL of backend API | `https://claimdesk-fz9r.onrender.com/api` |

---

## 3. Render (Backend) & Vercel (Frontend) Production Deployment

### A. Render Backend Setup (Web Service)
1. **Service Type:** Ensure your Render service is configured as a **Web Service** (not a Static Site).
2. **Root Directory:** `backend` (if building native Java) or root `/` (if building via Docker).
3. **Build Command:** `./mvnw clean package -DskipTests`
4. **Start Command:** `java -jar target/claimdesk-0.0.1-SNAPSHOT.jar`
5. **Health Check Path:** `/api/health` (returns HTTP 200 `{"status":"UP"}`)
6. **Required Environment Variables on Render:**
   - `CORS_ALLOWED_ORIGINS`: `https://claim-desk-three.vercel.app`
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<neon-host>/claimdesk_db?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME`: `<neon-user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<neon-password>`
   - `JWT_SECRET`: `<secure-256-bit-key>`

### B. Vercel Frontend Setup
1. **Framework Preset:** Vite
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Environment Variable on Vercel:**
   - `VITE_API_BASE_URL`: `https://claimdesk-fz9r.onrender.com/api`

---

## 4. Security Highlights & Controls

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
