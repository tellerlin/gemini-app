# Gemini AI Chat Application

A modern, feature-rich chat interface for Google's Gemini AI models built with React, TypeScript, and Vite. This application provides a seamless conversational experience with support for multiple AI models, file uploads, and advanced content rendering.

## 🚀 Features

### Core Functionality
- **Multi-Model Support**: Chat with different Gemini models (2.5 Pro, 2.5 Flash, 2.5 Flash-Lite, Live 2.5 Flash)
- **Multi-API Key Management**: Round-robin API key rotation for improved reliability and rate limit handling
- **Conversation Management**: Create, save, and manage multiple conversations
- **Conversation Export**: Export individual conversations as formatted text files
- **File Upload Support**: Upload images, PDFs, and documents for multimodal conversations
- **Real-time Chat**: Instant messaging with streaming AI responses
- **Persistent Storage**: Local IndexedDB storage for conversations and settings
- **URL Context Analysis**: 🌐 Directly analyze and understand web page content - NEW!

### Enhanced AI Response Support
- **Interactive Flowcharts**: Mermaid diagram rendering with zoom and download capabilities
- **Rich Data Tables**: Sortable, searchable, and paginated tables with CSV/JSON export
- **Dynamic Charts**: Multiple chart types (line, bar, pie, area, radar, scatter) with interactive features
- **Mathematical Expressions**: Support for inline and block math notation using KaTeX
- **Advanced Code Highlighting**: Syntax highlighting with copy functionality
- **Content Summary**: Visual indicators for different content types in AI responses
- **Google Search Grounding**: Enhanced responses with real-time web search capabilities
- **Intelligent URL Detection**: Automatic URL context enabling and smart content analysis

### Advanced Features
- **Error Handling**: Comprehensive error categorization and recovery
- **Retry Logic**: Automatic retry with exponential backoff
- **Timeout Management**: Configurable request timeouts
- **Markdown Rendering**: Rich text formatting with syntax highlighting
- **Responsive Design**: Mobile-first responsive interface
- **Toast Notifications**: User-friendly feedback system
- **Performance Monitoring**: Real-time performance metrics and health tracking

### Technical Features
- **TypeScript**: Full type safety and IntelliSense support
- **Modern React**: Functional components with hooks and React 19 features
- **State Management**: Zustand for lightweight, optimized state management
- **Virtual Scrolling**: Efficient handling of large message lists
- **Performance Monitoring**: Real-time performance tracking and optimization
- **Security**: Encrypted API key storage with Web Crypto API
- **Error Boundaries**: Comprehensive error handling and recovery
- **Tailwind CSS**: Utility-first styling
- **Vite**: Fast development and build tooling with advanced optimization
- **ESLint**: Code quality and consistency

## 🛠️ Technology Stack

### Frontend
- **React 19.1.1** - UI framework with concurrent features
- **TypeScript 5.5.3** - Type safety and enhanced development experience
- **Vite 7.1.2** - Fast build tool and development server
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React 0.539.0** - Modern icon library

### AI Integration
- **@google/genai 1.14.0** - Official Google Generative AI SDK
- **React Markdown 10.1.0** - Markdown rendering with custom components
- **React Syntax Highlighter 15.6.1** - Code syntax highlighting

### Enhanced Content Libraries
- **Mermaid 11.9.0** - Flowchart and diagram rendering with Chinese character support
- **@tanstack/react-table 8.21.3** - Modern table component with advanced features
- **ReactFlow 11.11.4** - Node-based flow diagrams
- **KaTeX 0.16.22** - Mathematical expression rendering
- **React KaTeX 3.1.0** - React wrapper for KaTeX

### State Management & Performance
- **Zustand 5.0.7** - Lightweight state management with persistence
- **Immer 10.1.1** - Immutable state updates

### UI/UX
- **React Hot Toast 2.5.2** - Toast notifications
- **CLSX 2.1.1** - Conditional CSS classes
- **Remark GFM 4.0.1** - GitHub Flavored Markdown support
- **Remark Math 6.0.0** - Mathematical notation in Markdown
- **Rehype KaTeX 7.0.1** - KaTeX integration for markdown

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

#### Method 1: In-App Configuration
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create one or more API keys
3. Open the application and click the settings icon
4. Add your API keys (supports multiple keys for redundancy)

