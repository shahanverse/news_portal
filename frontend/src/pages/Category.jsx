import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';

export default function Category({ selectedCategory, setCurrentView, setSelectedArticleId }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoryArticles = async () => {
      setLoading(true);
      try {
        const data = await api.getArticles({ category: selectedCategory, limit: 12 });
        setArticles(data.articles);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load category feed');
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      fetchCategoryArticles();
    }
  }, [selectedCategory]);

  const handleArticleClick = (id) => {
    setSelectedArticleId(id);
    setCurrentView('article');
  };

  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back navigation */}
      <button
        onClick={() => setCurrentView('home')}
        className="mb-6 flex items-center space-x-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </button>

      {/* Header */}
      <div className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Category Feed</span>
        <h1 className="font-display font-extrabold text-3xl md:text-5xl text-slate-900 dark:text-white mt-1">
          {capitalize(selectedCategory)}
        </h1>
      </div>

      {error ? (
        <div className="text-center py-12 text-rose-500">{error}</div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-slate-500">No articles available in this category yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => handleArticleClick(art.id)}
              className="group cursor-pointer bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 hover-card flex flex-col h-full"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={art.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000'}
                  alt={art.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                />
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800/80 pt-3">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{art.author_name}</span>
                  <span className="mx-1.5">•</span>
                  <span>{formatDate(art.created_at)}</span>
                  <span className="ml-auto flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{art.views}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
