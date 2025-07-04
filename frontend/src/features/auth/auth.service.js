import axios from "axios"

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api/auth`
  : "/api/auth" // fallback para desarrollo local

console.log("API_URL configurada:", API_URL) // Para debug

// Mejorar el servicio de login con mejor manejo de errores y logs
const login = async (email, password) => {
  try {
    console.log("Intentando login con:", { email, password: "***" })
    console.log("URL de login:", `${API_URL}/login`) // Para debug

    // Validar que email y password no estén vacíos
    if (!email || !password) {
      throw new Error("El email y la contraseña son obligatorios")
    }

    // Asegurarse de que los datos se envían correctamente
    const res = await axios.post(`${API_URL}/login`, {
      email: email.trim(),
      password: password,
    })

    console.log("Respuesta del servidor:", {
      status: res.status,
      hasToken: !!res.data?.token,
      hasUsuario: !!res.data?.usuario,
      usuario: res.data?.usuario,
    })

    // Si la respuesta incluye un token, guardarlo en localStorage
    if (res.data && res.data.token) {
      localStorage.setItem("token", res.data.token)

      // También guardar información básica del usuario
      if (res.data.usuario) {
        // Verificar explícitamente si es cliente
        const isCliente =
          res.data.usuario.isCliente === true ||
          res.data.usuario.rol === "cliente" ||
          (typeof res.data.usuario.rol === "string" && res.data.usuario.rol.toLowerCase() === "cliente")

        const userInfo = {
          id: res.data.usuario.id,
          nombre: res.data.usuario.nombre,
          email: res.data.usuario.email,
          rol: res.data.usuario.rol,
          isCliente: isCliente,
          // Añadir información sobre el estado del rol
          rolEliminado: res.data.usuario.rolEliminado || false,
          rolInactivo: res.data.usuario.rolInactivo || false,
        }

        localStorage.setItem("usuario", JSON.stringify(userInfo))
        localStorage.setItem("userType", isCliente ? "cliente" : "admin")

        console.log("Usuario guardado en localStorage:", userInfo)
      }
    } else {
      console.warn("No se recibió un token en la respuesta")
    }

    return res.data
  } catch (error) {
    console.error("Error en login:", error)

    // Mejorar el mensaje de error para el usuario
    let errorMessage = "Error al iniciar sesión"

    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        data: error.response.data,
      })

      // Usar el mensaje del servidor si está disponible
      if (error.response.data && error.response.data.msg) {
        errorMessage = error.response.data.msg
      }
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error("No se recibió respuesta del servidor")
      errorMessage = "No se pudo conectar con el servidor"
    } else {
      // Error al configurar la solicitud
      console.error("Error al configurar la solicitud:", error.message)
      errorMessage = error.message
    }

    throw new Error(errorMessage)
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

const resetPassword = async (token, password) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, { token, password })
    return response.data
  } catch (error) {
    console.error("Reset password request failed:", error)
    throw error
  }
}

// Añadir método para verificar el estado del rol
const verificarEstadoRol = async () => {
  try {
    const token = localStorage.getItem("token")
    if (!token) return { rolActivo: false }

    const res = await axios.get(`${API_URL}/verificar-rol`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return res.data
  } catch (error) {
    console.error("Error al verificar estado del rol:", error)
    return { rolActivo: false, error: error.message }
  }
}

export default { login, register, forgotPassword, resetPassword, verificarEstadoRol }