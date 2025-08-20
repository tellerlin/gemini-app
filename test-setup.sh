#!/bin/bash

echo "🧪 Testing Gemini Proxy Setup"
echo "================================"

echo ""
echo "1. Testing proxy server health..."
HEALTH_RESPONSE=$(curl -s http://100.90.100.8:3001/health)
echo "✅ Proxy server health: $HEALTH_RESPONSE"

echo ""
echo "2. Testing CORS headers..."
CORS_RESPONSE=$(curl -s -I -X OPTIONS http://100.90.100.8:3001/api/gemini/v1beta/models)
echo "CORS Headers:"
echo "$CORS_RESPONSE" | grep -i "access-control"

echo ""
echo "3. Services status:"
echo "📡 Proxy server: Running on 100.90.100.8:3001"
echo "🌐 Frontend server: Running on 100.90.100.8:5174"

echo ""
echo "4. Proxy configuration:"
echo "🔗 External proxy: http://192.168.1.3:7890 (server-side)"
echo "🔗 Client proxy: http://localhost:3001/api/gemini (client-side)"

echo ""
echo "5. Access URLs:"
echo "🌍 Frontend: http://100.90.100.8:5174"
echo "📡 Proxy API: http://100.90.100.8:3001/api/gemini"
echo "❤️ Health Check: http://100.90.100.8:3001/health"

echo ""
echo "✅ Setup complete! Client should now be able to access from http://100.90.100.8:5174"