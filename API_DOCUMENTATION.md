# Project Management System (PMS) API Documentation

This documentation specifies the API endpoints, request structures, validation rules, and responses for the Project Management System REST API. All endpoints are prefixed with `/api`.

---

## Section 1: Authentication API

### 1.1 Register User
*   **Endpoint:** `POST /api/auth/register`
*   **Authentication Required:** No
*   **Description:** Registers a new user account in the system. The password will be hashed using Bcrypt before insertion.
*   **Request Body (JSON):**
    *   `fullName` (string, required): The full name of the user. Cannot be empty or whitespace only.
    *   `email` (string, required): Unique email address conforming to standard validation patterns.
    *   `password` (string, required): User password. Minimum length is 8 characters.
*   **Expected Responses:**
    *   `201 Created`: Account successfully created.
    *   `400 Bad Request`: Input validation failed (e.g. invalid email format or password too short).
    *   `409 Conflict`: User with the specified email already exists.
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "message": "User registered successfully.",
      "data": {
        "id": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "createdAt": "2026-06-19T21:40:00.000Z"
      }
    }
    ```

### 1.2 User Login
*   **Endpoint:** `POST /api/auth/login`
*   **Authentication Required:** No
*   **Description:** Authenticates user credentials. Returns a signed JSON Web Token (JWT) that expires in 24 hours. Login attempts are rate-limited to 5 requests per 15 minutes per IP.
*   **Request Body (JSON):**
    *   `email` (string, required): Registered user email address.
    *   `password` (string, required): User password.
*   **Expected Responses:**
    *   `200 OK`: Successful authentication.
    *   `400 Bad Request`: Missing credentials.
    *   `401 Unauthorized`: Invalid email or password credentials.
    *   `429 Too Many Requests`: Exceeded 5 login attempts inside the 15-minute window.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login successful.",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "user": {
          "id": "a90918c5-28db-4e1b-b23c-d38466e138a0",
          "fullName": "John Doe",
          "email": "john.doe@example.com"
        }
      }
    }
    ```

### 1.3 User Logout
*   **Endpoint:** `POST /api/auth/logout`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Invalidates the current session.
*   **Request Body:** None
*   **Expected Responses:**
    *   `200 OK`: Logout validation successful.
    *   `401 Unauthorized`: Missing or malformed authorization token.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Logout successful."
    }
    ```

---

## Section 2: Projects API

All project endpoints are protected and strictly isolated to the authenticated user.

### 2.1 Get All Projects
*   **Endpoint:** `GET /api/projects`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Lists all projects owned by the authenticated user.
*   **Query Parameters (Optional):**
    *   `search` (string): Case-insensitive partial-match search on the project name.
    *   `status` (string): Filter by project status (`Not_Started`, `In_Progress`, `Completed`).
*   **Expected Responses:**
    *   `200 OK`: Success. Returns a list of projects.
    *   `401 Unauthorized`: Invalid or missing token.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
          "name": "Alpha Redesign",
          "description": "Enterprise website migrations",
          "status": "In_Progress",
          "startDate": "2026-06-19T00:00:00.000Z",
          "endDate": null,
          "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
          "createdAt": "2026-06-19T21:45:00.000Z",
          "updatedAt": "2026-06-19T21:45:00.000Z"
        }
      ]
    }
    ```

### 2.2 Get Project by ID
*   **Endpoint:** `GET /api/projects/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Fetches details of a specific project. If the project belongs to another user, access is rejected.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the project ID.
*   **Expected Responses:**
    *   `200 OK`: Success.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or project does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "name": "Alpha Redesign",
        "description": "Enterprise website migrations",
        "status": "In_Progress",
        "startDate": "2026-06-19T00:00:00.000Z",
        "endDate": null,
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:45:00.000Z",
        "updatedAt": "2026-06-19T21:45:00.000Z"
      }
    }
    ```

### 2.3 Create Project
*   **Endpoint:** `POST /api/projects`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Creates a new project owned by the authenticated user.
*   **Request Body (JSON):**
    *   `name` (string, required): Project name. Cannot be empty.
    *   `description` (string, optional): Detailed text.
    *   `status` (enum, optional): Lifecycle stage (`Not_Started`, `In_Progress`, `Completed`). Defaults to `Not_Started`.
    *   `startDate` (string, optional): ISO-8601 Date format.
    *   `endDate` (string, optional): ISO-8601 Date format.
*   **Expected Responses:**
    *   `201 Created`: Project created.
    *   `400 Bad Request`: Input validation failed.
    *   `401 Unauthorized`: Invalid token.
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "message": "Project created successfully.",
      "data": {
        "id": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "name": "Alpha Redesign",
        "description": "Enterprise website migrations",
        "status": "Not_Started",
        "startDate": null,
        "endDate": null,
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:45:00.000Z",
        "updatedAt": "2026-06-19T21:45:00.000Z"
      }
    }
    ```

### 2.4 Update Project
*   **Endpoint:** `PUT /api/projects/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Updates an existing project. Rejects modification if the project does not belong to the user.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the project ID.
*   **Request Body (JSON):**
    *   `name` (string, optional): Updated project name.
    *   `description` (string, optional): Updated description.
    *   `status` (enum, optional): Updated status (`Not_Started`, `In_Progress`, `Completed`).
    *   `startDate` (string, optional): ISO-8601 Date format.
    *   `endDate` (string, optional): ISO-8601 Date format.
