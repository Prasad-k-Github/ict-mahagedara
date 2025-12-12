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
      <div className="min-h-screen gradient-mesh flex items-center justify-center">
        <div className="glass p-8 rounded-3xl shadow-premium-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-gray-800 text-xl font-semibold">Loading your profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-mesh p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Premium Page Header */}
        <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-600 text-sm font-medium">Manage your account settings</p>
            </div>
          </div>
          <Link
            to="/"
            className="group relative px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-premium transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
          >
            <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20"></div>
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Chat
            </span>
          </Link>
        </div>

        {/* Premium Alert Messages */}
        {successMessage && (
          <div className="glass border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-2xl mb-6 flex items-start gap-3 animate-slide-in shadow-premium">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="glass border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-2xl mb-6 flex items-start gap-3 animate-slide-in shadow-premium">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Premium Action Buttons */}
        <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveSection('view')}
              className={`group relative overflow-hidden p-6 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 ${
                activeSection === 'view'
                  ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-premium'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-lg border-2 border-gray-200'
              }`}
            >
              <div className={`absolute inset-0 shimmer opacity-0 group-hover:opacity-20`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>View Profile</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('edit')}
              className={`group relative overflow-hidden p-6 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 ${
                activeSection === 'edit'
                  ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white shadow-premium'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-lg border-2 border-gray-200'
              }`}
            >
              <div className={`absolute inset-0 shimmer opacity-0 group-hover:opacity-20`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Update Profile</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('password')}
              className={`group relative overflow-hidden p-6 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 ${
                activeSection === 'password'
                  ? 'bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-premium'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-lg border-2 border-gray-200'
              }`}
            >
              <div className={`absolute inset-0 shimmer opacity-0 group-hover:opacity-20`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Change Password</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection('delete')}
              className={`group relative overflow-hidden p-6 rounded-2xl font-semibold transition-all duration-300 hover:-translate-y-1 ${
                activeSection === 'delete'
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-premium'
                  : 'bg-white/50 text-gray-700 hover:bg-white hover:shadow-lg border-2 border-gray-200'
              }`}
            >
              <div className={`absolute inset-0 shimmer opacity-0 group-hover:opacity-20`}></div>
              <div className="relative z-10 flex flex-col items-center gap-3">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Account</span>
              </div>
            </button>
          </div>
        </div>

        {/* View Profile Section */}
        {activeSection === 'view' && (
          <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Profile Information</h2>
            </div>
            {user && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">First Name</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                      {user.first_name}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Last Name</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                      {user.last_name}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">Email Address</label>
                  <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number</label>
                  <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                    {user.phone_number}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Grade</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                      Grade {user.grade_level}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Language</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium capitalize">
                      {user.language}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Birthday</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                      {formatDate(user.birthday)}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Gender</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium capitalize">
                      {user.gender}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Account Status</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center">
                      <span className={`px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                        user.is_active ? 'bg-gradient-to-r from-green-400 to-green-500 text-white' : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                        {user.is_active ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-800 text-sm">Member Since</label>
                    <div className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 font-medium">
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Profile Section */}
        {activeSection === 'edit' && (
          <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Edit Profile</h2>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-first-name" className="block mb-2 font-semibold text-gray-800 text-sm">First Name</label>
                  <input
                    id="edit-first-name"
                    type="text"
                    value={editData.first_name}
                    onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  />
                </div>
                <div>
                  <label htmlFor="edit-last-name" className="block mb-2 font-semibold text-gray-800 text-sm">Last Name</label>
                  <input
                    id="edit-last-name"
                    type="text"
                    value={editData.last_name}
                    onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-phone-number" className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number</label>
                <input
                  id="edit-phone-number"
                  type="tel"
                  value={editData.phone_number}
                  onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-grade" className="block mb-2 font-semibold text-gray-800 text-sm">Grade</label>
                  <select
                    id="edit-grade"
                    value={editData.grade_level}
                    onChange={(e) => setEditData({ ...editData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-language" className="block mb-2 font-semibold text-gray-800 text-sm">Language</label>
                  <select
                    id="edit-language"
                    value={editData.language}
                    onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    <option value="sinhala">Sinhala</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-birthday" className="block mb-2 font-semibold text-gray-800 text-sm">Birthday</label>
                  <input
                    id="edit-birthday"
                    type="date"
                    value={editData.birthday}
                    onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="edit-gender" className="block mb-2 font-semibold text-gray-800 text-sm">Gender</label>
                  <select
                    id="edit-gender"
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="relative group w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-premium transition-all duration-300 hover:-translate-y-0.5 overflow-hidden mt-2"
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20"></div>
                <span className="relative z-10">Update Profile</span>
              </button>
            </form>
          </div>
        )}

        {/* Change Password Section */}
        {activeSection === 'password' && (
          <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-200">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Change Password</h2>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label htmlFor="current-password" className="block mb-2 font-semibold text-gray-800 text-sm">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block mb-2 font-semibold text-gray-800 text-sm">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="block mb-2 font-semibold text-gray-800 text-sm">Confirm New Password</label>
                <input
                  id="confirm-new-password"
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="relative group w-full py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:shadow-premium transition-all duration-300 hover:-translate-y-0.5 overflow-hidden mt-2"
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20"></div>
                <span className="relative z-10">Change Password</span>
              </button>
            </form>
          </div>
        )}

        {/* Delete Account Section */}
        {activeSection === 'delete' && (
          <div className="glass rounded-3xl shadow-premium-lg p-6 md:p-8 mb-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-red-300">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-red-600">Danger Zone</h2>
            </div>

            {/* Danger Zone */}
            <div className="border-2 border-red-300 bg-red-50/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-red-600 font-bold text-lg">Danger Zone</h3>
              </div>
              <p className="text-gray-700 mb-5 text-sm leading-relaxed">
                Once you delete your account, there is no going back. All your data, sessions, and messages will be permanently removed. Please be certain before proceeding.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:-translate-y-0.5"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
