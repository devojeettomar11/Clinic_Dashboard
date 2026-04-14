# MedyGhar Clinic Admin — Full Stack App

A complete Clinic Admin Portal with React frontend + Node.js/Express backend + MongoDB Atlas.

---

## 📁 Project Structure

```
medyghar-clinic/
├── backend/          ← Node.js + Express + MongoDB REST API
└── frontend/         ← React 18 + Tailwind CSS + Zustand
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# → Edit .env and add your MongoDB Atlas URI
npm run dev
```

**`.env` variables:**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/medyghar
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🗄️ MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user (username + password)
4. Whitelist your IP (or use 0.0.0.0/0 for all)
5. Get the connection string and paste it into `.env` as `MONGO_URI`

---

## 🔑 First Time Login

1. Open http://localhost:3000/login
2. Switch to **Register** tab
3. Fill in your details (role auto-set to `clinic`)
4. You're logged in!
5. Go to **Clinic Setup** and complete the 4 steps
6. Use Admin panel (or MongoDB Compass) to set `clinic.status = "active"`

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register clinic admin |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user |
| GET  | /api/clinic/packages | List packages |
| POST | /api/clinic/packages | Create package |
| PUT  | /api/clinic/packages/:id | Update package |
| DELETE | /api/clinic/packages/:id | Delete package |
| PATCH | /api/clinic/packages/:id/toggle | Toggle active |
| GET  | /api/clinic/lab-tests | List lab tests |
| POST | /api/clinic/lab-tests | Create lab test |
| GET  | /api/clinic/bookings | List bookings |
| GET  | /api/clinic/bookings/:id | Booking detail |
| PUT  | /api/clinic/bookings/:id/assign | Assign technician |
| PUT  | /api/clinic/bookings/:id/status | Update status |
| POST | /api/clinic/bookings/:id/report | Upload report |
| GET  | /api/clinic/revenue/summary | Revenue summary |
| GET  | /api/clinic/revenue/transactions | Transactions |
| GET  | /api/clinic/technicians | List technicians |
| GET  | /api/clinic/my-clinic | Get clinic profile |
| POST | /api/clinic/setup | Create/update clinic |
| POST | /api/clinic/upload-license | Upload license file |
| PUT  | /api/auth/change-password | Change password |
| DELETE | /api/auth/delete-account | Delete account |

---

## 🧑‍💻 Adding Technicians

Technicians are stored in MongoDB. Insert manually via Compass or add a POST route:

```js
// Using Mongo Compass or mongosh:
db.technicians.insertOne({
  clinic: ObjectId("your_clinic_id"),
  name: "Rajesh Kumar",
  phone: "9876543210",
  employeeId: "TECH001",
  isActive: true
})
```

---

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router 6, Tailwind CSS, Zustand |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| File Upload | Multer |

---

## 📦 Features

- ✅ Clinic Admin login/register
- ✅ 4-step clinic profile setup (license upload, location, OTP, hours)
- ✅ Health packages CRUD with toggle active
- ✅ Lab tests CRUD with category badges
- ✅ Bookings management with 6-step workflow
- ✅ Assign technicians, collect samples, upload reports
- ✅ Revenue dashboard (daily/weekly/monthly)
- ✅ Transaction history with pagination
- ✅ Responsive sidebar with mobile drawer
- ✅ Toast notifications
- ✅ Password change & account deletion
