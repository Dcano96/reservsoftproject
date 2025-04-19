import axios from "axios"

// URL base para las peticiones a la API
const API_URL = "/api/clientes"

// Función para obtener las reservas del cliente autenticado
const getMisReservas = async () => {
  try {
    console.log("Solicitando mis reservas al servidor...")
    const response = await axios.get(`${API_URL}/mis-reservas`)

    console.log("Respuesta de mis reservas:", response.data)

    // Verificar la estructura de la respuesta y manejar diferentes formatos
    if (response.data && Array.isArray(response.data)) {
      return response.data
    } else if (response.data && Array.isArray(response.data.reservas)) {
      return response.data.reservas
    } else if (response.data && typeof response.data === "object") {
      // Si la respuesta es un objeto pero no tiene la propiedad reservas como array
      console.log("Formato de respuesta inesperado, devolviendo objeto completo:", response.data)
      return response.data
    } else {
      console.log("Formato de respuesta no reconocido, devolviendo array vacío")
      return []
    }
  } catch (error) {
    console.error("Error al obtener mis reservas:", error)

    // Mejorar el mensaje de error
    let errorMessage = "Error al obtener las reservas"

    if (error.response) {
      // El servidor respondió con un código de error
      errorMessage = error.response.data?.msg || `Error ${error.response.status}: ${error.response.statusText}`
      console.error("Respuesta del servidor:", error.response.data)
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      errorMessage = "No se recibió respuesta del servidor"
    } else {
      // Error al configurar la petición
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

// Función para obtener los detalles de una reserva específica
const getDetalleReserva = async (reservaId) => {
  try {
    // Obtener el token de autenticación
    const token = localStorage.getItem("token")

    if (!token) {
      throw new Error("No hay token de autenticación")
    }

    // Configurar los headers con el token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    // Realizar la petición para obtener los detalles de la reserva
    const response = await axios.get(`${API_URL}/reservas/${reservaId}`, config)

    console.log("Detalles de reserva obtenidos:", response.data)

    return response.data
  } catch (error) {
    console.error(`Error al obtener los detalles de la reserva ${reservaId}:`, error)

    // Mejorar el mensaje de error
    let errorMessage = "Error al obtener los detalles de la reserva"

    if (error.response) {
      errorMessage = error.response.data.msg || `Error ${error.response.status}: ${error.response.statusText}`
    } else if (error.request) {
      errorMessage = "No se recibió respuesta del servidor"
    } else {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

// Exportar las funciones del servicio
export default {
  getMisReservas,
  getDetalleReserva,
}
