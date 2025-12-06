import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Briefcase, User, LogOut, Shield, Home } from 'lucide-react';
import { getUser, isAdmin, logout } from '@/utils/auth';
import ThemeToggle from '@/components/ThemeToggle';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const admin = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/jobs', label: 'Jobs', icon: <Briefcase className="w-4 h-4" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  if (admin) {
    navLinks.push({
      path: '/admin',
      label: 'Admin',
      icon: <Shield className="w-4 h-4" />,
    });
  }

  return (
    <header className="header-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl text-gradient focus-ring rounded-lg px-2 py-1"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-[hsl(var(--primary-foreground))]" />
            </div>
            <span className="hidden sm:inline">JobPortal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-ring ${
                      isActive(link.path)
                        ? 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="w-px h-6 bg-[hsl(var(--border))] mx-2" />
                <div className="flex items-center gap-3">
                  <ThemeToggle />
                  <div className="text-sm">
                    <p className="font-medium text-[hsl(var(--foreground))]">
                      {user.email}
                    </p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost flex items-center gap-2 focus-ring"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />
                <Link
                  to="/login"
                  className="btn-ghost focus-ring"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  className="btn-primary focus-ring"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors focus-ring"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-[hsl(var(--border))]">
          <nav className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <div className="flex items-center justify-between px-4 py-3 mb-4 rounded-lg bg-[hsl(var(--muted))]">
                  <div>
                    <p className="font-medium text-[hsl(var(--foreground))]">
                      {user.email}
                    </p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                      {user.role}
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg font-medium text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/0.1)] transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-2 mb-2">
                  <span className="text-sm text-[hsl(var(--muted-foreground))]">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium hover:bg-[hsl(var(--muted))] transition-all"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary w-full text-center"
                >
                  Login / Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