#### Method 2: Environment Variables
1. Copy `.env.example` to `.env`
2. Add your API keys and proxy configuration to the `.env` file:
   ```env
   VITE_GEMINI_API_KEYS=your_first_api_key_here,your_second_api_key_here
   VITE_PROXY_URL=http://192.168.1.3:7890
   ```
3. Restart the development server

**Note**: Environment variables are loaded automatically and merged with any keys stored in the browser. Multiple keys enable round-robin functionality for better reliability.

## 🌐 Proxy Configuration

### HTTP Proxy Support
The application supports HTTP/HTTPS proxy configuration for users who need to route requests through a proxy server.

#### Configuration Methods

**Method 1: Environment Variables (.env file)**
```env
# HTTP proxy for Gemini API requests
VITE_PROXY_URL=http://192.168.1.3:7890

# Examples:
# Local proxy: VITE_PROXY_URL=http://127.0.0.1:7890
# Corporate proxy: VITE_PROXY_URL=http://proxy.company.com:8080
# HTTPS proxy: VITE_PROXY_URL=https://secure-proxy.example.com:443
```

**Method 2: In-App Configuration**
1. Click the settings icon in the application
2. Navigate to the "Proxy Settings" section
3. Enter your proxy URL (e.g., `http://192.168.1.3:7890`)
4. Click "Save" to apply the settings

#### Proxy URL Format
- **HTTP**: `http://host:port`
- **HTTPS**: `https://host:port`
- **With Authentication**: `http://username:password@host:port`

#### Common Proxy Scenarios
- **Development with local proxy**: `http://127.0.0.1:7890`
- **Corporate network**: `http://proxy.company.com:8080`
- **VPN/Tunnel proxy**: `http://192.168.1.3:7890`

**Security Note**: Proxy settings are stored locally and only used for Gemini API requests. No proxy credentials are transmitted to external servers.

## 🔐 Security Features

### API Key Protection
- **Masked Display**: API keys are displayed with only the last 6 characters visible
- **Copy Protection**: Masked keys cannot be copied to clipboard
- **Show/Hide Toggle**: Users can temporarily reveal keys for verification
- **Secure Storage**: Keys are stored locally in browser storage

### Conversation Export
- **Formatted Export**: Conversations are exported with timestamps and role indicators
- **Metadata Included**: Export includes conversation title, creation date, and model used
- **File Naming**: Automatic file naming with conversation title and date
- **Text Format**: Plain text format for easy sharing and archiving

## 📊 Enhanced AI Response Features

### Flowcharts and Diagrams
The application supports Mermaid diagrams in AI responses:

```mermaid
graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

**Usage**: Include ````mermaid` blocks in your AI responses for automatic diagram rendering.

### Interactive Data Tables
Rich table support with sorting, searching, and export capabilities:

**Usage**: Use ````table` blocks with JSON data:
```json
{
  "headers": ["Name", "Age", "City"],
  "data": [
    ["John", 30, "NYC"],
    ["Jane", 25, "LA"]
  ]
}
```

### Dynamic Charts
Multiple chart types supported: line, bar, pie, area, radar, scatter, and composed charts.

**Usage**: Use ````chart` blocks with chart configuration:
```json
{
  "type": "line",
  "data": [...],
  "config": {
    "xAxis": "month",
    "series": [...],
    "title": "Chart Title"
  }
}
```

### Mathematical Expressions
Support for both inline (`$formula$`) and block (`$$formula$$`) mathematical notation.

**Examples**:
- Inline: The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
- Block: $$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

### 🌐 URL Context Analysis (NEW!)
Directly analyze and understand web page content by including URLs in your messages.

**Usage Examples**:
```
Analyze this article: https://example.com/news/tech-trends
```

```
Compare these two sources:
https://site1.com/research
https://site2.com/analysis
```

```
Summarize key points from https://docs.example.com/guide
```

**Features**:
- 🔍 **Auto-detection**: Automatically enables when URLs are found in messages
- 📊 **Multi-URL support**: Analyze up to 10 URLs simultaneously  
- ✅ **Smart parsing**: Extracts content from news, docs, blogs, and research papers
- 🎯 **Contextual analysis**: Provides insights based on URL content and your questions
- 📈 **Success tracking**: Shows retrieval status for each URL

