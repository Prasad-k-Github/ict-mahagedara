import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import type { LoginCredentials, RegisterData } from '../types';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
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

  // Initialize Vanta.js effect
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
            backgroundColor: 0x23153c,
            points: 8.00,
            maxDistance: 20.00,
            spacing: 15.00
          });
        } catch (error) {
          console.error('Vanta initialization error:', error);
        }
      } else if (mounted) {
        // Retry after a short delay if libraries aren't loaded yet
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
          console.error('Vanta cleanup error:', error);
        }
        vantaEffect.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Vanta.js animated background */}
      <div ref={vantaRef} className="absolute inset-0 z-0"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center p-1">
            <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
              <span className="text-3xl">🇱🇰</span>
            </div>
          </div>
          <h1 className="text-3xl font-semibold mb-2 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
            ICT Mahagedara
          </h1>
          <p className="text-gray-300 text-sm">AI Learning Assistant by Prasad K. Gamage</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-purple-800/50 rounded-full p-1 mb-8 backdrop-blur-sm">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 bg-purple-900/30 border border-purple-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-md">
            <div>
                <label className="block mb-2 font-medium text-gray-200 text-sm">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-200 text-sm">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 bg-purple-900/30 border border-purple-500/30 rounded-2xl p-6 shadow-lg backdrop-blur-md">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first-name" className="block mb-2 font-medium text-gray-200 text-sm">First Name</label>
                <input
                  id="first-name"
                  type="text"
                  required
                  value={registerData.first_name}
                  onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block mb-2 font-medium text-gray-200 text-sm">Last Name</label>
                <input
                  id="last-name"
                  type="text"
                  required
                  value={registerData.last_name}
                  onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-email" className="block mb-2 font-medium text-gray-200 text-sm">Email</label>
              <input
                id="register-email"
                type="email"
                required
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phone-number" className="block mb-2 font-medium text-gray-200 text-sm">Phone Number</label>
              <input
                id="phone-number"
                type="tel"
                required
                value={registerData.phone_number}
                onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                placeholder="07XXXXXXXX"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="block mb-2 font-medium text-gray-200 text-sm">Password</label>
              <input
                id="register-password"
                type="password"
                required
                value={registerData.password}
                onChange={(e) => {
                  setRegisterData({ ...registerData, password: e.target.value });
                  checkPasswordStrength(e.target.value);
                }}
                className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
              />
              {registerData.password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-purple-900/50 rounded-full overflow-hidden">
                    <div className={`h-full transition-all ${getStrengthColor()} ${getStrengthWidth()}`}></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-300">{getStrengthText()}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block mb-2 font-medium text-gray-200 text-sm">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
              />
              {confirmPassword && (
                <p className={`text-xs mt-1.5 flex items-center gap-1 ${registerData.password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                  {registerData.password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="grade" className="block mb-2 font-medium text-gray-200 text-sm">Grade</label>
                <select
                  id="grade"
                  required
                  value={registerData.grade_level}
                  onChange={(e) => setRegisterData({ ...registerData, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block mb-2 font-medium text-gray-200 text-sm">Language</label>
                <select
                  id="language"
                  required
                  value={registerData.language}
                  onChange={(e) => setRegisterData({ ...registerData, language: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                >
                  <option value="sinhala">Sinhala</option>
                  <option value="english">English</option>
                  <option value="tamil">Tamil</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="birthday" className="block mb-2 font-medium text-gray-200 text-sm">Birthday</label>
                <input
                  id="birthday"
                  type="date"
                  required
                  value={registerData.birthday}
                  onChange={(e) => setRegisterData({ ...registerData, birthday: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block mb-2 font-medium text-gray-200 text-sm">Gender</label>
                <select
                  id="gender"
                  required
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-purple-800/30 border border-purple-500/30 rounded-xl text-base text-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 hover:border-orange-400/50 transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

