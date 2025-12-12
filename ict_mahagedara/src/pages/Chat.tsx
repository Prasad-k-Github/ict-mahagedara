import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { chatApi, authApi } from '../services/api';
import { parseMarkdown, highlightCode } from '../utils/markdown';
import type { Message, User } from '../types';
import 'highlight.js/styles/github-dark.css';

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const suggestedPrompts = [
    "Explain a concept in simple terms",
    "Help me solve a math problem",
    "Teach me about science",
    "Practice English conversation"
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    scrollToBottom();
    highlightCode();
  }, [messages]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    addMessage('user', userMessage);
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(sessionId, userMessage, 'session');
      
      if (response.session_id) {
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

  const handleSuggestedPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden text-white">
      {/* Vanta NET Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0"></div>

      {/* Blur Overlay for Content */}
      <div className="fixed inset-0 z-0 backdrop-blur-sm bg-black/10"></div>

      {/* Gemini-style Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-7 h-7 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-xs">🇱🇰</span>
            </div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-white via-yellow-200 to-red-300 bg-clip-text text-transparent drop-shadow-lg group-hover:from-yellow-200 group-hover:via-white group-hover:to-yellow-300 transition-all duration-300">
              ICT Mahagedara
            </h1>
          </Link>
          
          <div className="flex items-center gap-2 mt-2">
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-red-900/30 to-yellow-900/30 border border-red-500/30 hover:border-yellow-500/50 hover:bg-gradient-to-r hover:from-red-900/40 hover:to-yellow-900/40 transition-all duration-300 group backdrop-blur-sm"
                title={user.first_name}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-medium text-sm group-hover:scale-110 transition-transform duration-300">
                  {user.first_name.charAt(0)}
                </div>
                <span className="text-white font-medium text-sm bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:to-white transition-all duration-300">
                  {user.first_name}
                </span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="fixed top-16 bottom-0 left-0 right-0 overflow-y-auto z-10">
        <div className="w-full max-w-3xl mx-auto px-6 pb-32 pt-4">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center">
              <div className="mb-12">
                <h2 className="text-5xl font-semibold mb-4 bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
                  Hello, {user?.first_name || 'there'}
                </h2>
                <p className="text-xl text-gray-300">How can I help you today?</p>
              </div>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="p-4 text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 group backdrop-blur-sm"
                  >
                    <p className="text-white">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="py-8 space-y-8">
              {messages.map((message, index) => (
                <div key={index} className="animate-fade-in">
                  {message.role === 'user' ? (
                    /* User Message */
                    <div className="flex gap-4 items-start justify-end">
                      <div className="flex-1 pt-1 text-right">
                        <div className="inline-block max-w-[80%] bg-red-900/40 backdrop-blur-md border border-red-500/30 text-white px-5 py-3 rounded-2xl text-left">
                          <p className="text-lg">{message.content}</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user?.first_name.charAt(0) || 'U'}
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message */
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 via-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="inline-block max-w-[90%] bg-red-900/40 backdrop-blur-md border border-red-500/30 text-white px-5 py-3 rounded-2xl">
                          {message.isMarkdown ? (
                            <div
                              className="prose prose-lg max-w-none prose-headings:text-white prose-headings:font-semibold prose-p:text-white prose-p:leading-relaxed prose-a:text-yellow-400 prose-strong:text-white prose-code:text-sm prose-code:bg-red-900/50 prose-code:text-white prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white"
                              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                            />
                          ) : (
                            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-4 items-start animate-fade-in">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce animate-delay-100"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce animate-delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Fixed Input at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/80 via-red-900/60 to-transparent py-6 z-20 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-6">
            <form onSubmit={handleSubmit} className="relative">
              <div className="flex items-center gap-3 bg-red-800/40 rounded-full border border-red-500/30 shadow-lg hover:shadow-xl hover:border-yellow-500/50 transition-all duration-200 px-6 py-4 backdrop-blur-md">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-400 text-base disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  aria-label="Send message"
                  className="p-2 rounded-full bg-gradient-to-r from-red-600 to-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
            <p className="text-xs text-gray-400 text-center mt-3">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
