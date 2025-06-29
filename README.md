# Notification System

A scalable, and secure notification microservice built with **TypeScript**, **Express.js**, **MongoDB**, **RabbitMQ**, and **WebSocket** technologies. This system supports both email and WebSocket notifications, designed for seamless integration into microservices architectures. It includes rate-limiting, API key authentication, input sanitization, and a comprehensive CI/CD pipeline for automated testing and deployment.

---

## 🚀 Features

- **Multi-Channel Notifications**: Supports sending notifications via email (using **Nodemailer** and **EJS** templates) and WebSocket (using **Socket.IO**).
- **Message Queueing**: Utilizes **RabbitMQ** for reliable, asynchronous message processing with Dead Letter Queue (DLQ) support for handling failed messages.
- **Database Integration**: Stores notification metadata in **MongoDB** with a schema that tracks status (queued, sent, failed, failed_dlq).
- **Security**:
  - **API Key Authentication**: Protects endpoints with secure API key validation.
  - **Input Sanitization**: Uses `mongo-sanitize` and `xss` to prevent injection attacks.
  - **Rate Limiting**: Configurable rate limits for email and WebSocket endpoints to prevent abuse.
  - **CORS Support**: Configurable Cross-Origin Resource Sharing for secure frontend integration.
- **Scalability**: Dockerized setup with **Docker Compose** for easy deployment and orchestration of services (app, MongoDB, RabbitMQ).
- **CI/CD Pipeline**: Automated testing, building, and deployment using **GitHub Actions**, with Docker image pushing to Docker Hub.
- **Testing**: Comprehensive unit and integration tests using **Jest** and **Supertest**.
- **Logging**: Structured logging with request context for debugging and monitoring.
- **Graceful Shutdown**: Handles process termination signals (SIGINT, SIGTERM) to close connections cleanly.
- **Developer Experience**:
  - TypeScript for type safety and maintainability.
  - ESLint and Prettier for code quality and consistent formatting.
  - Hot-reloading with `ts-node-dev` for development.

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB (with Mongoose ORM)
- **Message Queue**: RabbitMQ (with AMQP protocol)
- **WebSocket**: Socket.IO
- **Email**: Nodemailer with EJS templating
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest, Supertest
- **Security**: mongo-sanitize, xss, rate limiting, api key, cors origins
- **Package Manager**: pnpm
- **Other Tools**: ESLint, Prettier, ts-node-dev, tsc-alias

---

## 📦 Setup and Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker** and **Docker Compose**
- **pnpm** (v10.12.1 or higher)
- A valid SMTP server (e.g., Gmail, SendGrid) for email notifications
- MongoDB and RabbitMQ (if not using Docker)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/YousofDev/notification-system.git
   cd notification-system
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   - Copy `.env.example` to `.env` and update with your configuration:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your SMTP, MongoDB, RabbitMQ, and API key settings.

4. **Run with Docker Compose**

   ```bash
   docker compose up -d
   ```

   This starts the application, MongoDB, and RabbitMQ services.

5. **Run Locally (Development)**

   ```bash
   pnpm run dev
   ```

   This starts the server with hot-reloading for development.

6. **Build and Run for Production**
   ```bash
   pnpm run prod
   ```

---

## 🛠 Usage

### API Endpoints

- **POST /api/v1/notifications/email**

  - Sends an email notification.
  - Requires `x-api-key` header.
  - Body: `{ to: string, subject: string, templateName: string, data: object }`
  - Response: `202 { message: "Email notification queued" }`

- **POST /api/v1/notifications/websocket**

  - Sends a WebSocket notification.
  - Requires `x-api-key` header.
  - Body: `{ userId: string, event: string, data: object }`
  - Response: `202 { message: "WebSocket notification queued" }`

- **GET /health**
  - Checks the health of the application and its dependencies.

### WebSocket Usage

- Connect to the WebSocket server at `ws://<host>:3000`.
- Join a room using a `userId` to receive targeted notifications.
- Listen for events emitted with the specified `event` name.

### Example API Request

```bash
curl -X POST http://localhost:3000/api/v1/notifications/email \
  -H "x-api-key: key123secret" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "user@example.com",
    "subject": "Welcome",
    "templateName": "welcome",
    "data": { "name": "John" }
  }'
```

---

## 🧪 Testing

Run tests with:

```bash
pnpm run test
```

- Tests cover API endpoints, notification queueing, and error handling.
- Uses Jest with a custom configuration for TypeScript and module aliases.
- Includes integration tests with a test MongoDB and RabbitMQ instance.

---

## 🐳 Docker Deployment

The application is fully containerized. Use the provided `docker-compose.yml` to run the app, MongoDB, and RabbitMQ:

```bash
docker compose up -d
```

- The app runs on port `3000` (configurable via `.env`).
- MongoDB runs on port `27017`.
- RabbitMQ runs on ports `5672` (AMQP) and `15672` (Management UI).

---

## 🤖 CI/CD Pipeline

The project includes a **GitHub Actions** workflow (`ci-cd.yml`) that:

1. Runs tests on push/pull requests to `main` and `develop` branches.
2. Builds and pushes a Docker image to Docker Hub on `main` branch pushes.
3. Deploys the application using Docker Compose.

To set up:

- Add Docker Hub credentials (`DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`) to GitHub Secrets.
- Add .env variables (e.g., `PORT`, `MONGO_URI`, `RABBITMQ_URI`) to GitHub Secrets.
