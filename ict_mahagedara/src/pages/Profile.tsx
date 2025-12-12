import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { profileApi } from '../services/api';
import type { User } from '../types';

export default function Profile() {
  const navigate = useNavigate();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
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

  useEffect(() => {
    let mounted = true;
    
    const initVanta = () => {
      if (!mounted) return;
      
      const THREE = (window as any).THREE;
      const VANTA = (window as any).VANTA;
      
      if (THREE && VANTA && VANTA.NET && vantaRef.current && !vantaEffect.current) {
        try {
          vantaEffect.current = VANTA.NET({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xff6b35,
            backgroundColor: 0x1a0a0a,
            points: 10.00,
            maxDistance: 20.00,
            spacing: 15.00
          });
        } catch (error) {
          console.error('Vanta NET initialization error:', error);
        }
      } else if (mounted) {
        setTimeout(initVanta, 100);
      }
    };
    
    initVanta();
    
    return () => {
      mounted = false;
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (error) {
          console.error('Vanta NET cleanup error:', error);
        }
        vantaEffect.current = null;
      }
    };
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white text-lg font-medium">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden text-white">
      {/* Vanta NET Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0"></div>

      {/* Blur Overlay for Content */}
      <div className="fixed inset-0 z-0 backdrop-blur-sm bg-black/10"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-white via-yellow-200 to-red-300 bg-clip-text text-transparent drop-shadow-lg">Profile Settings</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to="/chat"
              className="text-sm text-gray-200 hover:text-white font-medium flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Chat
            </Link>
            
            <button
              onClick={() => {
                localStorage.removeItem('access_token');
                navigate('/login');
              }}
              className="text-sm text-red-300 hover:text-red-200 font-medium flex items-center gap-2 px-4 py-2 rounded-full bg-red-900/30 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 transition-all backdrop-blur-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 min-h-screen relative z-10">
        <div className="max-w-4xl mx-auto px-6">
          {/* Alerts */}
          {successMessage && (
            <div className="bg-green-900/40 backdrop-blur-md border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex gap-2 bg-red-900/30 backdrop-blur-md rounded-full p-1 mb-8 border border-red-500/20">
            <button
              onClick={() => setActiveSection('view')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeSection === 'view'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              View
            </button>
            <button
              onClick={() => setActiveSection('edit')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeSection === 'edit'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveSection('password')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeSection === 'password'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setActiveSection('delete')}
              className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeSection === 'delete'
                  ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Delete
            </button>
          </div>

          {/* View Profile Section */}
          {activeSection === 'view' && user && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-4">Profile Information</h2>
            
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">First Name</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                    {user.first_name}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Last Name</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                    {user.last_name}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-yellow-300 text-sm">Email</label>
                <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-yellow-300 text-sm">Phone Number</label>
                <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                  {user.phone_number}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Grade</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                    Grade {user.grade_level}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Language</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white capitalize backdrop-blur-sm">
                    {user.language}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Birthday</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                    {formatDate(user.birthday)}
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Gender</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white capitalize backdrop-blur-sm">
                    {user.gender}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Status</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 backdrop-blur-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.is_active ? 'bg-green-500/30 text-green-200 border border-green-500/50' : 'bg-red-500/30 text-red-200 border border-red-500/50'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-medium text-yellow-300 text-sm">Member Since</label>
                  <div className="px-4 py-3 border border-red-500/20 rounded-xl bg-red-900/30 text-white backdrop-blur-sm">
                    {formatDate(user.created_at)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Section */}
          {activeSection === 'edit' && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-4">Edit Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-first-name" className="block mb-2 font-medium text-yellow-300 text-sm">First Name</label>
                    <input
                      id="edit-first-name"
                      type="text"
                      value={editData.first_name}
                      onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-last-name" className="block mb-2 font-medium text-yellow-300 text-sm">Last Name</label>
                    <input
                      id="edit-last-name"
                      type="text"
                      value={editData.last_name}
                      onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="edit-phone-number" className="block mb-2 font-medium text-yellow-300 text-sm">Phone Number</label>
                  <input
                    id="edit-phone-number"
                    type="tel"
                    value={editData.phone_number}
                    onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                    className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-grade" className="block mb-2 font-medium text-yellow-300 text-sm">Grade</label>
                    <select
                      id="edit-grade"
                      value={editData.grade_level}
                      onChange={(e) => setEditData({ ...editData, grade_level: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                        <option key={grade} value={grade} className="bg-gray-900">Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-language" className="block mb-2 font-medium text-yellow-300 text-sm">Language</label>
                    <select
                      id="edit-language"
                      value={editData.language}
                      onChange={(e) => setEditData({ ...editData, language: e.target.value })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    >
                      <option value="sinhala" className="bg-gray-900">Sinhala</option>
                      <option value="english" className="bg-gray-900">English</option>
                      <option value="tamil" className="bg-gray-900">Tamil</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="edit-birthday" className="block mb-2 font-medium text-yellow-300 text-sm">Birthday</label>
                    <input
                      id="edit-birthday"
                      type="date"
                      value={editData.birthday}
                      onChange={(e) => setEditData({ ...editData, birthday: e.target.value })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-gender" className="block mb-2 font-medium text-yellow-300 text-sm">Gender</label>
                    <select
                      id="edit-gender"
                      value={editData.gender}
                      onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    >
                      <option value="male" className="bg-gray-900">Male</option>
                      <option value="female" className="bg-gray-900">Female</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg hover:shadow-yellow-500/30 mt-2"
                >
                  Update Profile
                </button>
              </form>
            </div>
          )}

          {/* Change Password Section */}
          {activeSection === 'password' && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent mb-4">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block mb-2 font-medium text-yellow-300 text-sm">Current Password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="new-password" className="block mb-2 font-medium text-yellow-300 text-sm">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="confirm-new-password" className="block mb-2 font-medium text-yellow-300 text-sm">Confirm New Password</label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg hover:shadow-yellow-500/30 mt-2"
                >
                  Change Password
                </button>
              </form>
            </div>
          )}

          {/* Delete Account Section */}
          {activeSection === 'delete' && (
            <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-red-300 to-red-500 bg-clip-text text-transparent mb-4">Delete Account</h2>
              <div className="bg-red-900/50 border border-red-500/40 rounded-xl p-4 mb-4 backdrop-blur-sm">
                <p className="text-sm text-red-200 leading-relaxed">
                  Once you delete your account, there is no going back. All your data, sessions, and messages will be permanently removed. Please be certain before proceeding.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg hover:shadow-red-500/30 hover:from-red-700 hover:to-red-800"
              >
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
