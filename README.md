# SecureVault

SecureVault is an AES-256-GCM file encryption and decryption web app built with React, Node.js/Express, and Firebase Firestore. Users can encrypt files, save encrypted payloads to their vault, decrypt them with their key, and review activity history. Administrators can manage accounts and encrypted files.

## Features

- AES-256-GCM file encryption and decryption
- Authenticated user accounts with administrator and regular-user roles
- Encrypted file storage and per-user vaults
- Activity history, including failed decryption attempts
- Admin tools for user status, account, and encrypted-file management
- Firestore-backed user, file, and history metadata, with a local JSON fallback for development

## Tech stack

- **Frontend:** React, Vite, React Router, Axios, and Lucide icons
- **Backend:** Node.js and Express
- **Database:** Firebase Firestore through the Firebase Admin SDK
- **Local fallback:** `backend/localdb.json` when Firebase credentials are not configured
- **File storage:** `backend/encrypted/` for encrypted payloads and `backend/uploads/` for temporary uploads

## Project structure

```text
SecureVault/
├── backend/
│   ├── controllers/       # Authentication, file, and admin handlers
│   ├── middleware/        # Authentication and upload middleware
│   ├── models/            # User, file, and history data access
│   ├── routes/            # Express API routes
│   ├── services/          # AES encryption and Firebase services
│   ├── .env.example       # Safe backend configuration template
│   └── server.js          # API entry point
└── frontend/
    ├── public/            # Static assets, including auth-bg.jpg
    └── src/
        ├── components/    # Shared interface components
        ├── pages/         # Auth, vault, and admin screens
        └── services/      # API client
```

## Local setup

Use Node.js and npm. In a fresh checkout, create the backend environment file from the safe template:

```powershell
Copy-Item backend\.env.example backend\.env
```

If `backend\.env` already exists, do not overwrite it; add only missing settings. Set a strong private value for `JWT_SECRET`. To use Firebase Firestore, fill in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` with your service-account credentials. Keep `backend\.env` and service-account keys private and never commit them. Without the Firebase credentials, the backend uses `backend\localdb.json` for local metadata.

Install dependencies:

```powershell
cd backend
npm install
cd ..\frontend
npm install
```

Start the backend and frontend in separate terminals:

```powershell
# Terminal 1
cd backend
npm run dev
```

```powershell
# Terminal 2
cd frontend
npm run dev
```

The backend defaults to `http://localhost:5000`; `PORT` can override it. The frontend defaults to `http://localhost:5173`; set `FRONTEND_URL` if it is served from a different origin. For a non-default API address, set `VITE_API_URL` in the frontend environment (for example, `http://localhost:5000/api`). The authentication background image should be available at `frontend/public/auth-bg.jpg`.
