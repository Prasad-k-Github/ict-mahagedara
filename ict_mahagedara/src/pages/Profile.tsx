import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileApi } from '../services/api';
import type { User } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeSection, setActiveSection] = useState<'view' | 'edit' | 'password' | 'delete'>('view');

  // Edit profile state
  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    grade_level: 1,
    language: '',
    birthday: '',
    gender: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await loadProfile();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await profileApi.getProfile();
      setUser(userData);
      
      setEditData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        grade_level: userData.grade_level,
        language: userData.language,
        birthday: userData.birthday,
        gender: userData.gender,
      });
    } catch (error) {
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await profileApi.updateProfile(editData);
      setUser(updatedUser);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      await profileApi.changePassword(passwordData.current_password, passwordData.new_password, passwordData.confirm_password);
      showSuccess('Password changed successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
      return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      return;
    }

    try {
      await profileApi.deleteAccount();
      localStorage.removeItem('access_token');
      navigate('/login');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-700 text-lg font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Profile Settings</h1>
          </div>
          
          <Link
            to="/"
            className="text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Chat
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Alerts */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex gap-2 bg-gray-100 rounded-full p-1 mb-8">
          <button
            onClick={() => setActiveSection('view')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeSection === 'view'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            View
          </button>
          <button
            onClick={() => setActiveSection('edit')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeSection === 'edit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setActiveSection('password')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeSection === 'password'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setActiveSection('delete')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeSection === 'delete'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Delete
          </button>
        </div>

        {/* View Profile Section */}
        {activeSection === 'view' && user && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">First Name</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                  {user.first_name}
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Last Name</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                  {user.last_name}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Email</label>
              <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700 text-sm">Phone Number</label>
              <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                {user.phone_number}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Grade</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                  Grade {user.grade_level}
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Language</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 capitalize">
                  {user.language}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Birthday</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                  {formatDate(user.birthday)}
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Gender</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 capitalize">
                  {user.gender}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Status</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">Member Since</label>
                <div className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900">
                  {formatDate(user.created_at)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Section */}
        {activeSection === 'edit' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-first-name" className="block mb-2 font-medium text-gray-700 text-sm">First Name</label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="edit-last-name" className="block mb-2 font-medium text-gray-700 text-sm">Last Name</label>
                  <input
                    id="edit-last-name"
                    type="text"
                    value={editData.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-phone-number" className="block mb-2 font-medium text-gray-700 text-sm">Phone Number</label>
                <input
                  id="edit-phone-number"
                  type="tel"
                  value={editData.phone_number}
                  onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-grade" className="block mb-2 font-medium text-gray-700 text-sm">Grade</label>
                  <select
                    id="edit-grade"
                    value={editData.grade_level}
                    onChange={(e) => setEditData({ ...editData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-language" className="block mb-2 font-medium text-gray-700 text-sm">Language</label>
                  <select
                    id="edit-language"
                    value={editData.language}
                    onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all bg-white"
                  >
                    <option value="sinhala">Sinhala</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="edit-birthday" className="block mb-2 font-medium text-gray-700 text-sm">Birthday</label>
                  <input
                    id="edit-birthday"
                    type="date"
                    value={editData.birthday}
                    onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="edit-gender" className="block mb-2 font-medium text-gray-700 text-sm">Gender</label>
                  <select
                    id="edit-gender"
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg mt-2"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}

        {/* Change Password Section */}
        {activeSection === 'password' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block mb-2 font-medium text-gray-700 text-sm">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block mb-2 font-medium text-gray-700 text-sm">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block mb-2 font-medium text-gray-700 text-sm">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 hover:border-gray-400 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg mt-2"
              >
                Change Password
              </button>
            </form>
          </div>
        )}

        {/* Delete Account Section */}
        {activeSection === 'delete' && (
          <div className="bg-white border border-red-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Once you delete your account, there is no going back. All your data, sessions, and messages will be permanently removed. Please be certain before proceeding.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-3.5 bg-red-500 text-white rounded-full text-base font-semibold transition-all hover:bg-red-600 hover:shadow-lg"
            >
              Delete My Account
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
