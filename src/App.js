import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './utils/firebase';
import { setTheme } from './themes';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import Stations from './pages/dashboard/Stations';
import Categories from './pages/dashboard/Categories';
import Colors from './pages/dashboard/Colors';
import Cars from './pages/dashboard/Cars';
import Rents from './pages/dashboard/Rents';
import Reports from './pages/dashboard/Reports';
import Users from './pages/dashboard/Users';

// CSS imports
import './App.css';

function App() {
  useEffect(() => {
    // Set the default theme on application start
    setTheme('light');
    
    // You can also load user preference from localStorage here
    // const savedTheme = localStorage.getItem('theme') || 'light';
    // setTheme(savedTheme);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stations" element={<Stations />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/colors" element={<Colors />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/rents" element={<Rents />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<Users />} />
        
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Catch all route - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
