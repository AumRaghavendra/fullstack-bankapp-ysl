# Y$L Bank 🏦

A full-stack banking application built with Spring Boot, PostgreSQL, and Vanilla JS — featuring JWT authentication, role-based access control, and a responsive dark-themed UI.

## Live Demo
**[https://fullstack-bankapp-ysl.onrender.com](https://fullstack-bankapp-ysl.onrender.com)**

> The app is hosted on Render's free tier — it may take 30–60 seconds to wake up on first load.

---

## Features

### Banking
- Create bank accounts with holder name, account number, and opening balance
- Deposit and withdraw funds with balance validation
- Transfer money between accounts
- Full transaction history with timestamps and running balance

### Security
- JWT authentication — token embedded with role claim, no extra DB calls per request
- Password validation — must contain uppercase, number, and special character
- Every API endpoint protected — returns 401/403 without a valid token
- Role-based access control — USER and ADMIN roles with separate experiences

### Admin Panel
- Separate admin dashboard — completely different UI from regular users
- Stats overview — total users, total accounts, total money in the system
- Full accounts table with owner visibility and delete capability
- All registered users list
- Admin account auto-seeded on first startup

### Frontend
- Dark themed single page application
- Separate USER and ADMIN experiences after login — same login form, different rooms
- Welcome back greeting with logged-in username
- Password reveal toggle on login and register
- Mobile responsive layout
- No frameworks — pure HTML, CSS, Vanilla JS

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 21 |
| Framework | Spring Boot 3.x |
| Database | PostgreSQL (Render) / MySQL (local) |
| ORM | Hibernate / JPA |
| Security | Spring Security + JWT (jjwt 0.11.5) |
| Build Tool | Maven |
| Frontend | HTML, CSS, Vanilla JS |
| Deployment | Render (Docker) |

---

## Project Structure

```
com.bank.bankapp/
├── config/
│     └── DataSeeder.java              → Seeds admin account on startup
├── controller/
│     ├── AuthController.java          → Register / Login endpoints
│     └── BankAccountController.java   → All banking endpoints
├── service/
│     └── BankAccountService.java      → Business logic + ownership checks
├── repository/
│     ├── BankAccountRepository.java
│     ├── TransactionRepository.java
│     └── UserRepository.java
├── model/
│     ├── BankAccount.java
│     ├── Transaction.java
│     └── User.java                    → Includes role field (USER / ADMIN)
├── security/
│     ├── SecurityConfig.java
│     ├── JwtUtil.java                 → Generates + parses tokens with role claim
│     ├── JwtFilter.java               → Reads role from token on every request
│     └── CustomUserDetailsService.java
└── exception/
      └── GlobalExceptionHandler.java  → Centralised error handling
```

---

## API Endpoints

All endpoints except `/auth/**` require a valid `Authorization: Bearer <token>` header.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user |
| POST | `/auth/login` | Public | Login — returns JWT token + role |
| POST | `/accounts` | User | Create a bank account |
| GET | `/accounts` | User / Admin | Get accounts (user: own only, admin: all) |
| GET | `/accounts/{accountNumber}` | User / Admin | Get one account |
| PUT | `/accounts/{accountNumber}/deposit` | User / Admin | Deposit money |
| PUT | `/accounts/{accountNumber}/withdraw` | User / Admin | Withdraw money |
| POST | `/accounts/transfer` | User / Admin | Transfer between accounts |
| GET | `/accounts/{accountNumber}/transactions` | User / Admin | Transaction history |
| DELETE | `/accounts/{accountNumber}` | User / Admin | Delete account |
| GET | `/accounts/admin/users` | Admin only | List all registered users |

---

## Role-Based Access

| Action | USER | ADMIN |
|---|---|---|
| See own accounts | ✅ | ✅ |
| See all accounts | ❌ | ✅ |
| Operate on own accounts | ✅ | ✅ |
| Operate on any account | ❌ | ✅ |
| View all users | ❌ | ✅ |
| Delete any account | ❌ | ✅ |

---

## Running Locally

### Prerequisites
- Java 21
- Maven
- MySQL running locally

### Setup

1. Clone the repo
```bash
git clone https://github.com/AumRaghavendra/fullstack-bankapp-ysl.git
cd fullstack-bankapp-ysl
```

2. Update `src/main/resources/application.properties` with your local MySQL credentials:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bankapp
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

3. Run the app
```bash
./mvnw spring-boot:run
```

4. Open `http://localhost:8080` in your browser

On first startup, an admin account is automatically created:
- **Username:** `admin`
- **Password:** `Admin@123`

---

## Deployment (Docker + Render)

The app is containerised using a multi-stage Dockerfile:

```dockerfile
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/bankapp-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Environment variables set on Render:
```
SPRING_DATASOURCE_URL
SPRING_DATASOURCE_USERNAME
SPRING_DATASOURCE_PASSWORD
SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT
```

---

## Resume Description

**Y$L Bank — Full Stack Banking Application**
- Built REST API with Spring Boot 3, Java 21, deployed via Docker on Render
- JWT authentication with role claim embedded in token — no per-request DB lookups for auth
- Role-based access control — separate ADMIN and USER experiences, enforced at service layer
- Admin panel with system-wide stats, full accounts table, and user management
- CRUD operations with PostgreSQL and Hibernate/JPA
- Layered architecture — Controller → Service → Repository
- Input validation, global exception handling, and proper HTTP status codes
- Responsive frontend with HTML/CSS/Vanilla JS consuming REST APIs
- Version controlled with Git/GitHub
