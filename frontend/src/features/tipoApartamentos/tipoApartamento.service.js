import api from "../../services/api.js"

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/tipoApartamento`
  : "/tipoApartamento"; // fallback para desarrollo local

console.log("API_URL tipoApartamento configurada:", API_URL); // Para debug

const getTipoApartamentos = async () => {
  try {
    const res = await api.get(API_URL)
    return res.data
  } catch (error) {
    console.error("Error en getTipoApartamentos:", error.response?.data || error.message)
    throw error
  }
}

const getTipoApartamentoById = async (id) => {
  try {
    const res = await api.get(`${API_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error("Error en getTipoApartamentoById:", error.response?.data || error.message)
    throw error
  }
}

const createTipoApartamento = async (tipoApartamentoData) => {
  try {
    console.log("Enviando datos al servidor:", tipoApartamentoData)
    // Se espera que los datos incluyan: nombre, descripcion, tamaño y estado
    const res = await api.post(API_URL, tipoApartamentoData)
    return res.data
  } catch (error) {
    console.error("Error en createTipoApartamento:", error.response?.data || error.message)
    throw error
  }
}

const updateTipoApartamento = async (id, tipoApartamentoData) => {
  try {
    console.log("Actualizando tipoApartamento:", id, tipoApartamentoData)
    // Se espera que los datos incluyan: nombre, descripcion, tamaño y estado
    const res = await api.put(`${API_URL}/${id}`, tipoApartamentoData)
    return res.data
  } catch (error) {
    console.error("Error en updateTipoApartamento:", error.response?.data || error.message)
    throw error
  }
}

const darDeBajaTipoApartamento = async (id) => {
  try {
    console.log("Dando de baja tipoApartamento:", id)
    // Aquí se modifica el campo "estado" a false para darlo de baja
    const res = await api.put(`${API_URL}/${id}`, { estado: false })
    return res.data
  } catch (error) {
    console.error("Error en darDeBajaTipoApartamento:", error.response?.data || error.message)
    throw error
  }
}

// Nueva función para eliminar un tipoApartamento
const deleteTipoApartamento = async (id) => {
  try {
    console.log("Eliminando tipoApartamento:", id)
    const res = await api.delete(`${API_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error("Error en deleteTipoApartamento:", error.response?.data || error.message)
    throw error
  }
}

export default {
  getTipoApartamentos,
  getTipoApartamentoById,
  createTipoApartamento,
  updateTipoApartamento,
  darDeBajaTipoApartamento,
  deleteTipoApartamento,
}