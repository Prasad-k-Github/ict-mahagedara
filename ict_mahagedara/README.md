# 🎓 ICT Mahagedara - Premium AI Learning Agent

A stunning, premium AI-powered learning platform with beautiful Vanta.js NET animations.

## ✨ Features

### 🌟 Premium Landing Page
- **Animated 3D Background**: Vanta.js NET effect with particle network animation
- **Modern Hero Section**: Eye-catching gradient text with smooth animations
- **Feature Cards**: Glassmorphism design with hover effects
- **Responsive Design**: Works perfectly on all devices
- **Call-to-Action**: Clear paths for user engagement

### 💬 AI Chat Interface
- **Gemini-Inspired Design**: Clean, modern chat interface
- **Session & Stateless Modes**: Flexible conversation modes
- **Markdown Support**: Beautiful code highlighting and formatting
- **Suggested Prompts**: Quick-start conversation starters
- **Real-time Responses**: Smooth, animated message delivery

### 🔐 Authentication
- **Premium Login/Register**: Beautiful forms with Vanta.js background
- **Password Strength Indicator**: Real-time password validation
- **Secure Token Storage**: JWT-based authentication
- **User Profiles**: Personalized experience

## 🎨 Design Elements

### Color Palette
- Primary: Purple (`#667eea`) to Pink (`#764ba2`) gradients
- Accent: Orange (`#ff6b35`) highlights
- Background: Deep dark (`#0a0a1a`) with animated particles
- Text: Clean whites and grays for readability

### Animations
- ✅ Vanta.js NET 3D particle network
- ✅ Gradient animations
- ✅ Smooth hover effects
- ✅ Fade-in transitions
- ✅ Loading indicators
- ✅ Glassmorphism effects

### Typography
- **Primary Font**: Inter (300-900 weights)
- **Display Font**: Space Grotesk (400-700)
- Clean, modern, highly readable

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
ict_mahagedara/
├── src/
│   ├── pages/
│   │   ├── Home.tsx        # Premium landing page with Vanta.js
│   │   ├── Chat.tsx        # AI chat interface
│   │   ├── Login.tsx       # Authentication pages
│   │   └── Profile.tsx     # User profile
│   ├── components/         # Reusable components
│   ├── services/
│   │   └── api.ts         # API integration
│   ├── utils/
│   │   └── markdown.ts    # Markdown parsing
│   ├── types/
│   │   └── index.ts       # TypeScript types
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles + animations
├── public/
│   └── images/
├── index.html             # HTML with Vanta.js scripts
└── package.json
```

## 🎯 Key Pages

### Home (`/`)
Premium landing page featuring:
- Animated 3D particle background
- Hero section with gradient text
- Feature showcase with glassmorphism cards
- Statistics display
- Call-to-action sections

### Chat (`/chat`)
AI-powered chat interface with:
- Vanta.js animated background
- Session and stateless chat modes
- Markdown rendering with syntax highlighting
- Suggested conversation starters
- Real-time message streaming

### Login/Register (`/login`)
Beautiful authentication with:
- Vanta.js background animation
- Tab-based login/register forms
- Password strength indicator
- Form validation
- Smooth transitions

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Vanta.js (Three.js)
- **Routing**: React Router
- **Syntax Highlighting**: Highlight.js
- **Markdown**: Custom parser with HTML support
- **Build Tool**: Vite

## 🎨 Premium Design Features

### Glassmorphism
```css
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### Gradient Animations
```css
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

### Glow Effects
```css
.glow {
  box-shadow: 
    0 0 20px rgba(102, 126, 234, 0.6),
    0 0 40px rgba(118, 75, 162, 0.4);
}
```

## 🌐 Vanta.js Configuration

```javascript
VANTA.NET({
  el: element,
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  scaleMobile: 1.00,
  color: 0x667eea,        // Purple
  backgroundColor: 0x0a0a1a, // Deep dark
  points: 10.00,
  maxDistance: 20.00,
  spacing: 15.00
})
```

## 📱 Responsive Design

- **Mobile**: Optimized for small screens
- **Tablet**: Adjusted layouts and spacing
- **Desktop**: Full premium experience
- **Large Screens**: Maximum visual impact

## 🔥 Performance

- Vanta.js animations optimized for 60fps
- Lazy loading for better initial load
- Code splitting with React Router
- Optimized images and assets

## 📄 License

© 2025 ICT Mahagedara. Empowering education through AI.

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Vanta.js**
