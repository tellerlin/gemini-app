# Gemini AI Chat Application

A modern, feature-rich chat interface for Google's Gemini AI models built with React, TypeScript, and Vite. This application provides a seamless conversational experience with support for multiple AI models, file uploads, and advanced error handling.

## 🚀 Features

### Core Functionality
- **Multi-Model Support**: Chat with different Gemini models (2.5 Pro, 2.5 Flash, 2.5 Flash-Lite, Live 2.5 Flash)
- **Multi-API Key Management**: Round-robin API key rotation for improved reliability and rate limit handling
- **Conversation Management**: Create, save, and manage multiple conversations
- **File Upload Support**: Upload images for multimodal conversations
- **Real-time Chat**: Instant messaging with AI responses
- **Persistent Storage**: Local storage for conversations and settings

### Advanced Features
- **Error Handling**: Comprehensive error categorization and recovery
- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Management**: Configurable request timeouts
- **Markdown Rendering**: Rich text formatting with syntax highlighting
- **Responsive Design**: Mobile-first responsive interface
- **Toast Notifications**: User-friendly feedback system

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **Modern React**: Functional components with hooks
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast development and build tooling
- **ESLint**: Code quality and consistency

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript 5.5.3** - Type safety
- **Vite 5.4.2** - Build tool and dev server
- **Tailwind CSS 3.4.1** - Styling framework
- **Lucide React 0.539.0** - Icon library

### AI Integration
- **@google/generative-ai 0.24.1** - Official Google AI SDK
- **React Markdown 10.1.0** - Markdown rendering
- **React Syntax Highlighter 15.6.1** - Code syntax highlighting

### UI/UX
- **React Hot Toast 2.5.2** - Toast notifications
- **CLSX 2.1.1** - Conditional CSS classes

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI Studio API key(s)

### Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/tellerlin/gemini-app.git
   cd gemini-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### API Key Setup
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create one or more API keys
3. Open the application and click the settings icon
4. Add your API keys (supports multiple keys for redundancy)

### Available Models
- **Gemini 2.5 Pro**: Enhanced thinking, reasoning, and multimodal understanding
- **Gemini 2.5 Flash**: Adaptive thinking with cost efficiency
- **Gemini 2.5 Flash-Lite**: Most cost-efficient model
- **Gemini 2.5 Flash Live**: Low-latency voice and video interactions

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── ApiKeyModal.tsx # API key management modal
│   ├── ChatArea.tsx    # Main chat interface
│   ├── ChatInput.tsx   # Message input component
│   ├── FileUpload.tsx  # File upload functionality
│   ├── MessageBubble.tsx # Individual message display
│   └── Sidebar.tsx     # Conversation sidebar
├── hooks/              # Custom React hooks
│   ├── useChat.ts      # Chat state management
│   └── useLocalStorage.ts # Local storage utilities
├── services/           # External service integrations
│   └── gemini.ts       # Gemini AI service layer
├── types/              # TypeScript type definitions
│   └── chat.ts         # Chat-related interfaces
├── utils/              # Utility functions
│   └── cn.ts           # Class name utilities
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🔌 API Architecture

### GeminiService Class
The core service layer provides:

- **Multi-API Key Management**: Round-robin key rotation
- **Error Handling**: Categorized error responses
- **Retry Logic**: Exponential backoff with configurable attempts
- **Timeout Management**: 30-second default timeout
- **Multimodal Support**: Text and image processing
- **Conversation History**: Context-aware chat sessions

### Key Methods
- `generateResponse()`: Main content generation
- `testConnection()`: API connectivity verification
- `getAvailableModels()`: Model capability information
- `setApiKeys()`: API key configuration

## 🎨 UI Components

### Core Components
- **ChatArea**: Main conversation interface with message display
- **ChatInput**: Message composition with file upload
- **Sidebar**: Conversation management and settings
- **MessageBubble**: Individual message rendering with markdown
- **ApiKeyModal**: API key configuration interface

### UI Features
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support (configurable)
- **Loading States**: Visual feedback during API calls
- **Error States**: User-friendly error messages
- **File Upload**: Drag-and-drop image support

## 🔒 Security & Privacy

### Data Handling
- **Local Storage**: All data stored locally in browser
- **No Server**: No data transmitted to external servers
- **API Keys**: Stored securely in browser local storage
- **File Processing**: Images processed client-side

### Best Practices
- API keys are never logged or transmitted unnecessarily
- File uploads are validated for type and size
- Error messages don't expose sensitive information
- Secure HTTPS communication with Google AI API

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment Options
- **Static Hosting**: Deploy to Vercel, Netlify, or GitHub Pages
- **Docker**: Containerize for cloud deployment
- **CDN**: Serve static assets via CDN

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Static type checking
- **React Hooks**: Custom hook validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Repository Information
- **GitHub**: [https://github.com/tellerlin/gemini-app](https://github.com/tellerlin/gemini-app)
- **License**: MIT License
- **Language**: TypeScript (97.5%), JavaScript (1.7%), Other (0.8%)
- **Stars**: 0 | **Forks**: 0 | **Watchers**: 0

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Repository**: [https://github.com/tellerlin/gemini-app](https://github.com/tellerlin/gemini-app)

```
MIT License

Copyright (c) 2025 Gemini AI Chat Application

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🆘 Support

### Common Issues
- **API Key Errors**: Verify your API key is valid and has proper permissions
- **Rate Limiting**: Use multiple API keys for better throughput
- **File Upload Issues**: Ensure files are images and under size limits
- **Network Errors**: Check your internet connection and firewall settings

### Getting Help
- Check the [Google AI Studio documentation](https://ai.google.dev/)
- Review the console for detailed error messages
- Ensure you're using the latest version of the application
- Visit the [GitHub repository](https://github.com/tellerlin/gemini-app) for issues and discussions

## 🔄 Changelog

### Version 1.0.0
- Initial release with core chat functionality
- Multi-model support
- File upload capabilities
- Responsive design
- Local storage persistence

---

**Built with ❤️ using React, TypeScript, and Google's Gemini AI**

**GitHub**: [https://github.com/tellerlin/gemini-app](https://github.com/tellerlin/gemini-app) 