**Configuration**: Access via Settings → "URL 分析" tab to configure maximum URLs, preset URLs, and enable/disable the feature.

**Supported Content**: News articles, documentation, blog posts, research papers, product pages, and publicly accessible web content.

### Available Models
- **Gemini 2.5 Pro**: Enhanced thinking, reasoning, and multimodal understanding
- **Gemini 2.5 Flash**: Adaptive thinking with cost efficiency
- **Gemini 2.5 Flash-Lite**: Most cost-efficient model
- **Gemini 2.5 Flash Live**: Low-latency voice and video interactions

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Button, Input, Select)
│   ├── ApiKeyModal.tsx # API key management modal
│   ├── AdvancedSettingsModal.tsx # Advanced configuration settings
│   ├── ChatArea.tsx    # Main chat interface
│   ├── ChatInput.tsx   # Message input component with file upload
│   ├── CodeBlockCopy.tsx # Code block with copy functionality
│   ├── DemoContent.tsx # Feature showcase component
│   ├── EnhancedMessageBubble.tsx # Advanced message display with rich content
│   ├── EnhancedTable.tsx # Interactive data tables with sorting and export
│   ├── ExportRenderer.tsx # Content export functionality
│   ├── FileUpload.tsx  # Drag-and-drop file upload component
│   ├── GlobalErrorBoundary.tsx # Global error handling and recovery
│   ├── MermaidDiagram.tsx # Flowchart and diagram rendering
│   ├── MessageBubble.tsx # Basic message display component
│   ├── ModelSwitchIndicator.tsx # Model switching visual feedback
│   ├── ModernMarkdownRenderer.tsx # Enhanced markdown rendering
│   ├── OptimizedMermaidDiagram.tsx # Performance-optimized Mermaid rendering
│   ├── PerformanceMonitor.tsx # Real-time performance monitoring
│   ├── RenderingErrorBoundary.tsx # Error boundary for content rendering
│   ├── Sidebar.tsx     # Conversation sidebar with navigation
│   ├── SmartLoadingIndicator.tsx # Intelligent loading states
│   ├── StreamingMessage.tsx # Real-time streaming message display
│   ├── UserManager.tsx # User profile and settings management
│   └── VirtualizedChatList.tsx # Virtualized chat list for performance
├── config/             # Configuration files
│   └── gemini.ts       # Gemini model configurations and capabilities
├── hooks/              # Custom React hooks
│   ├── useChat.ts      # Chat state management with IndexedDB
│   └── useLocalStorage.ts # Local storage utilities and conversation management
├── services/           # External service integrations
│   └── gemini.ts       # Gemini AI service layer with advanced error handling
├── stores/             # State management
│   └── appStore.ts     # Zustand-based global state management
├── types/              # TypeScript type definitions
│   └── chat.ts         # Chat-related interfaces and types
├── utils/              # Utility functions
│   ├── cn.ts           # Class name utilities
│   ├── contentParser.ts # AI response content parsing with Chinese support
│   ├── contextManager.ts # Context optimization and summarization
│   ├── conversationDB.ts # IndexedDB conversation storage
│   ├── env.ts          # Environment variable utilities
│   ├── lazyComponents.ts # Lazy loading utilities for performance
│   ├── performanceTracker.ts # Performance monitoring and metrics
│   ├── security.ts     # Security utilities and API key encryption
│   ├── storageStrategy.ts # Storage strategy implementation
│   └── userManager.ts  # User data management
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🔌 API Architecture

### GeminiService Class
The core service layer provides comprehensive AI integration:

- **Multi-API Key Management**: Intelligent round-robin key rotation with health tracking
- **Error Handling**: Advanced error categorization with retry strategies
- **Retry Logic**: Exponential backoff with configurable attempts and intelligent delays
- **Timeout Management**: 30-second default timeout with graceful handling
- **Multimodal Support**: Text, image, PDF, and video processing
- **Conversation History**: Context-aware chat sessions with optimization
- **Performance Monitoring**: Real-time statistics and health metrics
- **Content Generation**: Support for both streaming and non-streaming responses
- **Advanced Features**: Grounding, URL context, and thinking capabilities

### State Management Architecture
The application uses **Zustand** for lightweight, efficient state management:

