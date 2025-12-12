import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import type { LoginCredentials, RegisterData } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login state
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  // Register state
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    grade_level: 1,
    language: 'sinhala',
    birthday: '',
    gender: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(loginData);
      localStorage.setItem('access_token', response.access_token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (registerData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Prepare data with confirm_password and capitalized values
      const dataToSend = {
        ...registerData,
        confirm_password: confirmPassword,
        gender: registerData.gender.charAt(0).toUpperCase() + registerData.gender.slice(1),
        language: registerData.language.charAt(0).toUpperCase() + registerData.language.slice(1),
      };
      
      const response = await authApi.register(dataToSend);
      setSuccess('Registration successful! Redirecting...');
      localStorage.setItem('access_token', response.access_token);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = () => {
    if (passwordStrength <= 2) return 'w-1/3';
    if (passwordStrength <= 4) return 'w-2/3';
    return 'w-full';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak password';
    if (passwordStrength <= 4) return 'Medium password';
    return 'Strong password';
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 md:p-6">
      <div className="glass rounded-3xl shadow-premium-lg w-full max-w-md overflow-hidden animate-slide-up">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-600 text-white py-12 px-6 text-center overflow-hidden">
          <div className="absolute inset-0 shimmer opacity-20"></div>
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 blur-3xl"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/30 shadow-glow animate-float">
              <span className="text-4xl">🇱🇰</span>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">Prasad K. Gamage</h1>
            <p className="text-sm text-white/90 font-medium">AI Learning Assistant for Sri Lankan Students</p>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="flex bg-gray-50/80 backdrop-blur-sm">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            className={`relative flex-1 py-5 text-center font-semibold transition-all duration-300 ${
              activeTab === 'login'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            {activeTab === 'login' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full"></div>
            )}
            <span className="relative z-10">Login</span>
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`relative flex-1 py-5 text-center font-semibold transition-all duration-300 ${
              activeTab === 'register'
                ? 'bg-white text-primary-600 shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
            }`}
          >
            {activeTab === 'register' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-full"></div>
            )}
            <span className="relative z-10">Register</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 bg-white">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-slide-in shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-5 py-4 rounded-xl mb-6 text-sm flex items-start gap-3 animate-slide-in shadow-sm">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-800 text-sm">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                    placeholder="your.email@example.com"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-800 text-sm">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                    placeholder="Enter your password"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative group w-full py-4 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden shadow-md"
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-30"></div>
                <span className="relative z-10">{loading ? 'Logging in...' : 'Login to Continue'}</span>
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="block mb-2 font-semibold text-gray-800 text-sm">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={registerData.first_name}
                    onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block mb-2 font-semibold text-gray-800 text-sm">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={registerData.last_name}
                    onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block mb-2 font-semibold text-gray-800 text-sm">Email *</label>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                />
              </div>

              <div>
                <label htmlFor="phone-number" className="block mb-2 font-semibold text-gray-800 text-sm">Phone Number *</label>
                <input
                  id="phone-number"
                  type="tel"
                  required
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block mb-2 font-semibold text-gray-800 text-sm">Password *</label>
                <input
                  id="register-password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                />
                {registerData.password && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${getStrengthColor()} ${getStrengthWidth()}`}></div>
                    </div>
                    <p className="text-xs mt-1.5 font-medium text-gray-600">{getStrengthText()}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-2 font-semibold text-gray-800 text-sm">Confirm Password *</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300"
                />
                {confirmPassword && (
                  <p className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${registerData.password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {registerData.password === confirmPassword ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block mb-2 font-semibold text-gray-800 text-sm">Grade *</label>
                  <select
                    id="grade"
                    required
                    value={registerData.grade_level}
                    onChange={(e) => setRegisterData({ ...registerData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="language" className="block mb-2 font-semibold text-gray-800 text-sm">Language *</label>
                  <select
                    id="language"
                    required
                    value={registerData.language}
                    onChange={(e) => setRegisterData({ ...registerData, language: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    <option value="sinhala">Sinhala</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthday" className="block mb-2 font-semibold text-gray-800 text-sm">Birthday *</label>
                  <input
                    id="birthday"
                    type="date"
                    required
                    value={registerData.birthday}
                    onChange={(e) => setRegisterData({ ...registerData, birthday: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block mb-2 font-semibold text-gray-800 text-sm">Gender *</label>
                  <select
                    id="gender"
                    required
                    value={registerData.gender}
                    onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base transition-all duration-300 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 hover:border-gray-300 bg-white"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative group w-full py-4 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 text-white rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-premium hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none overflow-hidden shadow-md mt-6"
              >
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-30"></div>
                <span className="relative z-10">{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
