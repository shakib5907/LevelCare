import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Login from './pages/Login';
import Register from './pages/Register';
import ClinicianDashboard from './pages/ClinicianDashboard';
import PatientDashboard from './pages/PatientDashboard';
import GuestOnlyRoute from './components/GuestOnlyRoute';

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
          <Route path="/clinician" element={<ClinicianDashboard />} />
          <Route path="/patient" element={<PatientDashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;