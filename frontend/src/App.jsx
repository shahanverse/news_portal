import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import PostEditor from './pages/PostEditor';
import Profile from './pages/Profile';
import { api } from './utils/api';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // Initialize theme and user state
  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('news_portal_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    document.body.classList.toggle('dark', savedTheme === 'dark');

    // Auth setup
    if (api.isAuthenticated()) {
      setUser(api.getCurrentUser());
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('news_portal_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.body.classList.toggle('dark', nextTheme === 'dark');
  };

  // Auth route helper
  const renderProtectedRoute = (Component, props = {}) => {
    if (!api.isAuthenticated()) {
      return <Login setUser={setUser} setCurrentView={setCurrentView} />;
    }
    return <Component {...props} />;
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Home
            setCurrentView={setCurrentView}
            setSelectedCategory={setSelectedCategory}
            setSelectedArticleId={setSelectedArticleId}
          />
        );
      case 'category':
        return (
          <Category
            selectedCategory={selectedCategory}
            setCurrentView={setCurrentView}
            setSelectedArticleId={setSelectedArticleId}
          />
        );
      case 'article':
        return (
          <Article
            selectedArticleId={selectedArticleId}
            setCurrentView={setCurrentView}
            setSelectedArticleId={setSelectedArticleId}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case 'login':
        return <Login setUser={setUser} setCurrentView={setCurrentView} />;
      case 'dashboard':
        return renderProtectedRoute(AdminDashboard, {
          setCurrentView,
          setEditingArticleId
        });
      case 'editor':
        return renderProtectedRoute(PostEditor, {
          editingArticleId,
          setCurrentView
        });
      case 'profile':
        return renderProtectedRoute(Profile, {
          user,
          setUser,
          setCurrentView
        });
      default:
        return (
          <Home
            setCurrentView={setCurrentView}
            setSelectedCategory={setSelectedCategory}
            setSelectedArticleId={setSelectedArticleId}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300 font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedCategory={setSelectedCategory}
        setSelectedArticleId={setSelectedArticleId}
        user={user}
        setUser={setUser}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-grow pb-16">
        {renderView()}
      </main>

      <Footer
        setCurrentView={setCurrentView}
        setSelectedCategory={setSelectedCategory}
      />
    </div>
  );
}
