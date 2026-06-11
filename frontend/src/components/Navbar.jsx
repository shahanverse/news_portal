import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, User, LogOut, LayoutDashboard, Menu, X, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';

export default function Navbar({ currentView, setCurrentView, setSelectedCategory, setSelectedArticleId, user, setUser, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    setCurrentView('category');
    setIsMenuOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Set to home view with search query
      setCurrentView('home');
      setSelectedCategory('');
      // Trigger search handling on the Home component (managed by parent state or context if preferred, 
      // but passing it as a simple custom event or let Home page fetch with search value)
      window.dispatchEvent(new CustomEvent('newsSearch', { detail: searchQuery }));
    }
  };

  const handleLogoClick = () => {
    setCurrentView('home');
    setSelectedCategory('');
    setSearchQuery('');
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentView('home');
    setIsDropdownOpen(false);
  };

  const categories = [
    { slug: 'technology', name: 'Technology' },
    { slug: 'science', name: 'Science' },
    { slug: 'business', name: 'Business' },
    { slug: 'politics', name: 'Politics' },
    { slug: 'entertainment', name: 'Entertainment' },
    { slug: 'sports', name: 'Sports' }
  ];

  return (
    <nav className="sticky top-0 z-50 glass transition-all duration-300 shadow-sm border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleLogoClick}>
            <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              PENOFT
            </span>
            <span className="font-display font-medium text-lg ml-1 text-slate-800 dark:text-slate-200">
              NEWS
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-6">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 ${
                  currentView === 'category' && cat.slug === cat.slug // will be set correctly below
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Search, Theme Toggle, Profile */}
          <div className="hidden md:flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-64 pl-10 pr-4 py-1.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all text-slate-800 dark:text-slate-200"
              />
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            </form>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentView('dashboard');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentView('profile');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="px-4 py-2 rounded-full text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-b border-slate-200 dark:border-slate-800">
          <div className="px-2 pt-2 pb-4 space-y-1">
            <form onSubmit={handleSearchSubmit} className="relative px-3 mb-3">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none text-slate-800 dark:text-slate-200"
              />
              <Search className="absolute left-6 top-3 h-4 w-4 text-slate-400" />
            </form>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {cat.name}
              </button>
            ))}

            {user ? (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 px-3">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
                    alt={user.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center space-x-2"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentView('profile');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 flex items-center space-x-2"
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-base font-medium text-rose-600 hover:text-rose-800 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800 mt-2 pt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="px-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentView('login');
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-2.5 text-center block rounded-full text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
