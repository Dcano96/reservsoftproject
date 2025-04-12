// services/mobiliario.service.js
import api from "../../services/api.js";

const API_URL = "/mobiliarios"; // Debe coincidir con la ruta montada en el backend

const getMobiliarios = async () => {
  try {
    const res = await api.get(API_URL);
    return res.data;
  } catch (error) {
    console.error("Error en getMobiliarios:", error.response?.data || error.message);
    throw error;
  }
};

const getMobiliarioById = async (id) => {
  try {
    const res = await api.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error en getMobiliarioById:", error.response?.data || error.message);
    throw error;
  }
};

const createMobiliario = async (mobiliarioData) => {
  try {
    console.log("Enviando datos al servidor:", mobiliarioData);
    const res = await api.post(API_URL, mobiliarioData);
    return res.data;
  } catch (error) {
    console.error("Error en createMobiliario:", error.response?.data || error.message);
    throw error;
  }
};

const updateMobiliario = async (id, mobiliarioData) => {
  try {
    console.log("Actualizando mobiliario:", id, mobiliarioData);
    const res = await api.put(`${API_URL}/${id}`, mobiliarioData);
    return res.data;
  } catch (error) {
    console.error("Error en updateMobiliario:", error.response?.data || error.message);
    throw error;
  }
};

const darDeBajaMobiliario = async (id) => {
  try {
    console.log("Dando de baja mobiliario:", id);
    const res = await api.put(`${API_URL}/baja/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error en darDeBajaMobiliario:", error.response?.data || error.message);
    throw error;
  }
};

const getMobiliariosPorApartamento = async (apartamentoId) => {
  try {
    const res = await api.get(`${API_URL}/apartamento/${apartamentoId}`);
    return res.data;
  } catch (error) {
    console.error("Error en getMobiliariosPorApartamento:", error.response?.data || error.message);
    throw error;
  }
};

export default {
  getMobiliarios,
  getMobiliarioById,
  createMobiliario,
  updateMobiliario,
  darDeBajaMobiliario,
  getMobiliariosPorApartamento,
};
