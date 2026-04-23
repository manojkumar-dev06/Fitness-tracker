# 🏋️‍♂️ Fitness Tracker

A full-stack MERN (MongoDB, Express, React, Node.js) application to help users track workouts, monitor progress, log nutrition, and stay consistent on their fitness journey.

---

## 🚀 Features

- 🏃‍♀️ **Workout Logging**: Track cardio and resistance training exercises.
- 📈 **Progress Dashboard**: Visualize workouts and performance trends.
- 🍎 **Nutrition Tracking**: Log food intake and calories.
- 👤 **User Authentication**: JWT-based secure login/signup system.
- 📅 **Calendar View**: View exercises by date.
- 🧠 **Profile Management**: View and update personal fitness profile.
- 📜 **History Page**: View all logged workout sessions.

---

## 🛠 Tech Stack

**Frontend:**
- React.js
- CSS Modules / Custom Styles
- React Router

**Backend:**
- Node.js
- Express.js
- MongoDB & Mongoose
- JWT for Auth
- Bcrypt for Password Hashing

---

## 📁 Project Structure

fitness-tracker/
- ├── client/ # React frontend
- │ ├── src/
- │ │ ├── pages/ # Login, Signup, Home, Profile, History
- │ │ ├── components/ # Header, Calendar, Navigation, etc.
- │ │ ├── styles/ # Component-wise CSS files
- │ │ └── utils/ # API helper, auth utils, date formatting
- │ └── public/ # Static assets
- ├── server/ # Node.js + Express backend
- │ ├── controllers/ # Business logic for workouts, nutrition, users
- │ ├── models/ # Mongoose models: User, Cardio, Resistance, Nutrition
- │ ├── routes/ # API routes
- │ └── utils/ # JWT auth middleware
- ├── .gitignore
- ├── README.md
- └── package.json

# Install Dependencies

# Backend
- cd server
- npm install

# Frontend
- cd ../client
- npm install

# Start the Development Server

# Backend (in one terminal)
- cd server
- npm run dev

# Frontend (in another terminal)
- cd client
- npm start
