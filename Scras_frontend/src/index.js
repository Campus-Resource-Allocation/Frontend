import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/main.css';

// Admin pages
import Teachers from './pages/admin/Teachers';
import Courses from './pages/admin/Courses';
import Students from './pages/admin/Students';
import Rooms from './pages/admin/Rooms';

// Student/TA/Teacher pages
import StudentDashboard from './pages/student/StudentDashboard';
import TADashboard from './pages/ta/TADashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import Login from './pages/Login';

// Check URL to decide which portal
const isAdminPortal = window.location.hostname.includes('admin');

function App() {
  if (isAdminPortal) {
    // Admin Portal
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Teachers />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/students" element={<Students />} />
          <Route path="/rooms" element={<Rooms />} />
        </Routes>
      </BrowserRouter>
    );
  } else {
    // Main Portal (Student/TA/Teacher)
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/student/*" element={<StudentDashboard />} />
          <Route path="/ta/*" element={<TADashboard />} />
          <Route path="/teacher/*" element={<TeacherDashboard />} />
        </Routes>
      </BrowserRouter>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);