const API_BASE_URL = 'https://news-portal-l43y.onrender.com';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('news_portal_token');
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Public endpoints
  async getCategories() {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getArticles({ category, search, limit, page } = {}) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit);
    if (page) params.append('page', page);

    const res = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  },

  async getTrendingArticles() {
    const res = await fetch(`${API_BASE_URL}/articles/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending articles');
    return res.json();
  },

  async getArticle(slugOrId) {
    const res = await fetch(`${API_BASE_URL}/articles/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  },

  // Auth endpoints
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('news_portal_token', data.token);
    localStorage.setItem('news_portal_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('news_portal_token');
    localStorage.removeItem('news_portal_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('news_portal_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('news_portal_token');
  },

  // Admin endpoints
  async getAdminStats() {
    const res = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminArticles({ status, search } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE_URL}/admin/articles?${params.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin articles');
    return res.json();
  },

  async createArticle(articleData) {
    const res = await fetch(`${API_BASE_URL}/admin/articles`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create article');
    return data;
  },

  async updateArticle(id, articleData) {
    const res = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(articleData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update article');
    return data;
  },

  async deleteArticle(id) {
    const res = await fetch(`${API_BASE_URL}/admin/articles/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete article');
    return data;
  },

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload image');
    // Return the full URL for frontend usage
    return `http://localhost:5001${data.url}`;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE_URL}/admin/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    // Update stored user details
    localStorage.setItem('news_portal_user', JSON.stringify(data));
    return data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${API_BASE_URL}/admin/profile/change-password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  }
};
