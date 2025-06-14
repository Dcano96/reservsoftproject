import api from "../../services/api.js"

// ✅ Usar la variable de entorno con /api
const API_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api/hospedaje` : "/api/hospedaje"

console.log("API_URL hospedaje configurada:", API_URL)

// ✅ Obtener todos los hospedajes con manejo de errores mejorado
const getHospedajes = async () => {
  try {
    console.log("🔄 Obteniendo hospedajes...")
    const res = await api.get(API_URL)
    console.log("✅ Hospedajes obtenidos exitosamente:", res.data?.length || 0, "registros")
    return res.data || []
  } catch (error) {
    console.error("❌ Error al obtener hospedajes:", error.message)

    // Manejo específico de errores sin romper la aplicación
    if (error.code === "ECONNABORTED") {
      throw new Error("La solicitud tardó demasiado tiempo. Verifica tu conexión a internet.")
    }

    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.msg || "Error del servidor"
      throw new Error(`Error ${status}: ${message}`)
    }

    if (error.request) {
      throw new Error("No se pudo conectar con el servidor. Verifica que esté ejecutándose.")
    }

    throw new Error(`Error inesperado: ${error.message}`)
  }
}

// Obtener un hospedaje por ID
const getHospedajeById = async (id) => {
  try {
    const res = await api.get(`${API_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error("Error al obtener hospedaje por ID:", error)
    throw error
  }
}

// Crear hospedaje (el número de reserva se asigna automáticamente en el back)
const createHospedaje = async (hospedajeData) => {
  try {
    const res = await api.post(API_URL, hospedajeData)
    return res.data
  } catch (error) {
    console.error("Error al crear hospedaje:", error)
    throw error
  }
}

// Actualizar hospedaje
const updateHospedaje = async (id, hospedajeData) => {
  try {
    const res = await api.put(`${API_URL}/${id}`, hospedajeData)
    return res.data
  } catch (error) {
    console.error("Error al actualizar hospedaje:", error)
    throw error
  }
}

// Eliminar hospedaje
const deleteHospedaje = async (id) => {
  try {
    const res = await api.delete(`${API_URL}/${id}`)
    return res.data
  } catch (error) {
    console.error("Error al eliminar hospedaje:", error)
    throw error
  }
}

/**
 * Enviar datos de Check‑in Check‑out para un hospedaje específico (id).
 * Se espera un array en la propiedad "servicios".
 */
const checkInCheckOut = async (id, serviciosData) => {
  try {
    const res = await api.post(`${API_URL}/${id}/checkin-checkout`, { servicios: serviciosData })
    return res.data
  } catch (error) {
    console.error("Error en check-in/check-out:", error)
    throw error
  }
}

// ✅ Obtener habitaciones disponibles con retry automático
const getHabitacionesDisponibles = async (retries = 2) => {
  try {
    const res = await api.get(`${API_URL}/habitaciones-disponibles`)
    return res.data
  } catch (error) {
    if (retries > 0 && (error.code === "ECONNABORTED" || error.request)) {
      console.log(`🔄 Reintentando obtener habitaciones... (${retries} intentos restantes)`)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return getHabitacionesDisponibles(retries - 1)
    }
    console.error("Error al obtener habitaciones disponibles:", error)
    throw error
  }
}

// Guardar cambios en habitaciones disponibles
const saveHabitaciones = async (rooms) => {
  try {
    const res = await api.post(`${API_URL}/habitaciones-disponibles/guardar`, { rooms })
    return res.data
  } catch (error) {
    console.error("Error al guardar habitaciones:", error)
    throw error
  }
}

// Obtener facturas de pago del cliente (actualmente no se utiliza en el front‑end)
const getFacturas = async () => {
  try {
    const res = await api.get(`${API_URL}/facturas`)
    return res.data
  } catch (error) {
    console.error("Error al obtener facturas:", error)
    throw error
  }
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
