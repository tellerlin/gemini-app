import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimize dependencies for faster dev startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-hot-toast',
      'clsx',
      '@google/genai',
      'mermaid',
      'dayjs'
    ],
    exclude: ['lucide-react'], // Exclude heavy libraries for lazy loading
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-gemini': ['@google/genai'],
          
          // UI and styling
          'vendor-ui': ['lucide-react', 'clsx', 'react-hot-toast'],
          
          // Content processing (heavy)
          'vendor-markdown': [
            'react-markdown', 
            'react-syntax-highlighter', 
            'remark-gfm',
            'remark-math',
            'rehype-katex'
          ],
          'vendor-math': ['katex', 'react-katex'],
          'vendor-table': ['@tanstack/react-table'],
          
          // Diagram libraries (heaviest - load on demand)
          'vendor-diagrams': ['mermaid', 'reactflow']
        },
        
        // Optimize file naming for better caching
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash].${ext}`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 1500, // Increased for chunk optimization
    sourcemap: process.env.NODE_ENV === 'development', // Only in dev
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.debug'] // Remove specific console methods
      },
      mangle: {
        safari10: true
      }
    },
    
    // Build target optimization
    target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari14']
  },
  
  // Development server optimizations
  server: {
    host: true,
    port: 5173,
    // Enable HMR optimizations
    hmr: {
      overlay: true
    }
  },
  
  preview: {
    port: 4173,
    host: true
  },
  
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@services': resolve(__dirname, 'src/services')
    }
  }
});