- **App Store**: Global state management with persistence
- **Performance Tracking**: Real-time metrics and monitoring
- **Immutable Updates**: Immer integration for safe state mutations
- **Selective Subscriptions**: Optimized re-rendering with targeted selectors
- **Batch Updates**: Efficient handling of multiple state changes

### Key Methods
- `generateResponse()`: Main content generation with comprehensive error handling
- `generateStreamingResponse()`: Real-time streaming with performance optimization
- `generateStreamingResponseWithGrounding()`: Enhanced streaming with search grounding
- `analyzeUrls()`: URL content analysis with intelligent context understanding 🌐 NEW!
- `testConnection()`: API connectivity verification with detailed diagnostics
- `getAvailableModelsWithCapabilities()`: Model information with real-time capability detection
- `setApiKeys()`: Multi-key configuration with health tracking initialization
- `batchValidateApiKeys()`: Comprehensive key validation with retry logic
- `getOptimalModelForTask()`: AI-powered model selection based on task analysis

## 🎨 UI Components

### Core Components
- **ChatArea**: Main conversation interface with virtualized message display
- **ChatInput**: Message composition with file upload
- **Sidebar**: Conversation management and settings
- **EnhancedMessageBubble**: Advanced message rendering with rich content support
- **VirtualizedChatList**: High-performance message list with virtualization
- **GlobalErrorBoundary**: Application-wide error handling and recovery
- **PerformanceMonitor**: Real-time performance metrics and monitoring

### Enhanced Content Components
- **MermaidDiagram**: Interactive flowchart and diagram rendering
- **EnhancedTable**: Sortable, searchable data tables with export functionality
- **ChartComponent**: Dynamic charts with multiple visualization types
- **ContentParser**: AI response content parsing and categorization

### UI Features
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Performance Optimization**: Virtual scrolling for large message lists
- **Error Boundaries**: Comprehensive error handling with graceful recovery
- **Loading States**: Smart loading indicators with performance tracking
- **Security**: Encrypted API key storage with secure display
- **File Upload**: Drag-and-drop image support with validation

## 🔒 Security & Privacy

### Data Handling
- **Local Storage**: All data stored locally in browser using IndexedDB
- **No Server**: No data transmitted to external servers except Gemini API
- **API Keys**: Encrypted storage using Web Crypto API with browser fingerprinting
- **File Processing**: Images processed client-side with secure validation
- **State Persistence**: Zustand persistence with secure storage strategies

### Best Practices
- API keys are encrypted and never logged or transmitted unnecessarily
- File uploads are validated for type, size, and security
- Error messages don't expose sensitive information
- Secure HTTPS communication with Google AI API
- Input sanitization prevents XSS attacks
- Comprehensive error boundaries prevent data leaks

## 🚀 Deployment

### Quick Deploy

#### Cloudflare Pages (Recommended)
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/sign-up/pages/from/github?template_url=https://github.com/tellerlin/gemini-app)

**One-click deployment to Cloudflare Pages:**
1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables:
   - `VITE_GEMINI_API_KEYS`: Your Gemini API keys (comma-separated)
   - `VITE_PROXY_URL`: Optional proxy URL
4. Deploy automatically

#### Docker Deployment
```bash
# Quick start with Docker
docker run -d \
  --name gemini-app \
  -p 80:80 \
  -e NODE_ENV=production \
  gemini-app:latest

# Or use Docker Compose
docker-compose up -d
```

#### Manual Deployment

**Build for Production**
```bash
npm run build
```

**Preview Production Build**
```bash
npm run preview
```

### Deployment Options

#### 🌐 Cloudflare Pages
- **Performance**: Global CDN with edge caching
- **SSL**: Automatic HTTPS certificates
- **Custom Domains**: Free custom domain support
- **Build Integration**: Automatic builds from GitHub
- **Environment Variables**: Secure API key storage

**Configuration:**
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `18`

#### 🐳 Docker & Container Platforms
- **Dockerfile**: Multi-stage build with nginx
- **Docker Compose**: Complete container setup
- **Health Checks**: Built-in health monitoring
- **Resource Optimization**: Lightweight Alpine Linux base

**Supported Platforms:**
- Docker Hub
- Google Cloud Run
- AWS App Runner
- Azure Container Instances
- Railway
- Fly.io

