import axios from "axios"

// Cambiar de URL hardcodeada a URL relativa
const API_URL = "/api/auth" // Quitar "http://localhost:5000" para usar el proxy correctamente

const login = async (email, password) => {
  try {
    console.log("Intentando login con:", { email, password: "***" })
    const res = await axios.post(`${API_URL}/login`, { email, password })
    console.log("Respuesta del servidor:", res.data)

    // Si la respuesta incluye un token, guardarlo en localStorage
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token)
    }

    return res.data
  } catch (error) {
    console.error("Error en login:", error.response?.data || error.message)
    throw error
  }
}

const register = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/register`, userData)
    return res.data
  } catch (error) {
    console.error("Error en register:", error.response?.data || error.message)
    throw error
  }
}

const forgotPassword = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/forgot-password`, { email })
    return res.data
  } catch (error) {
    // Mejorar el manejo de errores para propagar correctamente el mensaje del backend
    if (error.response && error.response.data) {
      throw error.response.data
    }
    throw new Error("Error al conectar con el servidor")
  }
}

export default { login, register, forgotPassword }
