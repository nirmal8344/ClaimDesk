# ClaimDesk — Insurance Claim Processing Platform

ClaimDesk is an enterprise-grade Insurance Claim Management System designed for end-to-end claim lifecycle management, document verification, assessment workflows, settlement disbursement, and multi-role access control.

---

## 1. System Architecture

- **Frontend:** React 18, TypeScript, Vite, Tailwind/Vanilla CSS, Lucide Icons, Recharts
- **Backend:** Java 17, Spring Boot 4.x, Spring Security (Stateless JWT Authentication), Spring Data JPA / Hibernate, Flyway Database Migrations
- **Database:** PostgreSQL 16 (Relational DB with schema migrations and seed data)
- **Reverse Proxy / Web Server:** Nginx (SPA client-side routing and `/api/` reverse proxy)
- **Containerization:** Multi-stage Dockerfiles and root `docker-compose.yml`

---

## 2. Default Seed Accounts

The database migrations (`V1__init_schema.sql` and `V2__seed_data.sql`) automatically provision the following accounts:

| Role | Email | Password | Name / Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `Admin@123` | Full administrative control, user management, claim assignment, approval decisions, settlements, and report exports |
| **Claim Officer** | `officer@company.com` | `Officer@123` | Inspect assigned claims, conduct damage assessments, recommend approvals |
| **Claim Officer** | `rajesh.k@company.com` | `Officer@123` | Officer account 2 |
| **Claim Officer** | `lavanya@company.com` | `Officer@123` | Officer account 3 |
| **Customer** | `arun.kumar@example.com` | `Customer@123` | Active policy holder, claim submission, document uploads, timeline tracking |
| **Customer** | `priya@gmail.com` | `Customer@123` | Active policy holder account 2 |

---

## 3. Quick Start with Docker Compose (Recommended)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (version 2.0+)

### One-Command Deployment

1. **Clone or navigate to the repository:**
   ```bash
   cd ClaimDesk
   ```

2. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Edit `.env` to specify custom database passwords, ports, or JWT signing keys. If not provided, sensible defaults defined in `docker-compose.yml` are applied.

3. **Build and start all services:**
   ```bash
   docker compose up --build -d
   ```

4. **Verify running containers:**
   ```bash
   docker compose ps
   ```

5. **Access the application:**
   - **Frontend Application:** [http://localhost](http://localhost) (or configured `FRONTEND_PORT`)
   - **Backend API Direct:** [http://localhost:8080/api](http://localhost:8080/api)
   - **PostgreSQL Database:** `localhost:5432`

6. **Stop services:**
   ```bash
   docker compose down
   ```
   *(To also delete persistent volumes: `docker compose down -v`)*

---

## 4. Environment Variables Reference

| Variable | Description | Default in Docker Compose |
| :--- | :--- | :--- |
| `POSTGRES_DB` | PostgreSQL database name | `claimdesk_db` |
| `POSTGRES_USER` | PostgreSQL superuser username | `postgres` |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` |
| `POSTGRES_PORT` | Host port for PostgreSQL | `5432` |
| `BACKEND_PORT` | Host port for Spring Boot API | `8080` |
| `FRONTEND_PORT` | Host port for Nginx Web Server | `80` |
| `SPRING_DATASOURCE_URL` | JDBC Connection String | `jdbc:postgresql://postgres:5432/claimdesk_db` |
| `JWT_SECRET` | 256-bit cryptographic signing secret | `claimdesk_adz4needz_super_secret_jwt_key_2026_claim_processing_platform_secure_token!` |
| `JWT_EXPIRATION` | Token validity in milliseconds | `86400000` (24 hours) |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for cross-origin requests | `http://localhost,http://localhost:80,http://localhost:5173,http://localhost:3000` |
| `FILE_UPLOAD_DIR` | Internal container path for uploads | `/app/uploads` |
| `VITE_API_BASE_URL` | Base API URL for frontend | `/api` |

---

## 5. Local Development (Without Docker)

### Prerequisites
- Java 17+ JDK installed
- Node.js 18+ and npm installed
- PostgreSQL 14+ running locally with database `claimdesk_db`

### Backend Setup
```bash
cd backend

# Run automated tests
./mvnw test

# Start the Spring Boot development server
./mvnw spring-boot:run
```
Backend runs at `http://localhost:8080`.

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run development server with HMR and API proxy
npm run dev
```
Frontend runs at `http://localhost:5173` and automatically proxies `/api` requests to `http://localhost:8080`.

---

## 6. Security & Authorization Architecture

- **Strict Role-Based Access Control (RBAC):**
  - All endpoints enforce `@PreAuthorize` or request matchers by role (`CUSTOMER`, `CLAIM_OFFICER`, `ADMIN`).
  - Customers can only view, track, and upload documents to claims they own.
  - Claim Officers can only access and record assessments for claims assigned to them.
  - Business rules block claim settlement until the claim decision has been approved by an Admin.
- **Document Protection:**
  - Files are stored with UUID identifiers outside the public web root.
  - Path traversal sequences (`../`, `..\`) are strictly rejected.
  - Whitelisted extensions: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.doc`, `.docx`.
  - Max upload size: 20MB per file, 25MB total per request.
- **Information Exposure Hardening:**
  - Internal stack traces and database exception messages are suppressed from API responses (`server.error.include-stacktrace=never`).
  - Standardized JSON responses for all 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, and 500 errors.

---

## 7. Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `Connection refused` to PostgreSQL | Database container is still initializing | Docker Compose healthcheck ensures backend waits for PostgreSQL. If starting manually, verify `pg_isready` returns success. |
| `401 Unauthorized` on API requests | Missing or expired JWT token | Re-login via `/login` to generate a fresh bearer token. Tokens are valid for 24 hours by default. |
| Port conflict on `80` or `8080` | Another process is using port 80 or 8080 | Update `FRONTEND_PORT` or `BACKEND_PORT` in your `.env` file before running `docker compose up`. |
| Upload fails with `413 Request Entity Too Large` | File exceeds maximum size | Ensure uploaded document is under 20MB. Nginx `client_max_body_size` is configured to 25M. |
