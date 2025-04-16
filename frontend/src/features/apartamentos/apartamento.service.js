import api from "../../services/api.js"

const getApartamentos = async () => {
  try {
    const response = await api.get("/apartamentos")
    console.log("Datos recibidos del servidor (GET):", response.data) // Depuración
    return response.data
  } catch (error) {
    console.error("Error fetching apartamentos:", error)
    throw error
  }
}

const getApartamento = async (id) => {
  try {
    const response = await api.get(`/apartamentos/${id}`)
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
    const response = await api.post("/apartamentos", dataToSend)
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
    const response = await api.put(`/apartamentos/${id}`, dataToSend)
    console.log("Respuesta del servidor (UPDATE):", response.data) // Depuración
    return response.data
  } catch (error) {
    console.error("Error updating apartamento:", error)
    throw error
  }
}

const deleteApartamento = async (id) => {
  try {
    await api.delete(`/apartamentos/${id}`)
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
