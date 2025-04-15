import api from "../../services/api"

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

// Nueva función para obtener las reservas del cliente autenticado
const getMisReservas = async () => {
  try {
    const response = await api.get(`${API_URL}/mis-reservas`)
    return response.data.reservas
  } catch (error) {
    console.error("Error al obtener mis reservas:", error)
    throw error
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
  getMisReservas, // Exportar la nueva función
}
