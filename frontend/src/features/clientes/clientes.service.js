import api from "../../services/api" // Ruta correcta a services/api.js

const API_URL = "/clientes" // Debe coincidir con la ruta montada en el back

const getClientes = async () => {
  const res = await api.get(API_URL)
  return res.data
}

const getClienteById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`)
  return res.data
}

const createCliente = async (clienteData) => {
  const res = await api.post(API_URL, clienteData)
  return res.data
}

const updateCliente = async (id, clienteData) => {
  const res = await api.put(`${API_URL}/${id}`, clienteData)
  return res.data
}

const deleteCliente = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`)
  return res.data
}

const getProfile = async () => {
  const res = await api.get(`${API_URL}/profile/me`) // Ajustado según tu ruta en cliente.routes.js
  return res.data
}

// Nueva función para cambiar la contraseña
const cambiarPassword = async (passwordActual, nuevoPassword) => {
  try {
    const res = await api.post(`${API_URL}/cambiar-password`, {
      passwordActual,
      nuevoPassword,
    })
    return res.data
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error.response?.data || error.message)
    throw error
  }
}

// Función para obtener las reservas del cliente autenticado
const getMisReservas = async () => {
  try {
    console.log("Solicitando mis reservas al servidor...")
    // Verificar que el token esté disponible
    const token = localStorage.getItem("token")
    if (!token) {
      console.warn("No hay token disponible para la solicitud")
    }

    const response = await api.get(`${API_URL}/mis-reservas`)
    console.log("Respuesta de mis reservas:", response.data)

    // Verificar la estructura de la respuesta
    if (response.data && Array.isArray(response.data)) {
      return response.data
    } else if (response.data && Array.isArray(response.data.reservas)) {
      return response.data.reservas
    } else {
      console.log("Formato de respuesta inesperado:", response.data)
      return response.data
    }
  } catch (error) {
    console.error("Error al obtener mis reservas:", error)

    // Mejorar el mensaje de error
    let errorMessage = "Error al obtener las reservas"

    if (error.response) {
      errorMessage = error.response.data?.msg || `Error ${error.response.status}: ${error.response.statusText}`
      console.error("Respuesta del servidor:", error.response.data)
    } else if (error.request) {
      errorMessage = "No se recibió respuesta del servidor"
    } else {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

// Función para obtener los detalles de una reserva específica
const getDetalleReserva = async (reservaId) => {
  try {
    console.log(`Solicitando detalles de la reserva ${reservaId}...`)
    const response = await api.get(`${API_URL}/reservas/${reservaId}`)

    console.log("Detalles de reserva obtenidos:", response.data)
    return response.data
  } catch (error) {
    console.error(`Error al obtener los detalles de la reserva ${reservaId}:`, error)

    let errorMessage = "Error al obtener los detalles de la reserva"

    if (error.response) {
      errorMessage = error.response.data?.msg || `Error ${error.response.status}: ${error.response.statusText}`
    } else if (error.request) {
      errorMessage = "No se recibió respuesta del servidor"
    } else {
      errorMessage = error.message
    }

    throw new Error(errorMessage)
  }
}

export default {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getProfile,
  cambiarPassword,
  getMisReservas,
  getDetalleReserva,
}
