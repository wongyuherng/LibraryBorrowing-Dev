# Library Borrowing System

## 1. Project Overview

The Library Borrowing System is a web-based application developed using a microservices architecture. It allows users to access library services such as user management, book browsing, and borrowing orders.

The project was adapted from the CloudEats tutorial into a library borrowing system. The original business functions were changed to match the library domain.

## 2. Technologies Used

- Node.js and Express.js
- React / JavaScript (where applicable)
- MySQL
- MongoDB
- Redis
- Docker and Docker Compose
- Jest for unit testing
- GitHub Actions for Continuous Integration

## 3. System Architecture

The system contains four main application services:

| Service | Responsibility |
|---|---|
| User Service | Handles user registration, login and user information |
| Book Service | Handles book information and book browsing |
| Order Service | Handles borrowing cart and borrowing orders |
| API Gateway | Receives client requests and forwards them to the correct service |

The supporting technologies are:

- MySQL stores user and book information.
- MongoDB stores borrowing order information.
- Redis is used for temporary cart data.
- Docker Compose manages the application services and databases.

## 4. Project Structure

```text
libraryborrowing-app/
├── services/
│   ├── user-service/
│   ├── book-service/
│   ├── order-service/
│   └── api-gateway/
├── backend/
│   └── init.sql
├── docker-compose.yml
├── .env.example
├── .gitignore
└── .github/
    └── workflows/
        └── ci.yml
```

## 5. Environment Configuration

Create a `.env` file in the project root directory using `.env.example` as a reference.

Set your own MySQL root password and MySQL user password in `.env`.

Do not upload the real `.env` file to GitHub because it contains sensitive information.

## 6. How to Run the Project

Open a terminal in the project directory.

Build and start all services:

```bash
sudo docker compose up -d --build
```

Check the running containers:

```bash
sudo docker compose ps
```

Check the API Gateway:

```bash
curl http://localhost:8000/health
```

Check the book service through the API Gateway:

```bash
curl http://localhost:8000/api/books
```

Stop the services:

```bash
sudo docker compose down
```

The named database volumes are retained when using this command.

## 7. Testing

The project uses Jest for unit testing.

Run the tests for each service:

```bash
cd services/user-service
npm test

cd ../book-service
npm test

cd ../order-service
npm test
```

GitHub Actions is also configured to run the service tests automatically when code is pushed to GitHub.

## 8. Project Repository

GitHub: https://github.com/wongyuherng/LibraryBorrowing-Dev

## Deployment Verification

The Library Borrowing System was deployed using Docker Compose.

The deployment was tested using the following commands:

```bash
sudo docker compose up -d
sudo docker compose ps
```

All seven containers started successfully. MySQL, MongoDB and Redis showed healthy status.

The API Gateway was tested using:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/books
```

Both endpoints returned successful responses. The system was also stopped and restarted using Docker Compose. The book records were still available after restarting, confirming that the MySQL data volume was preserved.