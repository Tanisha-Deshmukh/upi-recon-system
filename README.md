# PaySync: Advanced UPI & Reconciliation System

PaySync is a full-stack, distributed microservices application built to simulate a high-scale UPI payment ecosystem along with an automated banking reconciliation engine. It features real-time peer-to-peer payments, bank account linking, automated anomaly detection, and real-time transaction reconciliation.

## ⚠️ The Problem Statement
In modern fintech and distributed payment networks (like UPI), network failures, timeouts, and asynchronous banking APIs frequently cause a mismatch in transaction states. A user's bank might successfully debit their account, but the UPI application might record the transaction as "FAILED" or "PENDING" because it dropped the success callback. This leads to intense customer frustration, frozen funds, and massive overhead in manual banking reconciliation.

## 💡 How We Solved It
We built a distributed platform featuring a dedicated, **Automated Reconciliation Engine** running entirely separate from the main UPI API. 
While the core API handles live, high-speed transactions, the background reconciliation worker continuously polls "stuck" or "pending" transactions, directly verifies their actual status (via UTRs) with the Mock Bank API, and silently auto-corrects the master ledger. Once a dropped transaction is securely recovered and matched, the system triggers an instant **Web Push Notification** to the user—eliminating manual customer support overhead and ensuring zero dropped transactions.

---

## 🌟 Key Features

### 1. FastPay (Core UPI Application)
- **Peer-to-Peer Payments**: Send money instantly using UPI IDs.
- **Internal Transfers**: Transfer funds between your own linked bank accounts.
- **Bank Discovery & Linking**: Connect accounts securely using OAuth-like flows with a mock bank API.
- **FastPay PIN**: 6-digit secure hashed PIN required for all transactions.

### 2. Reconciliation Engine & Receiver Notifications
- **Automated Cron Jobs**: Background workers that continuously poll and match `PENDING` transactions against the banking ledger.
- **Anomaly Resolution**: Automatically resolves mismatched transaction statuses (e.g., failed UPI drops that were credited at the bank).
- **Receiver-First Alerts**: This Web Push Notification system is specially designed for the **receiver**. In the real world, if the receiver's banking server goes down or delays the response, the sender's app might show "Pending" or "Failed", causing panic. The moment our background engine confirms the money successfully reached the receiver's bank, it instantly fires a push notification directly to the receiver's device. They know they got paid securely without having to constantly refresh the dashboard!

### 3. Mock Bank API
- **Simulated Banking Gateway**: Acts as the single source of truth for account balances and external transactions.
- **Database Seeding**: Pre-configured with major Indian banks (SBI, HDFC, ICICI, etc.) to mimic real-world interactions.

### 4. Admin Dashboard
- **Live Sync & Ledger**: Real-time glassmorphism data tables for monitoring active transactions.
- **Financial Analytics**: Stats cards tracking pending volumes, success rates, and total settled amounts.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express.js (Microservices Architecture)
- **Database**: MongoDB (Mongoose schemas with strict referencing)
- **Security**: bcrypt (hashing PINs/Passwords), JWT (Access/Refresh tokens)
- **Push Notifications**: `web-push` library with Service Workers

---

## 🚀 How to Run the Project Locally

Because the project is split into four distinct services, you will need to open **4 separate terminal windows**.

### Prerequisites
- Node.js installed (v18+)
- MongoDB installed locally OR a MongoDB Atlas URI

### Step 1: Clone the Repository
```bash
git clone <your-repo-link>
cd UPI-RECON-SYSYTEM
```

### Step 2: Set up the Mock Bank API (Terminal 1)
This service acts as the core banking system.
```bash
cd mock-bank-api
npm install
```
*Create a `.env` file:*
```ini
PORT=5000
MONGODB_URI=your_mongo_connection_string
```
*Seed the database with default banks & accounts, then start it:*
```bash
node src/seed.js
npm start
```

### Step 3: Set up the UPI Payment System (Terminal 2)
This handles users, authentication, and initiating payments.
```bash
cd upi-recon-system/upiPaymentSystem
npm install
```
*Create a `.env` file:*
```ini
PORT=8000
MONGODB_URI=your_mongo_connection_string
CORS_ORIGIN=http://localhost:5173
BANK_API_URL=http://localhost:5000/api/v1/bank
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```
*Start the service:*
```bash
npm start
```

### Step 4: Set up the Reconciliation Engine (Terminal 3)
This background worker auto-resolves stuck transactions.
```bash
cd upi-recon-system/upi-reconciliation
npm install
```
*Create a `.env` file:*
```ini
PORT=8001
MONGODB_URI=your_mongo_connection_string
UPI_API_URL=http://localhost:8000/api/v1
PUBLIC_VAPID_KEY=your_vapid_public_key
PRIVATE_VAPID_KEY=your_vapid_private_key
```
*Start the service:*
```bash
npm start
```

### Step 5: Start the React Frontend (Terminal 4)
```bash
cd upi-recon-system/react-app
npm install
```
*Create a `.env` file:*
```ini
VITE_UPI_API_URL=http://localhost:8000/api/v1
VITE_RECON_API_URL=http://localhost:8001/api/v1
VITE_MOCK_BANK_API_URL=http://localhost:5000/api/v1
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```
*Start the frontend app:*
```bash
npm run dev
```

---

## 🔒 What Not To Push to GitHub
If you fork or clone this repository, ensure your `.gitignore` file contains the following to prevent pushing sensitive data:
- `node_modules/`
- `.env`
- `dist/` or `build/`
- `.DS_Store`
