import api from "../../services/api.js"

// ✅ Usar la variable de entorno con /api
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/reservas` : "/api/reservas" // fallback para desarrollo local

console.log("API_URL reservas configurada:", API_URL) // Para debug

// Obtener todas las reservas
export const getReservas = async () => {
  try {
    const response = await api.get(API_URL)
    return response.data
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    throw error
  }
}

// Obtener una reserva por ID
export const getReservaById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener la reserva:", error)
    throw error
  }
}

// Actualizar una reserva
export const updateReserva = async (id, reservaData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, reservaData)
    return response.data
  } catch (error) {
    console.error("Error al actualizar la reserva:", error)
    throw error
  }
}

// Eliminar una reserva
export const deleteReserva = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar la reserva:", error)
    throw error
  }
}

// Métodos para acompañantes
export const addAcompanante = async (reservaId, acompananteData) => {
  try {
    const response = await api.post(`${API_URL}/${reservaId}/acompanantes`, { acompanante: acompananteData })
    return response.data
  } catch (error) {
    console.error("Error al agregar acompañante:", error)
    throw error
  }
}

export const removeAcompanante = async (reservaId, acompananteId) => {
  try {
    const response = await api.delete(`${API_URL}/${reservaId}/acompanantes/${acompananteId}`)
    return response.data
  } catch (error) {
    console.error("Error al eliminar acompañante:", error)
    throw error
  }
}

export const updateAcompanante = async (reservaId, acompananteId, acompananteData) => {
  try {
    const response = await api.put(`${API_URL}/${reservaId}/acompanantes/${acompananteId}`, {
      acompanante: acompananteData,
    })
    return response.data
  } catch (error) {
    console.error("Error al actualizar acompañante:", error)
    throw error
  }
}

// Completar pago de una reserva
export const completarPagoReserva = async (id, montoData) => {
  try {
    const response = await api.post(`${API_URL}/${id}/completar-pago`, montoData)
    return response.data
  } catch (error) {
    console.error("Error al completar el pago de la reserva:", error)
    throw error
  }
}

// Subir comprobante de pago
export const subirComprobantePago = async (id, comprobante_url, completar_pago = false) => {
  try {
    console.log("Enviando comprobante:", { comprobante_url, completar_pago })
    const response = await api.post(`${API_URL}/${id}/comprobante`, {
      comprobante_url,
      completar_pago,
    })
    return response.data
  } catch (error) {
    console.error("Error al subir el comprobante de pago:", error)
    console.error("Error del servidor:", error.response?.data)
    throw error
  }
}
