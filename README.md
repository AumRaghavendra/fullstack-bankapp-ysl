# Y$L Bank 🏦

A full-stack banking REST API built with Spring Boot and MySQL, with a clean frontend UI.

## Features
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
| Build Tool | Maven |

## Project Structure
```
src/main/java/com/bank/bankapp/
├── controller/    → REST endpoints
├── service/       → Business logic
├── repository/    → Database access
├── model/         → Entity classes
└── exception/     → Error handling
```

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | /accounts | Create account |
| GET | /accounts | Get all accounts |
| GET | /accounts/{accountNumber} | Get one account |
| PUT | /accounts/{accountNumber}/deposit | Deposit money |
| PUT | /accounts/{accountNumber}/withdraw | Withdraw money |
| POST | /accounts/transfer | Transfer money |
| GET | /accounts/{accountNumber}/transactions | Transaction history |
| DELETE | /accounts/{accountNumber} | Delete account |

## Setup
1. Clone the repo
2. Create MySQL database: `CREATE DATABASE bankdb;`
3. Update `application.properties` with your MySQL password
4. Run `BankappApplication.java`
5. Open `http://localhost:8080`
