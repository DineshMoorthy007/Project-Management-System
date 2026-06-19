# Project Management System (PMS)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-398200?style=flat&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Project Overview
The Project Management System (PMS) is an enterprise-grade web application designed for secure project and task organization. The system is engineered around a secure REST API that enforces strict tenant isolation using JSON Web Tokens (JWT). This architecture ensures that authenticated users can only access and modify their own datasets, preventing privilege escalation. The frontend features a highly responsive dashboard built with React, providing real-time metrics, project lifecycle tracking, and task priority management.

---

## System Architecture
This codebase uses a monorepo structure to organize the frontend and backend applications:
*   **Backend (/backend):** Powered by a Node.js and Express.js application, utilizing the Prisma ORM to communicate with a PostgreSQL database. It manages user registration, session management, secure password hashing, and resource controller policies.
*   **Frontend (/frontend):** Built with React.js using Vite as the bundler. The user interface leverages Tailwind CSS for responsive styling, structured hooks for state management, and Axios for secure API communication.

---

## Technology Stack

### Backend
*   **Runtime Environment:** Node.js
*   **Application Framework:** Express.js
*   **Object-Relational Mapping (ORM):** Prisma ORM
*   **Database Engine:** PostgreSQL
*   **Authentication Security:** JSON Web Tokens (JWT), Bcrypt (10 salt rounds)
*   **Rate Limiting:** Express Rate Limit

### Frontend
*   **Library:** React.js
*   **Bundler:** Vite
*   **Styling Engine:** Tailwind CSS
*   **HTTP Client:** Axios

### Infrastructure & Operations
*   **Containerization:** Docker, Docker Compose
*   **Proxy / Web Server:** Nginx (Alpine)

---

## Getting Started (Local Development)

To run the application locally, you must run separate instances of the frontend and backend servers.

### 1. Backend Setup
Open a terminal instance and navigate to the backend directory:
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```
Note: Ensure that your environment variables, including DATABASE_URL and JWT_SECRET, are correctly configured in a .env file before executing these commands.

### 2. Frontend Setup
Open a second terminal instance and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The application will be accessible in your web browser at the port designated by Vite (typically http://localhost:5173).

---

## Docker Deployment

To build and launch the entire multi-container architecture using Docker Compose, execute the following command from the root directory:

```bash
docker-compose up --build
```

This coordinates three distinct services:
*   **db:** A database container running postgres:alpine with health check validations.
*   **backend:** A Node.js container exposing the REST API on port 5000.
*   **frontend:** An Nginx container serving compiled static frontend files on port 80.

---

## Documentation & Reference

For complete engineering specifications, APIs, and database structure references, consult the following documentation:
*   **API Enpoints & Requests Specs:** See [API_DOCUMENTATION.md](file:///d:/Projects/Project-Management-System/API_DOCUMENTATION.md)
*   **Prisma Database Entity ERD:** See [DATABASE_SCHEMA.md](file:///d:/Projects/Project-Management-System/DATABASE_SCHEMA.md)
