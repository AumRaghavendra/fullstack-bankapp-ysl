# Y$L Bank 🏦

A basic full-stack banking REST API built with Spring Boot and MySQL, with a clean frontend UI.

## 🌐 Live Demo
**[https://fullstack-bankapp-ysl-production.up.railway.app](https://fullstack-bankapp-ysl-production.up.railway.app)**

## Features
- JWT Authentication (Register/Login)
- Create and manage bank accounts
- Deposit, withdraw and transfer funds
- Transaction history with timestamps
- Input validation and error handling
- Persistent storage with MySQL

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3.x |
| Database | MySQL 8, Hibernate/JPA |
| Frontend | HTML, CSS, Vanilla JS |
| Security | Spring Security, JWT |
| Build Tool | Maven |
| Deployment | Railway |

## Project Structure
src/main/java/com/bank/bankapp/
├── controller/    → REST endpoints
├── service/       → Business logic
├── repository/    → Database access
├── model/         → Entity classes
├── security/      → JWT Auth
└── exception/     → Error handling

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login & get JWT token |
| POST | /accounts | Create account |
| GET | /accounts | Get all accounts |
| GET | /accounts/{accountNumber} | Get one account |
| PUT | /accounts/{accountNumber}/deposit | Deposit money |
| PUT | /accounts/{accountNumber}/withdraw | Withdraw money |
| POST | /accounts/transfer | Transfer money |
| GET | /accounts/{accountNumber}/transactions | Transaction history |
| DELETE | /accounts/{accountNumber} | Delete account |

