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
      addMessage('assistant', 'Hello! I\'m Prasad K. Gamage, your AI learning assistant. How can I help you today?');
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
    <div className="h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-5">
      <div className="w-full max-w-4xl h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white px-5 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🇱🇰 Prasad K. Gamage - AI Tutor</h1>
          <div className="flex items-center gap-4 text-sm">
            {user && <span className="opacity-90">Welcome, {user.first_name}!</span>}
            <Link
              to="/profile"
              className="px-4 py-1.5 bg-white/20 border border-white/30 rounded hover:bg-white/30 transition-all"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 bg-white/20 border border-white/30 rounded hover:bg-white/30 transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-gray-100 px-5 py-2.5 flex gap-2.5 border-b border-gray-300">
          <button
            onClick={() => handleModeChange('session')}
            className={`px-4 py-2 rounded font-medium transition-all ${
              currentMode === 'session'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-primary-500 hover:bg-gray-50'
            }`}
          >
            Session Mode
          </button>
          <button
            onClick={() => handleModeChange('stateless')}
            className={`px-4 py-2 rounded font-medium transition-all ${
              currentMode === 'stateless'
                ? 'bg-primary-500 text-white'
                : 'bg-white text-primary-500 hover:bg-gray-50'
            }`}
          >
            Stateless Mode
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4 custom-scrollbar">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-2.5 animate-slide-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.isMarkdown ? (
                  <div
                    className="message-content"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-2.5">
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce animate-delay-100"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce animate-delay-200"></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-5 border-t border-gray-200 flex gap-2.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 transition-colors disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
