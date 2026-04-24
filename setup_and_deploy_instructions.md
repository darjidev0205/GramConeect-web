# GramConnect - Setup & Deployment Guide

## 1. Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas GUI)

### Backend (Server)
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Ensure the `.env` file exists with the following values:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gramconnect
   JWT_SECRET=supersecret12345
   ```
   *(Update MONGODB_URI if you are using MongoDB Atlas)*
4. Start the backend server:
   ```bash
   npm run dev
   # OR
   node index.js
   ```
   The API will run on `http://localhost:5000`.

### Frontend (Client)
1. Open a new terminal and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app:
   Open your browser and navigate to `http://localhost:5173`.


---

## 2. Deployment Guide

### A. Deploying the Backend (Render or Railway)
1. Push your code to a GitHub repository.
2. Sign in to [Render](https://render.com/) or [Railway](https://railway.app/).
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. Set the Root Directory to `server`.
6. Set the Build Command to `npm install`.
7. Set the Start Command to `node index.js`.
8. Add your Environment Variables (`MONGODB_URI`, `JWT_SECRET`, etc.).
9. Deploy!

### B. Deploying the MongoDB Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** and create a new user and password.
3. Go to **Network Access** and whitelist `0.0.0.0/0` (Allow access from anywhere).
4. Get your connection string (URI) and update the `MONGODB_URI` environment variable in your deployed backend.

### C. Deploying the Frontend (Vercel or Netlify)
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the Framework Preset to **Vite**.
5. Set the Root Directory to `client`.
6. Ensure the Build Command is `npm run build` and Output Directory is `dist`.
7. Add any required environment variables (e.g., `VITE_API_URL` pointing to your deployed Render backend).
8. Deploy! Your app will be live within seconds.
