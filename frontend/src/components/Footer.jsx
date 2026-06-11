import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function Footer({ setCurrentView, setSelectedCategory }) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const handleCategoryClick = (slug) => {
    setSelectedCategory(slug);
    setCurrentView('category');
  };

  const handleLogoClick = () => {
    setSelectedCategory('');
    setCurrentView('home');
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
    <footer className="bg-slate-900 text-slate-350 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
              <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                PENOFT
              </span>
              <span className="font-display font-medium text-lg ml-1 text-white">
                NEWS
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Delivering independent, premium, and investigative journalism in technology, science, politics, and business since 2026.
            </p>
            {/* Social icons using custom inline SVGs */}
            <div className="flex space-x-4 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors" aria-label="Twitter">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors" aria-label="Github">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-full transition-colors" aria-label="LinkedIn">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links Col */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className="text-slate-400 hover:text-white transition-colors text-sm text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links Col */}
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Portal</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors text-left">
                  Homepage
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentView('login')} className="hover:text-white transition-colors text-left">
                  Admin Sign In
                </button>
              </li>
              <li>
                <span className="text-slate-500">Contact: support@penoft.com</span>
              </li>
              <li>
                <span className="text-slate-500">Demo Account: admin / password123</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="space-y-4">
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase">Subscribe</h3>
            <p className="text-sm text-slate-400">
              Get the latest high-priority news sent directly to your inbox every morning.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2 text-sm bg-slate-800 text-white rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 p-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
                  aria-label="Subscribe"
                >
                  <Send className="h-4.5 w-4.5" />
                </button>
              </div>
            </form>
            {subscribed && (
              <p className="text-xs text-emerald-400 transition-opacity">
                ✓ Thank you for subscribing to PENOFT newsletter!
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p>© 2026 PENOFT News Portal. All rights reserved. Created for Internship Machine Test.</p>
          <p>Reference: PENOFT Machine Test Guidelines</p>
        </div>
      </div>
    </footer>
  );
}
