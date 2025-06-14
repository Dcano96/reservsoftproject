import axios from "axios"

// ✅ Configuración mejorada de axios con timeout más largo
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 45000, // ✅ Aumentado de 10s a 45s
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url} - Token: ${token ? "✅" : "❌"}`)
    }
    return config
  },
  (error) => {
    console.error("Error en interceptor de request:", error)
    return Promise.reject(error)
  },
)

// ✅ Interceptor mejorado para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    const originalRequest = error.config

    // ✅ Logging detallado del error
    console.group("❌ Error en la respuesta de la API")
    console.log("URL:", originalRequest?.url)
    console.log("Método:", originalRequest?.method?.toUpperCase())
    console.log("Código de error:", error.code)
    console.log("Status:", error.response?.status)
    console.log("Mensaje original:", error.message)
    console.groupEnd()

    // ✅ Manejo específico de diferentes tipos de errores
    if (error.code === "ECONNABORTED") {
      console.error("⏱️ Timeout - La solicitud tardó demasiado")
      error.message = "La solicitud tardó demasiado tiempo. Verifica tu conexión a internet."
    } else if (error.code === "ERR_NETWORK") {
      console.error("🌐 Error de red - Sin conexión")
      error.message = "No se pudo conectar con el servidor. Verifica tu conexión a internet."
    } else if (error.response) {
      // El servidor respondió con un código de error
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 401:
          console.error("🔒 Error de autenticación:", data)
          error.message = "Sesión expirada. Por favor, inicia sesión nuevamente."
          // Puedes agregar lógica adicional aquí, como redirigir al login
          // localStorage.removeItem("token");
          // window.location.href = "/login";
          break
        case 403:
          console.error("🚫 Error de permisos:", data)
          error.message = "No tienes permisos para realizar esta acción."
          break
        case 404:
          console.error("🔍 Recurso no encontrado")
          error.message = "El recurso solicitado no fue encontrado."
          break
        case 408:
          console.error("⏱️ Timeout del servidor")
          error.message = "La consulta tardó demasiado tiempo. Intenta nuevamente."
          break
        case 500:
        case 502:
        case 503:
          console.error("🔥 Error del servidor:", data)
          error.message = "Error interno del servidor. Intenta nuevamente más tarde."
          break
        default:
          console.error("❌ Error del servidor:", data)
          error.message = data?.msg || data?.message || `Error del servidor (${status})`
      }
    } else if (error.request && !error.response) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error("📡 Error de red - No se recibió respuesta del servidor:", error.request)
      error.message = "No se pudo conectar con el servidor. Verifica que esté ejecutándose."
    }

    return Promise.reject(error)
  },
)

// ✅ Función helper para verificar la salud de la API
export const checkApiHealth = async () => {
  try {
    const response = await api.get("/health", { timeout: 5000 })
    return { healthy: true, message: "API funcionando correctamente" }
  } catch (error) {
    return {
      healthy: false,
      message: error.message || "API no disponible",
    }
  }
}

export default api
