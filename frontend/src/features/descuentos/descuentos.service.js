// src/features/descuentos/descuentos.service.js
import api from "../../services/api.js";

const API_URL = "/descuentos";

const getDescuentos = async () => {
  const res = await api.get(API_URL);
  return res.data;
};

const getDescuentoById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

const createDescuento = async (descuentoData) => {
  const res = await api.post(API_URL, descuentoData);
  return res.data;
};

const updateDescuento = async (id, descuentoData) => {
  const res = await api.put(`${API_URL}/${id}`, descuentoData);
  return res.data;
};

const deleteDescuento = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`);
  return res.data;
};

export default {
  getDescuentos,
  getDescuentoById,
  createDescuento,
  updateDescuento,
  deleteDescuento,
};
