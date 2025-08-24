// Cloudflare Worker - 代理Gemini API请求
// 部署到 https://your-domain.com/api/gemini/*
// Enhanced for mobile device compatibility

export default {
  async fetch(request, env, ctx) {
    // Handle preflight requests (CORS)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin'
        }
      });
    }

    // Only allow POST requests for Gemini API
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Enhanced origin checking with mobile app support
    const origin = request.headers.get('Origin');
    const referer = request.headers.get('Referer');
    const userAgent = request.headers.get('User-Agent') || '';
    
    const allowedOrigins = [
      'https://gemini.xuexiao.eu.org',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://127.0.0.1:5173',
      'https://localhost:5173'
    ];
    
    // Check if request is from mobile app or allowed origin
    const isMobileRequest = /Mobile|Android|iPhone|iPad/i.test(userAgent);
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isAllowedReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed));
    
    if (!isAllowedOrigin && !isAllowedReferer && !isMobileRequest) {
      return new Response('Forbidden - Invalid origin', { 
        status: 403,
        headers: {
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    try {
      // Get request body with timeout for mobile stability
      const body = await Promise.race([
        request.text(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request body timeout')), 10000)
        )
      ]);
      
      // Build Gemini API URL
      const url = new URL(request.url);
      const geminiPath = url.pathname.replace('/api/gemini', '');
      const geminiUrl = `https://generativelanguage.googleapis.com${geminiPath}${url.search}`;

      console.log(`📱 Mobile request: ${isMobileRequest}, Path: ${geminiPath}`);

      // Enhanced headers for mobile compatibility
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'User-Agent': 'Gemini-Proxy-Worker/1.0',
      };

      // Add timeout for mobile networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 seconds for mobile

      // Forward request to Gemini API
      const geminiResponse = await fetch(geminiUrl, {
        method: 'POST',
        headers: headers,
        body: body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle streaming responses for mobile
      const isStreamingResponse = geminiResponse.headers.get('content-type')?.includes('text/plain');
      
      let responseData;
      if (isStreamingResponse) {
        responseData = geminiResponse.body;
      } else {
        responseData = await geminiResponse.text();
      }

      // Enhanced CORS headers for mobile browsers
      const responseHeaders = {
        'Content-Type': geminiResponse.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
        // Mobile-specific headers
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      };

      // Add streaming headers if needed
      if (isStreamingResponse) {
        responseHeaders['Transfer-Encoding'] = 'chunked';
        responseHeaders['Connection'] = 'keep-alive';
      }

      return new Response(responseData, {
        status: geminiResponse.status,
        headers: responseHeaders
      });

    } catch (error) {
      console.error('Proxy error:', error);
      
      // Enhanced error handling for mobile
      let errorMessage = 'Proxy error';
      let statusCode = 500;
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - please check your connection';
        statusCode = 408;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error - please try again';
        statusCode = 503;
      }

      return new Response(JSON.stringify({ 
        error: errorMessage,
        mobile_optimized: true,
        timestamp: new Date().toISOString()
      }), {
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
          'Cache-Control': 'no-cache'
        }
      });
    }
  }
};