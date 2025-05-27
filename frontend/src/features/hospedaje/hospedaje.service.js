import api from "../../services/api.js"

// ✅ Usar la variable de entorno con /api
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/hospedaje` : "/api/hospedaje" // fallback para desarrollo local

console.log("API_URL hospedaje configurada:", API_URL) // Para debug

// Obtener todos los hospedajes
const getHospedajes = async () => {
  const res = await api.get(API_URL)
  return res.data
}

// Obtener un hospedaje por ID
const getHospedajeById = async (id) => {
  const res = await api.get(`${API_URL}/${id}`)
  return res.data
}

// Crear hospedaje (el número de reserva se asigna automáticamente en el back)
const createHospedaje = async (hospedajeData) => {
  const res = await api.post(API_URL, hospedajeData)
  return res.data
}

// Actualizar hospedaje
const updateHospedaje = async (id, hospedajeData) => {
  const res = await api.put(`${API_URL}/${id}`, hospedajeData)
  return res.data
}

// Eliminar hospedaje
const deleteHospedaje = async (id) => {
  const res = await api.delete(`${API_URL}/${id}`)
  return res.data
}

/**
 * Enviar datos de Check‑in Check‑out para un hospedaje específico (id).
 * Se espera un array en la propiedad "servicios".
 */
const checkInCheckOut = async (id, serviciosData) => {
  const res = await api.post(`${API_URL}/${id}/checkin-checkout`, { servicios: serviciosData })
  return res.data
}

// Obtener habitaciones disponibles
const getHabitacionesDisponibles = async () => {
  const res = await api.get(`${API_URL}/habitaciones-disponibles`)
  return res.data
}

// Guardar cambios en habitaciones disponibles
const saveHabitaciones = async (rooms) => {
  const res = await api.post(`${API_URL}/habitaciones-disponibles/guardar`, { rooms })
  return res.data
}

// Obtener facturas de pago del cliente (actualmente no se utiliza en el front‑end)
const getFacturas = async () => {
  const res = await api.get(`${API_URL}/facturas`)
  return res.data
}

export default {
  getHospedajes,
  getHospedajeById,
  createHospedaje,
  updateHospedaje,
  deleteHospedaje,
  checkInCheckOut,
  getHabitacionesDisponibles,
  saveHabitaciones,
  getFacturas,
}
