import api from "../../services/api.js"

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/roles`
  : "/roles"; // fallback para desarrollo local

console.log("API_URL roles configurada:", API_URL); // Para debug

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