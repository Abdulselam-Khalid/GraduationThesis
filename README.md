# Roomie Task Manager

A task management application built with vanilla JavaScript and Node.js.

## Features

- User authentication (login/register)
- Task management
- User assignment for tasks
- Real-time task updates

## Tech Stack

- Frontend: Vanilla JavaScript, HTML, CSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a .env file with the following variables:

```
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

3. Start the development server:

```bash
npm start
```

4. Open your browser and navigate to:

```
http://localhost:5000
```

## Project Structure

- `/public` - Static frontend files (HTML, CSS, JS)
- `/routes` - API route handlers
- `/controllers` - Business logic
- `/models` - Database models
- `/middleware` - Express middleware
- `/db` - Database connection setup