#### 📦 Static Hosting
- **Vercel**: `vercel --prod`
- **Netlify**: Drag & drop `dist` folder
- **GitHub Pages**: Upload build files
- **AWS S3**: Static website hosting
- **Azure Static Web Apps**: GitHub integration

### Environment Configuration

**Required Environment Variables:**
```env
# Gemini API Keys (required)
VITE_GEMINI_API_KEYS=your_api_key_1,your_api_key_2,your_api_key_3

# Optional Proxy Configuration
VITE_PROXY_URL=http://proxy.example.com:8080

# Build Environment
NODE_ENV=production
```

**Cloudflare Pages Environment Variables:**
1. Go to your Cloudflare Pages project
2. Navigate to Settings → Environment variables
3. Add production variables:
   - `VITE_GEMINI_API_KEYS`: Your API keys
   - `VITE_PROXY_URL`: Optional proxy URL

**Docker Environment Variables:**
```bash
# Docker run with environment
docker run -d \
  --name gemini-app \
  -p 80:80 \
  -e VITE_GEMINI_API_KEYS="key1,key2,key3" \
  -e VITE_PROXY_URL="http://proxy:8080" \
  gemini-app:latest
```

### Performance Optimization

**Build Optimizations:**
- Code splitting and lazy loading for optimal performance
- Virtual scrolling for large data sets
- Optimized bundle chunking with vendor separation
- Asset optimization (images, fonts) with compression
- Gzip compression with terser optimization
- Tree shaking for smaller bundles
- Browser caching strategies
- Performance monitoring and tracking

**CDN Benefits:**
- Global edge distribution
- Automatic asset optimization
- DDoS protection
- SSL/TLS encryption

### Security Considerations

**Production Security:**
- HTTPS only (automatic with Cloudflare)
- Content Security Policy headers
- XSS protection headers
- API key masking in frontend
- No server-side data storage

**Recommended Headers:**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Code Quality
- **ESLint**: Code linting and formatting with modern rules
- **TypeScript**: Static type checking with strict configuration
- **React Hooks**: Custom hook validation and dependency tracking
- **Performance**: Virtual scrolling and optimized re-rendering
- **Error Handling**: Comprehensive error boundaries and recovery

## ⚡ Performance Optimizations

### Recent Performance Improvements
The application has undergone comprehensive optimization to deliver exceptional performance:

### Bundle Optimization
- **Code Splitting**: Intelligent vendor chunk separation (React, Gemini, UI, Markdown, Diagrams)
- **Lazy Loading**: Dynamic imports for heavy components with Suspense boundaries
- **Tree Shaking**: Unused code elimination with terser optimization
- **Asset Optimization**: Compressed images, fonts, and static assets

### Runtime Performance
- **Virtual Scrolling**: Efficient rendering of large message lists with `VirtualizedChatList`
- **React.memo**: Optimized components prevent unnecessary re-renders
- **State Management**: Zustand with selective subscriptions and batch updates
- **Memory Management**: Proper cleanup and garbage collection strategies

### Security Enhancements
- **API Key Encryption**: Web Crypto API with browser fingerprinting
- **Input Sanitization**: XSS protection and secure file validation
- **Error Boundaries**: Comprehensive error handling with graceful recovery
- **Secure Storage**: Encrypted persistence for sensitive data

### Monitoring & Metrics
- **Performance Tracking**: Real-time Core Web Vitals monitoring
- **Bundle Analysis**: Size tracking and optimization metrics
- **Error Reporting**: Comprehensive error boundaries with recovery options
- **Memory Usage**: Performance tracker for memory and FPS monitoring

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

### Version 2.0.0 (Latest)
- 🌐 **NEW: URL Context Analysis** - Direct web page content analysis
- ✅ **Enhanced Grounding** - Improved Google Search integration  
- 🎯 **Smart Auto-Detection** - Automatic feature enabling based on content
- ⚙️ **Advanced Settings** - Comprehensive configuration options
- 🔧 **Performance Improvements** - Optimized streaming and response handling

### Version 1.0.0
- Initial release with core chat functionality
- Multi-model support
- File upload capabilities
- Responsive design
- Local storage persistence

---

**Built with ❤️ using React, TypeScript, and Google's Gemini AI**

**GitHub**: [https://github.com/tellerlin/gemini-app](https://github.com/tellerlin/gemini-app) 