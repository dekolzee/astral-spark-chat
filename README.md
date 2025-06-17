
# 🚀 AstralChat - AI-Powered Chatbot Platform

A production-ready, full-stack AI-powered chatbot platform with stunning visuals, advanced features, and modern architecture.

![AstralChat Preview](https://via.placeholder.com/1200x600/1a1a2e/7c3aed?text=AstralChat+-+AI+Conversations)

## ✨ Features

### 🎨 **Stunning Visual Design**
- **Futuristic Cyber Theme**: Electric purples, teals, and neon accents
- **Neumorphic UI Components**: Soft shadows and elevated surfaces
- **Smooth Animations**: Framer Motion powered micro-interactions
- **Glassmorphism Effects**: Translucent overlays with backdrop blur
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **PWA Ready**: Installable progressive web app

### 💬 **Advanced Chat Features**
- **Multi-Session Management**: Organize conversations in separate threads
- **Real-time Streaming**: WebSocket-ready for live AI responses
- **Typewriter Effects**: Animated text rendering for AI messages
- **File Upload System**: Drag-and-drop with progress indicators
- **Attachment Preview**: Inline image and file previews
- **Message Persistence**: Local storage with session management

### 🎨 **Customization**
- **Dynamic Theme Editor**: Real-time color and font customization
- **Dark/Light Mode**: Toggle between themes with persistence
- **Color Presets**: Pre-configured beautiful color schemes
- **Font Options**: Inter and Orbitron (cyber) typefaces
- **Custom CSS Properties**: Extensible theming system

### 🔧 **Technical Excellence**
- **TypeScript**: Full type safety and IntelliSense
- **React 18**: Latest React features with Suspense
- **Tailwind CSS**: Utility-first styling with custom design system
- **shadcn/ui**: High-quality, accessible components
- **Framer Motion**: Smooth animations and transitions
- **TensorFlow.js Ready**: Client-side AI processing capabilities
- **Modern Build Setup**: Vite for fast development and builds

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Framer Motion** for animations
- **React Dropzone** for file uploads
- **TensorFlow.js** for client-side AI
- **Lucide React** for icons

### Backend Ready
- **WebSocket Integration** prepared
- **File Upload API** endpoints ready
- **Authentication System** architecture planned
- **Real-time Streaming** infrastructure prepared

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser with ES2022 support

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd astral-spark-chat

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:8080` to see the application.

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📱 PWA Features

AstralChat is built as a Progressive Web App with:

- **Offline Capability**: Core features work without internet
- **Installable**: Add to home screen on mobile devices
- **App-like Experience**: Full-screen mode with native feel
- **Push Notifications**: Ready for real-time updates
- **Background Sync**: Queue messages when offline

## 🎨 Theming System

### Custom CSS Properties

The application uses CSS custom properties for theming:

```css
:root {
  --cyber-purple: 263 70% 50%;
  --cyber-teal: 180 62% 55%;
  --cyber-pink: 315 100% 75%;
  --background: 220 23% 5%;
  --foreground: 220 14% 96%;
}
```

### Theme Context

Use the theme context to customize appearance:

```typescript
import { useTheme } from './contexts/ThemeContext';

const { theme, updateTheme } = useTheme();

// Update colors
updateTheme({
  colors: {
    primary: '120 100% 50%', // Neon green
    secondary: '180 100% 50%', // Cyan
  }
});

// Toggle mode
updateTheme({ mode: 'light' });
```

## 🔧 Component Architecture

### Core Components

- **`ChatWindow`**: Main chat interface with message history
- **`FileUploader`**: Drag-and-drop file upload with previews
- **`ThemeSettings`**: Real-time theme customization panel
- **`LoadingScreen`**: Animated splash screen with branding

### Context Providers

- **`ThemeProvider`**: Global theme management and persistence
- **`ChatProvider`**: Chat state management with local storage

### Utility Classes

```css
.gradient-primary { /* Primary gradient background */ }
.neumorphic { /* Soft 3D shadow effects */ }
.glass { /* Glassmorphism backdrop blur */ }
.glow { /* Neon glow effects */ }
.text-gradient { /* Gradient text colors */ }
```

## 🔌 API Integration

### WebSocket Ready

```typescript
// WebSocket connection setup
const ws = new WebSocket('ws://localhost:8000/ws/chat');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  // Handle streaming AI response
};
```

### File Upload Endpoint

```typescript
// Upload files to backend
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
};
```

## 🎯 Performance Optimizations

- **Code Splitting**: Lazy loading of route components
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching Strategy**: Service worker for offline functionality
- **Memory Management**: Proper cleanup of event listeners
- **Debounced Inputs**: Optimized user input handling

## 🔒 Security Features

- **XSS Protection**: Sanitized user inputs
- **CSRF Tokens**: Ready for backend integration
- **Content Security Policy**: Configured headers
- **File Upload Validation**: Type and size restrictions
- **Rate Limiting**: Ready for API protection

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px - Optimized touch interface
- **Tablet**: 768px - 1024px - Adapted layout
- **Desktop**: > 1024px - Full feature set
- **Large Desktop**: > 1400px - Spacious layout

### Touch Optimizations

- **Larger Touch Targets**: 44px minimum
- **Gesture Support**: Swipe navigation ready
- **Mobile-First**: Progressive enhancement approach

## 🧪 Testing Strategy

### Component Testing
```bash
# Run component tests
npm run test

# Run with coverage
npm run test:coverage
```

### E2E Testing
```bash
# Run end-to-end tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
npm run build
vercel --prod
```

### Docker
```dockerfile
# Build Docker image
docker build -t astralchat .
docker run -p 3000:3000 astralchat
```

### Static Hosting
```bash
# Build for static hosting
npm run build
# Upload dist/ folder to your CDN
```

## 🔮 Future Enhancements

### Planned Features
- [ ] **Voice Chat**: Speech-to-text and text-to-speech
- [ ] **Video Calls**: WebRTC integration for video chat
- [ ] **Screen Sharing**: Share screens during conversations
- [ ] **AI Plugins**: Extensible AI model integration
- [ ] **Multi-language**: i18n support for global users
- [ ] **Analytics**: Usage tracking and insights
- [ ] **Team Features**: Collaborative chat environments

### Backend Integration
- [ ] **FastAPI Backend**: Python-based API server
- [ ] **PostgreSQL**: Production database setup
- [ ] **Redis**: Caching and session management
- [ ] **JWT Authentication**: Secure user authentication
- [ ] **WebSocket Scaling**: Multi-instance support
- [ ] **File Storage**: S3-compatible object storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

- **Documentation**: [Full documentation](https://docs.astralchat.dev)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Discord**: [Join our community](https://discord.gg/astralchat)

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**

*AstralChat - Where AI meets stunning design*
