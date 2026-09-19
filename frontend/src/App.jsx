import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import ClinicianDashboard from './pages/ClinicianDashboard';
import PatientDashboard from './pages/PatientDashboard';
import EmergencyConsole from './pages/EmergencyConsole';
import AdminDashboard from './pages/AdminDashboard';
import GuestOnlyRoute from './components/GuestOnlyRoute';
import RequireRole from './components/RequireRole';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <Login />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <Register />
              </GuestOnlyRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <RequireRole roles={['patient']}>
                <PatientDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/clinician"
            element={
              <RequireRole roles={['clinician', 'gp', 'paramedic']}>
                <ClinicianDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/emergency"
            element={
              <RequireRole roles={['emergency_operator']}>
                <EmergencyConsole />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole roles={['admin']}>
                <AdminDashboard />
              </RequireRole>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;