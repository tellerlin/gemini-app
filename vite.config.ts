import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-gemini': ['@google/genai'],
          'vendor-ui': ['lucide-react', 'clsx', 'react-hot-toast'],
          'vendor-charts': ['recharts', 'reactflow'],
          'vendor-markdown': ['react-markdown', 'react-syntax-highlighter', 'remark-gfm'],
          'vendor-math': ['katex', 'react-katex'],
          'vendor-table': ['@tanstack/react-table'],
          
          // Heavy diagram library
          'mermaid-core': ['mermaid']
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    sourcemap: false, // Disable sourcemaps for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  server: {
    host: true,
    port: 5173
  }
});
