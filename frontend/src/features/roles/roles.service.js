import api from "../../services/api.js"

const API_URL = "/roles"

const getRoles = async () => {
  const res = await api.get(API_URL)
  return res.data
}

const getRolById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`)
  return res.data
}

const createRol = async (rolData) => {
  const res = await api.post(API_URL, rolData)
  return res.data
}

const updateRol = async (id, rolData) => {
  const res = await api.put(`${API_URL}/${id}`, rolData)
  return res.data
}

const deleteRol = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`)
  return res.data
}

export default {
  getRoles,
  getRolById,
  createRol,
  updateRol,
  deleteRol,
}
