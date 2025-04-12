const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = (app) => {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000", // Ajusta esto a la URL de tu backend
      changeOrigin: true,
    }),
  )
}

