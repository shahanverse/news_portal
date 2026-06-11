# PENOFT News Portal - Internship Machine Test

A full-stack News Portal application built with a React (Vite) frontend, Node.js/Express backend, and a local SQLite database.

## Features

- **Public Site**:
  - Homepage featuring a main headline article, trending sidebar, and category-filtered grid feeds.
  - Category pages and full article reading views with view counts.
  - Light/Dark mode toggling.
  - Dynamic article search and mock discussions/comments.

- **Admin Panel (Protected)**:
  - Admin login dashboard with JWT-based authentication.
  - CRUD operations for articles (Create, Read, Edit, Delete).
  - Status management: Draft, In-Review, Published, and Scheduled.
  - Future scheduling: Scheduled articles automatically hide from the public feed until their publication time passes.
  - Image uploading with drag-and-drop/file picking and previewing.
  - Staff settings page (Profile updates & password changes).

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS v4, Lucide React
- **Backend**: Node.js, Express, Multer (file uploads), SQLite3, JWT (`jsonwebtoken`), Bcryptjs
- **Database**: SQLite (local file database, auto-seeds mock data on first boot)

## Setup & Running Locally

### Prerequisites
Make sure you have Node.js (v18+) installed.

### Setup Instructions

1. **Install Dependencies**:
   From the root directory, run the following command to install dependencies for the root, backend, and frontend folders:
   ```bash
   npm run install:all
   ```

2. **Start Development Servers**:
   Run the following command in the root folder to start both the Express API server and the Vite dev server concurrently:
   ```bash
   npm run dev
   ```

3. **Accessing the App**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:5001](http://localhost:5001)

### Demo Credentials
- **Username**: `admin`
- **Password**: `password123`

## Directory Structure

```
news-portal/
├── backend/
│   ├── data/             # Database files
│   ├── uploads/          # Uploaded cover images
│   ├── server.js         # Express routes & image uploads
│   ├── database.js       # SQLite connection & seed scripts
│   └── auth.js           # JWT authentication middleware
├── frontend/
│   ├── src/
│   │   ├── components/   # Shared layout components
│   │   ├── pages/        # Views (Home, Article, Admin, etc.)
│   │   ├── utils/        # API service helpers
│   │   ├── App.jsx       # View routing and state managers
│   │   └── index.css     # Global styles & Tailwind imports
│   └── index.html        # Entry page
└── package.json          # Root concurrently scripts
```

## Deployment Notes

### Backend (e.g. Render / Railway)
- Root Directory: `backend`
- Start Command: `node server.js`
- Environment Variables: `JWT_SECRET` (needed for token generation).

### Frontend (e.g. Vercel / Netlify)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- **Note**: Before building the frontend, change `API_BASE_URL` in `frontend/src/utils/api.js` to point to your live backend domain instead of `localhost`.
# news_portal
