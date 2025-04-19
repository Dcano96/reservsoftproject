import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
})

// Interceptor para agregar el token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") // Asegúrate de guardar el token al iniciar sesión
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("Token agregado a la solicitud:", config.url)
    } else {
      console.warn("No hay token disponible para la solicitud:", config.url)
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Agregar interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      console.error("Error de autenticación:", error.response.data)
      // Puedes agregar lógica adicional aquí, como redirigir al login
    }

    // Manejar errores de permisos (403)
    if (error.response && error.response.status === 403) {
      console.error("Error de permisos:", error.response.data)
    }

    return Promise.reject(error)
  },
)

export default api
