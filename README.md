# Foodlink

Foodlink is a web application that helps connect food providers (like restaurants and bakeries) with NGOs and individuals to reduce food waste. Providers can list surplus food, and others can claim it.

## Prerequisites

Before you begin, ensure you have met the following requirements:
* You have installed **Docker** and **Docker Compose**.
* You have **Node.js** (v20+) installed if you plan on running the application outside of Docker for development.

## Getting Started with Docker

The easiest way to get the application running is using Docker Compose, which spins up both the Node.js application and the PostgreSQL database.

1. **Start the containers**
   ```bash
   docker compose up --build -d
   ```
   This command builds the application image and starts the PostgreSQL database.

2. **Access the application**
   Open your browser and navigate to:
   ```
   http://localhost:5001
   ```
   > **Note:** The application runs on port `5001` on the host machine to avoid conflicts with macOS ControlCenter (which often reserves port 5000).

3. **Initialize the database**
   Once the containers are running, you need to push the database schema to the PostgreSQL container:
   ```bash
   DATABASE_URL=postgres://foodlink:foodlink_password@127.0.0.1:5432/foodlink npm run db:push
   ```

4. **Seed the database (Optional)**
   If you want to populate the database with some initial sample data (Users and Food Listings), run the seed script:
   ```bash
   DATABASE_URL=postgres://foodlink:foodlink_password@127.0.0.1:5432/foodlink npx tsx script/seed.ts
   ```

## Local Development (Without Docker)

If you prefer to run the Node.js application locally while only using Docker for the database:

1. **Start only the database**
   ```bash
   docker compose up db -d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set your environment variables**
   Create a `.env` file in the root directory (if not already present) and add the database URL:
   ```env
   DATABASE_URL=postgres://foodlink:foodlink_password@127.0.0.1:5432/foodlink
   ```

4. **Push the schema and seed data**
   ```bash
   npm run db:push
   npx tsx script/seed.ts
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will now be accessible at `http://localhost:5000`.

## Stopping the Application

To stop the running Docker containers, use:
```bash
docker compose down
```

This will stop and remove the containers and networks, but the database data will persist in the `postgres_data` Docker volume.
