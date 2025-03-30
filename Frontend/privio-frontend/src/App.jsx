import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ReportViolation from './pages/ReportViolation';
import Navbar from './components/Navbar';
import Dashboard from './pages/Admin';

function App() {
  const user = {
    username: 'adminUser'
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report-violation" element={<ReportViolation />} />
          <Route path="*" element={<div>404 Not Found</div>} />
          <Route path="/admin" element={<Dashboard user={user} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;