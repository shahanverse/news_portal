import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import {
  FileText,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  Eye,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function AdminDashboard({ setCurrentView, setEditingArticleId }) {
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    scheduled: 0,
    inReview: 0,
    published: 0,
    views: 0
  });
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getAdminStats();
      setStats(statsData);

      const articlesData = await api.getAdminArticles({
        status: activeTab,
        search: searchQuery
      });
      setArticles(articlesData);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch dashboard data. Please authenticate again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab, searchQuery]);

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.deleteArticle(id);
        fetchDashboardData();
      } catch (err) {
        alert(err.message || 'Failed to delete article');
      }
    }
  };

  const handleEdit = (id) => {
    setEditingArticleId(id);
    setCurrentView('editor');
  };

  const handleCreateNew = () => {
    setEditingArticleId(null);
    setCurrentView('editor');
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350',
      scheduled: 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400',
      'in-review': 'bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400',
      published: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${badges[status] || 'bg-slate-100'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
            Newsroom Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage editor posts, review draft submissions, and monitor stats.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Write Article</span>
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Articles', value: stats.total, icon: FileText, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/25' },
          { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/25' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/25' },
          { label: 'In Review', value: stats.inReview, icon: HelpCircle, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/25' },
          { label: 'Drafts', value: stats.draft, icon: FileSpreadsheet, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900/40' },
          { label: 'Total Views', value: stats.views, icon: Eye, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/25' }
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</span>
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display font-black text-2xl text-slate-800 dark:text-white leading-tight">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Navigation tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-6 pb-4 border-b border-slate-150 dark:border-slate-800">
        {/* Tabs */}
        <div className="flex space-x-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-xl max-w-fit">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'published', label: 'Published' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'in-review', label: 'In Review' },
            { id: 'draft', label: 'Drafts' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl mb-6 flex items-start space-x-2.5 text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Articles Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500 text-sm">No articles found in this section.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">Article</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Views</th>
                  <th className="py-4 px-6">Schedule / Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    {/* Title & Cover image */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-center space-x-3">
                        <img
                          src={art.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100'}
                          alt={art.title}
                          className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate hover:text-indigo-600">
                            {art.title}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{art.summary || 'No summary'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6 capitalize text-slate-600 dark:text-slate-400 font-medium">
                      {art.category_name || art.category_slug}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">{getStatusBadge(art.status)}</td>

                    {/* Views */}
                    <td className="py-4 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {art.views}
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {art.status === 'scheduled' ? (
                        <div>
                          <p className="font-semibold text-amber-600 dark:text-amber-400">Scheduled At</p>
                          <p>{new Date(art.scheduled_at).toLocaleString()}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-slate-600 dark:text-slate-400">Created</p>
                          <p>{formatDate(art.created_at)}</p>
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(art.id)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-colors"
                          title="Edit Article"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id, art.title)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
