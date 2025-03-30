// Navbar.jsx
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 right-0 p-4"> 
      <div className="hidden md:flex space-x-4"> {/* Desktop buttons */}
        <Link to="/" className="text-white hover:text-gray-300">Home</Link>
        <Link to="/report-violation" className="text-white hover:text-gray-300">Report Violation</Link>
      </div>
      <div className="md:hidden"> {/* Mobile menu toggle */}
        <button
          className="focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isMenuOpen && (
        <div className="md:hidden flex flex-col space-y-4 mt-4 mobile-menu">
          <div className="mobile-menu-content">
            <Link to="/" className="block hover:text-gray-300" onClick={closeMenu}>Home</Link>
            <Link to="/report-violation" className="block hover:text-gray-300" onClick={closeMenu}>Report Violation</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;