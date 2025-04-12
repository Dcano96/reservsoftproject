import api from "../../services/api.js"

const API_URL = "/apartamentos" // Debe coincidir con la ruta montada en el back

const getApartamentos = async () => {
  try {
    const res = await api.get(API_URL)
    return res.data
  } catch (error) {
    console.error("Error en getApartamentos:", error.response?.data || error.message)
    throw error
  }
}

const getApartamentoById = async (id) => {
  try {
    const res = await api.get(`${API_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error("Error en getApartamentoById:", error.response?.data || error.message)
    throw error
  }
}

const createApartamento = async (apartamentoData) => {
  try {
    console.log("Enviando datos al servidor:", apartamentoData)
    // Se espera que los datos incluyan: Tipo, NumeroApto, Piso, Tarifa y Estado
    const res = await api.post(API_URL, apartamentoData)
    return res.data
  } catch (error) {
    console.error("Error en createApartamento:", error.response?.data || error.message)
    throw error
  }
}

const updateApartamento = async (id, apartamentoData) => {
  try {
    console.log("Actualizando apartamento:", id, apartamentoData)
    // Se espera que los datos incluyan: Tipo, NumeroApto, Piso, Tarifa y Estado
    const res = await api.put(`${API_URL}/${id}`, apartamentoData)
    return res.data
  } catch (error) {
    console.error("Error en updateApartamento:", error.response?.data || error.message)
    throw error
  }
}

const darDeBajaApartamento = async (id) => {
  try {
    console.log("Dando de baja apartamento:", id)
    // Se modifica el campo "Estado" a false para darlo de baja
    const res = await api.put(`${API_URL}/${id}`, { Estado: false })
    return res.data
  } catch (error) {
    console.error("Error en darDeBajaApartamento:", error.response?.data || error.message)
    throw error
  }
}

export default {
  getApartamentos,
  getApartamentoById,
  createApartamento,
  updateApartamento,
  darDeBajaApartamento,
}
