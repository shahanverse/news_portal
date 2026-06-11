import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar, User, Eye, ArrowRight, Search, X } from 'lucide-react';

export default function Home({ setCurrentView, setSelectedCategory, setSelectedArticleId }) {
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHomeData = async (search = '', pageNum = 1) => {
    setLoading(true);
    try {
      const articlesData = await api.getArticles({ search, page: pageNum, limit: 7 });
      setArticles(articlesData.articles);
      setTotalPages(articlesData.pagination.totalPages);
      setPage(articlesData.pagination.page);

      const trendingData = await api.getTrendingArticles();
      setTrending(trendingData);
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load articles. Is the backend server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData(searchQuery, page);

    // Listen for search events from navbar
    const handleNavbarSearch = (e) => {
      setSearchQuery(e.detail);
      setPage(1);
      fetchHomeData(e.detail, 1);
    };

    window.addEventListener('newsSearch', handleNavbarSearch);
    return () => {
      window.removeEventListener('newsSearch', handleNavbarSearch);
    };
  }, [searchQuery, page]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    fetchHomeData('', 1);
  };

  const handleArticleClick = (id) => {
    setSelectedArticleId(id);
    setCurrentView('article');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading && articles.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-400 font-semibold mb-4">{error}</p>
          <button
            onClick={() => fetchHomeData(searchQuery, page)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Hero calculations
  const heroArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1, 4) : [];
  const feedArticles = articles.length > 4 ? articles.slice(4) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header Banner */}
      {searchQuery && (
        <div className="mb-8 p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/55 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-800 dark:text-indigo-300">
            <Search className="h-5 w-5" />
            <span className="font-medium">Showing search results for &ldquo;{searchQuery}&rdquo;</span>
          </div>
          <button
            onClick={handleClearSearch}
            className="p-1 hover:bg-indigo-150 dark:hover:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* 1. HERO SECTION */}
      {!searchQuery && heroArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Hero Card */}
          <div 
            onClick={() => handleArticleClick(heroArticle.id)}
            className="lg:col-span-2 group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:shadow-xl"
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={heroArticle.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000'}
                alt={heroArticle.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  {heroArticle.category_name || heroArticle.category_slug}
                </span>
              </div>
            </div>
            
            <div className="p-6 md:p-8 space-y-4">
              <h1 className="font-display font-extrabold text-2xl md:text-4xl text-slate-900 dark:text-slate-100 tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {heroArticle.title}
              </h1>
              <p className="text-slate-600 dark:text-slate-350 line-clamp-3 leading-relaxed">
                {heroArticle.summary}
              </p>
              
              <div className="flex flex-wrap items-center text-xs text-slate-500 dark:text-slate-400 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <img
                    src={heroArticle.author_avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80'}
                    alt={heroArticle.author_name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{heroArticle.author_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(heroArticle.created_at)}</span>
                </div>
                <div className="flex items-center space-x-1 ml-auto">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{heroArticle.views} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Sidebar - Secondary Articles */}
          <div className="space-y-6">
            <h2 className="font-display font-bold text-xl text-slate-950 dark:text-white border-l-4 border-indigo-600 pl-3">
              Trending Headlines
            </h2>
            <div className="space-y-4">
              {secondaryArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => handleArticleClick(art.id)}
                  className="group cursor-pointer flex space-x-4 p-3 rounded-xl hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all duration-300"
                >
                  <img
                    src={art.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000'}
                    alt={art.title}
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {art.category_name}
                    </span>
                    <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {art.title}
                    </h3>
                    <span className="text-[11px] text-slate-500">{formatDate(art.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. GENERAL FEED & TRENDING BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Articles Feed */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3">
            {searchQuery ? 'Search Feed' : 'Latest Stories'}
          </h2>

          {articles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500">No articles found matching your request.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(searchQuery ? articles : feedArticles).map((art) => (
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
                    <span className="absolute top-3 left-3 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                      {art.category_name}
                    </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Editorial Picks / Most Viewed */}
        <div className="space-y-6">
          <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3">
            Most Read
          </h2>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
            {trending.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => handleArticleClick(art.id)}
                className="group cursor-pointer flex items-start space-x-4"
              >
                <span className="font-display font-black text-3xl text-indigo-500/20 group-hover:text-indigo-500 transition-colors w-8 text-center">
                  0{idx + 1}
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {art.category_name}
                  </span>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {art.title}
                  </h4>
                  <div className="flex items-center text-[10px] text-slate-500 pt-1">
                    <span className="flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {art.views} views
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
