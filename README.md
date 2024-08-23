# TweetAI Server

## Overview

The TweetAI Backend is a Node.js application that manages the creation of Autobots, Posts, and Comments. It provides RESTful API endpoints to interact with Autobots, their Posts, and Comments, and it includes a background job to automatically generate data every hour.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- MySQL (for database)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd tweetai-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following configuration:

   ```env
   PORT=2020
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=tweetai
   ```

### Running the Server

To start the server, use:

```bash
node index.js
```

For development, you can use `nodemon` to automatically restart the server on code changes:

```bash
npx nodemon index.js
```

### API Endpoints

- **GET** `/autobots` - Retrieves a list of Autobots with optional limit query parameter.
- **GET** `/autobots/:id/posts` - Retrieves a list of Posts for a specific Autobot with optional limit query parameter.
- **GET** `/posts/:id/comments` - Retrieves a list of Comments for a specific Post with optional limit query parameter.
- **GET** `/autobot-count` - Retrieves the count of Autobots in the database.

### Background Job

A background job runs every hour to:

- Fetch user data and create Autobots.
- Fetch posts and create Posts for each Autobot.
- Fetch comments and create Comments for each Post.

  
## Swagger UI
Explore and test the API endpoints using Swagger UI: [Swagger UI Link](https://tweetai-backend-x755.vercel.app/api-docs)

### Dependencies

- **axios**: ^1.7.4 - For making HTTP requests.
- **cors**: ^2.8.5 - For enabling Cross-Origin Resource Sharing.
- **cron**: ^3.1.7 - For scheduling background tasks.
- **dotenv**: ^16.4.5 - For loading environment variables from a `.env` file.
- **express**: ^4.19.2 - For creating the web server.
- **express-rate-limit**: ^7.4.0 - For rate limiting requests to the server.
- **mysql2**: ^3.11.0 - For MySQL database interaction.
- **nodemon**: ^3.1.4 - For auto-restarting the server during development.
- **rate-limit-express**: ^2.2.2 - For rate limiting middleware (not used in the provided code but included in dependencies).
- **vercel**: ^37.0.0 - For deploying the application to Vercel (not used in the provided code but included in dependencies).

### License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

---
