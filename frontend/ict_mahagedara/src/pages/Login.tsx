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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white py-8 px-5 text-center">
          <h1 className="text-2xl font-bold mb-2">🇱🇰 Prasad K. Gamage</h1>
          <p className="text-sm opacity-90">Learning Assistant for Sri Lankan Students</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 border-b-2 border-gray-300">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              activeTab === 'login'
                ? 'bg-white text-primary-500 border-b-3 border-primary-500'
                : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-4 text-center font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-white text-primary-500 border-b-3 border-primary-500'
                : 'text-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-5 text-sm">
              {success}
            </div>
          )}

          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="mb-5">
                <label className="block mb-2 font-semibold text-gray-700 text-sm">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-lg text-base font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first-name" className="block mb-2 font-semibold text-gray-700 text-sm">First Name *</label>
                  <input
                    id="first-name"
                    type="text"
                    required
                    value={registerData.first_name}
                    onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block mb-2 font-semibold text-gray-700 text-sm">Last Name *</label>
                  <input
                    id="last-name"
                    type="text"
                    required
                    value={registerData.last_name}
                    onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="register-email" className="block mb-2 font-semibold text-gray-700 text-sm">Email *</label>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                />
              </div>

              <div>
                <label htmlFor="phone-number" className="block mb-2 font-semibold text-gray-700 text-sm">Phone Number *</label>
                <input
                  id="phone-number"
                  type="tel"
                  required
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  placeholder="07XXXXXXXX"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="block mb-2 font-semibold text-gray-700 text-sm">Password *</label>
                <input
                  id="register-password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                />
                {registerData.password && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full transition-all ${getStrengthColor()} ${getStrengthWidth()}`}></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{getStrengthText()}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block mb-2 font-semibold text-gray-700 text-sm">Confirm Password *</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                />
                {confirmPassword && (
                  <p className={`text-xs mt-1 ${registerData.password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {registerData.password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block mb-2 font-semibold text-gray-700 text-sm">Grade *</label>
                  <select
                    id="grade"
                    required
                    value={registerData.grade_level}
                    onChange={(e) => setRegisterData({ ...registerData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="language" className="block mb-2 font-semibold text-gray-700 text-sm">Language *</label>
                  <select
                    id="language"
                    required
                    value={registerData.language}
                    onChange={(e) => setRegisterData({ ...registerData, language: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  >
                    <option value="sinhala">Sinhala</option>
                    <option value="english">English</option>
                    <option value="tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="birthday" className="block mb-2 font-semibold text-gray-700 text-sm">Birthday *</label>
                  <input
                    id="birthday"
                    type="date"
                    required
                    value={registerData.birthday}
                    onChange={(e) => setRegisterData({ ...registerData, birthday: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block mb-2 font-semibold text-gray-700 text-sm">Gender *</label>
                  <select
                    id="gender"
                    required
                    value={registerData.gender}
                    onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base transition-colors focus:outline-none focus:border-primary-500"
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
                className="w-full py-4 bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-lg text-base font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
