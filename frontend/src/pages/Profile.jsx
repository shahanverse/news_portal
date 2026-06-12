import  { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { User, Mail, ImageIcon, FileText, Lock, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

export default function Profile({ user, setUser, setCurrentView }) {
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status indicators
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState(null);
  
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const prof = await api.getProfile();
        setName(prof.name);
        setEmail(prof.email);
        setAvatar(prof.avatar || '');
        setBio(prof.bio || '');
      } catch (err) {
        console.error('Failed to load profile details', err);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError(null);

    try {
      const updatedUser = await api.updateProfile({
        name,
        email,
        avatar,
        bio
      });
      setUser(updatedUser);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setProfileError(err.message || 'Failed to update profile information.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    setPwSuccess(false);
    setPwError(null);

    try {
      await api.changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setPwError(err.message || 'Failed to change password. Ensure old password is correct.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-150 dark:border-slate-800 pb-5">
        <h1 className="font-display font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
          Admin Account Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Update your public author profile biography, change passwords, or modify credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Profile info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User className="h-5 w-5 text-indigo-500" />
            <span>Admin Profile Details</span>
          </h2>

          {profileSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Profile information updated successfully!</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Avatar Image URL</label>
              <div className="relative">
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="Paste Unsplash or external photo link..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <ImageIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
              {avatar && (
                <div className="mt-3">
                  <img src={avatar} alt="Avatar Preview" className="h-14 w-14 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Biographical Bio</label>
              <div className="relative">
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell readers about yourself, experiences, or specialties..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed"
                />
                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow cursor-pointer disabled:opacity-50"
            >
              {profileLoading ? 'Updating Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Side: Security info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 space-y-6 h-fit">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="h-5 w-5 text-indigo-500" />
            <span>Update Password</span>
          </h2>

          {pwSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Password updated successfully!</span>
            </div>
          )}

          {pwError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center space-x-2 text-rose-700 dark:text-rose-400 text-xs">
              <ShieldAlert className="h-4.5 w-4.5" />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors shadow cursor-pointer disabled:opacity-50"
            >
              {pwLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
