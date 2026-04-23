import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/Dashboard.css";
import Navigation from "./components/Navigation";

// import pages and components
import Home from "./pages/Home";
import History from "./pages/History";
import Exercise from "./pages/Exercise";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Error from "./pages/Error";
import Dashboard from "./components/Dashboard";
import Profile from "./pages/Profile";
import SingleExercise from "./components/SingleExercise";
import Cardio from "./components/Cardio";
import Resistance from "./components/Resistance";
import Nutrition from "./pages/Nutrition";
import Auth from "./utils/auth";

function App() {
  const loggedIn = Auth.loggedIn();

  return (
    <Router>
      {loggedIn && <Navigation />}
      <Container>
        <Routes>
        <Route 
          path="/" 
          element={loggedIn ? <Navigate to="/dashboard" /> : <Home />} 
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={loggedIn ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/history" 
          element={loggedIn ? <History /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/history/:type/:id" 
          element={loggedIn ? <SingleExercise /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={loggedIn ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/exercise" 
          element={loggedIn ? <Exercise /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/nutrition" 
          element={loggedIn ? <Nutrition /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/exercise/cardio" 
          element={loggedIn ? <Cardio /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/exercise/resistance" 
          element={loggedIn ? <Resistance /> : <Navigate to="/login" />} 
        />
        
          <Route path="*" element={<Error />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
