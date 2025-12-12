import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileApi } from '../services/api';
import type { User, AccountStats } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AccountStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

      const statsData = await profileApi.getStats();
      setStats(statsData);
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
      await profileApi.changePassword(passwordData.current_password, passwordData.new_password);
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
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-5">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary-500">👤 My Profile</h1>
          <Link
            to="/"
            className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            ← Back to Chat
          </Link>
        </div>

        {/* Alert Messages */}
        {successMessage && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-5">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5">
            {errorMessage}
          </div>
        )}

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {/* Profile Information */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-primary-500 mb-5 pb-2.5 border-b-2 border-gray-100">
              Profile Information
            </h2>
            {user && (
              <div className="space-y-3">
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Full Name:</span>
                  <span className="text-gray-800 font-medium">{user.first_name} {user.last_name}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Email:</span>
                  <span className="text-gray-800 font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Phone:</span>
                  <span className="text-gray-800 font-medium">{user.phone_number}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Grade:</span>
                  <span className="text-gray-800 font-medium">Grade {user.grade_level}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Language:</span>
                  <span className="text-gray-800 font-medium capitalize">{user.language}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Birthday:</span>
                  <span className="text-gray-800 font-medium">{formatDate(user.birthday)}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Gender:</span>
                  <span className="text-gray-800 font-medium capitalize">{user.gender}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-semibold text-gray-600">Member Since:</span>
                  <span className="text-gray-800 font-medium">{formatDate(user.created_at)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Account Statistics */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-primary-500 mb-5 pb-2.5 border-b-2 border-gray-100">
              Account Statistics
            </h2>
            {stats && (
              <div className="space-y-2.5">
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-5 rounded-lg text-center">
                  <div className="text-4xl font-bold mb-1">{stats.total_sessions}</div>
                  <div className="text-sm opacity-90">Total Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-5 rounded-lg text-center">
                  <div className="text-4xl font-bold mb-1">{stats.total_messages}</div>
                  <div className="text-sm opacity-90">Messages Sent</div>
                </div>
                <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white p-5 rounded-lg text-center">
                  <div className="text-4xl font-bold mb-1">{stats.account_age_days}</div>
                  <div className="text-sm opacity-90">Days Active</div>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-primary-500 mb-5 pb-2.5 border-b-2 border-gray-100">
              Edit Profile
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-first-name" className="block mb-2 font-semibold text-gray-700 text-sm">First Name</label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-last-name" className="block mb-2 font-semibold text-gray-700 text-sm">Last Name</label>
                  <input
                    id="edit-last-name"
                    type="text"
                    value={editData.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-phone-number" className="block mb-2 font-semibold text-gray-700 text-sm">Phone Number</label>
                <input
                  id="edit-phone-number"
                  type="tel"
                  value={editData.phone_number}
                  onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-grade" className="block mb-2 font-semibold text-gray-700 text-sm">Grade</label>
                  <select
                    id="edit-grade"
                    value={editData.grade_level}
                    onChange={(e) => setEditData({ ...editData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-language" className="block mb-2 font-semibold text-gray-700 text-sm">Language</label>
                  <select
                    id="edit-language"
                    value={editData.language}
                    onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="sinhala">Sinhala</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-birthday" className="block mb-2 font-semibold text-gray-700 text-sm">Birthday</label>
                  <input
                    id="edit-birthday"
                    type="date"
                    value={editData.birthday}
                    onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="edit-gender" className="block mb-2 font-semibold text-gray-700 text-sm">Gender</label>
                  <select
                    id="edit-gender"
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Update Profile
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-bold text-primary-500 mb-5 pb-2.5 border-b-2 border-gray-100">
              Change Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="block mb-2 font-semibold text-gray-700 text-sm">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block mb-2 font-semibold text-gray-700 text-sm">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block mb-2 font-semibold text-gray-700 text-sm">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Change Password
              </button>
            </form>

            {/* Danger Zone */}
            <div className="mt-5 border-2 border-red-500 rounded-lg p-5">
              <h3 className="text-red-500 font-bold mb-2.5">Danger Zone</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
