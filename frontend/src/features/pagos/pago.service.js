import api from "../../services/api.js";

// Asegúrate de que en tu archivo api.js tengas algo similar a lo siguiente:
// import axios from "axios";
// const api = axios.create({ baseURL: "http://localhost:5000/api" });
// // Interceptor para adjuntar el token si existe
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );
// export default api;

const API_URL = "/pagos"; // Ruta base para pagos

const getPagos = async () => {
  try {
    const res = await api.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error en getPagos:", error);
    throw error;
  }
};

const getPagoById = async (id) => {
  try {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error en getPagoById:", error);
    throw error;
  }
};

const createPago = async (pagoData) => {
  try {
    const res = await api.post(API_URL, pagoData);
    return res.data;
  } catch (error) {
    console.error("Error en createPago:", error);
    throw error;
  }
};

const updatePago = async (id, pagoData) => {
  try {
    const res = await api.put(`${API_URL}/${id}`, pagoData);
    return res.data;
  } catch (error) {
    console.error("Error en updatePago:", error);
    throw error;
  }
};

const deletePago = async (id) => {
  try {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error en deletePago:", error);
    throw error;
  }
};

export default {
  getPagos,
  getPagoById,
  createPago,
  updatePago,
  deletePago,
};
