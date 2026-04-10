import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_')

  const processEnvValues = {
    'process.env': Object.entries(env).reduce((prev, [key, val]) => {
      return { ...prev, [key]: val }
    }, {}),
  }

  return {
    plugins: [react()],
    define: processEnvValues,
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    optimizeDeps: {
      include: [
        '@material-ui/core',
        '@material-ui/icons',
        '@material-ui/core/styles',
        '@material-ui/lab',
        '@material-ui/pickers',
        'react',
        'react-dom',
        'react-router-dom',
        'axios',
        'sweetalert2',
        'chart.js',
        'react-chartjs-2',
        'framer-motion',
        'jwt-decode',
        'date-fns',
      ],
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-mui': ['@material-ui/core', '@material-ui/icons', '@material-ui/lab'],
            'vendor-charts': ['chart.js', 'react-chartjs-2'],
            'vendor-utils': ['axios', 'sweetalert2', 'date-fns', 'jwt-decode'],
          },
        },
      },
    },
  }
})
