
# 🎓 College Student Management Portal

A full-stack web portal for managing student academic and disciplinary records securely, with role-based access for Admins and Faculty.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Charts | Recharts |

---

## 📁 Folder Structure

```
college-portal/
├── backend/
│   ├── models/
│   │   ├── User.js              # Admin & Faculty model
│   │   ├── Student.js           # Student data model
│   │   └── MalpracticeRecord.js # Malpractice/disciplinary model
│   ├── routes/
│   │   ├── auth.js              # Login, me, change-password
│   │   ├── students.js          # CRUD for students
│   │   ├── malpractice.js       # Malpractice records CRUD
│   │   ├── users.js             # Faculty management
│   │   └── stats.js             # Dashboard statistics
│   ├── middleware/
│   │   └── auth.js              # JWT protect + role guards
│   ├── seed/
│   │   └── seed.js              # Demo data seeder
│   ├── server.js                # Main Express app
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── pages/
│   │   ├── index.js             # Redirect to login/dashboard
│   │   ├── login.js             # Login page
│   │   ├── dashboard.js         # Dashboard with stats & charts
│   │   ├── students/
│   │   │   ├── index.js         # Students list with search/filter/sort
│   │   │   ├── new.js           # Add new student form
│   │   │   ├── [id].js          # Student profile detail page
│   │   │   └── [id]/edit.js     # Edit student
│   │   ├── malpractice/
│   │   │   ├── index.js         # All malpractice records
│   │   │   └── new.js           # Add new record
│   │   └── users/
│   │       └── index.js         # Faculty account management
│   ├── components/
│   │   ├── layout/
│   │   │   └── Layout.js        # Sidebar + header layout
│   │   └── forms/
│   │       └── StudentForm.js   # Reusable student form
│   ├── context/
│   │   └── AuthContext.js       # Auth state management
│   ├── hooks/
│   │   └── useProtectedRoute.js # Route protection hook
│   ├── lib/
│   │   └── api.js               # Axios API client
│   ├── styles/
│   │   └── globals.css          # Global styles + Tailwind
│   └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone / Download the project

```bash
cd college-portal
```

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/college_portal
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create env file
cp .env.local.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- **25 students** across 6 departments
- **8 malpractice records**  
- **1 admin + 3 faculty** accounts

### 5. Start the Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
Backend runs at: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:3000

---

## 🔐 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Faculty | faculty@college.edu | faculty123 |

---

## 👤 User Roles & Permissions

### Admin
- ✅ Add / Edit / Delete students
- ✅ Update CGPA and semester marks
- ✅ Add / manage malpractice records
- ✅ Manage faculty accounts
- ✅ View all dashboards and statistics
- ✅ Change any student's disciplinary notes

### Faculty
- ✅ Login securely
- ✅ View dashboard statistics
- ✅ Search and view student profiles
- ✅ View CGPA, academic history, malpractice records
- ❌ Cannot edit or delete any data

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

Full docs at: `GET /api/docs`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email + password |
| GET | `/auth/me` | Get current user |
| POST | `/auth/change-password` | Change password |

### Students
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/students` | All | List with pagination, search, filter |
| GET | `/students/:id` | All | Get student + malpractice records |
| POST | `/students` | Admin | Create student |
| PUT | `/students/:id` | Admin | Update student |
| DELETE | `/students/:id` | Admin | Soft-delete student |
| GET | `/students/departments/list` | All | List departments |

**Query params for GET /students:**
- `search` — name, ID, email, register number
- `department` — filter by department
- `year` — filter by year (1-4)
- `sortBy` — field to sort (name, cgpa, createdAt)
- `sortOrder` — asc / desc
- `page` — page number (default 1)
- `limit` — results per page (default 10)

### Malpractice
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/malpractice` | All | List records (filterable) |
| GET | `/malpractice/student/:id` | All | Records for one student |
| POST | `/malpractice` | Admin | Create record |
| PUT | `/malpractice/:id` | Admin | Update record |
| DELETE | `/malpractice/:id` | Admin | Delete record |

### Users (Faculty Management)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | List all users |
| POST | `/users` | Admin | Create user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Delete user |
| PATCH | `/users/:id/toggle-status` | Admin | Activate/deactivate |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats/dashboard` | Dashboard overview, charts, recent activity |

---

## 🗄️ Database Models

### User
```
name, email, password (hashed), role (admin/faculty), 
department, phone, isActive, lastLogin
```

### Student
```
studentId, registerNumber, name, email, phone
department, year, semester, cgpa, semesterGPA[]
attendance, bloodGroup, gender, category, dateOfBirth
address {street, city, state, pincode}
parentDetails {fatherName, fatherPhone, motherName, ...}
admissionYear, batch, scholarshipStatus, hostelResident
disciplinaryNotes, remarks, documents[], isActive
```

### MalpracticeRecord
```
student (ref), studentId, type, severity, incidentDate
description, actionTaken, status, examDetails
penaltyGiven, witnesses[], reportedBy (ref), reportedByName
attachments[]
```

---

## 🎨 Portal Features

- **Role-based login** with JWT
- **Dashboard** — charts, stats, recent activity
- **Student List** — search, filter by department/year, sort, paginate
- **Student Profile** — full academic history, family details, malpractice tab
- **Add/Edit Student** — tabbed form with all fields
- **Malpractice Module** — add, filter, update status
- **Faculty Management** — create, activate/deactivate accounts
- **Responsive UI** — works on mobile, tablet, desktop
- **Clean navy + gold design** with Sora + DM Sans typography

---

## 🔒 Security

- Passwords hashed with bcrypt (12 salt rounds)
- JWT tokens with expiry
- Role-based middleware on all protected routes
- Input validation with express-validator
- Soft-deletes for data integrity
- CORS configured for specific frontend origin

---

## 🚀 Production Deployment

### Backend (e.g., Render, Railway, Heroku)
1. Set environment variables
2. Change `MONGODB_URI` to MongoDB Atlas connection string
3. Set `NODE_ENV=production`

### Frontend (e.g., Vercel)
1. Set `NEXT_PUBLIC_API_URL` to your backend URL
2. Run `npm run build`
3. Deploy

---

## 📝 License

MIT — Free to use and modify.
=======
# Student-base-management

