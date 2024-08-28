```markdown
# BookSwap

## Overview
BookSwap is a web application that allows users to exchange books with each other. The application consists of a client-side built with React and a server-side built with Express.js.

## Client Environment Variables
The client-side application uses the following environment variables:

```dotenv
VITE_BACKEND_URL=http://localhost:8000
```

## Server Environment Variables
The server-side application uses the following environment variables:

```dotenv
FRONTEND_URL=http://localhost:5173
PORT=8000
MONGODB_URI=
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=
```

## Client
The client-side application is built using React and Vite.

### Setup
1. Navigate to the `client` directory:
   ```sh
   cd client
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```

## Server
The server-side application is built using Express.js.

### Setup
1. Navigate to the `server` directory:
   ```sh
   cd server
   ```
2. Install the dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm start
   ```

## License
This project is licensed under the MIT License.
```