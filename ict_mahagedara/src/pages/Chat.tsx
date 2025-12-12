import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chatApi, authApi } from '../services/api';
import { parseMarkdown, highlightCode } from '../utils/markdown';
import type { Message, User } from '../types';
import 'highlight.js/styles/github-dark.css';

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<'session' | 'stateless'>('session');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
    highlightCode();
  }, [messages]);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      await initSession();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  };

  const initSession = async () => {
    try {
      const { session_id } = await chatApi.createSession();
      setSessionId(session_id);
      setMessages([{
        role: 'assistant',
        content: 'Hello! I\'m Prasad K. Gamage, your AI learning assistant. How can I help you today?',
        isMarkdown: false
      }]);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      showError('Failed to initialize chat session');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string, isMarkdown = false) => {
    setMessages(prev => [...prev, { role, content, isMarkdown }]);
  };

  const showError = (message: string) => {
    addMessage('assistant', `❌ Error: ${message}`);
  };

  const handleModeChange = async (mode: 'session' | 'stateless') => {
    setCurrentMode(mode);
    setMessages([]);
    
    if (mode === 'session') {
      await initSession();
    } else {
      setSessionId(null);
      addMessage('assistant', 'Stateless mode activated. Each message will be independent.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(sessionId, userMessage, currentMode);
      
      if (currentMode === 'session' && response.session_id) {
        setSessionId(response.session_id);
      }
      
      addMessage('assistant', response.response, true);
    } catch (error) {
      console.error('Failed to send message:', error);
      showError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-6xl h-[90vh] glass rounded-3xl shadow-premium-lg flex flex-col overflow-hidden animate-slide-up">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 text-white px-6 py-5 flex justify-between items-center shadow-lg">
          <div className="absolute inset-0 shimmer opacity-20"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-glow">
              <span className="text-2xl">🇱🇰</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Prasad K. Gamage</h1>
              <p className="text-xs text-white/80 font-medium">Your AI Learning Assistant</p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-sm">
            {user && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="w-8 h-8 bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center font-semibold">
                  {user.first_name.charAt(0)}
                </div>
                <span className="font-medium">Welcome, {user.first_name}!</span>
              </div>
            )}
            <Link
              to="/profile"
              className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl hover:bg-white/25 hover:shadow-glow transition-all duration-300 font-medium"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/25 rounded-xl hover:bg-white/25 hover:shadow-glow transition-all duration-300 font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 flex gap-3 border-b border-gray-200/50 backdrop-blur-sm">
          <button
            onClick={() => handleModeChange('session')}
            className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentMode === 'session'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-premium transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-md'
            }`}
          >
            {currentMode === 'session' && (
              <div className="absolute inset-0 shimmer opacity-30 rounded-xl"></div>
            )}
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Session Mode
            </span>
          </button>
          <button
            onClick={() => handleModeChange('stateless')}
            className={`group relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentMode === 'stateless'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-premium transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-md'
            }`}
          >
            {currentMode === 'stateless' && (
              <div className="absolute inset-0 shimmer opacity-30 rounded-xl"></div>
            )}
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Stateless Mode
            </span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5 custom-scrollbar bg-gradient-to-b from-gray-50/30 to-transparent">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 animate-slide-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[75%] px-5 py-4 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                }`}
              >
                {message.isMarkdown ? (
                  <div
                    className="message-content prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-100">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-bounce animate-delay-100"></div>
                  <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-bounce animate-delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Premium Input */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                disabled={isLoading}
                className="w-full px-6 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all duration-300 disabled:bg-gray-50 disabled:text-gray-400 text-base shadow-sm hover:border-gray-300"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="relative group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-premium hover:shadow-premium-lg hover:-translate-y-0.5 disabled:transform-none overflow-hidden"
            >
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-20"></div>
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