*   **Expected Responses:**
    *   `200 OK`: Project updated.
    *   `400 Bad Request`: Validation failure.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or project does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Project updated successfully.",
      "data": {
        "id": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "name": "Alpha Redesign Phase 2",
        "description": "Enterprise website migrations phase 2",
        "status": "In_Progress",
        "startDate": "2026-06-19T00:00:00.000Z",
        "endDate": null,
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:45:00.000Z",
        "updatedAt": "2026-06-19T22:00:00.000Z"
      }
    }
    ```

### 2.5 Delete Project
*   **Endpoint:** `DELETE /api/projects/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Deletes a project along with all associated tasks (cascading). Rejects modification if the project does not belong to the user.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the project ID.
*   **Expected Responses:**
    *   `200 OK`: Project and tasks deleted.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or project does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Project and all associated tasks successfully deleted."
    }
    ```

---

## Section 3: Tasks API

All task endpoints are protected and tenant-isolated. Task querying and modifications verify that the parent project belongs to the user.

### 3.1 Get All Tasks
*   **Endpoint:** `GET /api/tasks`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Lists tasks. Automatically scopes to projects owned by the user.
*   **Query Parameters (Optional):**
    *   `projectId` (string): Filter tasks belonging strictly to a specific project.
    *   `search` (string): Case-insensitive partial-match search on task name.
    *   `status` (string): Filter by task status (`Pending`, `In_Progress`, `Completed`).
    *   `priority` (string): Filter by task priority (`Low`, `Medium`, `High`).
*   **Expected Responses:**
    *   `200 OK`: Success.
    *   `401 Unauthorized`: Invalid token.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "e4587a8b-1b6c-482a-a92c-0e319532851a",
          "name": "Design DB Schema",
          "description": "Draft relational postgres layout",
          "priority": "Medium",
          "status": "Completed",
          "dueDate": "2026-06-30T00:00:00.000Z",
          "projectId": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
          "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
          "createdAt": "2026-06-19T21:50:00.000Z",
          "updatedAt": "2026-06-19T22:10:00.000Z"
        }
      ]
    }
    ```

### 3.2 Get Task by ID
*   **Endpoint:** `GET /api/tasks/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Fetches details of a specific task. If the containing project belongs to another user, access is forbidden.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the task ID.
*   **Expected Responses:**
    *   `200 OK`: Success.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or task does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "e4587a8b-1b6c-482a-a92c-0e319532851a",
        "name": "Design DB Schema",
        "description": "Draft relational postgres layout",
        "priority": "Medium",
        "status": "Completed",
        "dueDate": "2026-06-30T00:00:00.000Z",
        "projectId": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:50:00.000Z",
        "updatedAt": "2026-06-19T22:10:00.000Z"
      }
    }
    ```

### 3.3 Create Task
*   **Endpoint:** `POST /api/tasks`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Creates a task in a project. Verifies project ownership before creation.
*   **Request Body (JSON):**
    *   `projectId` (string, required): UUIDv4 of the parent project owned by the user.
    *   `name` (string, required): Task name. Cannot be empty.
    *   `description` (string, optional): Detailed text.
    *   `priority` (enum, optional): Criticality level (`Low`, `Medium`, `High`). Defaults to `Medium`.
    *   `status` (enum, optional): Progress state (`Pending`, `In_Progress`, `Completed`). Defaults to `Pending`.
    *   `dueDate` (string, optional): ISO-8601 Date format.
*   **Expected Responses:**
    *   `201 Created`: Task created successfully.
    *   `400 Bad Request`: Input validation failed or project does not exist.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden`: User does not own the project.
*   **Success Response Example (201 Created):**
    ```json
    {
      "success": true,
      "message": "Task created successfully.",
      "data": {
        "id": "e4587a8b-1b6c-482a-a92c-0e319532851a",
        "name": "Design DB Schema",
        "description": "Draft relational postgres layout",
        "priority": "Medium",
        "status": "Pending",
        "dueDate": "2026-06-30T00:00:00.000Z",
        "projectId": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:50:00.000Z",
        "updatedAt": "2026-06-19T21:50:00.000Z"
      }
    }
    ```

### 3.4 Update Task
*   **Endpoint:** `PUT /api/tasks/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Edits details or progress status of a task.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the task ID.
*   **Request Body (JSON):**
    *   `name` (string, optional): Updated task name.
    *   `description` (string, optional): Updated description.
    *   `priority` (enum, optional): Updated priority (`Low`, `Medium`, `High`).
    *   `status` (enum, optional): Updated status (`Pending`, `In_Progress`, `Completed`).
    *   `dueDate` (string, optional): ISO-8601 Date format.
*   **Expected Responses:**
    *   `200 OK`: Task updated.
    *   `400 Bad Request`: Validation failure.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or task does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Task updated successfully.",
      "data": {
        "id": "e4587a8b-1b6c-482a-a92c-0e319532851a",
        "name": "Design DB Schema (Revised)",
        "description": "Draft database scheme revisions",
        "priority": "High",
        "status": "In_Progress",
        "dueDate": "2026-06-25T00:00:00.000Z",
        "projectId": "d09b30c1-db12-421d-91b5-824f8d9b1cd4",
        "userId": "a90918c5-28db-4e1b-b23c-d38466e138a0",
        "createdAt": "2026-06-19T21:50:00.000Z",
        "updatedAt": "2026-06-19T22:20:00.000Z"
      }
    }
    ```

### 3.5 Delete Task
*   **Endpoint:** `DELETE /api/tasks/:id`
*   **Authentication Required:** Yes (Bearer Token)
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Description:** Deletes a task. Verifies ownership of containing project first.
*   **URL Path Parameters:**
    *   `id` (string, required): UUIDv4 representing the task ID.
*   **Expected Responses:**
    *   `200 OK`: Task deleted successfully.
    *   `401 Unauthorized`: Invalid token.
    *   `403 Forbidden` / `404 Not Found`: Unauthorized access or task does not exist.
*   **Success Response Example (200 OK):**
    ```json
    {
      "success": true,
      "message": "Task successfully deleted."
    }
    ```
