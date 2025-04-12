import api from "../../services/api.js"

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
  const res = await api.get(`${API_URL}/profile`)
  return res.data
}

export default {
  getClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
  getProfile,
}

