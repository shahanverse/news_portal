import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { ArrowLeft, Save, Upload, Eye, Image as ImageIcon, Calendar, Clock, Sparkles } from 'lucide-react';

export default function PostEditor({ editingArticleId, setCurrentView }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categorySlug, setCategorySlug] = useState('technology');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [scheduledAt, setScheduledAt] = useState('');
  
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load categories
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };

    // Load article if editing
    const loadArticle = async () => {
      if (editingArticleId) {
        setLoading(true);
        try {
          const art = await api.getArticle(editingArticleId);
          setTitle(art.title);
          setSummary(art.summary || '');
          setContent(art.content);
          setCategorySlug(art.category_slug);
          setCoverImage(art.cover_image || '');
          setStatus(art.status);
          
          if (art.scheduled_at) {
            // Convert to datetime-local input format (YYYY-MM-DDThh:mm)
            const date = new Date(art.scheduled_at);
            const offset = date.getTimezoneOffset();
            const localDate = new Date(date.getTime() - offset * 60 * 1000);
            setScheduledAt(localDate.toISOString().slice(0, 16));
          } else {
            setScheduledAt('');
          }
          
          if (art.cover_image && art.cover_image.startsWith('/uploads/')) {
            setUploadMode('upload');
          } else {
            setUploadMode('url');
          }
        } catch (err) {
          console.error(err);
          setError('Failed to fetch article details for editing.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadCategories();
    loadArticle();
  }, [editingArticleId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const imageUrl = await api.uploadImage(file);
      setCoverImage(imageUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Image upload failed. Check file type and size.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (selectedStatus) => {
    if (!title.trim() || !content.trim() || !categorySlug) {
      setError('Title, content, and category are required.');
      return;
    }

    if (selectedStatus === 'scheduled' && !scheduledAt) {
      setError('Please select a publication date and time for scheduled articles.');
      return;
    }

    setLoading(true);
    setError(null);

    const articleData = {
      title,
      summary,
      content,
      category_slug: categorySlug,
      cover_image: coverImage,
      status: selectedStatus,
      scheduled_at: selectedStatus === 'scheduled' ? new Date(scheduledAt).toISOString() : null
    };

    try {
      if (editingArticleId) {
        await api.updateArticle(editingArticleId, articleData);
      } else {
        await api.createArticle(articleData);
      }
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save article. Please verify inputs.');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Upper header controls */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-150 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white">
              {editingArticleId ? 'Edit Article' : 'Compose Story'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Draft, schedule, or publish news onto the live portal feeds.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>{showPreview ? 'Edit Layout' : 'Live Preview'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
          {error}
        </div>
      )}

      {loading && !title ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : showPreview ? (
        /* ================= PREVIEW LAYOUT ================= */
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-amber-50 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-amber-800 dark:text-amber-300 text-xs flex items-center space-x-2">
            <Sparkles className="h-4.5 w-4.5 flex-shrink-0" />
            <span>You are viewing a draft simulation of how this article will look when published on the news feed.</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 md:p-8">
            <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-md">
              {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
            </span>
            <h1 className="font-display font-black text-3xl md:text-5xl text-slate-900 dark:text-white mt-4 mb-6 leading-tight">
              {title || 'Untitled Article'}
            </h1>
            
            {summary && (
              <p className="text-slate-500 dark:text-slate-350 border-l-4 border-indigo-500 pl-4 mb-8 text-base italic leading-relaxed">
                {summary}
              </p>
            )}

            {coverImage && (
              <div className="aspect-video w-full rounded-xl overflow-hidden mb-8 shadow-sm">
                <img src={coverImage} alt={title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-base">
              {content ? (
                content.split('\n\n').map((para, i) => <p key={i} className="mb-4">{para}</p>)
              ) : (
                <p className="text-slate-400 italic">No content written yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ================= EDITOR FORM LAYOUT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Fields Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-5">
              {/* Title input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter a compelling headline..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-display font-bold text-lg"
                />
              </div>

              {/* Summary / Subheading */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Summary / Subheading
                </label>
                <textarea
                  rows="2"
                  placeholder="Brief summary of the article (appears in headlines and cards)..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm leading-relaxed"
                />
              </div>

              {/* Cover Image Pickers */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Cover Image
                </label>

                {/* Upload vs URL buttons */}
                <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg max-w-fit mb-3">
                  <button
                    type="button"
                    onClick={() => setUploadMode('upload')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      uploadMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      uploadMode === 'url'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500'
                    }`}
                  >
                    Image URL
                  </button>
                </div>

                {uploadMode === 'upload' ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={triggerFileSelect}
                        disabled={uploading}
                        className="flex items-center space-x-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer"
                      >
                        <Upload className="h-4.5 w-4.5" />
                        <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <span className="text-xs text-slate-400">PNG, JPG, JPEG, or WEBP (max 5MB)</span>
                    </div>

                    {uploading && (
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="Paste cover image URL (e.g. Unsplash URL)..."
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}

                {/* Upload Image Preview Box */}
                {coverImage && (
                  <div className="mt-4 relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 dark:border-slate-850">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors shadow"
                      title="Remove Image"
                    >
                      <span className="text-xs font-bold px-1.5">✕</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Body */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Body Content
                </label>
                <textarea
                  rows="14"
                  required
                  placeholder="Tell your story. Support paragraphs with double spacing. Use '### Subheading' for sub headers..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>

          {/* Sidebar controls (Publish options / scheduling) */}
          <div className="space-y-6">
            {/* Meta panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3">
                Publication Panel
              </h3>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Category Slug
                </label>
                <select
                  value={categorySlug}
                  onChange={(e) => setCategorySlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status display */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400">Current Status:</span>
                <span className="ml-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 capitalize">
                  {status}
                </span>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-3">
                Save & Publishing Actions
              </h3>

              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={loading}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('in-review')}
                  disabled={loading}
                  className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Send for Approval
                </button>

                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={loading}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow cursor-pointer"
                >
                  Publish Now
                </button>
              </div>

              {/* Scheduling Panel */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-4 space-y-3">
                <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Or Schedule Release
                </h4>
                
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSave('scheduled')}
                  disabled={loading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-colors shadow cursor-pointer"
                >
                  Schedule Release
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
