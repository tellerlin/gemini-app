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
3. Or set environment variables:
```bash
export VITE_GEMINI_API_KEYS=key1,key2,key3
```

### 2. 🐳 Docker Deployment

**Quick Start:**
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
VITE_GEMINI_API_KEYS=your_api_key_1,your_api_key_2
```

### 3. ☁️ Cloudflare Pages (Recommended)

**Step 1: Deploy API Proxy**
[![Deploy Worker](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tellerlin/gemini-proxy-worker)

**Step 2: Deploy Frontend App**
[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tellerlin/gemini-app)

**Step 3: Configure Environment Variables**
```env
VITE_GEMINI_API_KEYS=your_api_keys
VITE_GEMINI_PROXY_URL=https://your-worker.workers.dev
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

### API Keys
Get your API keys from [Google AI Studio](https://makersuite.google.com/app/apikey) and configure them either:
- In the app settings (click the settings icon)
- As environment variables: `VITE_GEMINI_API_KEYS=key1,key2,key3`

### CORS Solution
For production deployments, use the [Gemini Proxy Worker](https://github.com/tellerlin/gemini-proxy-worker) to handle API requests and avoid CORS issues.

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