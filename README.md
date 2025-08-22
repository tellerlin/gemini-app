# 🚀 Gemini Chat Application

<div align="center">

![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)

**Modern AI Chat Interface · Based on Google Gemini API · 2025 Optimized Version**

*High Performance · Smart Caching · Multimodal Support · Enterprise Security*

</div>

---

## 📖 What is this?

This is a modern AI chat application that provides a clean, fast interface for Google Gemini AI models. It supports text conversations, image uploads, document analysis, and real-time streaming responses with advanced content rendering including charts, tables, and mathematical formulas.

### 🎭 Try Live Demo

**Demo Site**: [https://gemini.xuexiao.eu.org](https://gemini.xuexiao.eu.org) 

> ⚠️ **Demo Only**: This is a trial version for testing purposes. For production use, **we strongly recommend deploying your own instance** to ensure privacy, security, and optimal performance.

## 🚀 Deployment Options

Choose one of the following deployment methods:

### 1. 📦 Local Installation

**System Requirements:**
- Node.js 18+
- Google AI Studio API Key

**Steps:**
```bash
# Clone the repository
git clone https://github.com/tellerlin/gemini-app.git
cd gemini-app

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

**Configuration:**
1. Get API keys from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click settings icon in the app to add API keys
3. **Connection Mode**: Choose your API connection method:

**Option A: Auto-detect (Recommended)**
```bash
# No configuration needed - automatically detects:
# Local: Direct connection to Google API
# Production: Uses /api/gemini proxy
npm run dev
```

**Option B: Force Direct Connection**
```bash
# Create .env file
echo "VITE_GEMINI_API_MODE=direct" > .env
npm run dev
```

**Option C: Force Proxy Mode**
```bash
# Create .env file  
echo "VITE_GEMINI_API_MODE=proxy" > .env
npm run dev
```

### 2. 🐳 Docker Deployment

**Quick Start (Direct Connection - Recommended):**
```bash
docker run -p 8080:8080 tellerlin/gemini-app
```

**With Docker Compose:**
```bash
git clone https://github.com/tellerlin/gemini-app.git
cd gemini-app
docker-compose up -d
```

**Environment Variables:**
```env
# Force direct connection (recommended for Docker)
VITE_GEMINI_API_MODE=direct

# Or use proxy mode if needed
# VITE_GEMINI_API_MODE=proxy
# VITE_GEMINI_PROXY_URL=https://your-proxy.com/api/gemini
```

### 3. ☁️ Cloudflare Pages (Recommended)

**Step 1: Deploy API Proxy**
[![Deploy Worker](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tellerlin/gemini-proxy-worker)

**Step 2: Deploy Frontend App**
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tellerlin/gemini-app)

**Step 3: Configure Environment Variables**
```env
# Force proxy mode for Cloudflare deployment
VITE_GEMINI_API_MODE=proxy

# Or specify custom proxy URL
# VITE_GEMINI_PROXY_URL=https://your-worker.workers.dev
```

#### 🌐 Custom Domain Setup (Optional)

For a professional setup using your own domain:

**Method 1: Worker Routes (Recommended)**
1. After deploying both worker and app, go to your domain in Cloudflare Dashboard
2. Navigate to **"Workers Routes"** section  
3. Click **"Add Route"**
4. Set route pattern: `yourdomain.com/api/gemini/*`
5. Select your deployed worker
6. Update environment variable: `VITE_GEMINI_PROXY_URL=https://yourdomain.com`

![Cloudflare Workers Routes Setting](cloudflare-workers-routes-setting.png)

**Benefits:**
- ✅ Same domain for both app and API (`yourdomain.com`)
- ✅ Clean URLs without `workers.dev` subdomain  
- ✅ Better SEO and professional appearance
- ✅ Unified SSL certificate management

## 🔧 Configuration

### 🌐 API Connection Modes

This application supports three connection modes to accommodate different deployment environments:

#### 1. **Auto-detect Mode (Default)**
Automatically chooses the best connection method:
- **Local Development** (`localhost`, `127.0.0.1`, `0.0.0.0`): Direct connection to Google API
- **Production Deployment**: Uses `/api/gemini` proxy endpoint

```env
VITE_GEMINI_API_MODE=auto  # or omit (default behavior)
```

#### 2. **Direct Connection Mode**  
Always connects directly to `generativelanguage.googleapis.com`  
✅ **Best for**: Local development, Docker containers, environments with direct internet access

```env
VITE_GEMINI_API_MODE=direct
```

#### 3. **Proxy Mode**
Always uses `/api/gemini` proxy endpoint  
✅ **Best for**: Cloudflare Workers, Vercel Edge Functions, corporate networks

```env
VITE_GEMINI_API_MODE=proxy
```

#### 4. **Custom Proxy URL**
Use a custom proxy endpoint (overrides all other settings)

```env
VITE_GEMINI_PROXY_URL=https://your-custom-proxy.com/api/gemini
```

### 🔑 API Keys
Get your API keys from [Google AI Studio](https://makersuite.google.com/app/apikey) and configure them either:
- **In-App Settings** (Recommended): Click the settings icon in the app
- **Environment Variables**: Not recommended for production (see [.env.example](.env.example))

### 📁 Environment Setup
Copy `.env.example` to `.env` and configure for your environment:

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

### 🚨 Security Note
**Never put API keys in environment variables for production deployments.** Always use the in-app settings to maintain security and prevent exposure in build artifacts.

## 🎯 Core Features

- **Multi-model Support**: Gemini 2.5 Pro/Flash/Flash-Lite/Live
- **Multimodal Chat**: Text, images, PDFs, and documents
- **Real-time Streaming**: Instant AI responses with typewriter effect
- **Rich Content**: Charts, tables, math formulas, code highlighting
- **Smart Caching**: Optimized performance and memory usage
- **PWA Ready**: Install as desktop/mobile app
- **Secure**: Encrypted API key storage

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

<div align="center">

**🚀 Modern AI Chat Application**

[⭐ Star on GitHub](https://github.com/tellerlin/gemini-app) · 
[🐛 Report Issue](https://github.com/tellerlin/gemini-app/issues) · 
[💬 Discussions](https://github.com/tellerlin/gemini-app/discussions)

*Requires [Gemini Proxy Worker](https://github.com/tellerlin/gemini-proxy-worker) for production deployment*

</div>