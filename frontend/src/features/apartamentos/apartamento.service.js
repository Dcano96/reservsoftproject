import api from "../../services/api.js"

// ✅ Usar la variable de entorno con /api
const API_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api/apartamentos`
  : "/api/apartamentos" // fallback para desarrollo local

console.log("API_URL apartamentos configurada:", API_URL) // Para debug

const getApartamentos = async () => {
  try {
    const response = await api.get(API_URL)
    console.log("Datos recibidos del servidor (GET):", response.data) // Depuración
    return response.data
  } catch (error) {
    console.error("Error fetching apartamentos:", error)
    throw error
  }
}

const getApartamento = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching apartamento:", error)
    throw error
  }
}

const createApartamento = async (apartamentoData) => {
  try {
    // Convertir los campos numéricos a número antes de enviar
    const dataToSend = {
      ...apartamentoData,
      NumeroApto: Number(apartamentoData.NumeroApto),
      Piso: Number(apartamentoData.Piso),
      Capacidad: Number(apartamentoData.Capacidad),
      Tarifa: Number(apartamentoData.Tarifa),
    }

    console.log("Enviando datos al servidor (CREATE):", dataToSend)
    const response = await api.post(API_URL, dataToSend)
    console.log("Respuesta del servidor (CREATE):", response.data) // Depuración
    return response.data
  } catch (error) {
    console.error("Error creating apartamento:", error)
    throw error
  }
}

const updateApartamento = async (id, apartamentoData) => {
  try {
    const dataToSend = {
      ...apartamentoData,
      NumeroApto: Number(apartamentoData.NumeroApto),
      Piso: Number(apartamentoData.Piso),
      Capacidad: Number(apartamentoData.Capacidad),
      Tarifa: Number(apartamentoData.Tarifa),
    }
    console.log("Actualizando apartamento:", id)
    console.log("Datos enviados al servidor (UPDATE):", dataToSend)
    const response = await api.put(`${API_URL}/${id}`, dataToSend)
    console.log("Respuesta del servidor (UPDATE):", response.data) // Depuración
    return response.data
  } catch (error) {
    console.error("Error updating apartamento:", error)
    throw error
  }
}

const deleteApartamento = async (id) => {
  try {
    await api.delete(`${API_URL}/${id}`)
    return // No content on successful deletion
  } catch (error) {
    console.error("Error deleting apartamento:", error)
    throw error
  }
}

export default {
  getApartamentos,
  getApartamento,
  createApartamento,
  updateApartamento,
  deleteApartamento,
}
