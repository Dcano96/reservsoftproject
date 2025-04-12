import api from "../../services/api.js"

const API_URL = "/reservas" // Debe coincidir con la ruta montada en el back

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

// Crear una nueva reserva
export const createReserva = async (reservaData) => {
  try {
    const response = await api.post(API_URL, reservaData)
    return response.data
  } catch (error) {
    console.error("Error al crear la reserva:", error)
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
