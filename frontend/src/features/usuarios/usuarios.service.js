import api from "../../services/api.js";

// ✅ Usar la variable de entorno
const API_URL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/usuarios`
  : "/usuarios"; // fallback para desarrollo local

console.log("API_URL usuarios configurada:", API_URL); // Para debug

const getUsuarios = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

const getUsuarioById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

const createUsuario = async (usuarioData) => {
  const res = await api.post(API_URL, usuarioData);
  return res.data;
};

const updateUsuario = async (id, usuarioData) => {
  const res = await api.put(`${API_URL}/${id}`, usuarioData);
  return res.data;
};

const deleteUsuario = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};

export default {
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};