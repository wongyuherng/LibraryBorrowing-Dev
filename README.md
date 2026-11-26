# Library Borrowing System

## 1. Project Overview

The Library Borrowing System is a web-based application developed using a microservices architecture. It allows users to register, log in, browse books and manage borrowing-related operations.

This project was adapted from the CloudEats tutorial. The original food ordering system was changed into a library system. The services, API routes and data models were redesigned to match the library domain.

## 2. Technologies Used

- Node.js and Express.js
- MySQL
- MongoDB
- Redis
- Docker and Docker Compose
- Jest for unit testing
- GitHub Actions for CI/CD
- JWT for authentication
- Winston for application logging
- Prometheus for monitoring

## 3. System Architecture

The application contains four main services:

| Service | Responsibility |
|---|---|
| User Service | User registration, login, authentication and user management |
| Book Service | Book information and book browsing |
| Order Service | Borrowing cart and borrowing orders |
| API Gateway | Receives requests and forwards them to the correct service |

Supporting components:

- MySQL stores user and book information.
- MongoDB stores borrowing order information.
- Redis is used for temporary cart data.
- Prometheus collects monitoring metrics from the three microservices.
- Docker Compose manages all containers and their network.

The project runs eight containers: four application services, three database or supporting services (MySQL, MongoDB and Redis), and Prometheus.

## 4. Security, Logging and Monitoring

- JWT is used to authenticate users through login tokens.
- Role-based access control (RBAC) protects the admin user listing endpoint.
- Winston records application startup messages, HTTP requests and errors.
- Prometheus collects HTTP request metrics and Node.js system metrics from all three microservices.

Prometheus dashboard:

`http://localhost:9090`

The three microservices expose their metrics through `/metrics`.

## 5. Project Structure

```text
libraryborrowing-app/
├── services/
│   ├── user-service/
│   ├── book-service/
│   ├── order-service/
│   └── api-gateway/
├── backend/
│   └── init.sql
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── prometheus.yml
├── .env.example
├── .gitignore
├── README.md
└── REFLECTION.md
```

## 6. Environment Configuration

Create a `.env` file in the project root directory using `.env.example` as a reference.

Set your own MySQL passwords and JWT secret in the `.env` file.

Do not upload the real `.env` file to GitHub because it contains sensitive information. The `.env.example` file provides the required variable names without real credentials.

## 7. How to Run the Project

Open a terminal in the project directory.

First, create and configure the environment file:

```bash
cp .env.example .env
nano .env
```

Build and start all services:

```bash
sudo docker compose up -d --build
```

Check the running containers:

```bash
sudo docker compose ps
```

Check the API Gateway health:

```bash
curl http://localhost:8000/health
```

Check the book API:

```bash
curl http://localhost:8000/api/books
```

Open the Prometheus dashboard:

`http://localhost:9090`

Stop the services:

```bash
sudo docker compose down
```

The named database volumes are retained when using this command. Do not use the `-v` option if you want to keep the database data.

## 8. Testing

The project uses Jest for unit testing.

Run the tests from each service directory after installing its dependencies:

```bash
cd services/user-service
npm install
npm test
```

```bash
cd services/book-service
npm install
npm test
```

```bash
cd services/order-service
npm install
npm test
```

GitHub Actions is configured to run the tests automatically. A deployment job also uses a self-hosted runner on the Ubuntu virtual machine to update and verify the application.

## 9. Deployment Verification

The application was deployed on an Ubuntu virtual machine using Docker Compose.

All eight containers were checked using:

```bash
sudo docker compose ps
```

The API Gateway health endpoint and book API were tested successfully.

Prometheus was also checked to confirm that all three microservice targets were reporting as up. The application was stopped and restarted using Docker Compose, and the book records remained available, confirming that the MySQL data volume was preserved.

## 10. Project Repository

GitHub: https://github.com/wongyuherng/LibraryBorrowing-Dev