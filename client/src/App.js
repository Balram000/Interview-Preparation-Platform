import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Performance from './pages/Performance';
import AdminPanel from './pages/AdminPanel';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import CodingRound from './pages/CodingRound';
import HRInterview from './pages/HRInterview';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import './index.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/interview"
                  element={
                    <PrivateRoute>
                      <Interview />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/performance"
                  element={
                    <PrivateRoute>
                      <Performance />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/resume-analyzer"
                  element={
                    <PrivateRoute>
                      <ResumeAnalyzer />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/coding-round"
                  element={
                    <PrivateRoute>
                      <CodingRound />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/hr-interview"
                  element={
                    <PrivateRoute>
                      <HRInterview />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminPanel />
                    </AdminRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
