import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginReg from './LoginReg'
import SchedulingCommittee from './SchedulingCommittee'
import './App.css'

// Make sure you have Bootstrap CSS and Icons in your public/index.html:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
// <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet" />
// <link href="https://cdn.jsdelivr.net/npm/bootswatch@5.3.3/dist/flatly/bootstrap.min.css" rel="stylesheet" />
// <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Default route - Login/Register page */}
        <Route path="/" element={<LoginReg />} />
        
        {/* Scheduling Committee Dashboard */}
        <Route path="/scheduling-committee" element={<SchedulingCommittee />} />
        
        {/* Load Committee Dashboard - Add when ready */}
        {/* <Route path="/load-committee" element={<LoadCommittee />} /> */}
        
        {/* Faculty Dashboard - Add when ready */}
        {/* <Route path="/faculty-dashboard" element={<FacultyDashboard />} /> */}
        
        {/* Student Dashboard - Add when ready */}
        {/* <Route path="/student-dashboard" element={<StudentDashboard />} /> */}
        
        {/* Fallback - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>,
)