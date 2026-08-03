import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, LogOut, User, Menu, X, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
            <BookOpen className="text-primary-600" size={28} />
            <span className="text-xl font-bold text-gray-800">AI Interview Prep</span>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/dashboard" icon={<Home size={18} />}>Dashboard</NavLink>
              <NavLink to="/interview">Interview</NavLink>
              <NavLink to="/performance">Performance</NavLink>
              <NavLink to="/resume-analyzer">Resume</NavLink>
              <NavLink to="/coding-round">Coding</NavLink>
              <NavLink to="/hr-interview">HR Practice</NavLink>
              <NavLink to="/profile" icon={<User size={18} />}>Profile</NavLink>
              
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-800 transition font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-800"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {user ? (
              <div className="space-y-3">
                <MobileNavLink to="/dashboard">Dashboard</MobileNavLink>
                <MobileNavLink to="/interview">Interview</MobileNavLink>
                <MobileNavLink to="/performance">Performance</MobileNavLink>
                <MobileNavLink to="/resume-analyzer">Resume</MobileNavLink>
                <MobileNavLink to="/coding-round">Coding</MobileNavLink>
                <MobileNavLink to="/hr-interview">HR Practice</MobileNavLink>
                <MobileNavLink to="/profile">Profile</MobileNavLink>
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={18} />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <MobileNavLink to="/login">Sign In</MobileNavLink>
                <MobileNavLink to="/register">Get Started</MobileNavLink>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-2 transition font-medium ${
        isActive
          ? 'text-primary-600'
          : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
};

const MobileNavLink = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`block px-4 py-2 rounded-lg transition font-medium ${
        isActive
          ? 'bg-primary-50 text-primary-600'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
