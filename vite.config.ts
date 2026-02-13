import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Memastikan process.env tersedia di sisi client
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env': {} 
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});