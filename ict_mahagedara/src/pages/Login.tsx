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
      navigate('/chat');
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
      setTimeout(() => navigate('/chat'), 1500);
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
            backgroundColor: 0x1a0a0a,
            points: 10.00,
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

      {/* Blur Overlay for Content */}
      <div className="absolute inset-0 z-0 backdrop-blur-sm bg-black/10"></div>
      
      <div className="w-full max-w-7xl relative z-10 flex flex-col lg:flex-row gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="lg:pr-12">
            <div className="w-24 h-24 mx-auto lg:mx-0 mb-6 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center p-1 shadow-2xl">
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                <span className="text-4xl">🇱🇰</span>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              ICT Mahagedara
            </h1>
            <p className="text-xl text-gray-200 mb-6">AI Learning Assistant</p>
            <p className="text-gray-300 text-base mb-8">by Prasad K. Gamage</p>
            <div className="hidden lg:block space-y-4 text-gray-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">AI-Powered Learning</h3>
                  <p className="text-sm text-gray-300">Get personalized help with your studies</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Multiple Languages</h3>
                  <p className="text-sm text-gray-300">Learn in Sinhala, English, or Tamil</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">24/7 Available</h3>
                  <p className="text-sm text-gray-300">Study anytime, anywhere you want</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full lg:w-1/2">
          {/* Tabs */}
          <div className="flex gap-2 bg-red-900/30 backdrop-blur-md rounded-full p-1 mb-8 border border-red-500/20">
          <button
            onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => { setActiveTab('register'); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-900/40 backdrop-blur-md border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-900/40 backdrop-blur-md border border-green-500/30 text-green-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2 mb-6">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 shadow-lg">
            <div>
                <label className="block mb-2 font-medium text-yellow-300 text-sm">Email</label>
                <input
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-yellow-300 text-sm">Password</label>
                <input
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 bg-red-900/40 backdrop-blur-md border border-red-500/30 rounded-2xl p-6 shadow-lg">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="first-name" className="block mb-2 font-medium text-yellow-300 text-sm">First Name</label>
                <input
                  id="first-name"
                  type="text"
                  required
                  value={registerData.first_name}
                  onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="last-name" className="block mb-2 font-medium text-yellow-300 text-sm">Last Name</label>
                <input
                  id="last-name"
                  type="text"
                  required
                  value={registerData.last_name}
                  onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="phone-number" className="block mb-2 font-medium text-yellow-300 text-sm">Phone Number</label>
                <input
                  id="phone-number"
                  type="tel"
                  required
                  value={registerData.phone_number}
                  onChange={(e) => setRegisterData({ ...registerData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                  placeholder="07XXXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="register-email" className="block mb-2 font-medium text-yellow-300 text-sm">Email</label>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="register-password" className="block mb-2 font-medium text-yellow-300 text-sm">Password</label>
                <input
                  id="register-password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => {
                    setRegisterData({ ...registerData, password: e.target.value });
                    checkPasswordStrength(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block mb-2 font-medium text-yellow-300 text-sm">Confirm Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
            </div>

            {registerData.password && (
              <div>
                <div className="h-1.5 bg-red-900/50 rounded-full overflow-hidden backdrop-blur-sm">
                  <div className={`h-full transition-all ${getStrengthColor()} ${getStrengthWidth()}`}></div>
                </div>
                <p className="text-xs mt-1 text-gray-300">{getStrengthText()}</p>
              </div>
            )}

            {confirmPassword && (
              <p className={`text-xs flex items-center gap-1 ${registerData.password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                {registerData.password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="grade" className="block mb-2 font-medium text-yellow-300 text-sm">Grade</label>
                <select
                  id="grade"
                  required
                  value={registerData.grade_level}
                  onChange={(e) => setRegisterData({ ...registerData, grade_level: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                    <option key={grade} value={grade} className="bg-gray-900">Grade {grade}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="language" className="block mb-2 font-medium text-yellow-300 text-sm">Language</label>
                <select
                  id="language"
                  required
                  value={registerData.language}
                  onChange={(e) => setRegisterData({ ...registerData, language: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                >
                  <option value="sinhala" className="bg-gray-900">Sinhala</option>
                  <option value="english" className="bg-gray-900">English</option>
                  <option value="tamil" className="bg-gray-900">Tamil</option>
                </select>
              </div>
              <div>
                <label htmlFor="birthday" className="block mb-2 font-medium text-yellow-300 text-sm">Birthday</label>
                <input
                  id="birthday"
                  type="date"
                  required
                  value={registerData.birthday}
                  onChange={(e) => setRegisterData({ ...registerData, birthday: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label htmlFor="gender" className="block mb-2 font-medium text-yellow-300 text-sm">Gender</label>
                <select
                  id="gender"
                  required
                  value={registerData.gender}
                  onChange={(e) => setRegisterData({ ...registerData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-red-500/30 rounded-xl bg-red-900/30 text-white backdrop-blur-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 hover:border-red-500/50 transition-all"
                >
                  <option value="" className="bg-gray-900">Select</option>
                  <option value="male" className="bg-gray-900">Male</option>
                  <option value="female" className="bg-gray-900">Female</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-red-500 to-yellow-500 text-white rounded-full text-base font-semibold transition-all hover:shadow-lg hover:shadow-yellow-500/30 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
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

