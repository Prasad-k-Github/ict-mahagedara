import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/api';

export default function Home() {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await authApi.getCurrentUser();
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

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
      }
    };

    const loadVanta = () => {
      const THREE = (window as any).THREE;
      const VANTA = (window as any).VANTA;
      
      if (THREE && VANTA && VANTA.NET) {
        initVanta();
      } else {
        setTimeout(loadVanta, 100);
      }
    };

    loadVanta();

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Learning",
      description: "Personalized educational experience powered by advanced AI technology"
    },
    {
      icon: "💡",
      title: "Smart Assistance",
      description: "Get instant help with homework, concepts, and problem-solving"
    },
    {
      icon: "📚",
      title: "Comprehensive Topics",
      description: "Math, Science, English, and more - all in one place"
    },
    {
      icon: "🎯",
      title: "Adaptive Learning",
      description: "Content that adapts to your learning pace and style"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vanta Background */}
      <div ref={vantaRef} className="fixed inset-0 z-0" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <span className="text-2xl font-bold text-white">ICT Mahagedara</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to={isAuthenticated ? "/chat" : "/login"}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
                  Powered by Advanced AI
                </span>
              </div>
              
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Your Personal
                <span className="block mt-2 bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent animate-gradient">
                  AI Learning Agent
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed max-w-3xl mx-auto">
                Experience the future of education with our intelligent AI tutor. Get instant help, 
                personalized learning, and master any subject at your own pace.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? "/chat" : "/login"}
                  className="group px-8 py-4 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Start Learning Now</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#features"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-20">
              {[
                { value: "24/7", label: "Available" },
                { value: "100+", label: "Topics Covered" },
                { value: "Smart", label: "AI Responses" },
                { value: "Free", label: "To Start" }
              ].map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features Section */}
            <div id="features" className="scroll-mt-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Why Choose ICT Mahagedara?
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Experience cutting-edge AI technology designed to make learning easier and more effective
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-1"
                  >
                    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="mt-20 text-center p-12 bg-gradient-to-r from-red-600/20 to-yellow-600/20 backdrop-blur-sm rounded-3xl border border-white/10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Learning?
              </h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of students already learning smarter with our AI agent
              </p>
              <Link
                to={isAuthenticated ? "/chat" : "/login"}
                className="inline-block px-10 py-4 bg-gradient-to-r from-red-600 to-yellow-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-red-500/50 transition-all transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <p>&copy; 2025 ICT Mahagedara. Empowering education through AI.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
