import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Calendar, User, Eye, ArrowLeft, Share2, MessageSquare, Heart, Bookmark, Copy, Check } from 'lucide-react';

export default function Article({ selectedArticleId, setCurrentView, setSelectedArticleId, setSelectedCategory }) {
  const [article, setArticle] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Likes/Comments in state
  const [likes, setLikes] = useState(124);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, author: 'David Miller', text: 'This is an incredibly detailed and well-written analysis. The transition to quantum-resistant encryption is definitely something more organizations should prioritize.', date: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80' },
    { id: 2, author: 'Emma Watson', text: 'Excellent report. The security implications of harvesting encrypted data now for decryption later are scary, yet very real.', date: '1 hour ago', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80' }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchArticleData = async () => {
      setLoading(true);
      try {
        const data = await api.getArticle(selectedArticleId);
        setArticle(data);
        
        // Fetch recommendations from category
        if (data.category_slug) {
          const recData = await api.getArticles({ category: data.category_slug, limit: 4 });
          // Filter out current article
          const filteredRecs = recData.articles.filter(a => a.id !== data.id).slice(0, 3);
          setRecommendations(filteredRecs);
        }
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load article details');
      } finally {
        setLoading(false);
      }
    };

    if (selectedArticleId) {
      fetchArticleData();
    }
  }, [selectedArticleId]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes(likes - 1);
      setHasLiked(false);
    } else {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const commentObj = {
        id: Date.now(),
        author: 'Anonymous Reader',
        text: newComment,
        date: 'Just now',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'
      };
      setComments([commentObj, ...comments]);
      setNewComment('');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Helper to render body paragraphs / basic markdown
  const renderContent = (content) => {
    if (!content) return null;
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('### ')) {
        return <h3 key={index}>{paragraph.replace('### ', '')}</h3>;
      }
      if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
        const items = paragraph.split('\n');
        return (
          <ul key={index}>
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
            ))}
          </ul>
        );
      }
      // Check for numbered list
      if (/^\d+\.\s+/.test(paragraph)) {
        const items = paragraph.split('\n');
        return (
          <ol key={index}>
            {items.map((item, i) => (
              <li key={i}>{item.replace(/^\d+\.\s+/, '')}</li>
            ))}
          </ol>
        );
      }
      return <p key={index}>{paragraph}</p>;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-16">
        <p className="text-rose-500 font-semibold">{error || 'Article not found'}</p>
        <button onClick={() => setCurrentView('home')} className="mt-4 text-indigo-600 hover:underline">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <button
        onClick={() => setCurrentView('home')}
        className="mb-6 flex items-center space-x-2 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </button>

      {/* Category badge */}
      <div className="mb-4">
        <button
          onClick={() => {
            setSelectedCategory(article.category_slug);
            setCurrentView('category');
          }}
          className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full transition-colors"
        >
          {article.category_name || article.category_slug}
        </button>
      </div>

      {/* Title */}
      <h1 className="font-display font-black text-3xl md:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
        {article.title}
      </h1>

      {/* Summary */}
      <p className="text-lg text-slate-600 dark:text-slate-350 leading-relaxed border-l-4 border-indigo-500 pl-4 mb-8 italic">
        {article.summary}
      </p>

      {/* Author & Date metadata */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 dark:border-slate-800 mb-8">
        <div className="flex items-center space-x-3">
          <img
            src={article.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'}
            alt={article.author_name}
            className="h-12 w-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{article.author_name}</p>
            <p className="text-xs text-slate-400">Reporter & Writer</p>
          </div>
        </div>

        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{article.views} views</span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      <div className="aspect-video w-full rounded-2xl overflow-hidden mb-8 shadow-md">
        <img
          src={article.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000'}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Content */}
      <article className="prose dark:prose-invert max-w-none mb-12">
        {renderContent(article.content)}
      </article>

      {/* Post Actions (Likes / Share) */}
      <div className="flex items-center justify-between py-4 border-y border-slate-100 dark:border-slate-800 mb-12">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 text-sm px-3.5 py-1.5 rounded-full transition-colors ${
              hasLiked
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
            }`}
          >
            <Heart className={`h-4.5 w-4.5 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2 text-sm px-3.5 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            {copied ? <Check className="h-4.5 w-4.5 text-emerald-500" /> : <Copy className="h-4.5 w-4.5" />}
            <span>{copied ? 'Copied Link' : 'Copy'}</span>
          </button>
        </div>

        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
          <Bookmark className="h-4.5 w-4.5" />
        </button>
      </div>

      {/* Author Biography */}
      {article.author_bio && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start space-x-4 mb-12">
          <img
            src={article.author_avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'}
            alt={article.author_name}
            className="h-16 w-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">About {article.author_name}</h4>
            <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">{article.author_bio}</p>
          </div>
        </div>
      )}

      {/* Suggested Recommended Reads */}
      {recommendations.length > 0 && (
        <div className="mb-12">
          <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mb-6 border-l-4 border-indigo-600 pl-3">
            Recommended For You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedArticleId(rec.id)}
                className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden hover-card flex flex-col h-full"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={rec.cover_image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600'}
                    alt={rec.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {rec.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block pt-2">{formatDate(rec.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments section */}
      <div className="space-y-6">
        <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white border-l-4 border-indigo-600 pl-3">
          Discussion ({comments.length})
        </h3>
        
        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3">
          <textarea
            required
            rows="3"
            placeholder="Add to the story discussion..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            Post Comment
          </button>
        </form>

        {/* Comment List */}
        <div className="space-y-4 pt-4">
          {comments.map((comm) => (
            <div key={comm.id} className="flex space-x-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
              <img
                src={comm.avatar}
                alt={comm.author}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="space-y-1 flex-grow">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-xs text-slate-900 dark:text-white">{comm.author}</h5>
                  <span className="text-[10px] text-slate-400">{comm.date}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed">{comm.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
